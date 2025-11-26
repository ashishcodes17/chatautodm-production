/**
 * BullMQ Queue System - PRODUCTION SAFE
 * 
 * Features:
 * - Priority queues (story > comment > dm)
 * - Automatic retry with exponential backoff
 * - Dead letter queue for permanent failures
 * - Rate limiting per workspace
 * - Falls back to direct processing if BullMQ fails
 * 
 * Environment Variables:
 * - BULLMQ_ENABLED=true (enable queue system)
 * - REDIS_URL=redis://localhost:6379
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import type { Db } from 'mongodb';

const BULLMQ_ENABLED = process.env.BULLMQ_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://:1196843649@62.72.42.195:6379';

// Queue priorities (lower number = higher priority)
export const PRIORITY = {
  DM: 1,               // Highest priority - direct messages are most important
  STORY_REPLY: 2,      // High priority - story engagement
  COMMENT: 3,          // Medium priority - comment replies
  RETRY: 20,           // Low priority (retries)
};

let webhookQueue: Queue | null = null;
let deadLetterQueue: Queue | null = null;
let queueEvents: QueueEvents | null = null;
let isQueueReady = false;

// Initialize BullMQ
export async function initQueue() {
  if (!BULLMQ_ENABLED) {
    console.log('⚠️  BullMQ disabled (set BULLMQ_ENABLED=true to enable)');
    console.log('📌 Using direct processing mode');
    return;
  }

  try {
    console.log('🔄 Initializing BullMQ...');

    const connection = {
      host: new URL(REDIS_URL).hostname,
      port: parseInt(new URL(REDIS_URL).port || '6379'),
      maxRetriesPerRequest: null,
    };

    // Main webhook queue
    webhookQueue = new Queue('webhooks', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start at 2s, then 4s, 8s
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000,
        },
        removeOnFail: false, // Move to dead letter instead
      },
    });

    // Dead letter queue for permanent failures
    deadLetterQueue = new Queue('webhooks-dead', {
      connection,
      defaultJobOptions: {
        removeOnComplete: {
          age: 86400 * 7, // Keep for 7 days
        },
      },
    });

    // Queue events for monitoring
    queueEvents = new QueueEvents('webhooks', { connection });

    queueEvents.on('completed', ({ jobId }) => {
      // Minimal logging
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`❌ Job ${jobId} failed: ${failedReason}`);
    });

    await webhookQueue.waitUntilReady();
    await deadLetterQueue.waitUntilReady();
    
    isQueueReady = true;
    console.log('✅ BullMQ ready');

  } catch (error: any) {
    console.error('❌ BullMQ initialization failed:', error.message);
    console.log('⚠️  Falling back to direct processing');
    webhookQueue = null;
    deadLetterQueue = null;
    isQueueReady = false;
  }
}

// Add webhook to queue (with fallback to direct processing)
export async function enqueueWebhook(
  data: any,
  priority: number = PRIORITY.DM,
  processWebhookFn?: (data: any) => Promise<void>
): Promise<boolean> {
  // If BullMQ not available, process directly
  if (!webhookQueue || !isQueueReady) {
    if (processWebhookFn) {
      try {
        await processWebhookFn(data);
        return true;
      } catch (error: any) {
        console.error('❌ Direct processing failed:', error.message);
        return false;
      }
    }
    return false;
  }

  try {
    // Determine priority based on webhook type
    const webhookType = determineWebhookType(data);
    const jobPriority = getPriorityForType(webhookType);

    await webhookQueue.add(
      'process',
      { data, type: webhookType },
      {
        priority: jobPriority,
        jobId: generateJobId(data), // Deduplication
      }
    );

    return true;
  } catch (error: any) {
    console.error('⚠️  Queue add failed:', error.message);
    
    // Fallback to direct processing
    if (processWebhookFn) {
      try {
        await processWebhookFn(data);
        return true;
      } catch (err: any) {
        console.error('❌ Fallback processing failed:', err.message);
        return false;
      }
    }
    
    return false;
  }
}

// Create worker to process queue
export function createWorker(processWebhookFn: (data: any) => Promise<void>, concurrency: number = 100) {
  if (!BULLMQ_ENABLED || !webhookQueue) {
    console.log('⚠️  Worker not created (BullMQ disabled)');
    return null;
  }

  const connection = {
    host: new URL(REDIS_URL).hostname,
    port: parseInt(new URL(REDIS_URL).port || '6379'),
    maxRetriesPerRequest: null,
  };

  const worker = new Worker(
    'webhooks',
    async (job) => {
      try {
        await processWebhookFn(job.data.data);
      } catch (error: any) {
        // If this is the last attempt, move to dead letter
        if (job.attemptsMade >= 3) {
          await deadLetterQueue?.add('failed', {
            originalData: job.data,
            error: error.message,
            attempts: job.attemptsMade,
            failedAt: new Date(),
          });
        }
        throw error; // Re-throw for BullMQ retry logic
      }
    },
    {
      connection,
      concurrency,
      limiter: {
        max: 1000, // Max 1000 jobs per second
        duration: 1000,
      },
    }
  );

  worker.on('completed', (job) => {
    // Minimal logging
  });

  worker.on('failed', (job, err) => {
    if (job) {
      console.error(`❌ Job ${job.id} failed (attempt ${job.attemptsMade}/3): ${err.message}`);
    }
  });

  worker.on('error', (err) => {
    console.error('❌ Worker error:', err.message);
  });

  console.log(`✅ Worker started (concurrency: ${concurrency})`);
  return worker;
}

// Helper functions
function determineWebhookType(data: any): string {
  if (data.entry?.[0]?.messaging) {
    const message = data.entry[0].messaging[0]?.message;
    if (message?.reply_to?.story) {
      return 'story_reply';
    }
    return 'dm';
  }
  
  if (data.entry?.[0]?.changes) {
    const change = data.entry[0].changes[0];
    if (change?.field === 'comments') {
      return 'comment';
    }
  }
  
  return 'unknown';
}

function getPriorityForType(type: string): number {
  switch (type) {
    case 'story_reply':
      return PRIORITY.STORY_REPLY;
    case 'comment':
      return PRIORITY.COMMENT;
    case 'dm':
      return PRIORITY.DM;
    default:
      return PRIORITY.DM;
  }
}

function generateJobId(data: any): string {
  // Generate unique job ID for deduplication
  const entry = data.entry?.[0];
  if (!entry) return `job-${Date.now()}-${Math.random()}`;
  
  const id = entry.id;
  const time = entry.time;
  const messaging = entry.messaging?.[0];
  const messageId = messaging?.message?.mid;
  
  return `${id}-${time}-${messageId || Math.random()}`.substring(0, 100);
}

// Monitoring
export async function getQueueStats() {
  if (!webhookQueue || !isQueueReady) {
    return { enabled: false };
  }

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      webhookQueue.getWaitingCount(),
      webhookQueue.getActiveCount(),
      webhookQueue.getCompletedCount(),
      webhookQueue.getFailedCount(),
      webhookQueue.getDelayedCount(),
    ]);

    const deadCount = deadLetterQueue ? await deadLetterQueue.getWaitingCount() : 0;

    return {
      enabled: true,
      ready: isQueueReady,
      waiting,
      active,
      completed,
      failed,
      delayed,
      deadLetter: deadCount,
    };
  } catch (error: any) {
    return { enabled: true, ready: false, error: error.message };
  }
}

export function isQueueEnabled(): boolean {
  return BULLMQ_ENABLED && isQueueReady;
}

// Graceful shutdown
export async function closeQueue() {
  if (webhookQueue) {
    await webhookQueue.close();
  }
  if (deadLetterQueue) {
    await deadLetterQueue.close();
  }
  if (queueEvents) {
    await queueEvents.close();
  }
  console.log('✅ Queue closed gracefully');
}
