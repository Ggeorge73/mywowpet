# Shopify E2E Pipeline — Secrets & Configuration Guide

Pipeline configuration reference for the **mywowpet.com** Shopify storefront CI/CD system. This document covers secrets provisioning, environment protection, and local development setup.

---

## Prerequisites

| Requirement | Details |
|---|---|
| **GitHub Repository** | Repository with Actions enabled and admin access to manage secrets |
| **Shopify Partner Account** | Partner or staff account with theme management permissions |
| **Theme Access App** | Installed on the store — generates CI-safe access tokens |
| **Node.js ≥ 18** | Required for Playwright and Shopify CLI |

---

## Required GitHub Secrets

All four secrets below **must** be configured before the pipeline will run successfully.

| Secret Name | Description | How to Obtain |
|---|---|---|
| `SHOPIFY_STORE_URL` | The `.myshopify.com` store identifier (e.g., `mywowpet.myshopify.com`) | **Shopify Admin** → Settings → Domains. Use the primary `.myshopify.com` URL, not a custom domain. |
| `SHOPIFY_CLI_TOKEN` | Theme Access password used for headless CI authentication | See [Generating a Theme Access Token](#generating-a-theme-access-token) below. |
| `SHOPIFY_THEME_ID` | Numeric ID of the target theme for deployments | **Shopify Admin** → Online Store → Themes → click **⋯** → **Edit code**. The theme ID is the numeric segment in the URL: `admin/themes/<THEME_ID>`. |
| `STOREFRONT_URL` | Public-facing storefront URL (e.g., `https://mywowpet.com`) | The live URL Playwright navigates during E2E tests. Use the canonical domain with `https://`. |

### Generating a Theme Access Token

1. In **Shopify Admin**, go to **Apps**.
2. Search for and install the **Theme Access** app (by Shopify).
3. Open the app and click **Create password**.
4. Give it a descriptive name: `CI/CD Pipeline — GitHub Actions`.
5. Copy the generated password — it is shown **only once**.
6. Store it as the `SHOPIFY_CLI_TOKEN` secret in GitHub.

> [!IMPORTANT]
> Theme Access tokens are scoped to a single store and do **not** expire automatically. Rotate them periodically and revoke any unused tokens via the Theme Access app.

---

## Setting Secrets in GitHub

1. Navigate to your repository on GitHub.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**.
4. Enter the secret **Name** exactly as shown in the table above (case-sensitive).
5. Paste the secret **Value**.
6. Click **Add secret**.
7. Repeat for all four secrets.

```text
Repository
 └── Settings
      └── Secrets and variables
           └── Actions
                ├── SHOPIFY_STORE_URL
                ├── SHOPIFY_CLI_TOKEN
                ├── SHOPIFY_THEME_ID
                └── STOREFRONT_URL
```

> [!TIP]
> Use **Environment secrets** instead of repository secrets if you need different values per environment (e.g., staging vs. production theme IDs).

---

## Optional: Environment Protection Rules

For production deployments, configure a protected environment with manual approval gates:

1. Go to **Settings** → **Environments** → **New environment**.
2. Name it `production`.
3. Enable **Required reviewers** and add one or more team members.
4. Optionally enable **Wait timer** (e.g., 5 minutes) for a cooldown before deploy.
5. Under **Deployment branches**, restrict to `main` only.

In the workflow YAML, the deploy job references this environment:

```yaml
deploy:
  needs: [test]
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://mywowpet.com
  steps:
    - uses: actions/checkout@v4
    - run: npm run shopify:deploy
      env:
        SHOPIFY_STORE_URL: ${{ secrets.SHOPIFY_STORE_URL }}
        SHOPIFY_CLI_TOKEN: ${{ secrets.SHOPIFY_CLI_TOKEN }}
        SHOPIFY_THEME_ID: ${{ secrets.SHOPIFY_THEME_ID }}
```

> [!WARNING]
> Without environment protection, any push to `main` will trigger an **automatic deployment** to the live theme. Configure required reviewers to prevent unintended production changes.

---

## Running Locally

Set the required environment variables in your shell before running tests:

### PowerShell

```powershell
$env:STOREFRONT_URL = "https://mywowpet.com"
$env:SHOPIFY_STORE_URL = "mywowpet.myshopify.com"
$env:SHOPIFY_CLI_TOKEN = "<your-theme-access-password>"
$env:SHOPIFY_THEME_ID = "<your-theme-id>"
```

### Bash / Zsh

```bash
export STOREFRONT_URL="https://mywowpet.com"
export SHOPIFY_STORE_URL="mywowpet.myshopify.com"
export SHOPIFY_CLI_TOKEN="<your-theme-access-password>"
export SHOPIFY_THEME_ID="<your-theme-id>"
```

Alternatively, create a `.env` file in the project root (already in `.gitignore`):

```env
STOREFRONT_URL=https://mywowpet.com
SHOPIFY_STORE_URL=mywowpet.myshopify.com
SHOPIFY_CLI_TOKEN=shptka_xxxxxxxxxxxxxxxxxxxx
SHOPIFY_THEME_ID=123456789
```

Then run:

```bash
# Install dependencies & browsers
npm install
npx playwright install --with-deps

# Run full suite
npm test

# Run with visible browser
npm run test:headed

# Run interactive UI mode
npm run test:ui

# Run Chromium only
npm run test:chromium

# View HTML report
npm run test:report
```

> [!CAUTION]
> **Never** commit `.env` files or hardcode secrets in source files. Verify `.gitignore` includes `.env` before your first commit.

---

## Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| `401 Unauthorized` on deploy | Expired or revoked `SHOPIFY_CLI_TOKEN` | Regenerate the token in the Theme Access app and update the GitHub secret. |
| `Theme not found` error | Incorrect `SHOPIFY_THEME_ID` | Verify the numeric ID in Shopify Admin → Themes → Edit Code URL. Published and unpublished themes have different IDs. |
| `429 Too Many Requests` | Shopify API rate limit hit | The pipeline retries automatically. If persistent, increase the wait between test runs or reduce parallel test workers in `playwright.config.ts`. |
| Tests fail with `Navigation timeout` | Storefront is slow or `STOREFRONT_URL` is wrong | Confirm the URL resolves publicly. Increase `timeout` in Playwright config. Check if the store is password-protected (remove the storefront password or handle it in test setup). |
| `SHOPIFY_CLI_TOKEN` works locally but fails in CI | Token copied with trailing whitespace | Re-paste the secret in GitHub, ensuring no leading/trailing spaces. |
| Deploy succeeds but theme unchanged | Pushed to wrong theme ID (e.g., staging) | Cross-check `SHOPIFY_THEME_ID` against the **live** theme, not an unpublished draft. |
| Playwright browsers not found in CI | `npx playwright install` step missing | Ensure the workflow includes `npx playwright install --with-deps` before the test step. |

> [!NOTE]
> For pipeline failures not covered here, check the **Actions** tab in GitHub for full job logs. Shopify CLI outputs detailed error messages that typically indicate the exact misconfiguration.
