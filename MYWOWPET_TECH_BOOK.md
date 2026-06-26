# 📖 MyWowPet Master Technology Book
**Version:** 1.0  
**Repository:** [mywowpet](https://github.com/Ggeorge73/mywowpet)

Welcome to the **MyWowPet Master Technology Book**. This document serves as the comprehensive onboarding guide, architectural blueprint, and operational runbook for the MyWowPet storefront. Whether you are a frontend developer, QA engineer, or DevSecOps specialist, this guide explains exactly what we built, how it works, and how to maintain it.

---

## Chapter 1: System Overview & Architecture

### The Core Paradigm
MyWowPet operates on a modern, decoupled web architecture. Instead of relying on a monolithic CMS, the application splits concerns across specialized tools:

1. **The Static Frontend:** A custom HTML/CSS/JS frontend providing an ultra-fast, app-like experience.
2. **The Firebase Backend:** Provides scalable hosting and secure database rules (Firestore) for user profiles, carts, and reviews.
3. **The Shopify Engine:** Handles the actual e-commerce logic, theme asset compilation, and payment processing.
4. **The DevSecOps Orchestrator:** A robust suite of GitHub Actions that strictly guards the `main` branch with security scans, Playwright UI testing, and automated continuous delivery.

### Repository Topography
* **`/assets`, `/css`, `/js`**: The client-side logic and styling.
* **`*.html`**: The core application pages (`index.html`, `cart.html`, `checkout.html`, etc.).
* **`/e2e-tests`**: Playwright UI automation specs ensuring business-critical user flows (like checking out) never break.
* **`.github/workflows`**: The CI/CD heart of the operation, containing the deployment and security pipelines.
* **`firebase.json` & `firestore.rules`**: Firebase infrastructure-as-code.

---

## Chapter 2: The Frontend Architecture

### Core Pages
The frontend is primarily driven by static HTML files that aggressively cache for performance.
* **`index.html`**: The main storefront landing page.
* **`product.html` / `shop.html`**: The product listing and details pages.
* **`cart.html` / `checkout.html`**: The highly sensitive purchase funnel.

### Client-Side Logic & PWA
The client-side logic (inside the `/js` folder) interacts heavily with Firestore and the browser's local storage to manage state (like the cart count). 

We also implemented a **Service Worker (`sw.js`)**. This grants the storefront Progressive Web App (PWA) capabilities, allowing assets to be cached locally on the user's device. This drastically improves load times on repeat visits and provides offline resilience.

---

## Chapter 3: Backend, Database & Hosting

### Firebase Hosting (`firebase.json`)
The storefront is hosted on Firebase Hosting. Key architectural decisions configured in `firebase.json` include:
- **`cleanUrls: true`**: Automatically drops `.html` extensions for cleaner routing.
- **Aggressive Caching**: Static assets (JS, CSS, images) are cached for 3600 seconds (`max-age=3600`).
- **Strict Content Security Policy (CSP)**: We enforce a very strict CSP. We only allow scripts and styles from `'self'`, Shopify (`sdks.shopifycdn.com`), and Google (`www.gstatic.com`). The site is permitted to frame `checkout.shopify.com` to ensure the Shopify checkout funnel functions securely without exposing the site to Cross-Site Scripting (XSS).

### Firestore Security (`firestore.rules`)
We use Firestore to store stateful user data. The database rules (`firestore.rules`) are strictly locked down:
- **`isOwner(userId)`**: Users can only read and write their own documents in the `/users/` collection.
- **Schema Validation**: Writes to the user profile enforce a strict schema using `hasOnlyAllowedUserFields()`. You cannot inject arbitrary fields into a user document.
- **Reviews**: Authenticated users can create reviews, but they are validated natively in the rules to ensure ratings are integers between 1 and 5.
- **Locked Collections**: Sensitive collections like `/orders`, `/loyalty`, and `/subscriptions` are strictly set to `allow read, write: if false;`, meaning they can only be manipulated by privileged backend admin SDKs, not the client.

---

## Chapter 4: The Testing Ecosystem (Playwright)

Quality Assurance is fully automated. We do not rely on manual testing for deployments.

### Playwright Configuration (`playwright.config.ts`)
We use Playwright to simulate real users browsing the storefront.
- **Cross-Browser:** Tests run against both Desktop Chromium and Mobile Safari (iPhone 12).
- **Environment Targeting:** If `BASE_URL` is provided (e.g., in CI pointing to staging), it tests against the live URL. If omitted, Playwright automatically spins up a local server (`npx serve . -l 3000`) and tests against localhost.
- **Artifacts:** Video recordings and DOM traces are retained `only-on-failure`.

### The E2E Suite (`e2e-tests/checkout.spec.ts`)
The crown jewel of our testing suite is the checkout synthetic test. It ensures:
1. The product page loads.
2. The `#add-to-cart-btn` is visible and clickable.
3. The cart state updates successfully.

> [!WARNING]
> If a UI developer changes the ID of the Add to Cart button or modifies the DOM structure of the product page, this test will fail, and the deployment will be blocked. Tests must be updated alongside UI changes.

---

## Chapter 5: DevSecOps & CI/CD Pipelines

Our GitHub Actions setup operates as an autonomous DevOps team. All code merged to `main` must pass through these three pipelines.

### 1. Security Gates (`security-gates.yml`)
This pipeline implements "Shift-Left" security:
- **Gitleaks (Secret Detection):** Scans the PR for accidentally committed API keys, passwords, or tokens.
- **Semgrep (SAST):** Scans the Javascript source code for insecure patterns and XSS vulnerabilities.
- **Trivy (SCA):** Scans the `package.json` and `package-lock.json` for third-party NPM libraries with known vulnerabilities (CVEs).

### 2. Quality Assurance (`playwright.yml`)
- Triggers on PRs to `main` and pushes to `staging`.
- Checks out the code, runs `npx playwright install --with-deps`, and executes the test suite.
- Blocks the merge if any business-critical UI flows are broken.

### 3. Continuous Delivery (`shopify-cd.yml`)
This is the deployment engine.
1. **Build:** Runs `npm ci` and `npm run build` to compile theme assets.
2. **Lint:** Uses the Shopify CLI to run `shopify theme check`.
3. **Scan:** Runs a final Trivy filesystem scan.
4. **Deploy:** If all previous steps and the security/playwright gates are green, it authenticates using `SHOPIFY_CLI_THEME_TOKEN` and forces the code to the live Shopify theme (`SHOPIFY_PROD_THEME_ID`).

---

## Chapter 6: Operational Guides & Onboarding

### Local Development Setup
To run the MyWowPet storefront locally on your machine:
1. Clone the repository: `git clone https://github.com/Ggeorge73/mywowpet.com`
2. Install dependencies: `npm ci`
3. Serve the local frontend: `npx serve . -l 3000` (or let Playwright do it automatically when running tests).
4. Run tests locally: `npm run test:ui` (opens the Playwright UI mode).

### Dealing with Failed Deployments
If the `Shopify Continuous Delivery` pipeline fails on the `main` branch, investigate in this order:
1. **Did Playwright Fail?** Check the E2E workflow. If tests failed, download the `playwright-report` artifact to view the video of the failure. *Do not force deploy; fix the bug or the test.*
2. **Did a Security Gate Trip?** Check if Trivy found a new High/Critical vulnerability in an NPM package. Run `npm audit fix` locally, push the update, and let the pipeline run again.
3. **Did Theme Check Fail?** Check the logs for Liquid syntax errors.

> [!TIP]
> **Golden Rule:** The `main` branch must always remain deployable. Never bypass branch protection rules. If a test is flaky, fix the flakiness; do not disable the test.
