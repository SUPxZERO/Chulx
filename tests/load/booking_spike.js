import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 200 }, // ramp up to 200 users
    { duration: '1m', target: 200 },  // stay at 200 users for 1 min
    { duration: '30s', target: 1000 }, // spike to 1000 users
    { duration: '1m', target: 1000 }, // stay at 1000 for 1 min
    { duration: '30s', target: 0 },   // ramp down
  ],
};

export default function () {
  // Simulate attempting to double-book the same companion
  const payload = JSON.stringify({
    companion_id: 1,
    venue_id: 1,
    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
    scheduled_end: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    purpose: 'TOURISM'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'Authorization': 'Bearer YOUR_TEST_TOKEN' // In reality, we'd inject this
    },
  };

  const res = http.post('http://localhost/api/v1/bookings', payload, params);

  // We EXPECT mostly 422s or 500s due to the EXCLUDE constraint blocking double bookings
  check(res, {
    'is status 422 (blocked by DB)': (r) => r.status === 422 || r.status === 500,
    'is status 201 (success)': (r) => r.status === 201,
  });

  sleep(1);
}
