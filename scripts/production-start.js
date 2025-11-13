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

// Start Next.js Server (workers will run INSIDE this process)
console.log('🌐 Starting Next.js Server with integrated workers...');

// If queue enabled, start workers BEFORE Next.js
if (USE_QUEUE) {
  console.log('⚡ Queue System: ENABLED');
  console.log('🔧 Starting workers IN-PROCESS (no HTTP needed)...\n');
  
  // Import and start workers in THIS process
  const startWorkers = require('./start-workers-inprocess.js');
  startWorkers().then(() => {
    console.log('✅ Workers started in-process\n');
  }).catch(err => {
    console.error('❌ Failed to start workers:', err);
    console.error('⚠️  Continuing without workers...\n');
  });
}

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

if (USE_QUEUE) {
  console.log('========================================');
  console.log('🎉 All systems operational!');
  console.log('   Server + In-Process Workers');
  console.log('========================================\n');
  console.log('📊 Monitor queue: curl http://localhost:3000/api/webhooks/queue-stats\n');
} else {
  console.log('⚠️  Queue System: DISABLED');
  console.log('   Set USE_QUEUE_SYSTEM=true to enable\n');
  console.log('========================================');
  console.log('🎉 Server operational (Direct mode)');
  console.log('========================================\n');
}

// Keep process alive
process.stdin.resume();
