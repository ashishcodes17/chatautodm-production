#!/usr/bin/env node

/**
 * Production Startup Script
 * 
 * Automatically starts:
 * 1. Next.js Server
 * 2. Webhook Queue Workers (if queue enabled)
 * 
 * NO MANUAL WORK REQUIRED - Just run: npm start
 */

const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('\n🚀 ========================================');
console.log('   ChatAutoDM Production Startup');
console.log('========================================\n');

const USE_QUEUE = process.env.USE_QUEUE_SYSTEM === 'true';
const processes = [];

// Graceful shutdown handler
function shutdown() {
  console.log('\n⚠️  Shutdown signal received...');
  
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      console.log(`   Stopping ${proc.name}...`);
      proc.kill('SIGTERM');
    }
  });

  setTimeout(() => {
    console.log('✅ Shutdown complete\n');
    process.exit(0);
  }, 3000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start Next.js Server
console.log('🌐 Starting Next.js Server...');
const serverProcess = spawn('node', [
  path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next'),
  'start'
], {
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.name = 'Next.js Server';
processes.push(serverProcess);

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start Next.js server:', err);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Next.js server exited with code ${code}`);
    process.exit(code);
  }
});

console.log('✅ Next.js Server started\n');

// Start Workers (if queue enabled)
if (USE_QUEUE) {
  console.log('⚡ Queue System: ENABLED');
  console.log('🔧 Starting Webhook Queue Workers...\n');
  
  // Small delay to let server initialize
  setTimeout(() => {
    const workerProcess = spawn('node', [
      path.join(__dirname, 'start-workers.js')
    ], {
      stdio: 'inherit',
      env: { ...process.env }
    });

    workerProcess.name = 'Queue Workers';
    processes.push(workerProcess);

    workerProcess.on('error', (err) => {
      console.error('❌ Failed to start workers:', err);
      console.error('⚠️  Server continues without queue workers');
    });

    workerProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`⚠️  Workers exited with code ${code}`);
        console.error('   Server continues running...');
      }
    });

    console.log('✅ Queue Workers started\n');
    console.log('========================================');
    console.log('🎉 All systems operational!');
    console.log('========================================\n');
    console.log('📊 Monitor queue: curl http://localhost:3000/api/webhooks/queue-stats\n');
    
  }, 2000);
  
} else {
  console.log('⚠️  Queue System: DISABLED');
  console.log('   Set USE_QUEUE_SYSTEM=true to enable\n');
  console.log('========================================');
  console.log('🎉 Server operational (Direct mode)');
  console.log('========================================\n');
}

// Keep process alive
process.stdin.resume();
