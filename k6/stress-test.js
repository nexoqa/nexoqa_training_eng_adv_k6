import http from "k6/http";
import { sleep } from "k6";

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-arrival-rate",
      preAllocatedVUs: 500,
      timeUnit: "1s",
      stages: [
        { duration: "2m", target: 10 }, // below normal load
        { duration: "5m", target: 10 },
        { duration: "2m", target: 20 }, // normal load
        { duration: "5m", target: 20 },
        { duration: "2m", target: 30 }, // around the breaking point
        { duration: "5m", target: 30 },
        { duration: "2m", target: 40 }, // beyond the breaking point
        { duration: "5m", target: 40 },
        { duration: "10m", target: 0 }, // scale down. Recovery stage.
      ],
    },
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

