import NodeCache from 'node-cache';

/**
 * Shared In-Memory Cache Module (node-cache)
 * Practical 9: In-Memory Caching and Query Optimization
 * Charotar University of Science and Technology (CHARUSAT)
 */

// Default standard TTL: 60 seconds as specified in Practical 9 problem statement
const DEFAULT_STD_TTL = 60;
const CHECK_PERIOD = 120;

// Initialize node-cache instance
const cache = new NodeCache({
  stdTTL: DEFAULT_STD_TTL,
  checkperiod: CHECK_PERIOD,
  useClones: true
});

// Telemetry counters for Supplementary Problem 2 (Cache-hit/cache-miss debug metrics)
const telemetry = {
  hits: 0,
  misses: 0,
  writes: 0,
  invalidations: 0,
  startedAt: new Date().toISOString()
};

/**
 * Record a cache hit
 */
export const recordHit = () => {
  telemetry.hits++;
};

/**
 * Record a cache miss
 */
export const recordMiss = () => {
  telemetry.misses++;
};

/**
 * Record a write / cache set operation
 */
export const recordWrite = () => {
  telemetry.writes++;
};

/**
 * Invalidate all tasks cache keys (both all-tasks collection and individual task keys)
 * Called on any write operation (POST, PUT, DELETE) to guarantee data correctness
 * @param {string|null} specificTaskId - Optional specific task ID to also invalidate
 */
export const invalidateTasksCache = (specificTaskId = null) => {
  const allKeys = cache.keys();
  const keysToDelete = [];

  // Identify collection-level cache keys
  allKeys.forEach((key) => {
    if (key === 'all_tasks' || key.startsWith('tasks_')) {
      keysToDelete.push(key);
    }
  });

  // Identify specific single-task cache key (Supplementary Problem 1)
  if (specificTaskId) {
    const singleKey = `task_${specificTaskId}`;
    if (!keysToDelete.includes(singleKey)) {
      keysToDelete.push(singleKey);
    }
  }

  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
    telemetry.invalidations += keysToDelete.length;
    console.log(`🧹 [Cache Invalidation] Evicted ${keysToDelete.length} key(s): ${keysToDelete.join(', ')}`);
  }

  return keysToDelete;
};

/**
 * Retrieve comprehensive cache telemetry and performance statistics (Supplementary Problem 2)
 */
export const getCacheTelemetry = () => {
  const nodeStats = cache.getStats();
  const totalQueries = telemetry.hits + telemetry.misses;
  const hitRatio = totalQueries > 0
    ? `${((telemetry.hits / totalQueries) * 100).toFixed(2)}%`
    : '0.00%';

  const keys = cache.keys();
  const keyDetails = keys.map((k) => ({
    key: k,
    ttlRemainingSeconds: cache.getTtl(k) ? Math.max(0, Math.round((cache.getTtl(k) - Date.now()) / 1000)) : 0
  }));

  return {
    status: 'active',
    summary: {
      totalRequests: totalQueries,
      cacheHits: telemetry.hits,
      cacheMisses: telemetry.misses,
      hitRatio: hitRatio,
      invalidations: telemetry.invalidations,
      activeKeysCount: keys.length
    },
    config: {
      stdTTL: DEFAULT_STD_TTL,
      checkperiod: CHECK_PERIOD,
      engine: 'node-cache (in-memory)'
    },
    activeKeys: keyDetails,
    internalNodeCacheStats: nodeStats,
    uptimeStart: telemetry.startedAt
  };
};

/**
 * Reset telemetry counters and purge all in-memory keys
 */
export const flushCache = () => {
  const keyCount = cache.keys().length;
  cache.flushAll();
  telemetry.hits = 0;
  telemetry.misses = 0;
  telemetry.writes = 0;
  telemetry.invalidations = 0;
  return keyCount;
};

export default cache;
