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

    // Search query in Gmail
    const searchQuery = 'subject:("dance intensive" OR "tuition" OR "suspended" OR "housekeeping" OR "Lara")';
    console.log(`Performing search with query: ${searchQuery}`);

    // Navigate to search results directly by setting the hash URL
    const searchUrlHash = `#search/${encodeURIComponent(searchQuery)}`;
    await page.evaluate((hash) => {
      window.location.hash = hash;
    }, searchUrlHash);

    console.log("Waiting 5s for search results to load...");
    await page.waitForTimeout(5000);

    // Get list of emails in the search results
    const emailRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.zA'));
      return rows.map((r, idx) => {
        const sender = r.querySelector('span.yP, span.zF')?.innerText || 'Unknown';
        const subjectEl = r.querySelector('span.bog');
        const subject = subjectEl?.innerText || 'No Subject';
        const snippet = r.querySelector('span.y2')?.innerText || '';
        const date = r.querySelector('td.xW span')?.innerText || '';
        const isUnread = r.classList.contains('zE');
        // Find threadId from the row attribute data-thread-id or data-legacy-thread-id
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

    // Save search results
    fs.writeFileSync('gmail_search_results.json', JSON.stringify(emailRows, null, 2));

    // Scrape them all
    const results = {};
    for (let i = 0; i < emailRows.length; i++) {
      const email = emailRows[i];
      console.log(`\nScraping row ${i}: "${email.subject}" (ThreadID: ${email.threadId})...`);
      
      // Go to thread
      await page.evaluate((tid) => {
        window.location.hash = `#search/subject%3A%28%22dance+intensive%22+OR+%22tuition%22+OR+%22suspended%22+OR+%22housekeeping%22+OR+%22Lara%22%29/${tid}`;
      }, email.threadId);
      await page.waitForTimeout(5000);

      // Extract body
      const body = await page.evaluate(() => {
        const titleEl = document.querySelector('h2.hP');
        const subject = titleEl ? titleEl.innerText.trim() : 'No Title';
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
          const bodyElements = Array.from(document.querySelectorAll('.ii.gt'));
          if (bodyElements.length > 0) {
            return bodyElements.map(el => el.innerText.trim()).join('\n\n--- MESSAGE SPLIT ---\n\n');
          }
          return document.body.innerText.substring(0, 5000);
        }
        return messages.join('\n\n=========================================\n\n');
      });

      console.log(`Scraped body length: ${body.length}`);
      results[email.subject] = body;

      // Go back to search results
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, searchUrlHash);
      await page.waitForTimeout(3000);
    }

    fs.writeFileSync('gmail_search_bodies.json', JSON.stringify(results, null, 2));
    console.log("Wrote gmail_search_bodies.json successfully!");

    // Navigate back to inbox
    await page.evaluate(() => {
      window.location.hash = "#inbox";
    });

  } catch (error) {
    console.error("Error during execution:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
