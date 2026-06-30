/* ============================================
   My Wow Pet - Support Chatbot
   Store-trained local assistant with email handoff
   ============================================ */

const WowChatbot = (() => {
  const SUPPORT_EMAIL = "support@mywowpet.com";
  const STORAGE_KEY = "wow_chat_history";
  const MAX_HISTORY = 16;

  const fallbackPrompts = [
    "What is your shipping policy?",
    "Recommend food for my dog",
    "How do returns work?",
    "Help me track an order"
  ];

  const policyAnswers = [
    {
      id: "shipping",
      label: "Shipping",
      keywords: ["ship", "shipping", "delivery", "deliver", "freight", "postage", "arrive", "transit", "express", "overnight", "international", "apo", "fpo", "po box"],
      answer: "My Wow Pet offers free standard shipping on orders over $49. Orders under $49 ship for $5.99. Standard delivery is usually 5-7 business days after 1-2 business days of processing. Express is 2-3 business days for $12.99, and overnight is 1 business day for $24.99. The store currently ships within the United States, including APO/FPO/DPO addresses. P.O. Boxes are supported with standard shipping only.",
      links: [{ label: "Shipping info", href: "shipping.html" }, { label: "Track order", href: "tracking.html" }]
    },
    {
      id: "returns",
      label: "Returns",
      keywords: ["return", "refund", "exchange", "rma", "damaged", "wrong item", "defective", "guarantee"],
      answer: "My Wow Pet has a 30-Day Happiness Guarantee. Unopened, unused items in original packaging can be returned within 30 days. Defective, damaged, or incorrect items are also eligible. Opened food, treats, and supplements cannot be returned for health and safety reasons. Refunds are processed within 2 business days after the return is received, then may take 5-7 business days to appear on the original payment method.",
      links: [{ label: "Returns", href: "returns.html" }, { label: "Contact support", href: "contact.html" }]
    },
    {
      id: "subscribe",
      label: "Subscribe & Save",
      keywords: ["subscribe", "subscription", "recurring", "auto ship", "autoship", "save", "frequency", "pause", "skip", "cancel subscription"],
      answer: "Subscribe & Save gives 15% off eligible food, treats, hay, seed blends, and health items. You can choose a delivery schedule such as every 2, 4, 6, or 8 weeks, then manage, pause, skip, or cancel from your account. Items with a subscribe price on the product page qualify.",
      links: [{ label: "Subscribe & Save", href: "subscribe.html" }, { label: "My pets", href: "profile.html#subscriptions" }]
    },
    {
      id: "payment",
      label: "Payments",
      keywords: ["payment", "pay", "credit card", "visa", "mastercard", "amex", "discover", "paypal", "apple pay", "checkout"],
      answer: "Checkout supports major credit cards including Visa, Mastercard, American Express, and Discover, plus PayPal and Apple Pay. If checkout does not complete, confirm the billing details, check that every cart item is available, then try again or contact support.",
      links: [{ label: "Cart", href: "cart.html" }, { label: "Contact support", href: "contact.html" }]
    },
    {
      id: "tracking",
      label: "Order Tracking",
      keywords: ["track", "tracking", "order status", "where is my order", "confirmation", "order number", "lost package"],
      answer: "You can track an order with the order number from your confirmation email and the email address used at checkout. Confirmation emails are sent right after checkout; if it is missing, check spam or junk first. Support can resend it if needed.",
      links: [{ label: "Track order", href: "tracking.html" }, { label: "Email support", href: `mailto:${SUPPORT_EMAIL}` }]
    },
    {
      id: "contact",
      label: "Contact",
      keywords: ["contact", "email", "human", "agent", "support", "representative", "call", "phone", "business hours"],
      answer: "A support specialist can help by email at support@mywowpet.com. The team aims to respond within 24 hours. Business hours are Monday-Friday 9:00 AM-6:00 PM EST and Saturday 10:00 AM-4:00 PM EST.",
      links: [{ label: "Contact support", href: "contact.html" }, { label: "Email now", href: `mailto:${SUPPORT_EMAIL}` }],
      handoff: true
    },
    {
      id: "loyalty",
      label: "Loyalty",
      keywords: ["loyalty", "points", "tier", "bronze", "silver", "gold", "platinum", "rewards"],
      answer: "My Wow Pet loyalty tiers are Bronze, Silver, Gold, and Platinum. Points are stored in your profile, and higher tiers can earn stronger rewards. You can review current points, history, and tier progress from the My Pets profile area.",
      links: [{ label: "My pets", href: "profile.html" }]
    },
    {
      id: "discounts",
      label: "Discounts",
      keywords: ["discount", "promo", "coupon", "code", "welcome15", "pet10", "freeship", "sale"],
      answer: "New customers can use WELCOME15 for 15% off. Other store codes include PET10 for 10% off and FREESHIP for a shipping credit. Subscribe & Save items show their own 15% subscription price when eligible.",
      links: [{ label: "Shop deals", href: "shop.html" }]
    }
  ];

  const medicalSignals = ["emergency", "poison", "seizure", "bleeding", "choking", "can't breathe", "cannot breathe", "vomiting blood", "ate chocolate", "toxic", "vet"];
  const initialized = { value: false };
  let refs = {};
  let conversation = [];

  function init() {
    if (initialized.value || document.getElementById("wow-chatbot")) return;
    initialized.value = true;
    inject();
    bind();
    restoreHistory();
    if (!conversation.length) {
      addMessage("bot", "Hi, I am the My Wow Pet support assistant. I can answer store policy questions, recommend products from the catalog, help with cart basics, and email support when a person should step in.", { quick: fallbackPrompts });
    } else {
      renderHistory();
    }
  }

  function inject() {
    const root = document.createElement("div");
    root.id = "wow-chatbot";
    root.className = "wow-chatbot";
    root.innerHTML = `
      <button class="wow-chat-launcher" type="button" aria-label="Open support chat" aria-expanded="false">
        <span class="wow-chat-launcher-icon" aria-hidden="true">?</span>
        <span class="wow-chat-launcher-text">Support</span>
      </button>
      <section class="wow-chat-panel" role="dialog" aria-modal="false" aria-labelledby="wow-chat-title" hidden>
        <header class="wow-chat-header">
          <div>
            <p class="wow-chat-kicker">Support Agent</p>
            <h2 id="wow-chat-title">My Wow Pet Assistant</h2>
          </div>
          <button class="wow-chat-close" type="button" aria-label="Close support chat">&times;</button>
        </header>
        <div class="wow-chat-status" aria-live="polite" hidden>
          <span class="wow-chat-thinking-dot"></span>
          <span>Thinking through store knowledge...</span>
        </div>
        <div class="wow-chat-messages" aria-live="polite"></div>
        <div class="wow-chat-quick" aria-label="Suggested questions"></div>
        <form class="wow-chat-form">
          <label class="sr-only" for="wow-chat-input">Ask a question</label>
          <textarea id="wow-chat-input" rows="1" placeholder="Ask about products, orders, returns..." required></textarea>
          <button type="submit" aria-label="Send question">Send</button>
        </form>
      </section>
    `;
    document.body.appendChild(root);

    refs = {
      root,
      launcher: root.querySelector(".wow-chat-launcher"),
      panel: root.querySelector(".wow-chat-panel"),
      close: root.querySelector(".wow-chat-close"),
      messages: root.querySelector(".wow-chat-messages"),
      quick: root.querySelector(".wow-chat-quick"),
      form: root.querySelector(".wow-chat-form"),
      input: root.querySelector("#wow-chat-input"),
      status: root.querySelector(".wow-chat-status")
    };
  }

  function bind() {
    refs.launcher.addEventListener("click", () => togglePanel());
    refs.close.addEventListener("click", () => togglePanel(false));
    refs.form.addEventListener("submit", event => {
      event.preventDefault();
      const question = refs.input.value.trim();
      if (!question) return;
      refs.input.value = "";
      refs.input.style.height = "";
      ask(question);
    });
    refs.input.addEventListener("input", () => {
      refs.input.style.height = "auto";
      refs.input.style.height = Math.min(refs.input.scrollHeight, 120) + "px";
    });
    refs.input.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        refs.form.requestSubmit();
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !refs.panel.hidden) togglePanel(false);
    });
  }

  function togglePanel(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : refs.panel.hidden;
    refs.panel.hidden = !shouldOpen;
    refs.launcher.setAttribute("aria-expanded", String(shouldOpen));
    refs.root.classList.toggle("open", shouldOpen);
    if (shouldOpen) {
      setTimeout(() => refs.input.focus(), 80);
      scrollToBottom();
    }
  }

  function ask(question) {
    addMessage("user", question);
    setThinking(true);

    window.setTimeout(() => {
      const response = buildResponse(question);
      setThinking(false);
      addMessage("bot", response.text, response);
      if (response.handoff) showHandoff(question, response.handoffReason);
    }, 520);
  }

  function buildResponse(question) {
    const normalized = normalize(question);

    if (medicalSignals.some(signal => normalized.includes(signal))) {
      return {
        text: "This sounds like it may need medical judgment. I can share product information, but I should not diagnose symptoms or handle urgent pet health situations. Please contact your veterinarian or an emergency vet right away. I can also help email My Wow Pet support with product or order details.",
        confidence: 0.3,
        handoff: true,
        handoffReason: "Possible urgent pet health or veterinary question"
      };
    }

    if (hasAny(normalized, ["human", "agent", "representative", "email support", "contact support", "talk to"])) {
      const contact = policyAnswers.find(item => item.id === "contact");
      return { text: contact.answer, links: contact.links, confidence: 0.95, handoff: true, handoffReason: "Customer requested a person" };
    }

    const cartAnswer = answerCart(normalized);
    if (cartAnswer) return cartAnswer;

    const orderAnswer = answerOrders(normalized);
    if (orderAnswer) return orderAnswer;

    const productAnswer = answerProducts(question, normalized);
    if (productAnswer) return productAnswer;

    const policyAnswer = answerPolicies(normalized);
    if (policyAnswer) return policyAnswer;

    return {
      text: "I could not find a reliable answer from the store catalog or support policies. The safest next step is to send this to a support specialist so they can review the details.",
      confidence: 0.1,
      handoff: true,
      handoffReason: "Low confidence answer"
    };
  }

  function answerPolicies(normalized) {
    let best = null;
    policyAnswers.forEach(item => {
      const score = item.keywords.reduce((total, keyword) => total + (includesTerm(normalized, keyword) ? 1 : 0), 0);
      if (!best || score > best.score) best = { item, score };
    });
    if (!best || best.score < 1) return null;
    return {
      text: best.item.answer,
      links: best.item.links,
      confidence: Math.min(0.98, 0.65 + best.score * 0.1),
      handoff: best.item.handoff
    };
  }

  function answerProducts(original, normalized) {
    const products = getProducts();
    if (!products.length) return null;

    const explicitProduct = findProductMatch(original, products);
    const asksProductDetail = hasAny(normalized, ["ingredient", "ingredients", "feeding", "feed", "price", "cost", "stock", "available", "rating", "review", "subscribe", "subscription"]) || explicitProduct;
    const asksRecommendation = hasAny(normalized, ["recommend", "best", "suggest", "looking for", "need", "find", "food", "treat", "toy", "health", "supplement", "collar", "bed", "litter", "hay", "seed"]);

    if (explicitProduct && asksProductDetail) {
      return productDetailResponse(explicitProduct, normalized);
    }

    if (!asksRecommendation) return null;

    const scored = scoreProducts(original, products).filter(entry => entry.score > 0);
    if (!scored.length) return null;

    const top = scored.slice(0, 3).map(entry => entry.product);
    const petText = detectPetType(normalized);
    const categoryText = detectCategory(normalized);
    const intro = `Here are ${petText || categoryText ? "the closest" : "some strong"} matches from the My Wow Pet catalog${petText ? ` for ${petText.replace("-", " ")}s` : ""}:`;
    const detail = top.map(product => formatProductLine(product)).join("\n");
    return {
      text: `${intro}\n${detail}\n\nI matched these by product type, life stage, dietary tags, ratings, and the wording in your question.`,
      products: top,
      links: [{ label: "Shop all", href: buildShopLink(normalized) }],
      confidence: 0.82
    };
  }

  function productDetailResponse(product, normalized) {
    const parts = [
      `${product.name} by ${product.brand} is ${formatMoney(product.price)}${product.subscribable ? `, or ${formatMoney(product.subscribePrice)} with Subscribe & Save` : ""}.`,
      `It is a ${product.petType.replace("-", " ")} ${product.category} item rated ${product.rating}/5 from ${product.reviewCount} reviews.`,
      product.description
    ];

    if (normalized.includes("ingredient") && product.ingredients) {
      parts.push(`Ingredients: ${product.ingredients}`);
    }
    if ((normalized.includes("feeding") || normalized.includes("feed")) && product.feedingGuide) {
      parts.push(`Feeding guide: ${product.feedingGuide}`);
    }
    if (normalized.includes("stock") || normalized.includes("available")) {
      parts.push(product.inStock === false ? "This item is currently marked out of stock." : "This item is currently marked in stock for secure checkout.");
    }
    if (product.tags?.length) {
      parts.push(`Helpful tags: ${product.tags.join(", ")}.`);
    }

    return {
      text: parts.join("\n\n"),
      products: [product],
      links: [{ label: "View product", href: `product.html?id=${product.id}` }],
      confidence: 0.94
    };
  }

  function answerCart(normalized) {
    if (!hasAny(normalized, ["cart", "basket", "subtotal", "total", "shipping threshold"])) return null;
    if (!window.WowStore || typeof WowStore.getCart !== "function") return null;

    const cart = WowStore.getCart();
    const totals = WowStore.getCartTotal();
    if (!cart.length) {
      return {
        text: "Your cart is empty right now. Free standard shipping starts at $49, so I can help find a product if you tell me the pet type or category you need.",
        links: [{ label: "Shop now", href: "shop.html" }],
        confidence: 0.9
      };
    }

    const itemLines = cart.map(item => {
      const product = WowStore.getProduct(item.productId);
      if (!product) return null;
      const price = item.isSubscription && product.subscribePrice ? product.subscribePrice : product.price;
      return `${item.qty} x ${product.name} (${formatMoney(price)} each${item.isSubscription ? ", subscription" : ""})`;
    }).filter(Boolean);

    return {
      text: `Your cart has ${WowStore.getCartCount()} item(s):\n${itemLines.join("\n")}\n\nEstimated subtotal: ${formatMoney(totals.subtotal)}. Shipping is ${totals.shipping === 0 ? "free" : formatMoney(totals.shipping)}. Estimated total with tax/discounts: ${formatMoney(totals.total)}.`,
      links: [{ label: "View cart", href: "cart.html" }, { label: "Checkout", href: "checkout.html" }],
      confidence: 0.95
    };
  }

  function answerOrders(normalized) {
    if (!hasAny(normalized, ["my order", "recent order", "order history", "subscription status", "next delivery"])) return null;
    if (!window.WowStore) return null;

    if (normalized.includes("subscription") || normalized.includes("next delivery")) {
      const subs = typeof WowStore.getSubscriptions === "function" ? WowStore.getSubscriptions() : [];
      if (!subs.length) {
        return { text: "I do not see an active saved subscription in this browser. You can start one from Subscribe & Save or manage existing subscriptions from your profile.", links: [{ label: "Subscribe & Save", href: "subscribe.html" }, { label: "Profile", href: "profile.html#subscriptions" }], confidence: 0.78 };
      }
      const lines = subs.map(sub => {
        const product = WowStore.getProduct(sub.productId);
        return `${product ? product.name : "Subscription item"}: ${sub.status}, next delivery ${sub.nextDelivery}, every ${sub.frequency}.`;
      });
      return { text: `Here is what I found in this browser's saved subscriptions:\n${lines.join("\n")}`, links: [{ label: "Manage subscriptions", href: "profile.html#subscriptions" }], confidence: 0.86 };
    }

    const orders = typeof WowStore.getOrders === "function" ? WowStore.getOrders() : [];
    if (!orders.length) return null;
    const lines = orders.slice(0, 3).map(order => `${order.id}: ${order.status} on ${order.date}, total ${formatMoney(order.total)}.`);
    return {
      text: `Here are the recent saved orders I can see in this browser:\n${lines.join("\n")}\n\nFor live carrier updates, use the tracking page with your order number and checkout email.`,
      links: [{ label: "Track order", href: "tracking.html" }],
      confidence: 0.82
    };
  }

  function showHandoff(question, reason) {
    const wrapper = document.createElement("form");
    wrapper.className = "wow-chat-handoff";
    wrapper.innerHTML = `
      <div class="wow-chat-handoff-title">Send this to support</div>
      <label>
        Your email
        <input type="email" name="email" placeholder="you@example.com" required>
      </label>
      <label>
        Details
        <textarea name="details" rows="4" required></textarea>
      </label>
      <button type="submit">Open email draft</button>
    `;
    wrapper.querySelector("[name='details']").value = `Question: ${question}\n\nReason: ${reason || "Needs support review"}`;
    wrapper.addEventListener("submit", event => {
      event.preventDefault();
      const email = wrapper.elements.email.value.trim();
      const details = wrapper.elements.details.value.trim();
      const subject = encodeURIComponent("My Wow Pet support request");
      const body = encodeURIComponent(`${details}\n\nCustomer email: ${email}`);
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
      if (window.WowApp?.showToast) {
        WowApp.showToast("Email draft opened for support.", "OK");
      }
    });
    refs.messages.appendChild(wrapper);
    scrollToBottom();
  }

  function addMessage(role, text, meta = {}) {
    const entry = { role, text, meta: compactMeta(meta), time: Date.now() };
    conversation.push(entry);
    conversation = conversation.slice(-MAX_HISTORY);
    saveHistory();
    renderMessage(entry);
    renderQuick(meta.quick || suggestFollowups(meta));
    scrollToBottom();
  }

  function renderMessage(entry) {
    const bubble = document.createElement("div");
    bubble.className = `wow-chat-message ${entry.role}`;

    const text = document.createElement("div");
    text.className = "wow-chat-bubble";
    text.textContent = entry.text;
    bubble.appendChild(text);

    if (entry.meta?.products?.length) {
      const list = document.createElement("div");
      list.className = "wow-chat-products";
      entry.meta.products.forEach(product => list.appendChild(renderProductMini(product)));
      bubble.appendChild(list);
    }

    if (entry.meta?.links?.length) {
      const links = document.createElement("div");
      links.className = "wow-chat-links";
      entry.meta.links.forEach(link => {
        const anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.textContent = link.label;
        if (link.href.startsWith("mailto:")) anchor.target = "_self";
        links.appendChild(anchor);
      });
      bubble.appendChild(links);
    }

    refs.messages.appendChild(bubble);
  }

  function renderProductMini(product) {
    const card = document.createElement("a");
    card.className = "wow-chat-product";
    card.href = `product.html?id=${product.id}`;
    const image = window.WowStore?.getProductImage ? WowStore.getProductImage(product) : "";
    card.innerHTML = `
      <span class="wow-chat-product-image">${image ? `<img src="${image}" alt="">` : ""}</span>
      <span class="wow-chat-product-copy">
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.brand)} - ${formatMoney(product.price)}</span>
      </span>
    `;
    return card;
  }

  function renderQuick(items) {
    refs.quick.innerHTML = "";
    (items || fallbackPrompts).slice(0, 4).forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item;
      button.addEventListener("click", () => {
        togglePanel(true);
        ask(item);
      });
      refs.quick.appendChild(button);
    });
  }

  function renderHistory() {
    refs.messages.innerHTML = "";
    conversation.forEach(renderMessage);
    renderQuick(fallbackPrompts);
  }

  function restoreHistory() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) conversation = saved.slice(-MAX_HISTORY);
    } catch {
      conversation = [];
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation.map(item => ({
        role: item.role,
        text: item.text,
        meta: item.meta,
        time: item.time
      }))));
    } catch {
      return;
    }
  }

  function compactMeta(meta) {
    return {
      links: meta.links || [],
      products: meta.products || [],
      quick: meta.quick || null
    };
  }

  function suggestFollowups(meta) {
    if (meta?.products?.length) return ["Does it subscribe?", "What are the ingredients?", "Show more dog products", "Contact support"];
    if (meta?.links?.some(link => link.href.includes("shipping"))) return ["How do returns work?", "Track my order", "What payment methods?", "Email support"];
    return fallbackPrompts;
  }

  function setThinking(isThinking) {
    refs.status.hidden = !isThinking;
    refs.form.querySelector("button").disabled = isThinking;
    if (isThinking) scrollToBottom();
  }

  function getProducts() {
    return window.WowStore?.getProducts ? WowStore.getProducts() : (window.WowStore?.products || []);
  }

  function scoreProducts(original, products) {
    const normalized = normalize(original);
    const tokens = tokenize(normalized).filter(token => token.length > 2);
    const petType = detectPetType(normalized);
    const category = detectCategory(normalized);
    const dietary = detectFromList(normalized, ["grain-free", "organic", "high-protein", "limited-ingredient", "raw"]);
    const lifeStage = detectFromList(normalized, ["puppy", "kitten", "adult", "senior"]);
    const breedSize = detectFromList(normalized, ["small", "medium", "large", "giant"]);

    return products.map(product => {
      const haystack = normalize([
        product.name,
        product.brand,
        product.category,
        product.petType,
        product.description,
        product.tags?.join(" "),
        product.dietary?.join(" "),
        product.lifeStage?.join(" "),
        product.breedSize?.join(" ")
      ].join(" "));
      let score = 0;
      tokens.forEach(token => {
        if (haystack.includes(token)) score += token.length > 4 ? 2 : 1;
      });
      if (petType && product.petType === petType) score += 7;
      if (category && product.category === category) score += 5;
      dietary.forEach(tag => { if (product.dietary?.includes(tag) || product.tags?.includes(tag)) score += 4; });
      lifeStage.forEach(stage => {
        const normalizedStage = stage === "kitten" ? "puppy" : stage;
        if (product.lifeStage?.includes(normalizedStage)) score += 3;
      });
      breedSize.forEach(size => { if (product.breedSize?.includes(size) || product.breedSize?.includes("all")) score += 2; });
      score += Number(product.rating || 0) * 0.5;
      score += Math.min(Number(product.reviewCount || 0) / 250, 2);
      if (hasAny(normalized, ["subscribe", "autoship", "recurring"]) && product.subscribable) score += 4;
      return { product, score };
    }).sort((a, b) => b.score - a.score);
  }

  function findProductMatch(original, products) {
    const normalized = normalize(original);
    return products.find(product => normalized.includes(normalize(product.name)))
      || products.find(product => normalize(product.name).split(" ").filter(Boolean).slice(0, 3).every(part => normalized.includes(part)));
  }

  function detectPetType(normalized) {
    if (hasAny(normalized, ["dog", "puppy", "canine"])) return "dog";
    if (hasAny(normalized, ["cat", "kitten", "feline"])) return "cat";
    if (hasAny(normalized, ["rabbit", "guinea", "hamster", "small pet", "small-pet", "chinchilla"])) return "small-pet";
    if (hasAny(normalized, ["bird", "parakeet", "budgie"])) return "bird";
    return "";
  }

  function detectCategory(normalized) {
    if (hasAny(normalized, ["food", "kibble", "recipe", "formula", "hay", "seed"])) return "food";
    if (hasAny(normalized, ["treat", "chew", "bites"])) return "treats";
    if (hasAny(normalized, ["toy", "ball", "puzzle", "wand", "play"])) return "toys";
    if (hasAny(normalized, ["health", "supplement", "probiotic", "joint", "calming", "kidney"])) return "health";
    if (hasAny(normalized, ["accessory", "collar", "bed", "bowl", "litter", "perch", "feeding station"])) return "accessories";
    return "";
  }

  function detectFromList(normalized, values) {
    return values.filter(value => includesTerm(normalized, value));
  }

  function buildShopLink(normalized) {
    const petType = detectPetType(normalized);
    const category = detectCategory(normalized);
    const params = new URLSearchParams();
    if (petType) params.set("pet", petType);
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `shop.html?${query}` : "shop.html";
  }

  function formatProductLine(product) {
    const sub = product.subscribable ? `, subscribe ${formatMoney(product.subscribePrice)}` : "";
    return `- ${product.name}: ${formatMoney(product.price)}${sub}, ${product.rating}/5 rating. ${product.description}`;
  }

  function formatMoney(value) {
    const amount = Number(value || 0);
    return `$${amount.toFixed(2)}`;
  }

  function hasAny(text, terms) {
    return terms.some(term => includesTerm(text, term));
  }

  function includesTerm(text, term) {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) return false;
    if (normalizedTerm.includes(" ")) return text.includes(normalizedTerm);
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedTerm)}([^a-z0-9]|$)`).test(text);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9#.$\-\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function tokenize(value) {
    return normalize(value).split(" ");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      refs.messages.scrollTop = refs.messages.scrollHeight;
    });
  }

  return { init, ask };
})();

window.WowChatbot = WowChatbot;
