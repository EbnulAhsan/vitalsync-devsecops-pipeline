# VitalSync — CI/CD Quality, Security & Performance Pipeline

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Security Scan](https://img.shields.io/badge/trivy-passing-brightgreen)]()
[![Code Quality](https://img.shields.io/badge/sonarcloud-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## Overview

**VitalSync** is a health and wellness tracking application that helps users monitor and manage personal health metrics — including BMI, water intake, sleep, weight, and fitness goals.

This repository showcases a production-style **DevSecOps pipeline** built around VitalSync's backend service, demonstrating how quality, security, and performance can be enforced automatically at every stage of the software delivery lifecycle — from commit to container.

The pipeline integrates:

| Stage | Purpose |
|---|---|
| **Unit Testing** | Verify business logic correctness (Jest) |
| **Static Code Analysis** | Catch bugs, code smells, and vulnerabilities (SonarCloud) |
| **Policy as Code** | Enforce deployment and configuration rules (OPA) |
| **Load Testing** | Validate performance under concurrent load (k6) |
| **Container Security** | Scan images for vulnerabilities and misconfigurations (Trivy) |
| **CI/CD Orchestration** | Automate the above on every push/PR (GitHub Actions) |

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Quality Engineering](#quality-engineering)
- [Security Implementation](#security-implementation)
- [Performance Testing](#performance-testing)
- [Docker](#docker)
- [Getting Started](#getting-started)
- [Generated Artifacts](#generated-artifacts)
- [Security & Performance Improvements](#security--performance-improvements)
- [Pipeline Status](#pipeline-status)
- [Assignment Deliverables](#assignment-deliverables)
- [Author](#author)

---

## Tech Stack

**Backend**
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

**Quality & Security**
- Jest — unit testing & coverage
- SonarCloud — static analysis, code quality, and security hotspots
- Open Policy Agent (OPA) — policy-as-code validation
- Trivy — container vulnerability scanning

**DevOps & CI/CD**
- Docker — multi-stage, hardened container builds
- GitHub Actions — CI/CD orchestration
- k6 — performance/load testing

---

## Project Structure

```
.
├── src/                        # Application source code
├── prisma/                     # Prisma schema & migrations
├── tests/                      # Jest unit tests
├── policies/
│   └── security.rego           # OPA policy definitions
├── performance/
│   └── health-test.js          # k6 load test script
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions pipeline definition
├── Dockerfile                   # Multi-stage, non-root container build
├── docker-compose.yml
├── package.json
└── README.md
```

---

## CI/CD Pipeline

The pipeline is orchestrated with **GitHub Actions** and runs automatically on every push and pull request. It is organized into four sequential stages, each acting as a quality gate for the next.

```
 ┌────────────────────────┐
 │ Build & Unit Tests     │
 └───────────┬────────────┘
             ▼
 ┌────────────────────────┐
 │ OPA Policy Validation  │
 └───────────┬────────────┘
             ▼
 ┌────────────────────────┐
 │ k6 Load Testing        │
 └───────────┬────────────┘
             ▼
 ┌────────────────────────┐
 │ Build & Scan Docker    │
 │ Image (Trivy)          │
 └───────────┬────────────┘
             ▼
 ┌────────────────────────┐
 │ Artifacts Published     │
 └────────────────────────┘
```

### Stage 1 — Build and Unit Tests
- Install project dependencies
- Run the Jest unit test suite
- Generate a code coverage report

### Stage 2 — OPA Policy Validation
- Validate deployment and configuration rules against `policies/security.rego`
- Fail the build if required environment variables or security configurations are missing

### Stage 3 — k6 Load Testing
- Simulate concurrent traffic against the `/health` endpoint
- Generate a performance report artifact

### Stage 4 — Build and Scan Docker Image
- Build the production Docker image using a multi-stage Dockerfile
- Run a Trivy vulnerability scan against the built image
- Upload the security scan report as a workflow artifact

---

## Quality Engineering

### Unit Testing

Unit tests are implemented with **Jest**, currently covering the BMI calculation service, with coverage reporting wired into CI.

```bash
# Run tests
npm test

# Generate coverage report
npm run test:coverage
```

**Results**
- All unit tests pass successfully
- Coverage report generated automatically on every run
- Coverage artifact stored via GitHub Actions for historical tracking

### Static Code Analysis (SonarCloud)

SonarCloud performs continuous static analysis across the codebase, checking for:

- Bugs
- Vulnerabilities
- Code smells
- Maintainability
- Reliability
- Security hotspots

**Current Results**

| Metric | Count |
|---|---|
| Security Issues | 0 |
| Reliability Issues | 0 |
| Maintainability Issues | 1 |
| Application source code issues | 0 |

> **Note:** The single remaining maintainability issue is located in an auto-generated Prisma migration file (`prisma/migrations/*/migration.sql`). Modifying auto-generated migration files is not recommended, so this finding is accepted as-is rather than suppressed or edited.

---

## Security Implementation

### Secret Management

All hardcoded secrets were removed from the codebase and replaced with environment-variable-based configuration.

`.env.example`:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

### Hardened Dockerfile

The Docker build follows container security best practices:

- **Multi-stage build** — separates build-time dependencies from the runtime image
- **Production-only dependency installation** — no dev dependencies ship in the final image
- **Non-root container user** — the application runs without root privileges inside the container

**Benefits**
- Reduced attack surface
- Smaller final image size
- Improved container security posture
- Better alignment with production deployment practices

### Policy as Code (OPA)

**Open Policy Agent** validates deployment and configuration policies before a build is allowed to proceed, catching misconfigurations before they reach production.

```bash
opa eval \
  -d policies/security.rego \
  -i policies/input.json \
  "data.security.allow"
```

**Validation coverage:**
- Required environment variables are present
- Security-related configuration meets policy requirements
- Deployment configuration is compliant before promotion

### Vulnerability Scanning (Trivy)

**Trivy** scans the built Docker image as part of CI, covering:

- OS-level vulnerabilities
- Dependency vulnerabilities
- Container misconfigurations
- Exposed secrets

Scan results are published as the `trivy-report` artifact on every pipeline run.

---

## Performance Testing

### k6 Load Testing

Performance is validated using **k6**, targeting the application's `/health` endpoint under simulated concurrent load.

**Test scenario**

| Parameter | Value |
|---|---|
| Endpoint | `/health` |
| Virtual Users | 50 |
| Duration | Configured in workflow |

**Run locally**

```bash
k6 run performance/health-test.js
```

Results are published as the `k6-results` artifact after every CI run, enabling performance regressions to be tracked over time.

---

## Docker

**Build the image**

```bash
docker build -t vitalsync .
```

**Run the container**

```bash
docker run -p 5000:5000 vitalsync
```

---

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd vitalsync
   ```
2. Copy the environment template and fill in your own values
   ```bash
   cp .env.example .env
   ```
3. Install dependencies
   ```bash
   npm install
   ```
4. Run database migrations
   ```bash
   npx prisma migrate dev
   ```
5. Start the application
   ```bash
   npm run dev
   ```
6. Run the test suite locally
   ```bash
   npm test
   ```

---

## Generated Artifacts

Every pipeline run automatically produces the following downloadable artifacts in GitHub Actions:

| Artifact | Description |
|---|---|
| `coverage-report` | Jest unit test coverage results |
| `trivy-report` | Container vulnerability scan results |
| `k6-results` | Load/performance test results |

### Evidence Collected

- Unit test success logs
- Coverage report
- OPA policy validation output
- GitHub Actions run summary
- SonarCloud analysis dashboard
- Trivy scan report
- k6 load test results

---

## Screenshots

> Replace each link below with your Google Drive share link (make sure sharing is set to "Anyone with the link").

| Evidence |
|---|---|
 https://drive.google.com/drive/folders/1lFRs4HEeV0JrwFglSQt9w17qgqB-JRg8?usp=sharing
---

## Security & Performance Improvements

**Security**
- ✅ Removed hardcoded secrets
- ✅ Added environment-based configuration (`.env.example`)
- ✅ Built a hardened, non-root Dockerfile
- ✅ Implemented OPA policy validation
- ✅ Added automated Trivy vulnerability scanning
- ✅ Added CI-enforced security checks

**Performance**
- ✅ Automated load testing with k6
- ✅ Health endpoint validated under concurrent load
- ✅ Performance report generation per pipeline run
- ✅ CI-integrated performance verification

---

## Pipeline Status

| Check | Status |
|---|---|
| Build | ✅ Successful |
| Unit Tests | ✅ Passed |
| Coverage | ✅ Generated |
| OPA Validation | ✅ Passed |
| Docker Image Build | ✅ Successful |
| Trivy Scan | ✅ Completed |
| k6 Load Test | ✅ Passed |
| SonarCloud Analysis | ✅ Integrated |
| GitHub Actions Workflow | ✅ Successful |

---

## Assignment Deliverables

- [x] GitHub repository
- [x] GitHub Actions CI/CD pipeline
- [x] SonarCloud integration
- [x] Jest unit tests
- [x] Coverage report
- [x] Docker image build
- [x] Trivy vulnerability scan
- [x] OPA policy validation
- [x] k6 performance testing
- [x] Documented security improvements
- [x] Evidence screenshots

---

## Author

**Md. Ebnul Ahsan**

*CI/CD Quality, Security & Performance project*
DevSecOps implementation using GitHub Actions, SonarCloud, Docker, Trivy, OPA, and k6.
