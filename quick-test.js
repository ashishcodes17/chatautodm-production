// 🧪 QUICK RACE CONDITION TEST
// Copy-paste this into browser console on your dashboard page

(async function quickRaceConditionTest() {
    console.clear();
    console.log('%c🧪 Quick Race Condition Test Starting...', 'color: #7c3aed; font-size: 16px; font-weight: bold;');
    console.log('%cThis will test the authentication fix by making rapid parallel requests\n', 'color: #666;');

    // Get workspace ID from URL
    const wsid = window.location.pathname.split('/')[1];
    if (!wsid || wsid === 'select-workspace') {
        console.error('❌ Error: Not on a workspace page. Please navigate to your dashboard first.');
        return;
    }

    console.log(`📍 Testing workspace: ${wsid}\n`);

    let totalTests = 0;
    let successCount = 0;
    let failCount = 0;
    let unexpectedRedirects = 0;

    // Test 1: Single Request Test
    console.log('%c1️⃣ Test 1: Single Request', 'color: #0ea5e9; font-weight: bold;');
    try {
        totalTests++;
        const [authRes, wsRes] = await Promise.all([
            fetch('/api/auth/me', { credentials: 'include' }),
            fetch(`/api/workspaces/${wsid}/user`, { credentials: 'include' })
        ]);
        
        if (authRes.ok && wsRes.ok) {
            console.log('%c   ✅ Single request test PASSED', 'color: #22c55e;');
            successCount++;
        } else {
            console.log('%c   ❌ Single request test FAILED', 'color: #ef4444;', {
                authStatus: authRes.status,
                wsStatus: wsRes.status
            });
            failCount++;
        }
    } catch (e) {
        console.log('%c   ❌ Single request test ERROR:', 'color: #ef4444;', e.message);
        failCount++;
    }

    // Test 2: Parallel Requests (10x)
    console.log('\n%c2️⃣ Test 2: 10 Parallel Requests', 'color: #0ea5e9; font-weight: bold;');
    const parallelPromises = [];
    for (let i = 0; i < 10; i++) {
        parallelPromises.push(
            Promise.all([
                fetch('/api/auth/me', { credentials: 'include' }),
                fetch(`/api/workspaces/${wsid}/user`, { credentials: 'include' })
            ])
        );
    }

    try {
        totalTests += 10;
        const results = await Promise.all(parallelPromises);
        const parallelSuccess = results.filter(([auth, ws]) => auth.ok && ws.ok).length;
        const parallelFail = 10 - parallelSuccess;
        
        successCount += parallelSuccess;
        failCount += parallelFail;
        
        if (parallelSuccess === 10) {
            console.log('%c   ✅ All 10 parallel requests PASSED', 'color: #22c55e;');
        } else {
            console.log(`%c   ⚠️ Parallel test: ${parallelSuccess}/10 passed`, 'color: #f59e0b;');
        }
    } catch (e) {
        console.log('%c   ❌ Parallel test ERROR:', 'color: #ef4444;', e.message);
        failCount += 10;
    }

    // Test 3: Rapid Sequential Requests (20x)
    console.log('\n%c3️⃣ Test 3: 20 Rapid Sequential Requests', 'color: #0ea5e9; font-weight: bold;');
    for (let i = 0; i < 20; i++) {
        try {
            totalTests++;
            const wsRes = await fetch(`/api/workspaces/${wsid}/user`, { credentials: 'include' });
            const data = await wsRes.json();
            
            if (wsRes.ok && data.success) {
                successCount++;
            } else if (wsRes.status === 403) {
                console.log(`%c   ❌ Request ${i+1}: Got 403 Forbidden (shouldn't happen for your workspace!)`, 'color: #ef4444;');
                failCount++;
                unexpectedRedirects++;
            } else {
                failCount++;
            }
        } catch (e) {
            failCount++;
        }
        
        // Small delay to simulate rapid navigation
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const rapidSuccess = 20 - (failCount - (totalTests - 30 - failCount));
    console.log(`%c   ${rapidSuccess === 20 ? '✅' : '⚠️'} Rapid sequential: ${rapidSuccess}/20 passed`, `color: ${rapidSuccess === 20 ? '#22c55e' : '#f59e0b'};`);

    // Test 4: SessionStorage Cache Check
    console.log('\n%c4️⃣ Test 4: SessionStorage Cache', 'color: #0ea5e9; font-weight: bold;');
    const cacheKey = `ws_valid_${wsid}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        const cacheTime = parseInt(cached);
        const age = Date.now() - cacheTime;
        const ageMinutes = (age / 1000 / 60).toFixed(1);
        console.log(`%c   ✅ Cache exists: ${ageMinutes} minutes old`, 'color: #22c55e;');
    } else {
        console.log('%c   ⚠️ No cache found (might be first visit)', 'color: #f59e0b;');
    }

    // Results Summary
    console.log('\n' + '='.repeat(60));
    console.log('%c📊 TEST RESULTS', 'color: #7c3aed; font-size: 18px; font-weight: bold;');
    console.log('='.repeat(60));
    
    const successRate = ((successCount / totalTests) * 100).toFixed(1);
    const passColor = successRate >= 95 ? '#22c55e' : successRate >= 80 ? '#f59e0b' : '#ef4444';
    
    console.log(`%c✓ Successful:        ${successCount}/${totalTests} (${successRate}%)`, `color: ${passColor}; font-weight: bold;`);
    console.log(`%c✗ Failed:            ${failCount}/${totalTests}`, `color: ${failCount === 0 ? '#666' : '#ef4444'};`);
    console.log(`%c↻ Unexpected 403s:   ${unexpectedRedirects}`, `color: ${unexpectedRedirects === 0 ? '#666' : '#ef4444'};`);
    
    console.log('\n' + '='.repeat(60));
    
    if (successRate >= 98) {
        console.log('%c🎉 EXCELLENT! Race condition is FIXED!', 'color: #22c55e; font-size: 16px; font-weight: bold;');
        console.log('%cThe authentication flow is stable and reliable.', 'color: #22c55e;');
    } else if (successRate >= 90) {
        console.log('%c⚠️ MOSTLY WORKING - Minor issues detected', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
        console.log('%cCheck the failed requests above for details.', 'color: #f59e0b;');
    } else {
        console.log('%c❌ RACE CONDITION STILL EXISTS', 'color: #ef4444; font-size: 16px; font-weight: bold;');
        console.log('%cPlease check the implementation and try again.', 'color: #ef4444;');
    }
    
    console.log('='.repeat(60) + '\n');
    
    // Recommendations
    if (unexpectedRedirects > 0) {
        console.log('%c⚠️ IMPORTANT: You got 403 Forbidden errors on your own workspace!', 'color: #ef4444; font-weight: bold;');
        console.log('%cThis means:', 'color: #666;');
        console.log('  1. Check if workspace.userId matches user._id in MongoDB');
        console.log('  2. Clear cookies and login again');
        console.log('  3. Verify getCurrentUser() is reading cookie correctly\n');
    }

    // Advanced diagnostics
    console.log('%c🔍 Run diagnostics?', 'color: #7c3aed; font-weight: bold;');
    console.log('Run this to see detailed user/workspace data:');
    console.log('%cawait (await fetch("/api/auth/me", {credentials: "include"})).json()', 'background: #f5f5f5; padding: 5px; border-radius: 3px;');
    console.log('%cawait (await fetch("/api/workspaces/' + wsid + '/user", {credentials: "include"})).json()', 'background: #f5f5f5; padding: 5px; border-radius: 3px;');

})();
