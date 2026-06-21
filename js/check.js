/* ============================================
   WowPetStore — Pet-Check AI Logic Engine
   ============================================ */

const PetCheckPage = (() => {
  let petMode = 'dog'; // 'dog' or 'cat'
  let selectedRegion = null;

  // Rule-based symptoms per anatomical region
  const regionSymptoms = {
    ears: [
      { text: "Itchy ears & scratching", tag: "itchy ears" },
      { text: "Head shaking", tag: "shaking head" },
      { text: "Ear discharge or wax", tag: "ear discharge" },
      { text: "Foul ear odor", tag: "smelly ears" },
      { text: "Redness or swelling in canal", tag: "red ears" }
    ],
    eyes: [
      { text: "Redness or bloodshot eyes", tag: "red eyes" },
      { text: "Watery eyes or squinting", tag: "watery eyes" },
      { text: "Nose discharge & sneezing", tag: "sneezing" },
      { text: "Head tilting", tag: "head tilting" },
      { text: "Swollen face/eyelids", tag: "swollen face" }
    ],
    mouth: [
      { text: "Persistent coughing", tag: "coughing" },
      { text: "Excessive drooling", tag: "drooling" },
      { text: "Bad breath", tag: "bad breath" },
      { text: "Pale or blue gums", tag: "pale gums" },
      { text: "Difficulty swallowing", tag: "gagging" }
    ],
    chest: [
      { text: "Rapid/Heavy panting", tag: "panting heavily" },
      { text: "Difficulty breathing", tag: "difficulty breathing" },
      { text: "Wheezing or raspy breath", tag: "wheezing" },
      { text: "Rapid heart rate", tag: "rapid heart rate" }
    ],
    stomach: [
      { text: "Vomiting", tag: "vomiting" },
      { text: "Diarrhea or loose stool", tag: "diarrhea" },
      { text: "Bloating or firm abdomen", tag: "bloating" },
      { text: "Loss of appetite", tag: "lost appetite" },
      { text: "Lethargy & stomach pain", tag: "lethargic" }
    ],
    paws: [
      { text: "Limping or favoring a leg", tag: "limping" },
      { text: "Constant paw licking", tag: "licking paw" },
      { text: "Swollen leg or paw", tag: "swollen paw" },
      { text: "Visible cut/wound on pad", tag: "paw cut" },
      { text: "Broken toenail", tag: "broken nail" }
    ],
    skin: [
      { text: "Scratching & itchiness", tag: "scratching skin" },
      { text: "Hair loss or bald spots", tag: "hair loss" },
      { text: "Rashes or red bumps", tag: "skin rash" },
      { text: "Moist red patch (Hot Spot)", tag: "hot spot" },
      { text: "Fleas or ticks visible", tag: "fleas" }
    ],
    tail: [
      { text: "Biting tail base", tag: "tail biting" },
      { text: "Tail limp or down", tag: "tail down" },
      { text: "Swelling on tail", tag: "swollen tail" }
    ]
  };

  // Critical Emergency Red-Flag keywords
  const redFlags = [
    "bloat", "unresponsive", "seizure", "poison", "toxic", "unconscious",
    "choking", "snake bite", "bleeding heavily", "chocolate", "lily", "lilies",
    "antifreeze", "heat stroke", "cyanide", "rat poison", "cannot breathe",
    "pale gums", "blue gums", "convulsion", "lethargic cat", "lethargic dog"
  ];

  // Heuristic diagnostic data
  const triageData = {
    ears: {
      severity: "green",
      title: "Mild Ear Irritation / Suspected Otitis",
      desc: "Mild discomfort, scratching, or wax buildup. Usually treatable with ear cleaning and hygiene changes.",
      steps: [
        "Inspect the ear canal gently using a flashlight. Check for debris, mites, or redness.",
        "Gently clean the visible outer ear with a damp cotton ball. Do not insert cotton swabs (Q-tips) deep into the ear canal.",
        "Ensure ears are dried thoroughly after baths or swimming to prevent yeast/bacterial growth.",
        "Apply calming, soothing balm around the outer folds if raw from scratching.",
        "Monitor for 48 hours. If symptoms persist, or if foul odor and yellow/green discharge develop, consult your vet."
      ],
      vetSummary: "Symptom: Ear itching/shaking head.\nAnatomical Part: Ears.\nDuration: 1-2 days.\nBehavior: Shaking head, scratching ears.\nSuspected Cause: Minor wax buildup, ear irritation, or mild yeast infection.",
      products: [14, 23] // Calming Diffuser, Paw Balm
    },
    eyes: {
      severity: "yellow",
      title: "Moderate Eye/Nasal Inflammation",
      desc: "Watery discharge, redness, or sneezing. Requires careful monitoring to prevent corneal damage or respiratory infection spread.",
      steps: [
        "Gently wipe eyes with a warm, damp cloth, moving from the inner corner outwards.",
        "Use a separate clean cloth area for each eye to prevent cross-contamination.",
        "Keep your pet in a clean, dust-free environment. Avoid using aerosol sprays, perfumes, or harsh chemicals.",
        "Do not apply human eye drops or medications under any circumstances.",
        "If squinting, cloudiness, yellow discharge, or head tilting is observed, schedule a vet visit immediately."
      ],
      vetSummary: "Symptom: Redness/watery discharge, head tilting, sneezing.\nAnatomical Part: Head/Eyes.\nDuration: Observed recently.\nBehavior: Squinting, rubbing eyes.\nSuspected Cause: Conjunctivitis, allergies, or early upper respiratory infection.",
      products: [14, 12] // Calming Diffuser, Probiotic Daily
    },
    mouth: {
      severity: "yellow",
      title: "Urgent Mouth/Throat Discomfort",
      desc: "Persistent coughing, gagging, or heavy drooling. Monitor breathing closely.",
      steps: [
        "Keep your pet calm and rested. Restrain physical exertion, which can trigger coughing fits.",
        "Elevate room humidity. Using a warm humidifier or keeping your pet in the bathroom during a hot shower helps soothe airways.",
        "Transition to soft, moist foods if swallowing appears painful.",
        "Remove neck collar pressure; utilize a harness for leash walking instead.",
        "If gums are pale, blue, or if breathing becomes labored, treat as an emergency immediately."
      ],
      vetSummary: "Symptom: Coughing, drooling, gagging.\nAnatomical Part: Mouth/Throat.\nDuration: Active.\nBehavior: Lethargic, raspy breaths.\nSuspected Cause: Tracheal irritation, kennel cough, or dental swelling.",
      products: [12, 14] // Probiotic, Calming Diffuser
    },
    chest: {
      severity: "yellow",
      title: "Urgent Chest/Respiratory Stress",
      desc: "Rapid breathing or panting. Assess environmental heat levels immediately.",
      steps: [
        "Move your pet to a cool, shaded, and well-ventilated space immediately.",
        "Offer cool water to drink, but do not force ingestion.",
        "Apply a cool, damp towel to the neck, armpits, and groin. Avoid ice-cold water, which can cause blood vessels to constrict and lock in heat.",
        "Measure breathing rate: Count chest rises for 30 seconds and multiply by 2. If it exceeds 40 breaths/min while resting, see a vet.",
        "Keep the environment quiet to minimize exertion and anxiety."
      ],
      vetSummary: "Symptom: Rapid breathing, panting heavily, wheezing.\nAnatomical Part: Chest/Lungs.\nDuration: Ongoing.\nBehavior: Reluctance to lie down, panting.\nSuspected Cause: Mild heat stress, respiratory irritation, or anxiety.",
      products: [14, 21] // Calming Diffuser, Cozy Bed
    },
    stomach: {
      severity: "yellow",
      title: "Moderate Digestive Upset / Gastroenteritis",
      desc: "Vomiting or diarrhea. Primary concern is preventing severe dehydration.",
      steps: [
        "Withhold food for 12 hours (fasting) to let the stomach settle. Provide small, frequent sips of fresh water.",
        "After fasting, offer a bland diet: boiled white-meat chicken (no skin, no bones) and white rice (2:1 ratio).",
        "Feed in small portions (1-2 tablespoons) every 3-4 hours. Gradually transition back to regular food over 3 days.",
        "Check hydration: Gently pull up the skin over the shoulders (scruff). If it does not snap back immediately, dehydration is present.",
        "Consult your vet if vomiting occurs more than 3 times in 24 hours, or if blood is visible in vomit or stool."
      ],
      vetSummary: "Symptom: Vomiting, diarrhea, loss of appetite.\nAnatomical Part: Stomach/Abdomen.\nDuration: 1 day.\nBehavior: Lost appetite, curled up.\nSuspected Cause: Dietary indiscretion, minor food intolerance, or mild gastroenteritis.",
      products: [12, 1] // Probiotics, Wilderness Salmon
    },
    paws: {
      severity: "yellow",
      title: "Moderate Musculoskeletal Limping / Paw Injury",
      desc: "Limping or paw licking. Inspect pad surfaces for physical foreign bodies.",
      steps: [
        "Examine the paw pad, toes, and nails carefully. Look for stuck thorns, glass, cuts, or torn nails.",
        "If a minor thorn is found, remove gently with sterilized tweezers. Clean with warm water and mild soap.",
        "Restrict all exercise: Do not allow running, jumping, or stairs. Crating or room confinement is advised.",
        "Apply a cold compress (ice pack wrapped in a towel) to any swollen joints for 10-15 minutes to reduce swelling.",
        "Prevent licking: Use an E-collar or slip a clean baby sock over the paw. If limping persists past 48 hours, seek veterinary care."
      ],
      vetSummary: "Symptom: Limping, paw licking, leg swelling.\nAnatomical Part: Paws/Limbs.\nDuration: Recent onset.\nBehavior: Favoring leg, licking paw.\nSuspected Cause: Soft tissue sprain, paw pad cut, or broken nail.",
      products: [13, 23, 21] // Joint Chews, Paw Balm, Cozy Bed
    },
    skin: {
      severity: "green",
      title: "Mild Dermatitis / Allergic Scratching",
      desc: "Skin scratching, hair loss, or redness. Focused on itch relief and barrier protection.",
      steps: [
        "Bathe your pet in cool or lukewarm water. Oatmeal-based pet shampoos help reduce skin inflammation.",
        "Check thoroughly for fleas, flea dirt (black specs), or ticks. Administer flea prevention if overdue.",
        "Keep the skin dry. If a raw, wet 'Hot Spot' is developing, trim surrounding hair and apply a drying antiseptic.",
        "Moisturize dry paw pads or nose with natural beeswax paw balm.",
        "Use a protective collar if your pet is chewing skin raw. Consult your vet regarding appropriate antihistamine dosages."
      ],
      vetSummary: "Symptom: Scratching skin, hair loss, rash.\nAnatomical Part: Skin/Coat.\nDuration: 2-3 days.\nBehavior: Obsessive scratching/licking.\nSuspected Cause: Flea allergy dermatitis, environmental allergies, or hot spot.",
      products: [23, 12, 14] // Paw Balm, Probiotics, Calming Diffuser
    },
    tail: {
      severity: "green",
      title: "Mild Tail Base Strain / Irritation",
      desc: "Tail biting or tail limpness. Check for flea nesting at the tail base.",
      steps: [
        "Inspect the tail and tail base for fleas, bites, or cuts.",
        "If tail is sore or sprained ('limber tail' from swimming or hard wagging), rest is the primary treatment.",
        "Prevent tail chasing or biting behavior by keeping pet calm and distracted.",
        "Apply a cool compress to the tail base for 10 minutes if sore.",
        "See vet if tail is hanging completely limp or if pet vocalizes in pain when tail is touched."
      ],
      vetSummary: "Symptom: Tail biting, tail down.\nAnatomical Part: Tail.\nDuration: Recent.\nBehavior: Tail limp, biting base.\nSuspected Cause: Tail muscle strain (limber tail) or flea nesting irritation.",
      products: [23, 14] // Paw Balm, Calming Diffuser
    }
  };

  function init() {
    console.log("🐾 [WowPetStore] Pet-Check AI module initialized.");
    setPetMode('dog');
  }

  function setPetMode(mode) {
    petMode = mode;
    
    // Toggle tab active classes
    const dogTab = document.getElementById('tab-dog-mode');
    const catTab = document.getElementById('tab-cat-mode');
    if (dogTab && catTab) {
      dogTab.classList.toggle('active', mode === 'dog');
      catTab.classList.toggle('active', mode === 'cat');
    }

    // Toggle active SVGs
    const dogSvg = document.getElementById('dog-svg');
    const catSvg = document.getElementById('cat-svg');
    if (dogSvg && catSvg) {
      dogSvg.classList.toggle('active', mode === 'dog');
      catSvg.classList.toggle('active', mode === 'cat');
    }

    clearSelectedRegion();
  }

  function selectPart(part) {
    selectedRegion = part;
    
    // Clear previous active parts
    const currentSvg = petMode === 'dog' ? document.getElementById('dog-svg') : document.getElementById('cat-svg');
    if (currentSvg) {
      currentSvg.querySelectorAll('.hotspot-group').forEach(group => {
        group.classList.toggle('active-part', group.dataset.part === part);
      });
    }

    // Populate and open symptom selector panel
    const selectorPanel = document.getElementById('region-symptom-selector');
    const selectorTitle = document.getElementById('selected-region-title');
    const tagContainer = document.getElementById('symptom-tag-container');

    if (selectorPanel && selectorTitle && tagContainer) {
      selectorPanel.style.display = 'block';
      const formattedTitle = part.charAt(0).toUpperCase() + part.slice(1) + " Symptoms";
      selectorTitle.textContent = formattedTitle;

      const symptoms = regionSymptoms[part] || [];
      tagContainer.innerHTML = symptoms.map(s => `
        <button type="button" class="symptom-btn-tag" onclick="PetCheckPage.addSymptomTag('${s.tag}')">
          + ${s.text}
        </button>
      `).join('');
    }
  }

  function clearSelectedRegion() {
    selectedRegion = null;
    
    // Clear active hotspot classes
    document.querySelectorAll('.hotspot-group').forEach(group => {
      group.classList.remove('active-part');
    });

    // Hide symptom tags panel
    const selectorPanel = document.getElementById('region-symptom-selector');
    if (selectorPanel) {
      selectorPanel.style.display = 'none';
    }
  }

  function addSymptomTag(tag) {
    const input = document.getElementById('symptom-input');
    if (input) {
      const current = input.value.trim();
      const prefix = petMode === 'dog' ? "My dog has " : "My cat has ";
      
      if (current === "") {
        input.value = `${prefix}${tag}`;
      } else {
        input.value = `${current}, and shows signs of ${tag}`;
      }
      input.focus();
    }
  }

  function setSymptomText(text) {
    const input = document.getElementById('symptom-input');
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  function runDiagnostic(e) {
    if (e) e.preventDefault();
    
    const input = document.getElementById('symptom-input');
    if (!input) return;
    
    const rawText = input.value.trim().toLowerCase();
    if (!rawText) return;

    // 1. Red-Flag Intercept Check (with Negation Handling)
    const matchedRedFlag = redFlags.find(flag => {
      const idx = rawText.indexOf(flag);
      if (idx === -1) return false;

      // Check for negations in the immediate prefix (approx 15 characters before the keyword)
      const prefix = rawText.substring(Math.max(0, idx - 15), idx).trim();
      const negations = ["no", "not", "prevent", "don't", "dont", "never", "didn't", "didnt", "free", "without", "clear", "safe"];
      
      const hasNegation = negations.some(neg => {
        const regex = new RegExp(`\\b${neg.replace(/[.*+?^${}()|[\]\]/g, '\$&')}\\b`, 'i');
        return regex.test(prefix);
      });

      return !hasNegation;
    });

    if (matchedRedFlag) {
      triggerEmergency();
      return;
    }

    // 2. Triage mapping
    let matchedRegion = null;
    let highestScore = 0;

    Object.keys(regionSymptoms).forEach(region => {
      let score = 0;
      // Match region key
      if (rawText.includes(region)) score += 3;
      
      // Match specific tags
      regionSymptoms[region].forEach(s => {
        if (rawText.includes(s.tag)) score += 2;
      });

      // Partial keywords
      const partsMap = {
        ears: ['ear', 'shake', 'wax', 'itchy head'],
        eyes: ['eye', 'nose', 'sneeze', 'discharge', 'blind', 'squint'],
        mouth: ['mouth', 'cough', 'drool', 'throat', 'bad breath', 'gum'],
        chest: ['chest', 'pant', 'breath', 'wheez', 'lung', 'heart'],
        stomach: ['stomach', 'vomit', 'diarrhea', 'appetite', 'puke', 'bloat', 'constip'],
        paws: ['paw', 'leg', 'limp', 'swoll', 'hurt leg', 'nail', 'pad'],
        skin: ['skin', 'scratch', 'hair', 'rash', 'fleas', 'ticks', 'hot spot', 'itchy'],
        tail: ['tail', 'wag', 'rump']
      };

      const keywords = partsMap[region] || [];
      keywords.forEach(word => {
        if (rawText.includes(word)) score += 1;
      });

      if (score > highestScore) {
        highestScore = score;
        matchedRegion = region;
      }
    });

    if (highestScore === 0 || !matchedRegion) {
      // Hide results if they were open from a previous search
      const resultsWrapper = document.getElementById('results-wrapper');
      if (resultsWrapper) {
        resultsWrapper.style.display = 'none';
      }
      
      if (typeof WowApp !== 'undefined') {
        WowApp.showToast('No matching symptoms identified. Please select a body part or try listing different symptoms.', '⚠️');
      } else {
        alert('No matching symptoms identified. Please select a body part or try listing different symptoms.');
      }
      return;
    }

    renderResults(matchedRegion);
  }

  function renderResults(region) {
    const data = triageData[region];
    if (!data) return;

    const resultsWrapper = document.getElementById('results-wrapper');
    const severityBanner = document.getElementById('severity-banner');
    const severityIcon = document.getElementById('severity-icon-box');
    const severityTitle = document.getElementById('severity-title');
    const severityDesc = document.getElementById('severity-description');
    const firstAidSteps = document.getElementById('first-aid-steps');
    const checklistBox = document.getElementById('checklist-box');

    if (!resultsWrapper) return;

    // Reset classes
    severityBanner.className = "severity-banner";
    
    // Set dynamic severity details
    if (data.severity === 'green') {
      severityBanner.classList.add('severity-green');
      severityIcon.textContent = "🟢";
      severityTitle.textContent = "Mild / Home Triage";
    } else if (data.severity === 'yellow') {
      severityBanner.classList.add('severity-yellow');
      severityIcon.textContent = "🟡";
      severityTitle.textContent = "Urgent / Close Monitoring Required";
    } else {
      severityBanner.classList.add('severity-red');
      severityIcon.textContent = "🔴";
      severityTitle.textContent = "Critical / Veterinary Emergency Care";
    }

    severityDesc.textContent = data.desc;

    // Render first-aid steps
    firstAidSteps.innerHTML = data.steps.map(step => `<li>${step}</li>`).join('');

    // Render Checklist text
    checklistBox.textContent = data.vetSummary + `\nReported Timeline: ${new Date().toLocaleDateString()}`;

    // Render Store Recommendations
    renderStoreRecommendations(data.products);

    // Show results
    resultsWrapper.style.display = 'block';
    resultsWrapper.scrollIntoView({ behavior: 'smooth' });
    
    // Trigger animations
    if (typeof WowAnimations !== 'undefined') {
      WowAnimations.init();
    }
  }

  function renderStoreRecommendations(productIds) {
    const section = document.getElementById('store-recommendations-section');
    const grid = document.getElementById('recommended-products-grid');
    if (!section || !grid) return;

    if (!productIds || productIds.length === 0) {
      section.style.display = 'none';
      return;
    }

    // Get matching products from store.js
    const matched = productIds.map(id => WowStore.getProduct(id)).filter(p => p !== undefined);

    if (matched.length === 0) {
      section.style.display = 'none';
      return;
    }

    // Render cards using WowApp if available
    if (typeof WowApp !== 'undefined') {
      grid.innerHTML = matched.map(p => WowApp.renderProductCard(p)).join('');
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  }

  function triggerEmergency() {
    const overlay = document.getElementById('emergency-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    
    // Hide standard results
    const resultsWrapper = document.getElementById('results-wrapper');
    if (resultsWrapper) {
      resultsWrapper.style.display = 'none';
    }
  }

  function dismissEmergency() {
    const overlay = document.getElementById('emergency-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function copyChecklist() {
    const checklistBox = document.getElementById('checklist-box');
    const copyBtn = document.getElementById('copy-checklist-btn');
    if (!checklistBox) return;

    const text = checklistBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (typeof WowApp !== 'undefined') {
        WowApp.showToast("Vet checklist copied to clipboard!", "📋");
      } else {
        alert("Vet checklist copied!");
      }
      
      // Temporary button state change
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✓ Copied!";
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      }
    }).catch(err => {
      console.error("Could not copy text: ", err);
    });
  }

  return {
    init,
    setPetMode,
    selectPart,
    clearSelectedRegion,
    addSymptomTag,
    setSymptomText,
    runDiagnostic,
    dismissEmergency,
    copyChecklist
  };
})();
