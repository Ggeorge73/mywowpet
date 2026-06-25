const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  let browser;
  try {
    console.log("Connecting to Chrome CDP on http://127.0.0.1:9222...");
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const contexts = browser.contexts();
    const page = contexts[0].pages().find(p => p.url().includes("mail.google.com")) || contexts[0].pages()[0];
    console.log(`Connected to page: "${await page.title()}"`);

    // Search query in Gmail with in:anywhere
    const searchQuery = 'in:anywhere ("dance intensive" OR "Maryland Tuition" OR "suspended" OR "housekeeping" OR "Lara school")';
    console.log(`Performing search with query: ${searchQuery}`);

    const searchUrlHash = `#search/${encodeURIComponent(searchQuery)}`;
    await page.evaluate((hash) => {
      window.location.hash = hash;
    }, searchUrlHash);

    console.log("Waiting 5s for search results to load...");
    await page.waitForTimeout(5000);

    const emailRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.zA'));
      return rows.map((r, idx) => {
        const sender = r.querySelector('span.yP, span.zF')?.innerText || 'Unknown';
        const subjectEl = r.querySelector('span.bog');
        const subject = subjectEl?.innerText || 'No Subject';
        const snippet = r.querySelector('span.y2')?.innerText || '';
        const date = r.querySelector('td.xW span')?.innerText || '';
        const isUnread = r.classList.contains('zE');
        const threadId = r.getAttribute('data-thread-id') || r.getAttribute('data-legacy-thread-id') || '';
        return { idx, sender, subject, snippet, date, isUnread, threadId };
      });
    });

    console.log(`\nFound ${emailRows.length} email rows in search results:`);
    emailRows.forEach(r => {
      console.log(`[Row ${r.idx}] Date: ${r.date} | Sender: ${r.sender} | Subject: ${r.subject} | ThreadID: ${r.threadId}`);
      console.log(`   Snippet: ${r.snippet.substring(0, 100)}`);
      console.log('-'.repeat(50));
    });

    fs.writeFileSync('gmail_anywhere_results.json', JSON.stringify(emailRows, null, 2));

  } catch (error) {
    console.error("Error during execution:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
