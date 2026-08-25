import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const failureRate = new Rate("custom_failure_rate");
const responseTime = new Trend("custom_response_time", true);

export const options = {
  scenarios: {
    health_check_load: {
      executor: "constant-vus",
      vus: 50,
      duration: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    custom_failure_rate: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export default function () {
  const response = http.get(`${BASE_URL}/health`);

  const passed = check(response, {
    "status is 200": (res) => res.status === 200,
    "response reports healthy status": (res) => {
      try {
        return res.json("status") === "healthy";
      } catch {
        return false;
      }
    },
  });

  failureRate.add(!passed);
  responseTime.add(response.timings.duration);

  sleep(1);
}
