import http from 'k6/http';
import { check, group, sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 1 minutes.
    { duration: '2m', target: 100 }, // stay at 100 users for 2 minutes
    { duration: '1m', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'http://localhost:8081';

export default () => {

    let iterationInTest = `${exec.scenario.iterationInTest}`;
    let data = {
      email: 'TestUser'+iterationInTest+'@test.com',
      password: 'SuperCroc2020',
    };
  
    const response = http.post(`${BASE_URL}/register`, JSON.stringify(data),{
      headers: { 'Content-Type': 'application/json' },
    });
  
    check(response, {
      'register in successfully': (resp) => resp.json('token') !== '' && resp.status === 200,
    });
  
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${response.json('token')}`,
      },
    };
  
    const bookmarks = http.get(`${BASE_URL}/bookmarks`, authHeaders).json();
    check(bookmarks, { 'retrieved bookmarks': (bookmark) => bookmark.length >= 0 });
  
    sleep(1);
  
  };
  
  export function teardown(data) {
      const responseReset = http.get(`${BASE_URL}/reset`);
      console.log(responseReset.status)
      check(responseReset, { 'retrieved reset': (reset) => reset.status === 200 });
  }
  
