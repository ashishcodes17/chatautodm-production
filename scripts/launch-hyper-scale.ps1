# HYPER-SCALE LAUNCHER
# Runs 10 parallel workers to achieve 1M webhooks/hour
#
# Each worker: ~1,667/min
# 10 workers: ~16,670/min = 1M/hour
#
# Usage: .\scripts\launch-hyper-scale.ps1

Write-Host "`n🚀 ===== HYPER-SCALE LAUNCHER =====" -ForegroundColor Cyan
Write-Host "🎯 TARGET: 1M webhooks/hour" -ForegroundColor Green
Write-Host "👥 Starting 10 parallel workers..." -ForegroundColor Yellow
Write-Host "====================================`n" -ForegroundColor Cyan

$jobs = @()

# Launch 10 workers
for ($i = 1; $i -le 10; $i++) {
    Write-Host "🚀 Starting Worker $i..." -ForegroundColor Green
    
    $job = Start-Job -ScriptBlock {
        param($workerId)
        Set-Location "E:\fullstack-learn\chatautodm-web"
        $env:WORKER_ID = "worker-$workerId"
        node --expose-gc --max-old-space-size=8192 -r esbuild-register scripts/hyper-processor.ts
    } -ArgumentList $i
    
    $jobs += $job
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅ All 10 workers started!" -ForegroundColor Green
Write-Host "📊 Monitoring (Ctrl+C to stop all)...`n" -ForegroundColor Yellow

# Monitor jobs
try {
    while ($true) {
        $running = ($jobs | Where-Object { $_.State -eq 'Running' }).Count
        $completed = ($jobs | Where-Object { $_.State -eq 'Completed' }).Count
        $failed = ($jobs | Where-Object { $_.State -eq 'Failed' }).Count
        
        Write-Host "📊 Workers: $running running | $completed completed | $failed failed" -ForegroundColor Cyan
        
        # Show output from jobs
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job 2>&1
            if ($output) {
                Write-Host $output
            }
        }
        
        Start-Sleep -Seconds 5
    }
} finally {
    Write-Host "`n⚠️  Stopping all workers..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job -Force
    Write-Host "✅ All workers stopped`n" -ForegroundColor Green
}
