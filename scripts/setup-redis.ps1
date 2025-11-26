# Redis + BullMQ Setup Script
# Run this on your VPS

Write-Host "`n🚀 ===== REDIS + BULLMQ SETUP =====" -ForegroundColor Cyan
Write-Host "Installing dependencies...`n" -ForegroundColor Yellow

# Install Node packages
Write-Host "📦 Installing ioredis and bullmq..." -ForegroundColor Green
pnpm add ioredis bullmq

Write-Host "`n✅ Dependencies installed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Install Redis on your VPS:" -ForegroundColor White
Write-Host "   ssh root@62.72.42.195" -ForegroundColor Gray
Write-Host "   sudo apt update && sudo apt install redis-server -y" -ForegroundColor Gray
Write-Host "   sudo systemctl enable redis" -ForegroundColor Gray
Write-Host "   sudo systemctl start redis" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure Redis:" -ForegroundColor White
Write-Host "   sudo nano /etc/redis/redis.conf" -ForegroundColor Gray
Write-Host "   Set: maxmemory 6gb" -ForegroundColor Gray
Write-Host "   Set: maxmemory-policy allkeys-lru" -ForegroundColor Gray
Write-Host "   Save and: sudo systemctl restart redis" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test Redis:" -ForegroundColor White
Write-Host "   redis-cli -h 62.72.42.195 ping" -ForegroundColor Gray
Write-Host "   (should return PONG)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run worker with Redis DISABLED (safe test):" -ForegroundColor White
Write-Host "   node --expose-gc --max-old-space-size=8192 -r esbuild-register scripts/redis-worker.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Enable Redis once ready:" -ForegroundColor White
Write-Host "   `$env:REDIS_ENABLED='true'; `$env:REDIS_URL='redis://62.72.42.195:6379'" -ForegroundColor Gray
Write-Host "   node --expose-gc --max-old-space-size=8192 -r esbuild-register scripts/redis-worker.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Enable both Redis + BullMQ (max performance):" -ForegroundColor White
Write-Host "   `$env:REDIS_ENABLED='true'; `$env:BULLMQ_ENABLED='true'" -ForegroundColor Gray
Write-Host "   node --expose-gc --max-old-space-size=8192 -r esbuild-register scripts/redis-worker.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================`n" -ForegroundColor Cyan
