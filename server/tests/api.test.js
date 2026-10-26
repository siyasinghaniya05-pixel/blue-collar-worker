process.env.NODE_ENV = 'test';
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../server.js';

let server;
let baseUrl;

before(async () => {
  await new Promise(resolve => {
    // Pick an ephemeral port for testing
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
});

async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

describe('KaushalID Full-Stack Backend Integration Tests', () => {

  test('1. Health Check returns KaushalID Platform API metadata', async () => {
    const res = await apiRequest('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'OK');
    assert.strictEqual(res.data.service, 'KaushalID Platform API');
    assert.ok(res.data.credentialsCount >= 3);
  });

  test('2. Unauthenticated request to /api/admin/stats returns 401 Unauthorized', async () => {
    const res = await apiRequest('/api/admin/stats');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.code, 'AUTH_REQUIRED');
  });

  test('3. Invalid password login returns 401 Unauthorized', async () => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'rajesh.patil@kaushalid.in', password: 'wrongpassword' }
    });
    assert.strictEqual(res.status, 401);
  });

  test('4. Worker Demo Login returns JWT and worker profile', async () => {
    const res = await apiRequest('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'worker' }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.role, 'worker');
    assert.strictEqual(res.data.user.kaushalId, 'KID-IN-MH-10248');
  });

  test('5. Worker Token accessing Admin endpoint returns 403 Forbidden', async () => {
    const loginRes = await apiRequest('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'worker' }
    });
    const workerToken = loginRes.data.token;

    const res = await apiRequest('/api/admin/stats', {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.code, 'FORBIDDEN_ROLE');
  });

  test('6. Admin Demo Login and Accessing /api/admin/stats returns 200 with real KPIs', async () => {
    const loginRes = await apiRequest('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'admin' }
    });
    assert.strictEqual(loginRes.status, 200);
    const adminToken = loginRes.data.token;
    assert.strictEqual(loginRes.data.user.role, 'admin');

    const res = await apiRequest('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.kpis.totalWorkers >= 8);
    assert.ok(res.data.kpis.verifiedCredentials >= 2);
  });

  test('7. QR Verification of Valid Credential (KID-IN-MH-10248) returns status VERIFIED', async () => {
    const res = await apiRequest('/api/verify/KID-IN-MH-10248');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.valid, true);
    assert.strictEqual(res.data.status, 'VERIFIED');
    assert.strictEqual(res.data.workerName, 'Rajesh Patil');
    assert.ok(res.data.verifiedCompetencies.length > 0);
    // Ensure sensitive contact details are masked
    assert.strictEqual(res.data.phone, undefined);
    assert.strictEqual(res.data.passwordHash, undefined);
  });

  test('8. QR Verification of Revoked Credential (KID-REVOKED-001) returns status REVOKED with mandatory reason', async () => {
    const res = await apiRequest('/api/verify/KID-REVOKED-001');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.valid, false);
    assert.strictEqual(res.data.status, 'REVOKED');
    assert.ok(res.data.revocationReason);
  });

  test('9. QR Verification of Non-existent Credential (KID-NONEXISTENT) returns 404 NOT_FOUND', async () => {
    const res = await apiRequest('/api/verify/KID-NONEXISTENT');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.valid, false);
    assert.strictEqual(res.data.status, 'NOT_FOUND');
  });

  test('10. Worker submits Assessment Request and Admin reviews/approves it', async () => {
    // 1. Worker login
    const workerAuth = await apiRequest('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'worker' }
    });
    const workerToken = workerAuth.data.token;

    // 2. Submit assessment request
    const createRes = await apiRequest('/api/assessment-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
      body: {
        trade: 'Electrician',
        skillArea: 'Solar Inverter Synchronization',
        evidenceDescription: 'Oscilloscope waveform and anti-islanding relay test log.'
      }
    });
    assert.strictEqual(createRes.status, 201);
    const requestId = createRes.data.request.id;
    assert.strictEqual(createRes.data.request.status, 'Pending Review');

    // 3. Admin login
    const adminAuth = await apiRequest('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'admin' }
    });
    const adminToken = adminAuth.data.token;

    // 4. Admin approves
    const reviewRes = await apiRequest(`/api/assessment-requests/${requestId}/review`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'Approved',
        score: 95,
        assessorNotes: 'Frequency locking and safety disconnect occurred within 12 milliseconds.'
      }
    });
    assert.strictEqual(reviewRes.status, 200);
    assert.strictEqual(reviewRes.data.request.status, 'Approved');
  });

  test('11. Employer bookmarks and unbookmarks candidate worker', async () => {
    const empAuth = await apiRequest('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'employer' }
    });
    const empToken = empAuth.data.token;

    const testWorkerId = `KID-TEST-${Date.now()}`;
    // 1. Add bookmark
    const addRes = await apiRequest('/api/employer/save-worker', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { workerId: testWorkerId }
    });
    assert.strictEqual(addRes.status, 200);
    assert.strictEqual(addRes.data.isSaved, true);
    assert.ok(addRes.data.savedWorkers.includes(testWorkerId));

    // 2. Remove bookmark (toggle)
    const removeRes = await apiRequest('/api/employer/save-worker', {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
      body: { workerId: testWorkerId }
    });
    assert.strictEqual(removeRes.status, 200);
    assert.strictEqual(removeRes.data.isSaved, false);
    assert.ok(!removeRes.data.savedWorkers.includes(testWorkerId));
  });

});
