# Testing Strategy

VisionKirana involves complex ML heuristics, financial data, and offline-first browser capabilities. A rigorous testing strategy is mandatory.

## 1. Unit Testing
**Scope**: Individual functions, utility classes, and ML heuristics.
**Framework**: `pytest` for backend, `Vitest` for frontend.

* **Risk Engine**: We must mock the inputs and assert that exactly `100.0` is returned for perfect shops, and Risk Categories break perfectly at the defined boundaries (e.g., >80 is Low Risk).
* **Location Intelligence**: Assert that mock seed data returns deterministic values.

## 2. Integration Testing
**Scope**: API endpoints and database transactions.
**Framework**: `pytest` with `httpx` (FastAPI TestClient) and a test PostgreSQL/SQLite database.

* **Upload Pipeline**: Test the multipart form upload endpoint. Verify that a background task is successfully enqueued upon a 201 Created response.
* **Aggregator Report API**: Assert that the `/api/v1/report/{id}` endpoint aggregates data correctly without throwing 500 errors if sub-modules (like Voice) return null.

## 3. End-to-End (E2E) Testing
**Scope**: Critical user journeys in a real browser.
**Framework**: `Playwright` or `Cypress`.

* **Shop Registration**: Log in as a shop owner, navigate to `/register-shop`, fill the form, and assert redirect to the dashboard.
* **Offline Sync**: 
  1. Login.
  2. Throttle network to 'Offline' via Playwright network interception.
  3. Submit a form. Assert "Saved Locally" UI appears.
  4. Restore network. Assert Sync Engine fires and UI turns green.
* **Admin Dashboard**: Log in as admin, navigate to `/dashboard`, assert the Recharts Area Chart renders successfully.

## 4. ML Model Testing
**Scope**: Accuracy of CV and OCR integrations.

* Keep a frozen dataset of 50 store images and 50 invoices in a hidden test directory.
* Run EasyOCR and OpenCV over this frozen dataset nightly in CI.
* Assert that the extracted confidence scores and text outputs do not deviate significantly from a known benchmark JSON file to prevent regressions.
