// 🧪 SELECT-WORKSPACE PAGE TEST
// Run this on http://localhost:3000/select-workspace
// It will test rapid workspace clicking to simulate the race condition

(async function selectWorkspaceTest() {
    console.clear();
    console.log('%c🧪 Select-Workspace Navigation Test', 'color: #7c3aed; font-size: 16px; font-weight: bold;');
    console.log('%cThis tests the race condition by simulating rapid workspace selection\n', 'color: #666;');

    // Check if we're on select-workspace page
    if (!window.location.pathname.includes('select-workspace')) {
        console.error('❌ Error: This test should be run on /select-workspace page');
        console.log('💡 Navigate to http://localhost:3000/select-workspace first');
        return;
    }

    console.log('📍 Fetching your workspaces...\n');

    try {
        // Fetch user's workspaces
        const wsResponse = await fetch('/api/workspaces', { credentials: 'include' });
        if (!wsResponse.ok) {
            console.error('❌ Not authenticated. Please login first!');
            return;
        }

        const workspaces = await wsResponse.json();
        
        if (!workspaces || workspaces.length === 0) {
            console.error('❌ No workspaces found. Please connect an Instagram account first.');
            return;
        }

        console.log(`✅ Found ${workspaces.length} workspace(s):`);
        workspaces.forEach((ws, i) => {
            console.log(`   ${i + 1}. ${ws.name} (${ws._id})`);
        });

        // Use the first workspace for testing
        const testWorkspace = workspaces[0];
        const wsid = testWorkspace._id;

        console.log(`\n🎯 Testing with workspace: ${testWorkspace.name} (${wsid})`);
        console.log('─'.repeat(60));

        let totalAttempts = 0;
        let successCount = 0;
        let failCount = 0;
        let redirectErrors = 0;

        // Test 1: Auth Check
        console.log('\n%c1️⃣ Test 1: Authentication Check', 'color: #0ea5e9; font-weight: bold;');
        try {
            const authRes = await fetch('/api/auth/me', { credentials: 'include' });
            if (authRes.ok) {
                const userData = await authRes.json();
                console.log(`%c   ✅ Authenticated as: ${userData.name || userData.email}`, 'color: #22c55e;');
            } else {
                console.log('%c   ❌ Authentication failed', 'color: #ef4444;');
            }
        } catch (e) {
            console.log('%c   ❌ Auth error:', 'color: #ef4444;', e.message);
        }

        // Test 2: Single Workspace Access
        console.log('\n%c2️⃣ Test 2: Single Workspace Access', 'color: #0ea5e9; font-weight: bold;');
        try {
            totalAttempts++;
            const wsRes = await fetch(`/api/workspaces/${wsid}/user`, { credentials: 'include' });
            const wsData = await wsRes.json();
            
            if (wsRes.ok && wsData.success) {
                console.log('%c   ✅ Workspace access verified', 'color: #22c55e;');
                successCount++;
            } else if (wsRes.status === 403) {
                console.log('%c   ❌ 403 Forbidden - You don\'t own this workspace!', 'color: #ef4444;');
                failCount++;
                redirectErrors++;
            } else {
                console.log(`%c   ⚠️ Unexpected response: ${wsRes.status}`, 'color: #f59e0b;', wsData);
                failCount++;
            }
        } catch (e) {
            console.log('%c   ❌ Error:', 'color: #ef4444;', e.message);
            failCount++;
        }

        // Test 3: Rapid Workspace Access (Simulating Quick Clicks)
        console.log('\n%c3️⃣ Test 3: Rapid Access Simulation (20x)', 'color: #0ea5e9; font-weight: bold;');
        console.log('%c   Simulating rapid workspace clicking...', 'color: #666;');
        
        for (let i = 0; i < 20; i++) {
            try {
                totalAttempts++;
                
                // Parallel calls (simulating what layout.tsx does)
                const [authRes, wsRes] = await Promise.all([
                    fetch('/api/auth/me', { credentials: 'include' }),
                    fetch(`/api/workspaces/${wsid}/user`, { credentials: 'include' })
                ]);

                const wsData = await wsRes.json();
                
                if (authRes.ok && wsRes.ok && wsData.success) {
                    successCount++;
                    if ((i + 1) % 5 === 0) {
                        console.log(`%c   ✓ ${i + 1}/20 completed`, 'color: #22c55e;');
                    }
                } else if (wsRes.status === 403) {
                    console.log(`%c   ❌ Attempt ${i + 1}: Got 403 Forbidden!`, 'color: #ef4444;');
                    failCount++;
                    redirectErrors++;
                } else {
                    console.log(`%c   ⚠️ Attempt ${i + 1}: Failed (Auth: ${authRes.status}, WS: ${wsRes.status})`, 'color: #f59e0b;');
                    failCount++;
                }
            } catch (e) {
                failCount++;
                console.log(`%c   ❌ Attempt ${i + 1}: Error - ${e.message}`, 'color: #ef4444;');
            }
            
            // Tiny delay (50ms) to simulate rapid clicking
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Test 4: Parallel Burst (Extreme Case)
        console.log('\n%c4️⃣ Test 4: Parallel Burst (10 simultaneous)', 'color: #0ea5e9; font-weight: bold;');
        const burstPromises = [];
        
        for (let i = 0; i < 10; i++) {
            burstPromises.push(
                Promise.all([
                    fetch('/api/auth/me', { credentials: 'include' }),
                    fetch(`/api/workspaces/${wsid}/user`, { credentials: 'include' })
                ]).then(async ([authRes, wsRes]) => {
                    const wsData = await wsRes.json();
                    return {
                        success: authRes.ok && wsRes.ok && wsData.success,
                        status: wsRes.status,
                        is403: wsRes.status === 403
                    };
                })
            );
        }

        try {
            totalAttempts += 10;
            const burstResults = await Promise.all(burstPromises);
            const burstSuccess = burstResults.filter(r => r.success).length;
            const burst403 = burstResults.filter(r => r.is403).length;
            
            successCount += burstSuccess;
            failCount += (10 - burstSuccess);
            redirectErrors += burst403;
            
            if (burstSuccess === 10) {
                console.log('%c   ✅ All 10 parallel requests succeeded!', 'color: #22c55e;');
            } else {
                console.log(`%c   ⚠️ Parallel burst: ${burstSuccess}/10 passed`, 'color: #f59e0b;');
                if (burst403 > 0) {
                    console.log(`%c   ❌ ${burst403} got 403 Forbidden errors!`, 'color: #ef4444;');
                }
            }
        } catch (e) {
            failCount += 10;
            console.log('%c   ❌ Parallel burst failed:', 'color: #ef4444;', e.message);
        }

        // Results Summary
        console.log('\n' + '='.repeat(60));
        console.log('%c📊 TEST RESULTS', 'color: #7c3aed; font-size: 18px; font-weight: bold;');
        console.log('='.repeat(60));
        
        const successRate = ((successCount / totalAttempts) * 100).toFixed(1);
        const passColor = successRate >= 95 ? '#22c55e' : successRate >= 80 ? '#f59e0b' : '#ef4444';
        
        console.log(`%c✓ Successful:        ${successCount}/${totalAttempts} (${successRate}%)`, `color: ${passColor}; font-weight: bold;`);
        console.log(`%c✗ Failed:            ${failCount}/${totalAttempts}`, `color: ${failCount === 0 ? '#666' : '#ef4444'};`);
        console.log(`%c🚫 403 Redirects:    ${redirectErrors}`, `color: ${redirectErrors === 0 ? '#666' : '#ef4444'}; font-weight: bold;`);
        
        console.log('\n' + '='.repeat(60));
        
        if (successRate >= 98 && redirectErrors === 0) {
            console.log('%c🎉 PERFECT! Race condition is FIXED!', 'color: #22c55e; font-size: 16px; font-weight: bold;');
            console.log('%cYou can now safely click workspaces without unexpected redirects.', 'color: #22c55e;');
            console.log('\n%c✅ Ready to deploy to production!', 'color: #22c55e; font-weight: bold;');
        } else if (successRate >= 90 && redirectErrors === 0) {
            console.log('%c⚠️ MOSTLY WORKING - Some network issues detected', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
            console.log('%cNo 403 errors, so the race condition is fixed!', 'color: #f59e0b;');
        } else if (redirectErrors > 0) {
            console.log('%c❌ RACE CONDITION DETECTED!', 'color: #ef4444; font-size: 16px; font-weight: bold;');
            console.log(`%c${redirectErrors} unexpected 403 Forbidden errors occurred!`, 'color: #ef4444;');
            console.log('\n%c🔍 This means:', 'color: #666;');
            console.log('   1. Cookie race condition still exists, OR');
            console.log('   2. User ID mismatch in database');
        } else {
            console.log('%c⚠️ HIGH FAILURE RATE', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
            console.log('%cCheck network connection and try again.', 'color: #f59e0b;');
        }
        
        console.log('='.repeat(60) + '\n');

        // Now provide actual navigation test
        console.log('%c🚀 MANUAL TEST:', 'color: #7c3aed; font-weight: bold;');
        console.log(`%cNow try clicking the workspace "${testWorkspace.name}" 10-20 times rapidly`, 'color: #666;');
        console.log('%cExpected: Should navigate to dashboard every time', 'color: #666;');
        console.log('%cBug (if exists): Sometimes redirects back to /select-workspace', 'color: #666;');

    } catch (error) {
        console.error('%c❌ Test failed:', 'color: #ef4444; font-weight: bold;', error);
    }

})();
