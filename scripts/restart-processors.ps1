# Quick restart script for both processors
Write-Host "`n🔄 Stopping all Node.js processors..." -ForegroundColor Yellow

# Kill all node processes running the processors
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host "✅ All processors stopped`n" -ForegroundColor Green

Write-Host "🚀 Starting Emergency Processor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\fullstack-learn\chatautodm-web'; node --expose-gc --max-old-space-size=4096 -r esbuild-register scripts/emergency-process-queue.ts"

Start-Sleep -Seconds 3

Write-Host "🚀 Starting Real-time Processor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\fullstack-learn\chatautodm-web'; node --expose-gc --max-old-space-size=4096 -r esbuild-register scripts/realtime-processor.ts"

Write-Host "`n✅ Both processors restarted!" -ForegroundColor Green
Write-Host "📊 Check the new windows for processing logs`n" -ForegroundColor Yellow
