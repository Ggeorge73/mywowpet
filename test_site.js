const PORT = 9222;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Creating new Chrome tab pointing to localhost:8085...");
  const createRes = await fetch(`http://127.0.0.1:${PORT}/json/new?url=about:blank`, {
    method: 'PUT'
  });
  const tab = await createRes.json();
  const pageWsUrl = tab.webSocketDebuggerUrl;
  
  console.log(`Connecting WebSocket to new tab: ${pageWsUrl}`);
  const ws = new WebSocket(pageWsUrl);
  let messageId = 0;
  const pendingRequests = new Map();
  
  const errors = [];

  const sendCommand = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = ++messageId;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.method === "Runtime.exceptionThrown") {
      const exception = data.params.exceptionDetails;
      const text = exception.exception ? exception.exception.description : exception.text;
      errors.push(`[JS Exception] ${text} at line ${exception.lineNumber}:${exception.columnNumber} in ${exception.url}`);
    }
    
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };
  
  await new Promise(resolve => ws.onopen = resolve);
  await sendCommand("Runtime.enable");
  await sendCommand("Log.enable");
  
  const pages = [
    { name: "Home", url: "http://localhost:8085/index.html" },
    { name: "Shop", url: "http://localhost:8085/shop.html" },
    { name: "Product Detail (ID: 1)", url: "http://localhost:8085/product.html?id=1" },
    { name: "Pet-Check AI Triage", url: "http://localhost:8085/check.html" },
    { name: "Profile", url: "http://localhost:8085/profile.html" },
    { name: "Cart", url: "http://localhost:8085/cart.html" },
    { name: "Checkout warning fallback", url: "http://localhost:8085/checkout.html" }
  ];

  for (const page of pages) {
    console.log(`\n--- Auditing Page: ${page.name} (${page.url}) ---`);
    const startTime = Date.now();
    
    // Navigate
    await sendCommand("Page.navigate", { url: page.url });
    // Wait for load event
    await delay(2500); // Allow JS to execute, images to load
    
    // Check page title and if elements are rendered
    const pageMetrics = await sendCommand("Runtime.evaluate", {
      expression: `
        (() => {
          return {
            title: document.title,
            bodyLength: document.body.innerText.length,
            hasNavSlot: !!document.getElementById('nav-slot'),
            hasFooterSlot: !!document.getElementById('footer-slot')
          };
        })()
      `,
      returnByValue: true
    });
    
    console.log(`Title: "${pageMetrics.result.value.title}"`);
    console.log(`Content Size: ${pageMetrics.result.value.bodyLength} characters`);
    console.log(`Navigation Bar Rendered: ${pageMetrics.result.value.hasNavSlot ? "Yes" : "No"}`);
    console.log(`Footer Bar Rendered: ${pageMetrics.result.value.hasFooterSlot ? "Yes" : "No"}`);
    
    // Check specific pages for critical features
    if (page.name.includes("Product")) {
      const hasBuyBtn = await sendCommand("Runtime.evaluate", {
        expression: `!!document.getElementById('shopify-buy-button-container')`,
        returnByValue: true
      });
      console.log(`Shopify Buy Button Container Present: ${hasBuyBtn.result.value ? "Yes" : "No"}`);
    } else if (page.name.includes("Pet-Check")) {
      const hasMap = await sendCommand("Runtime.evaluate", {
        expression: `!!document.getElementById('pet-avatar-wrapper')`,
        returnByValue: true
      });
      console.log(`Pet Body Mapper Loaded: ${hasMap.result.value ? "Yes" : "No"}`);
    }
    
    console.log(`Load and Execution Time: ${Date.now() - startTime}ms`);
  }
  
  console.log("\n=================================");
  console.log("Audit Complete.");
  console.log(`Total captured exceptions/critical errors during navigation: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.error(e));
  } else {
    console.log("No JavaScript exceptions occurred during navigation!");
  }
  console.log("=================================");

  // Close the tab
  console.log("Closing audit tab...");
  await fetch(`http://127.0.0.1:${PORT}/json/close/${tab.id}`);
  ws.close();
}

main().catch(err => {
  console.error("Audit error:", err);
});
