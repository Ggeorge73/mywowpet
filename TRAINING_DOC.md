# DevSecOps Training & Infrastructure Guide: mywowpet.com

**Version:** 1.0  
**Last Updated:** June 2026  
**Purpose:** This document serves as a comprehensive educational guide and onboarding manual for new developers, project managers, and engineers joining the `mywowpet.com` project. It details the journey from manual theme management to a fully autonomous DevSecOps infrastructure, explaining the "why", "how", and "what's next".

---

## 1. Project Context & Objectives

### The Initial State
Historically, managing a Shopify storefront like `mywowpet.com` involved developers making manual code changes in the Shopify Admin UI or using localized CLI pushes without a central source of truth. This approach lacked version control consistency, security auditing, and automated testing, leading to potential downtime and brittle deployments.

### The Objective
The core goal was to implement an enterprise-grade **DevSecOps (Development, Security, and Operations)** ecosystem. We aimed to:
1. Make the GitHub repository the absolute single source of truth for all theme code.
2. Implement "Shift-Left" security to catch exposed passwords or vulnerabilities *before* they deploy.
3. Establish automated Quality Assurance (QA) gates that block deployments if the storefront breaks.
4. Eliminate manual human deployments via Continuous Delivery (CD).

---

## 2. Phase 1: CI/CD Foundations & Lessons Learned

### What Was Intended
We set out to create a unified GitHub Actions pipeline (`e2e-shopify-pipeline.yml`) that would lint the code, run Playwright E2E tests, and deploy the code via the Shopify CLI.

### What Was Achieved & Learned
We successfully configured the pipeline, but this phase served as a masterclass in advanced GitHub Actions YAML debugging. We encountered and resolved several complex Infrastructure-as-Code (IaC) syntax constraints:
* **Expression Evaluation:** We learned that using hyphens in step IDs (e.g., `run-tests`) breaks YAML logical expressions because the hyphen is evaluated as a subtraction operator (`steps.run - tests.outcome`). We resolved this by adopting snake_case (`run_tests`).
* **Secrets Context Scope:** We discovered that the `${{ secrets.* }}` context cannot be mapped at the global job `env` level if it relies on conditional expressions, and strictly must be injected at the step level or `with` blocks.
* **Outcome Verification:** The pipeline successfully executed, and when the Playwright tests failed, the pipeline immediately halted the deployment step. This successfully validated our core objective: **The Quality Gate works.**

---

## 3. Phase 2: Autonomous DevSecOps Orchestration

### What Was Intended
With the basic mechanics proven, we needed to evolve the infrastructure into a highly modular, professional-grade DevSecOps team structure. We invoked four specialized AI subagents to architect distinct operational areas:
1. **Agile Orchestrator:** Ticket & sprint management.
2. **CI/CD Architect:** Advanced deployment logic.
3. **AppSec Expert:** Automated security gating.
4. **SRE QA Engineer:** Production testing and monitoring.

### What Was Achieved
The subagents successfully generated a complete suite of modular configurations, resulting in the `DevSecOps_Runbook.md` and several discrete pipeline files.

#### A. Security & Compliance (`security-gates.yml`)
* **Gitleaks:** Scans every pull request commit for accidentally hardcoded API keys or passwords.
* **Semgrep (SAST):** Scans the raw code for insecure programming patterns (like Cross-Site Scripting vulnerabilities).
* **Trivy (SCA):** Scans third-party NPM dependencies to ensure we aren't inheriting known CVEs (Common Vulnerabilities and Exposures).

#### B. End-to-End Testing (`playwright.yml` & `checkout.spec.ts`)
* A headless browser (Chromium/Webkit) spins up on a GitHub Ubuntu runner.
* It navigates to the storefront, adds an item to the cart, and attempts to checkout.
* This ensures that no code merge can ever break the primary revenue-generating funnel. 

#### C. Continuous Deployment (`shopify-cd.yml`)
* Completely replaces the manual "Publish Theme" button in Shopify.
* Once security and tests pass, it securely authenticates via `SHOPIFY_CLI_THEME_TOKEN` and forces the repository code into the live Shopify environment.

#### D. Agile Workflow Integration
* A Scrumban methodology was defined, enforcing that every git branch and commit must carry a Jira ticket ID (e.g., `MWP-123`). GitHub Webhooks are mapped to automatically move Jira tickets across the Kanban board as Pull Requests are opened, reviewed, and merged.

---

## 4. Current Architecture State

As of this documentation, the repository contains:
- `.github/workflows/shopify-cd.yml`: The deployment engine.
- `.github/workflows/security-gates.yml`: The automated security guards.
- `.github/workflows/playwright.yml`: The QA test runner.
- `e2e-tests/checkout.spec.ts`: The synthetic checkout test.
- `playwright.config.ts`: The testing framework configuration.
- `DevSecOps_Runbook.md`: The operational manual for the team.

**All of these are live and currently enforcing rules on the `main` branch.**

---

## 5. Maintenance & Next Steps

For any developer taking over this architecture, the following steps are required to keep the system healthy:

1. **Test Maintenance (Urgent):** The generic Playwright test in `e2e-tests/checkout.spec.ts` needs its CSS selectors updated to match the specific DOM elements of the `mywowpet.com` theme (e.g., updating the class name for the "Add to Cart" button).
2. **Pipeline Consolidation:** The initial proof-of-concept pipeline (`e2e-shopify-pipeline.yml`) overlaps with the new modular pipelines. It should be safely deleted.
3. **Secret Management:** Ensure all required environment variables (`STAGING_URL`, `TEST_API_TOKEN`, etc.) are actively maintained in GitHub Settings > Secrets.
4. **Jira Synchronization:** Ensure the Jira project webhooks are physically connected to the GitHub repository to realize the automated ticket transitions outlined in the Runbook.
