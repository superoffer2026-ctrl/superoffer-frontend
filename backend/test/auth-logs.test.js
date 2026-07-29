import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../app.js';

let server;
let baseUrl;

before(async () => {
  const created = createApp({
    tokenSecret: 'test-secret-with-more-than-32-characters',
    adminApprovalKey: 'test-admin-key'
  });
  server = created.app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

test('serves public dynamic data endpoints', async () => {
  const statsRes = await fetch(`${baseUrl}/api/v1/public/stats`);
  assert.equal(statsRes.status, 200);
  const stats = await statsRes.json();
  assert.ok(stats.verified_students > 0);
  assert.ok(stats.active_universities > 0);

  const unisRes = await fetch(`${baseUrl}/api/v1/public/universities`);
  assert.equal(unisRes.status, 200);
  const unis = await unisRes.json();
  assert.ok(Array.isArray(unis.universities));
  assert.ok(unis.universities.length >= 3);
});

test('admin auth logs endpoint requires admin key and returns audit logs and CSV', async () => {
  const unauthorizedRes = await fetch(`${baseUrl}/api/v1/admin/auth-logs`);
  assert.equal(unauthorizedRes.status, 401);

  const logsRes = await fetch(`${baseUrl}/api/v1/admin/auth-logs`, {
    headers: { 'x-admin-key': 'test-admin-key' }
  });
  assert.equal(logsRes.status, 200);
  const data = await logsRes.json();
  assert.ok(Array.isArray(data.logs));
  assert.ok(data.total >= 5);

  const csvRes = await fetch(`${baseUrl}/api/v1/admin/auth-logs?format=csv`, {
    headers: { 'x-admin-key': 'test-admin-key' }
  });
  assert.equal(csvRes.status, 200);
  assert.ok(csvRes.headers.get('content-type').includes('text/csv'));
  const text = await csvRes.text();
  assert.ok(text.includes('IP Address,Status'));
});
