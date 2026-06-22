const PORT = 9222;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const createRes = await fetch(`http://127.0.0.1:${PORT}/json/new?url=about:blank`, {
    method: 'PUT'
  });
  const tab = await createRes.json();
  const pageWsUrl = tab.webSocketDebuggerUrl;
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
    const result = await sendCommand("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  console.log("Navigating...");
  await sendCommand("Page.navigate", { url: "http://localhost:8085/product.html?id=1" });
  await delay(8000);

  // Click buy button
  const clickRes = await evaluateExpression(`
    (() => {
      const container = document.getElementById('shopify-buy-button-container');
      if (!container) return "no-container";
      const iframe = container.querySelector('iframe');
      if (!iframe) return "no-iframe";
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const btn = doc.querySelector('.shopify-buy__btn');
      if (!btn) return "no-btn";
      btn.click();
      return "clicked";
    })()
  `);
  console.log("Click result:", clickRes);

  await delay(8000);

  // Get inner HTML of all iframes
  const iframesHTML = await evaluateExpression(`
    (() => {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      return iframes.map((iframe, idx) => {
        let html = "";
        let err = "";
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          html = doc.body.innerHTML;
        } catch(e) { err = e.toString(); }
        return {
          index: idx,
          className: iframe.className,
          id: iframe.id,
          htmlLength: html.length,
          html,
          err
        };
      });
    })()
  `);

  console.log("All iframes HTML:");
  console.log(JSON.stringify(iframesHTML, null, 2));

  await fetch(`http://127.0.0.1:${PORT}/json/close/${tab.id}`);
  ws.close();
}

main().catch(console.error);
