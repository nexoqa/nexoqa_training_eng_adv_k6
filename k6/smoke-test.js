import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export const options = {
  vus: 1, 
  duration: '1s',

  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'http://localhost:8081';

export default () => {

  let data = {
    email: 'TestUser@test.com',
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
