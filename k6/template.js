import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

//init section
export const options = {
  vus: 1, 
  duration: '1s',

  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'http://localhost:8081';
//init section

export function setup(){
    // Preconditions
}

export default () => {


};

export function teardown(data) {

}
