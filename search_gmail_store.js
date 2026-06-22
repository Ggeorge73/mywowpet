const PORT = 9222;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Connecting to Chrome...");
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const tabs = await res.json();
  const gmailTab = tabs.find(tab => tab.url && tab.url.includes("mail.google.com"));
  if (!gmailTab) {
    console.error("Gmail tab not found");
    process.exit(1);
  }
  
  const pageWsUrl = gmailTab.webSocketDebuggerUrl;
  console.log(`Connecting to Gmail WebSocket: ${pageWsUrl}`);
  const ws = new WebSocket(pageWsUrl);
  let messageId = 0;
  const pendingRequests = new Map();
  
  const sendCommand = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = ++messageId;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };
  
  await new Promise(resolve => ws.onopen = resolve);
  await sendCommand("Runtime.enable");
  
  async function evaluateExpression(expression) {
    const result = await sendCommand("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) {
      throw new Error("JS Evaluation failed: " + result.exceptionDetails.text);
    }
    return result.result.value;
  }

  const queries = [
    "wowpetstore",
    "mywowpet",
    "New customer message"
  ];

  for (const query of queries) {
    console.log(`\n--- Searching Gmail for: "${query}" ---`);
    await evaluateExpression(`window.location.hash = "#search/${encodeURIComponent(query)}"`);
    await delay(4000); // Wait for search results to load
    
    const threads = await evaluateExpression(`
      (() => {
        const rows = document.querySelectorAll('tr.zA');
        const list = [];
        rows.forEach(row => {
          const isUnread = row.classList.contains('zE');
          const subjectEl = row.querySelector('.bog');
          const subject = subjectEl ? subjectEl.innerText : 'No Subject';
          const senderEl = row.querySelector('.yW span');
          const sender = senderEl ? senderEl.innerText : 'Unknown';
          const dateEl = row.querySelector('.xW span');
          const date = dateEl ? dateEl.innerText : 'Unknown';
          const snippetEl = row.querySelector('.y2');
          const snippet = snippetEl ? snippetEl.innerText : '';
          
          let threadId = '';
          const link = row.querySelector('a[href]');
          if (link) {
            const href = link.getAttribute('href');
            const match = href.match(/#search\\/[^\\/]+\\/([a-f0-9]+)/) || href.match(/#[a-zA-Z0-9_-]+\\/([a-f0-9]+)/);
            if (match) threadId = match[1];
          }
          list.push({ sender, subject, date, snippet, isUnread, threadId });
        });
        return list;
      })()
    `);

    console.log(`Found ${threads.length} threads matching query.`);
    threads.slice(0, 10).forEach((t, i) => {
      console.log(`[Thread #${i+1}] Date: ${t.date} | From: ${t.sender} | Subject: "${t.subject}" | Unread: ${t.isUnread} | ID: ${t.threadId}`);
      console.log(`    Snippet: ${t.snippet}`);
    });
  }

  ws.close();
}

main().catch(err => {
  console.error("Error:", err);
});
