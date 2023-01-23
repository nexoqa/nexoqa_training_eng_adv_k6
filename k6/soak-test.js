import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 400 }, // ramp up to 400 users
    { duration: '3h56m', target: 400 }, // stay at 400 for ~4 hours
    { duration: '2m', target: 0 }, // scale down. (optional)
  ],
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


