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

// Fetch is built-in to Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

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

// Start Next.js Server first
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

// If queue enabled, start workers AFTER server is ready
if (USE_QUEUE) {
  console.log('⚡ Queue System: ENABLED');
  console.log('🔧 Waiting for server to be ready before starting workers...\n');
  
  // Wait for server to be ready (check localhost:3000)
  async function waitForServer() {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch('http://localhost:3000/api/webhooks/queue-stats');
        if (response.ok) {
          console.log('✅ Server is ready!\n');
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      attempts++;
      console.log(`   Waiting for server... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.error('❌ Server did not become ready in time');
    return false;
  }
  
  // Start workers after server is ready
  waitForServer().then(ready => {
    if (!ready) {
      console.error('⚠️  Starting workers anyway (server may not be ready)');
    }
    
    console.log('🔧 Starting in-process workers...\n');
    
    const startWorkers = require('./start-workers-inprocess.js');
    startWorkers().then(() => {
      console.log('========================================');
      console.log('🎉 All systems operational!');
      console.log('   Server + In-Process Workers');
      console.log('========================================\n');
      console.log('📊 Monitor queue: curl http://localhost:3000/api/webhooks/queue-stats\n');
    }).catch(err => {
      console.error('❌ Failed to start workers:', err);
      console.error('⚠️  Continuing without workers...\n');
    });
  });
  
} else {
  console.log('⚠️  Queue System: DISABLED');
  console.log('   Set USE_QUEUE_SYSTEM=true to enable\n');
  console.log('========================================');
  console.log('🎉 Server operational (Direct mode)');
  console.log('========================================\n');
}

// Keep process alive
process.stdin.resume();
