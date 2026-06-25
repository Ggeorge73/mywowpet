const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  let browser;
  try {
    console.log("Connecting to Chrome CDP on http://127.0.0.1:9222...");
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const contexts = browser.contexts();
    if (contexts.length === 0) {
      console.error("No contexts found.");
      return;
    }
    const pages = contexts[0].pages();
    const page = pages.find(p => p.url().includes("mail.google.com")) || pages[0];
    console.log(`Connected to page: "${await page.title()}" at URL: ${page.url()}`);

    // Wait for Gmail to load
    await page.waitForLoadState('domcontentloaded');

    // Get list of emails in the inbox
    const emailRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.zA'));
      return rows.map((r, idx) => {
        const sender = r.querySelector('span.yP, span.zF')?.innerText || 'Unknown';
        const subjectEl = r.querySelector('span.bog');
        const subject = subjectEl?.innerText || 'No Subject';
        const snippet = r.querySelector('span.y2')?.innerText || '';
        const date = r.querySelector('td.xW span')?.innerText || '';
        const isUnread = r.classList.contains('zE');
        return { idx, sender, subject, snippet, date, isUnread };
      });
    });

    console.log(`\nFound ${emailRows.length} email rows in the current view:`);
    emailRows.slice(0, 15).forEach(r => {
      console.log(`[Row ${r.idx}] Date: ${r.date} | Sender: ${r.sender} | Subject: ${r.subject} | Unread: ${r.isUnread}`);
      console.log(`   Snippet: ${r.snippet.substring(0, 80)}`);
      console.log('-'.repeat(50));
    });

    // Write inbox list to a json file
    fs.writeFileSync('gmail_rows_scraped.json', JSON.stringify(emailRows, null, 2));
    console.log("Wrote gmail_rows_scraped.json");

    // Let's scrape the full bodies of the four target emails:
    // 1. Dance Intensive Registration Confirmation
    // 2. Invoice for Adeoba's Fall Semester
    // 3. Your store "MyWowPetStore" has been suspended
    // 4. Housekeeping: Kindly treat as URGENT (Lara George)
    const targets = [
      { key: "dance_intensive", pattern: "dance intensive" },
      { key: "tuition_invoice", pattern: "invoice for adeoba" },
      { key: "shopify_suspended", pattern: "suspended" },
      { key: "housekeeping", pattern: "housekeeping" }
    ];

    const results = {};

    for (const target of targets) {
      console.log(`\nSearching for target: ${target.key} (pattern: "${target.pattern}")...`);
      // Find row index
      const row = emailRows.find(r => 
        r.subject.toLowerCase().includes(target.pattern) || 
        r.snippet.toLowerCase().includes(target.pattern)
      );

      if (!row) {
        console.log(`Target ${target.key} NOT found in email list.`);
        results[target.key] = "NOT FOUND";
        continue;
      }

      console.log(`Found matching row: [Row ${row.idx}] Subject: "${row.subject}"`);
      
      // Click on the row in Gmail.
      // We can do this by selector: we find the element matching tr.zA and click it
      const rowSelector = `tr.zA:nth-child(${row.idx + 1})`; // 1-indexed for CSS
      // Or we can find by subject text
      await page.locator(`tr.zA`).nth(row.idx).click();
      console.log("Clicked row. Waiting 5s for email body to load...");
      await page.waitForTimeout(5000);

      // Extract the email content
      const emailBody = await page.evaluate(() => {
        const titleEl = document.querySelector('h2.hP');
        const subject = titleEl ? titleEl.innerText.trim() : 'No Title';

        // Get all message bodies in this thread
        const msgDivs = Array.from(document.querySelectorAll('div.adn.ec'));
        const messages = msgDivs.map(div => {
          const senderNameEl = div.querySelector('span.gD');
          const senderEmail = senderNameEl ? senderNameEl.getAttribute('email') || '' : '';
          const senderName = senderNameEl ? senderNameEl.textContent.trim() : '';
          const dateEl = div.querySelector('.g3, .gY');
          const dateStr = dateEl ? dateEl.getAttribute('title') || dateEl.textContent.trim() : '';
          const bodyEl = div.querySelector('.ii.gt');
          const bodyText = bodyEl ? bodyEl.innerText.trim() : '';
          return `From: ${senderName} <${senderEmail}>\nDate: ${dateStr}\n\n${bodyText}`;
        });

        if (messages.length === 0) {
          // Try fallback
          const bodyElements = Array.from(document.querySelectorAll('.ii.gt'));
          if (bodyElements.length > 0) {
            return bodyElements.map(el => el.innerText.trim()).join('\n\n--- MESSAGE SPLIT ---\n\n');
          }
          return document.body.innerText.substring(0, 5000);
        }

        return messages.join('\n\n=========================================\n\n');
      });

      console.log(`Extracted email body length: ${emailBody.length} characters.`);
      results[target.key] = emailBody;

      // Go back to inbox
      console.log("Going back to inbox...");
      // Click Inbox label or go to #inbox
      await page.evaluate(() => {
        window.location.hash = "#inbox";
      });
      await page.waitForTimeout(4000);
    }

    fs.writeFileSync('gmail_scraped_bodies.json', JSON.stringify(results, null, 2));
    console.log("\nFinished scraping. Wrote gmail_scraped_bodies.json successfully!");

  } catch (error) {
    console.error("Error during execution:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
