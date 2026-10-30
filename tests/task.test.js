import { test, describe, it, before } from 'node:test';
import assert from 'node:assert';
import cache, { invalidateTasksCache } from '../backend/config/cache.js';
import taskEmitter from '../backend/events/taskEmitter.js';
import { enhanceTaskWithAI, getAiServiceHealth } from '../backend/services/aiService.js';

/**
 * Automated Test Suite for Practical 12: CI/CD Pipeline with GitHub Actions
 * Tests core backend components: In-Memory Cache, EventEmitter, and Validation logic.
 */

describe('1. In-Memory Caching Unit Tests (Practical 9 Engine)', () => {
  it('should store and retrieve data from cache', () => {
    const testKey = 'test_sample_key';
    const testData = { title: 'Dockerized Microservice', priority: 'high' };

    cache.set(testKey, testData, 60);
    const retrieved = cache.get(testKey);

    assert.ok(retrieved, 'Cached data should not be null');
    assert.strictEqual(retrieved.title, 'Dockerized Microservice');
    assert.strictEqual(retrieved.priority, 'high');
  });

  it('should invalidate task keys on write operation', () => {
    cache.set('all_tasks', [{ title: 'Old Task' }], 60);
    cache.set('task_12345', { title: 'Old Single Task' }, 60);

    const evicted = invalidateTasksCache('12345');
    assert.ok(Array.isArray(evicted), 'Evicted keys should return an array');
    assert.strictEqual(cache.get('all_tasks'), undefined, 'all_tasks should be evicted');
    assert.strictEqual(cache.get('task_12345'), undefined, 'task_12345 should be evicted');
  });
});

describe('2. Event-Driven Architecture Unit Tests (Practical 10 EventEmitter)', () => {
  it('should emit and listen for task:created events asynchronously', async () => {
    const dummyTask = { _id: 'test_task_id_99', title: 'CI/CD Automated Test Task' };
    const dummyUser = { name: 'CI/CD Bot', email: 'ci@charusat.edu.in' };

    await new Promise((resolve, reject) => {
      const testListener = (payload) => {
        try {
          assert.strictEqual(payload.task.title, 'CI/CD Automated Test Task');
          assert.strictEqual(payload.user.email, 'ci@charusat.edu.in');
          taskEmitter.removeListener('task:created', testListener);
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      taskEmitter.on('task:created', testListener);
      taskEmitter.emit('task:created', { task: dummyTask, user: dummyUser, emittedAt: new Date().toISOString() });
    });
  });
});

describe('3. Validation & Business Logic Tests', () => {
  it('should validate task schema rules', () => {
    const isValidTitle = (title) => typeof title === 'string' && title.trim().length > 0;

    assert.strictEqual(isValidTitle('Valid Task Title'), true, 'Non-empty title should be valid');
    assert.strictEqual(isValidTitle('   '), false, 'Whitespace title should be invalid');
    assert.strictEqual(isValidTitle(''), false, 'Empty title should be invalid');
    assert.strictEqual(isValidTitle(null), false, 'Null title should be invalid');
  });

  // Practical 12 Requirement: Demonstrate a failed pipeline caused by a broken test
  it('demonstration of CI pass/fail condition', () => {
    if (process.env.DEMO_BROKEN_TEST === 'true') {
      assert.strictEqual(
        'pipeline_status_failed',
        'pipeline_status_passed',
        '🚨 INTENTIONAL CI FAILURE: Demonstrating broken test pipeline failure for Practical 12!'
      );
    } else {
      assert.strictEqual(
        'pipeline_status_passed',
        'pipeline_status_passed',
        '✅ CI Pipeline Test Passed: All tests green!'
      );
    }
  });
});

describe('4. AI API Integration & Graceful Degradation (Practical 13)', () => {
  it('should return operational health telemetry for AI service', async () => {
    const health = await getAiServiceHealth();
    assert.strictEqual(health.status, 'operational');
    assert.strictEqual(health.gracefulDegradationActive, true);
    assert.ok(Array.isArray(health.supportedFeatures));
  });

  it('should enhance a task using AI service or fallback', async () => {
    const enhanced = await enhanceTaskWithAI('Deploy Multi-Stage Docker Container to AWS');
    assert.ok(enhanced.description, 'Description should be generated');
    assert.ok(['low', 'medium', 'high', 'urgent'].includes(enhanced.priority), 'Valid priority expected');
    assert.ok(typeof enhanced.estimatedHours === 'number', 'Estimated hours should be numeric');
    assert.ok(Array.isArray(enhanced.subtasks), 'Subtasks should be an array');
    assert.strictEqual(enhanced.aiGenerated, true);
  });

  it('should gracefully degrade when external AI service errors or offline', async () => {
    const degraded = await enhanceTaskWithAI('Fix Critical Authentication Crash', '', { forceDegradation: true });
    assert.strictEqual(degraded.degraded, true, 'Degraded flag should be true');
    assert.strictEqual(degraded.source, 'fallback-heuristic-engine');
    assert.strictEqual(degraded.priority, 'high');
    assert.ok(degraded.description.length > 20);
    assert.ok(degraded.apiDiagnostics, 'Diagnostics object should be present');
  });
});

