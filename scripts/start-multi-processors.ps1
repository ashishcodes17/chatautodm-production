# Start 4 real-time processors in parallel for high-volume processing
# Handles 600-1200 webhooks/min by distributing load

Write-Host "`n🚀 Starting HIGH-VOLUME Multi-Processor System" -ForegroundColor Cyan
Write-Host "📊 Capacity: 600-1200 webhooks/min" -ForegroundColor Green
Write-Host "⚡ Running 4 processors in parallel`n" -ForegroundColor Yellow

# Kill any existing processors
Write-Host "🔄 Stopping existing processors..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*realtime-processor*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# Start 4 real-time processors (each handles 150-300/min)
Write-Host "🚀 Starting Processor 1..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\fullstack-learn\chatautodm-web'; `$env:PROCESSOR_ID='P1'; node --expose-gc --max-old-space-size=6144 -r esbuild-register scripts/realtime-processor.ts"

Start-Sleep -Seconds 2

Write-Host "🚀 Starting Processor 2..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\fullstack-learn\chatautodm-web'; `$env:PROCESSOR_ID='P2'; node --expose-gc --max-old-space-size=6144 -r esbuild-register scripts/realtime-processor.ts"

Start-Sleep -Seconds 2

Write-Host "🚀 Starting Processor 3..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\fullstack-learn\chatautodm-web'; `$env:PROCESSOR_ID='P3'; node --expose-gc --max-old-space-size=6144 -r esbuild-register scripts/realtime-processor.ts"

Start-Sleep -Seconds 2

Write-Host "🚀 Starting Processor 4..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\fullstack-learn\chatautodm-web'; `$env:PROCESSOR_ID='P4'; node --expose-gc --max-old-space-size=6144 -r esbuild-register scripts/realtime-processor.ts"

Write-Host "`n✅ All 4 processors started!" -ForegroundColor Green
Write-Host "📊 Total capacity: ~1000 webhooks/min" -ForegroundColor Yellow
Write-Host "💡 Each processor window shows its own stats" -ForegroundColor Cyan
Write-Host "⚠️  To stop all: Get-Process node | Stop-Process -Force`n" -ForegroundColor Red
