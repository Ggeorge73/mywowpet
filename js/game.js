/* ============================================
   WowPetStore — Pet Nutrition IQ Game
   ============================================ */

const PetGame = (() => {
  // ---- Question Bank (30+) ----
  const questions = [
    { q: "What percentage of a rabbit's diet should be hay?", options: ["50%", "60%", "80%", "30%"], correct: 2, fact: "Hay should make up approximately 80% of a rabbit's diet. It's essential for dental health and proper digestion.", difficulty: "medium" },
    { q: "Which nutrient is most important for a cat's heart health?", options: ["Vitamin C", "Taurine", "Iron", "Calcium"], correct: 1, fact: "Taurine is an amino acid critical for cats. Unlike dogs, cats cannot synthesize it and must get it from food. Deficiency can cause heart disease.", difficulty: "medium" },
    { q: "Dogs are considered:", options: ["Strict carnivores", "Herbivores", "Omnivores", "Frugivores"], correct: 2, fact: "While dogs descended from wolves, they've evolved to be omnivores. They can digest starches and benefit from a balanced diet of meat, vegetables, and grains.", difficulty: "easy" },
    { q: "Which common human food is toxic to dogs?", options: ["Carrots", "Blueberries", "Grapes", "Watermelon"], correct: 2, fact: "Grapes and raisins can cause acute kidney failure in dogs, even in small amounts. Always keep them out of reach!", difficulty: "easy" },
    { q: "How much water should a healthy dog drink daily per pound of body weight?", options: ["0.25 oz", "0.5-1 oz", "2-3 oz", "4-5 oz"], correct: 1, fact: "Dogs need about 0.5 to 1 ounce of water per pound of body weight daily. A 50-lb dog needs 25-50 oz of water per day.", difficulty: "hard" },
    { q: "What is the primary benefit of omega-3 fatty acids for pets?", options: ["Stronger teeth", "Better hearing", "Reduced inflammation & healthy coat", "Improved night vision"], correct: 2, fact: "Omega-3 fatty acids (EPA & DHA) help reduce inflammation, support skin and coat health, and may benefit joint, brain, and heart health in pets.", difficulty: "medium" },
    { q: "Which vitamin can be toxic to cats in large amounts?", options: ["Vitamin C", "Vitamin A", "Vitamin B12", "Vitamin D"], correct: 1, fact: "Excess Vitamin A can cause bone growth issues and joint problems in cats. This is why raw liver should only be fed in moderation.", difficulty: "hard" },
    { q: "At what age should kittens be fully weaned from their mother's milk?", options: ["2-3 weeks", "4-5 weeks", "8-10 weeks", "12-14 weeks"], correct: 2, fact: "Kittens should be fully weaned by 8-10 weeks. Before that, they need their mother's milk or a specialized kitten formula — never cow's milk!", difficulty: "medium" },
    { q: "Which mineral is crucial for preventing urinary crystals in cats?", options: ["Iron", "Magnesium", "Zinc", "Copper"], correct: 1, fact: "Controlled magnesium levels help prevent struvite crystal formation in cats. Many urinary health cat foods carefully balance magnesium content.", difficulty: "hard" },
    { q: "How often should you change a dog's diet?", options: ["Every week", "Every month", "Gradually over 7-10 days", "Immediately when switching"], correct: 2, fact: "When switching pet food, transition gradually over 7-10 days by mixing increasing amounts of new food with old food to prevent digestive upset.", difficulty: "easy" },
    { q: "What's the ideal body condition for a healthy pet?", options: ["You can't feel ribs", "Ribs easily felt with slight fat cover", "Ribs visibly showing", "Round belly shape"], correct: 1, fact: "In ideal body condition, ribs should be easily felt under a slight fat covering. A visible waist from above and a tucked abdomen from the side indicate healthy weight.", difficulty: "medium" },
    { q: "Which protein source is considered 'novel' for allergy elimination diets?", options: ["Chicken", "Beef", "Venison", "Salmon"], correct: 2, fact: "Novel proteins like venison, duck, or rabbit are used in elimination diets because the pet likely hasn't been exposed to them, reducing allergic reactions.", difficulty: "hard" },
    { q: "Cats are classified as:", options: ["Omnivores", "Obligate carnivores", "Herbivores", "Flexitarians"], correct: 1, fact: "Cats are obligate carnivores — they require nutrients found only in animal tissue. They have limited ability to process plant-based proteins.", difficulty: "easy" },
    { q: "What is glucosamine primarily used for in pet supplements?", options: ["Skin health", "Joint support", "Digestive health", "Eye health"], correct: 1, fact: "Glucosamine helps maintain cartilage and joint fluid, making it especially beneficial for senior dogs and large breeds prone to hip dysplasia.", difficulty: "easy" },
    { q: "How many essential amino acids do dogs require?", options: ["5", "10", "15", "20"], correct: 1, fact: "Dogs require 10 essential amino acids that must come from their diet: arginine, histidine, isoleucine, leucine, lysine, methionine, phenylalanine, threonine, tryptophan, and valine.", difficulty: "hard" },
    { q: "What's the maximum safe percentage of treats in a pet's daily calories?", options: ["5%", "10%", "25%", "50%"], correct: 1, fact: "Treats should make up no more than 10% of your pet's daily caloric intake. The remaining 90% should come from a complete, balanced diet.", difficulty: "medium" },
    { q: "Which common spice is beneficial for pets with joint inflammation?", options: ["Cinnamon", "Turmeric", "Paprika", "Black pepper"], correct: 1, fact: "Curcumin in turmeric has anti-inflammatory properties. Many pet joint supplements include turmeric to help manage arthritis and joint pain naturally.", difficulty: "medium" },
    { q: "What does 'AAFCO complete and balanced' mean on pet food?", options: ["All organic ingredients", "Meets minimum nutrition standards", "No artificial ingredients", "Veterinarian approved"], correct: 1, fact: "AAFCO (Association of American Feed Control Officials) sets nutrient profiles. 'Complete and balanced' means the food meets minimum nutritional requirements for a specific life stage.", difficulty: "medium" },
    { q: "How many times per day should adult cats typically be fed?", options: ["Once", "2-3 times", "5-6 times", "Free-feed all day"], correct: 1, fact: "Most adult cats do well with 2-3 measured meals per day. Free-feeding can lead to obesity, especially in indoor cats with lower activity levels.", difficulty: "easy" },
    { q: "Which is the best first ingredient to look for in pet food?", options: ["Corn meal", "Named meat (e.g., 'chicken')", "By-product meal", "Wheat flour"], correct: 1, fact: "A named whole meat (like 'deboned chicken') as the first ingredient indicates higher quality protein. Ingredients are listed by weight, so the first ingredient is the most abundant.", difficulty: "easy" },
    { q: "What is the purpose of probiotics in pet food?", options: ["Flavoring", "Gut health & immune support", "Color preservation", "Thickening"], correct: 1, fact: "Probiotics are beneficial bacteria that support digestive health, nutrient absorption, and immune function. They're especially helpful after antibiotic treatments.", difficulty: "medium" },
    { q: "At what temperature should wet pet food be served?", options: ["Straight from fridge", "Room temperature", "Warm/body temperature", "Hot"], correct: 2, fact: "Wet food is best served at warm/body temperature (around 100°F/38°C). This enhances aroma and palatability while being gentle on the stomach.", difficulty: "hard" },
    { q: "Which of these is a sign of food allergies in dogs?", options: ["Wagging tail", "Itchy ears and paws", "Increased energy", "Shinier coat"], correct: 1, fact: "Common food allergy signs include itchy ears, paws, and skin, chronic ear infections, and digestive issues. The most common allergens are beef, dairy, and chicken.", difficulty: "easy" },
    { q: "How long can dry kibble safely sit out in a bowl?", options: ["2-4 hours", "12-24 hours", "Up to 3 days", "Indefinitely"], correct: 1, fact: "Dry kibble should ideally be consumed within 12-24 hours once exposed. Oil in kibble can become rancid, and the food can attract bacteria and pests.", difficulty: "medium" },
    { q: "What percentage of a parakeet's diet should be seeds?", options: ["100%", "50-60%", "25-30%", "10-20%"], correct: 2, fact: "Seeds should only be 25-30% of a parakeet's diet. The rest should include pellets, fresh vegetables, and occasional fruits for complete nutrition.", difficulty: "hard" },
    { q: "Which of these foods is safe for dogs?", options: ["Onions", "Xylitol gum", "Plain pumpkin", "Macadamia nuts"], correct: 2, fact: "Plain, cooked pumpkin is excellent for dogs! It's high in fiber and helps with both diarrhea and constipation. Avoid pumpkin pie filling with added sugars.", difficulty: "easy" },
    { q: "What does 'grain-free' pet food typically substitute for grains?", options: ["Nothing — fewer ingredients", "Legumes and potatoes", "More meat only", "Synthetic fiber"], correct: 1, fact: "Grain-free foods typically use legumes (peas, lentils), potatoes, or sweet potatoes as carbohydrate sources instead of corn, wheat, or rice.", difficulty: "medium" },
    { q: "How much protein does an adult cat's diet typically need?", options: ["10-15%", "20-25%", "26-40%", "50-60%"], correct: 2, fact: "Adult cats need at least 26% protein in their diet (on a dry matter basis), though many experts recommend 30-40%. Kittens need even more for growth.", difficulty: "hard" },
    { q: "What is the benefit of elevated feeding bowls for large dogs?", options: ["Looks nicer", "Reduces neck strain & aids digestion", "Makes food taste better", "Keeps food warmer"], correct: 1, fact: "Elevated bowls reduce neck and joint strain for large and senior dogs. They can also promote better posture during eating and may help with swallowing.", difficulty: "medium" },
    { q: "Which vitamin do cats produce naturally but dogs cannot?", options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], correct: 1, fact: "Both cats AND dogs can actually produce Vitamin C on their own, unlike humans. Vitamin C supplementation is generally unnecessary for healthy pets.", difficulty: "hard" }
  ];

  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let streak = 0;
  let bestStreak = 0;
  let timerInterval = null;
  let timeLeft = 15;
  let answered = false;

  function init() {
    const hs = WowStore.getGameHighScore();
    const display = document.getElementById('high-score-display');
    if (hs.played > 0) {
      display.innerHTML = `🏆 High Score: <strong>${hs.score}</strong> pts | Best: <strong>${hs.correct}/10</strong> correct | Games Played: <strong>${hs.played}</strong>`;
    } else {
      display.innerHTML = 'No games played yet. Be the first!';
    }
  }

  function start() {
    currentQuestions = shuffleArray([...questions]).slice(0, 10);
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    streak = 0;
    bestStreak = 0;
    answered = false;

    document.getElementById('game-intro').style.display = 'none';
    document.getElementById('game-play').classList.add('active');
    document.getElementById('game-results').classList.remove('active');

    showQuestion();
  }

  function showQuestion() {
    answered = false;
    const q = currentQuestions[currentIndex];
    const letters = ['A', 'B', 'C', 'D'];

    document.getElementById('game-progress').textContent = `Question ${currentIndex + 1} / 10`;
    document.getElementById('q-number').textContent = `Question ${currentIndex + 1}`;
    document.getElementById('q-text').textContent = q.q;
    document.getElementById('game-score').textContent = score;
    document.getElementById('q-fact').style.display = 'none';

    const streakEl = document.getElementById('game-streak');
    if (streak > 0) {
      streakEl.style.display = '';
      streakEl.textContent = `🔥 ${streak} streak${streak > 1 ? ' (x' + getMultiplier() + ')' : ''}`;
    } else {
      streakEl.style.display = 'none';
    }

    document.getElementById('q-answers').innerHTML = q.options.map((opt, i) =>
      `<button class="game-answer" onclick="PetGame.answer(${i})">
        <span class="answer-letter">${letters[i]}</span>
        <span>${opt}</span>
      </button>`
    ).join('');

    startTimer();
  }

  function startTimer() {
    timeLeft = 15;
    const fill = document.getElementById('game-timer-fill');
    fill.style.width = '100%';
    fill.classList.remove('urgent');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft -= 0.1;
      const pct = (timeLeft / 15) * 100;
      fill.style.width = pct + '%';

      if (timeLeft <= 5) fill.classList.add('urgent');

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!answered) timeUp();
      }
    }, 100);
  }

  function getMultiplier() {
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    if (streak >= 2) return 1.5;
    return 1;
  }

  function answer(index) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const q = currentQuestions[currentIndex];
    const buttons = document.querySelectorAll('.game-answer');
    const isCorrect = index === q.correct;

    // Disable all buttons
    buttons.forEach(b => b.classList.add('disabled'));

    // Mark correct/wrong
    buttons[q.correct].classList.add('correct');
    if (!isCorrect) buttons[index].classList.add('wrong');

    if (isCorrect) {
      correctCount++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      const timeBonus = Math.round(timeLeft * 10);
      const multiplier = getMultiplier();
      const points = Math.round((100 + timeBonus) * multiplier);
      score += points;
      document.getElementById('game-score').textContent = score;

      const streakEl = document.getElementById('game-streak');
      streakEl.style.display = '';
      streakEl.textContent = `🔥 ${streak} streak${streak > 1 ? ' (x' + multiplier + ')' : ''}`;
    } else {
      streak = 0;
      document.getElementById('game-streak').style.display = 'none';
    }

    // Show fun fact
    const factEl = document.getElementById('q-fact');
    factEl.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Not quite!'}</strong> ${q.fact}`;
    factEl.style.display = 'block';

    // Next question after delay
    setTimeout(() => {
      currentIndex++;
      if (currentIndex >= 10) {
        showResults();
      } else {
        showQuestion();
      }
    }, 3000);
  }

  function timeUp() {
    answered = true;
    streak = 0;
    document.getElementById('game-streak').style.display = 'none';

    const q = currentQuestions[currentIndex];
    const buttons = document.querySelectorAll('.game-answer');
    buttons.forEach(b => b.classList.add('disabled'));
    buttons[q.correct].classList.add('correct');

    const factEl = document.getElementById('q-fact');
    factEl.innerHTML = `<strong>⏱️ Time's up!</strong> ${q.fact}`;
    factEl.style.display = 'block';

    setTimeout(() => {
      currentIndex++;
      if (currentIndex >= 10) {
        showResults();
      } else {
        showQuestion();
      }
    }, 3000);
  }

  function showResults() {
    document.getElementById('game-play').classList.remove('active');
    document.getElementById('game-results').classList.add('active');

    // Determine rank
    let rank, icon, points, code;
    if (correctCount === 10) {
      rank = 'Nutrition Genius!'; icon = '💎'; points = 500; code = 'PETIQ25';
    } else if (correctCount >= 7) {
      rank = 'Gold Scholar'; icon = '🥇'; points = 200; code = 'PETIQ15';
    } else if (correctCount >= 4) {
      rank = 'Silver Learner'; icon = '🥈'; points = 100; code = 'PETIQ10';
    } else {
      rank = 'Bronze Beginner'; icon = '🥉'; points = 50; code = null;
    }

    document.getElementById('results-icon').textContent = icon;
    document.getElementById('results-title').textContent = rank;
    document.getElementById('results-detail').textContent = `${correctCount}/10 correct · Best streak: ${bestStreak} · Score: ${score}`;

    // Animated score counter
    const scoreEl = document.getElementById('results-score');
    WowAnimations.counterUp(scoreEl, score, 1500);

    // Reward
    document.getElementById('reward-points').textContent = `+${points} Loyalty Points`;
    const codeContainer = document.getElementById('reward-code-container');
    if (code) {
      codeContainer.innerHTML = `<p style="font-size: var(--fs-sm); color: rgba(255,255,255,0.5); margin: var(--space-3) 0;">+ Promo Code:</p>
        <span class="reward-code" onclick="navigator.clipboard.writeText('${code}'); this.textContent = 'Copied! ✓'; setTimeout(() => this.textContent = '${code}', 2000);">${code}</span>
        <p style="font-size: var(--fs-xs); color: rgba(255,255,255,0.4); margin-top: var(--space-2);">Click to copy · ${code === 'PETIQ25' ? '25% off' : code === 'PETIQ15' ? '15% off' : '10% off'} your next order</p>`;
    } else {
      codeContainer.innerHTML = `<p style="font-size: var(--fs-sm); color: rgba(255,255,255,0.4); margin-top: var(--space-3);">Score 4+ correct to unlock a discount code!</p>`;
    }

    // Save rewards
    WowStore.addLoyaltyPoints(points, `Pet Nutrition IQ — ${rank}`);
    WowStore.setGameHighScore(score, correctCount);

    // Confetti on perfect score
    if (correctCount === 10) {
      WowAnimations.confetti();
    }

    // Leaderboard
    renderLeaderboard();
  }

  function renderLeaderboard() {
    const hs = WowStore.getGameHighScore();
    const leaderboard = document.getElementById('game-leaderboard');
    // Simple local leaderboard with dummy entries
    const entries = [
      { name: 'You', score: hs.score, highlight: true },
      { name: 'PetLover99', score: 1850 },
      { name: 'DogMom2024', score: 1620 },
      { name: 'CatWhisperer', score: 1340 },
      { name: 'FurBabyFan', score: 980 }
    ].sort((a, b) => b.score - a.score);

    const rankClasses = ['gold', 'silver', 'bronze', 'normal', 'normal'];

    leaderboard.innerHTML = `<h4>🏆 Leaderboard</h4>
      ${entries.map((e, i) => `
        <div class="leaderboard-entry" ${e.highlight ? 'style="background: rgba(var(--color-primary-rgb), 0.1); border: 1px solid rgba(var(--color-primary-rgb), 0.2);"' : ''}>
          <span class="leaderboard-rank ${rankClasses[i]}">${i + 1}</span>
          <span style="color: ${e.highlight ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.7)'}; font-weight: ${e.highlight ? 'var(--fw-bold)' : 'normal'};">${e.name}</span>
          <span class="leaderboard-score">${e.score}</span>
        </div>
      `).join('')}`;
  }

  function restart() {
    document.getElementById('game-results').classList.remove('active');
    document.getElementById('game-intro').style.display = 'flex';
    init();
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { init, start, answer, restart };
})();
