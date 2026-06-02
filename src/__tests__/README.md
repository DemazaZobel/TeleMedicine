# MedLink — Frontend Test Suite

A complete guide to running, understanding, and reporting the MedLink frontend test suite.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Test Architecture](#2-test-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Prerequisites & Installation](#4-prerequisites--installation)
5. [Package.json Scripts](#5-packagejson-scripts)
6. [Running the Tests](#6-running-the-tests)
7. [Generating Reports](#7-generating-reports)
8. [Understanding the Output](#8-understanding-the-output)
9. [Test File Reference](#9-test-file-reference)
10. [Requirements Coverage Map](#10-requirements-coverage-map)
11. [Troubleshooting](#11-troubleshooting)
12. [Adding New Tests](#12-adding-new-tests)

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| **App** | MedLink — Telemedicine Platform |
| **Framework** | React Native / Expo (Expo Router) |
| **Language** | TypeScript |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Test Framework** | Jest (jest-expo preset) |
| **Total Test Cases** | 102 tests across 9 files |
| **Requirements Covered** | FR1–FR27, NFR1–NFR19 |

---

## 2. Test Architecture

The suite is organized into **three layers**, each testing a different level of the app:

```
Layer 1 — Unit Tests (Stores)
  └── Test Zustand store actions and computed values in isolation.
      No HTTP calls. No React. Pure TypeScript logic.

Layer 2 — Unit Tests (Services)
  └── Test HTTP service functions using axios-mock-adapter.
      Intercepts real axios calls. Verifies request payloads and
      response handling without hitting the real backend.

Layer 3 — Integration Tests
  └── Test how store logic integrates end-to-end across
      multiple actions (e.g. login → bootstrap → logout flow).
```

### Mocking Strategy

| What is mocked | How | Why |
|---|---|---|
| `expo-secure-store` | Manual jest mock in `setup.ts` | No native Keychain in Jest |
| `expo-router` | Manual jest mock in `setup.ts` | No navigation runtime in Jest |
| Backend API | `axios-mock-adapter` | Tests run offline, deterministic |
| Auth/Booking services | `jest.mock()` in store tests | Isolate store logic from HTTP |
| Static assets (images/CSS) | `fileMock.js` | Prevent import crashes |

---

## 3. Folder Structure

```
frontend/
├── jest.config.js                          ← Jest configuration
│
└── src/
    └── __tests__/
        ├── setup.ts                        ← Global mocks (runs before every test)
        │
        ├── __mocks__/
        │   └── fileMock.js                 ← Static asset mock
        │
        ├── unit/
        │   ├── stores/
        │   │   ├── authStore.test.ts       ← Auth, login, logout, bootstrap, profile
        │   │   ├── bookingStore.test.ts    ← Booking, cancellation, notifications, wallet
        │   │   ├── discoveryStore.test.ts  ← Doctor search and filters
        │   │   ├── doctorStore.test.ts     ← Doctor profile, documents, verification stages
        │   │   ├── rbac.test.ts            ← Role-based routing and access control
        │   │   └── appointmentLifecycle.test.ts ← Appointment status transitions
        │   │
        │   └── services/
        │       ├── authService.test.ts          ← Auth HTTP layer (login, register, OTP)
        │       └── doctorAndPaymentService.test.ts ← Doctor, payment, notification HTTP layer
        │
        └── integration/
            └── LoginForm.test.ts           ← Login logic + session bootstrap integration
```

---

## 4. Prerequisites & Installation

### Step 1 — Install test dependencies

Run this command inside the `frontend/` directory:

```bash
npm install --save-dev \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  axios-mock-adapter \
  jest-html-reporter \
  @types/jest
```

### Step 2 — Verify jest.config.js exists

Make sure `jest.config.js` is at the root of `frontend/` (same level as `package.json`).

### Step 3 — Verify setup.ts is in place

Make sure `src/__tests__/setup.ts` exists — this file mocks all native modules before tests run.

---

## 5. Package.json Scripts

Add these scripts to the `"scripts"` section of your `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:verbose": "jest --verbose",
  "test:coverage": "jest --coverage",
  "test:json": "jest --json --outputFile=test-results/results.json",
  "test:html": "jest --reporters=default --reporters=jest-html-reporter",
  "test:full": "jest --verbose --coverage --json --outputFile=test-results/results.json 2>&1 | tee test-results/results.txt",
  "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-html-reporter"
}
```

---

## 6. Running the Tests

### Run all tests (quickest)

```bash
npx jest
```

### Run all tests with every test name printed

```bash
npx jest --verbose
```

### Run a single test file

```bash
npx jest src/__tests__/unit/stores/authStore.test.ts
```

### Run tests matching a name pattern

```bash
# Run only auth-related tests
npx jest --testNamePattern="TC-AUTH"

# Run only booking tests
npx jest --testNamePattern="TC-BOOK"

# Run only a specific test case
npx jest --testNamePattern="TC-AUTH-004"
```

### Run tests in watch mode (re-runs on file save — useful during development)

```bash
npx jest --watch
```

### Run only tests that failed last time

```bash
npx jest --onlyFailures
```

---

## 7. Generating Reports

### JSON Report

Outputs a machine-readable file with every test result, duration, and error message.

```bash
npx jest --json --outputFile=test-results/results.json
```

File saved to: `frontend/test-results/results.json`

---

### Plain Text Report (Terminal output saved to file)

```bash
npx jest --verbose 2>&1 | tee test-results/results.txt
```

File saved to: `frontend/test-results/results.txt`

---

### HTML Report (Best for documentation — opens in browser)

Make sure `jest-html-reporter` is installed, then add this to `jest.config.js`:

```js
reporters: [
  "default",
  ["jest-html-reporter", {
    pageTitle: "MedLink Frontend Test Report",
    outputPath: "test-results/test-report.html",
    includeFailureMsg: true,
    includeSuiteFailure: true,
    sort: "status"
  }]
]
```

Then run:

```bash
npx jest
```

File saved to: `frontend/test-results/test-report.html`
Open it in any browser. You can print it to PDF directly from the browser.

---

### Coverage Report (Shows which lines of code are tested)

```bash
npx jest --coverage
```

This creates a `coverage/` folder. Open this file in your browser:

```
frontend/coverage/lcov-report/index.html
```

---

### All Reports at Once (

```bash
mkdir -p test-results
npx jest --verbose --coverage --json --outputFile=test-results/results.json 2>&1 | tee test-results/results.txt
```

This gives you:
- `test-results/results.txt` — full terminal output
- `test-results/results.json` — machine-readable JSON
- `test-results/test-report.html` — visual HTML report (if reporter configured)
- `coverage/lcov-report/index.html` — code coverage breakdown

---

## 8. Understanding the Output

### Terminal output explained

```
PASS  src/__tests__/unit/stores/authStore.test.ts    ← File passed
FAIL  src/__tests__/integration/LoginForm.test.ts    ← File has failures

  ● TC-AUTH-009: token refresh › updates access token   ← Failed test name

    expect(jest.fn()).toHaveBeenCalled()               ← What was checked
    Expected number of calls: >= 1
    Received number of calls:  0                       ← What actually happened

      205 |   expect(mockedAuthService.refreshToken).toHaveBeenCalled();
              ^                                        ← Exact line that failed

Test Suites: 1 failed, 4 passed, 5 total
Tests:       1 failed, 48 passed, 49 total             ← Summary line
Time:        0.41 s
```

### Coverage table explained

```
File                        | % Stmts | % Branch | % Funcs | % Lines
----------------------------|---------|----------|---------|--------
authStore.ts                |   87.5  |   75.0   |  100.0  |  87.5
  ← % of statements tested    ↑          ↑           ↑        ↑
                            Branches = if/else paths  Functions = called
```

- **Stmts** — percentage of code statements executed during tests
- **Branch** — percentage of if/else branches covered
- **Funcs** — percentage of functions called at least once
- **Lines** — percentage of lines executed

Aim for **≥ 70%** across all four columns for a solid test suite.

---

## 9. Test File Reference

| File | Layer | TC IDs | Count |
|------|-------|--------|-------|
| `authStore.test.ts` | Unit / Store | TC-AUTH-001, 003, 004, 005, 008, 010, 011, 012, 013, TC-PROFILE-002 | 13 |
| `bookingStore.test.ts` | Unit / Store | TC-BOOK-001, 005, TC-DOC-APPT-002, TC-NOTIF-001, 002, TC-PAY-004, TC-DOC-APPT-005 | 9 |
| `discoveryStore.test.ts` | Unit / Store | TC-SEARCH-001, 002, 003, 006 | 5 |
| `doctorStore.test.ts` | Unit / Store | TC-DOCTOR-001, 002, 003, 004, TC-NAV-005 | 12 |
| `rbac.test.ts` | Unit / Store | TC-NAV-001, 002, 003, 005, TC-NFR-008 | 10 |
| `appointmentLifecycle.test.ts` | Unit / Store | TC-STATUS-001, 002, TC-BOOK-002, 004, TC-DOC-APPT-005, 006, TC-REVIEW-004 | 12 |
| `authService.test.ts` | Unit / Service | TC-AUTH-001, 003, 004, 005, 008, TC-PROFILE-001, 002, TC-BOOK-001, 005, TC-DOC-APPT-002, TC-MEDICAL-001, 002, TC-NFR-005 | 14 |
| `doctorAndPaymentService.test.ts` | Unit / Service | TC-SEARCH-001, 005, TC-DOCTOR-001, 002, TC-STATUS-003, TC-PAY-001, 002, 004, TC-NOTIF-001, 002, 004, TC-BOOK-006, 007, TC-DOC-APPT-004, TC-NFR-003, 009 | 18 |
| `LoginForm.test.ts` | Integration | TC-AUTH-004, 005, 006, 009 | 9 |
| **TOTAL** | | | **102** |

---

## 10. Requirements Coverage Map

| Requirement | Test File(s) |
|-------------|-------------|
| FR1 — Auth & Login | authStore, authService, LoginForm |
| FR2 — Doctor Verification | doctorStore, doctorAndPaymentService |
| FR3 — Patient Profiles | authStore, authService |
| FR4 — Password Recovery | authStore, authService |
| FR5 — Doctor Search | discoveryStore, doctorAndPaymentService |
| FR6 — Filters & Sorting | discoveryStore, doctorAndPaymentService |
| FR7 — Doctor Profile Detail | doctorAndPaymentService |
| FR8 — Book Consultation | bookingStore, authService |
| FR9 — Accept/Reject/Reschedule | bookingStore, doctorAndPaymentService |
| FR10 — Appointment Status | bookingStore, appointmentLifecycle |
| FR11 — Notifications | bookingStore, doctorAndPaymentService |
| FR12 — Chat Messaging | (Maestro E2E — chat backend pending) |
| FR13 — File Sharing in Chat | (Maestro E2E — chat backend pending) |
| FR14 — Video Link | doctorAndPaymentService |
| FR15 — Secure Communication | authService (TC-NFR-005) |
| FR16 — Chapa Payment | doctorAndPaymentService |
| FR17 — View Fees Before Booking | doctorAndPaymentService |
| FR18 — Receipts | doctorAndPaymentService |
| FR19 — Doctor Wallet | bookingStore, doctorAndPaymentService |
| FR20 — Ratings & Reviews | appointmentLifecycle (TC-REVIEW-004) |
| FR21 — Average Ratings | doctorAndPaymentService |
| FR22 — Admin Verify Doctor | doctorStore |
| FR23 — Admin CRUD | (admin panel — future test file) |
| FR24 — Suspend Accounts | (admin panel — future test file) |
| FR25 — Analytics | (admin panel — future test file) |
| FR26 — RBAC | rbac.test.ts |
| FR27 — Data Encryption | authService (NFR-003, NFR-007) |
| NFR1 — Response ≤ 3s | authService (timeout config) |
| NFR3 — HTTPS | doctorAndPaymentService (TC-NFR-003) |
| NFR7 — Password not logged | authService (TC-NFR-005) |
| NFR8 — RBAC enforced | rbac.test.ts (TC-NFR-008) |
| NFR9 — Timeout configured | doctorAndPaymentService (TC-NFR-009) |

---

## 11. Troubleshooting

### "Cannot find module" errors

Make sure path aliases are configured in `jest.config.js`:

```js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

---

### "The module ... is not mocked" errors

Check that `setup.ts` is listed in `jest.config.js`:

```js
setupFiles: ['./src/__tests__/setup.ts'],
```

---

### "SyntaxError: Unexpected token" on Expo or NativeWind imports

Make sure `transformIgnorePatterns` in `jest.config.js` includes the problematic package. Add it to the list:

```js
transformIgnorePatterns: [
  'node_modules/(?!(expo|@expo|nativewind|react-native|YOUR_PACKAGE)/)',
]
```

---

### Tests pass locally but fail in CI

Add `--ci` flag which disables interactive mode:

```bash
npx jest --ci
```

---

### Coverage report shows 0% for some files

Run coverage with `--collectCoverageFrom` to force inclusion:

```bash
npx jest --coverage --collectCoverageFrom="src/**/*.{ts,tsx}"
```

---

## 12. Adding New Tests

### Template for a new store test

```ts
// src/__tests__/unit/stores/myStore.test.ts

import { act } from 'react-test-renderer';
import { useMyStore } from '../../../store/myStore';
import { myService } from '../../../features/my/services/myService';

jest.mock('../../../features/my/services/myService');
const mockedService = myService as jest.Mocked<typeof myService>;

beforeEach(() => {
  useMyStore.setState({ /* reset to initial */ });
  jest.clearAllMocks();
});

describe('TC-XX-001: descriptive test name', () => {
  it('does the expected thing', async () => {
    mockedService.someMethod.mockResolvedValueOnce({ result: 'ok' });

    await act(async () => {
      await useMyStore.getState().someAction();
    });

    expect(useMyStore.getState().someField).toBe('expected');
  });
});
```

### Template for a new service (HTTP) test

```ts
// src/__tests__/unit/services/myService.test.ts

import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../../../services/api';
import { myService } from '../../../features/my/services/myService';

const mock = new MockAdapter(apiClient);
afterEach(() => mock.reset());
afterAll(() => mock.restore());

describe('myService.someMethod', () => {
  it('TC-XX-001: GET /my-endpoint/ returns expected data', async () => {
    mock.onGet('/my-endpoint/').reply(200, { result: 'ok' });

    const result = await myService.someMethod();
    expect(result.result).toBe('ok');
  });
});
```

### Naming conventions

- **Files:** `[storeName].test.ts` or `[serviceName].test.ts`
- **Describe blocks:** `TC-XX-NNN: short description`
- **It blocks:** Plain English describing the expected behavior
- **Fixtures:** Define at the top of the file, reuse across tests

---

*MedLink Test Suite — maintained alongside the main frontend codebase.*