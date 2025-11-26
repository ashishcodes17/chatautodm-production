import { getDatabase } from "@/lib/mongodb";
import { initRedis, invalidateAutomation } from "@/lib/redis-cache";

async function main() {
  try {
    console.log('🔄 Starting automation cache sync (change stream)');

    // Initialize Redis (best-effort)
    initRedis().catch(err => console.error('⚠️ Redis init failed in cache-sync:', err.message));

    const db = await getDatabase();
    const coll = db.collection('automations');

    // Watch for inserts, updates, replaces and deletes
    const changeStream = coll.watch(
      [
        { $match: { operationType: { $in: ['insert', 'update', 'replace', 'delete'] } } }
      ],
      { fullDocument: 'updateLookup' }
    );

    changeStream.on('change', async (change) => {
      try {
        console.log('🔔 Automation change detected:', change.operationType);

        const doc = (change as any).fullDocument;

        // Best-effort workspace/type extraction
        const workspaceId = doc?.workspaceId?.toString?.() || doc?.workspaceId;
        const type = doc?.type || (change.updateDescription && change.updateDescription.updatedFields && change.updateDescription.updatedFields.type);
        const postId = doc?.selectedPost || doc?.selectedStory || doc?.config?.postId || null;

        if (workspaceId && type) {
          console.log(`🧹 Invalidating cache for workspace=${workspaceId}, type=${type}, postId=${postId || 'any'}`);
          await invalidateAutomation(workspaceId.toString(), type, postId ? postId.toString() : undefined);
        } else {
          // Fallback: invalidate all automation cache keys (best-effort)
          console.log('🧹 Could not determine workspace/type — invalidating all automation cache keys');
          await invalidateAutomation('*', '*', '*');
        }
      } catch (err: any) {
        console.error('❌ Error handling automation change:', err.message || err);
      }
    });

    changeStream.on('error', (err) => {
      console.error('❌ ChangeStream error:', err);
      process.exit(1);
    });

    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down automation cache sync...');
      await changeStream.close();
      process.exit(0);
    });

  } catch (error: any) {
    console.error('❌ automation-cache-sync failed to start:', error.message || error);
    process.exit(1);
  }
}

main();
