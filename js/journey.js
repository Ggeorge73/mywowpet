/* ============================================
   WowPetStore — 3D Solar Journey (Three.js)
   Immersive product discovery experience
   ============================================ */

const JourneyApp = (() => {
  let scene, camera, renderer, clock;
  let planets = [];
  let starField;
  let sunMesh, sunGlow;
  let raycaster, mouse;
  let hoveredPlanet = null;
  let isAnimating = true;
  let cameraTarget = { x: 0, y: 0, z: 0 };
  let cameraPosition = { x: 0, y: 8, z: 20 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let rotation = { x: 0, y: 0 };

  // Category config
  const categoryConfig = [
    {
      id: 'food', name: 'Food', icon: '🥩',
      color: 0xF4A460, emissive: 0xE08840, size: 1.4, orbit: 6, speed: 0.3,
      desc: 'Premium nutrition for every pet — kibble, wet food, and raw diets crafted from real whole ingredients.',
      nutrition: [
        { label: 'Real Meat First', value: '100% of products' },
        { label: 'Grain-Free Options', value: '60% of products' },
        { label: 'Avg. Protein', value: '28-38%' },
        { label: 'Subscribable', value: 'Yes — Save 15%' }
      ]
    },
    {
      id: 'treats', name: 'Treats', icon: '🦴',
      color: 0xE8745A, emissive: 0xD06040, size: 1.0, orbit: 9, speed: 0.45,
      desc: 'Freeze-dried, dental chews, and training treats — single-ingredient and vet-approved.',
      nutrition: [
        { label: 'Single Ingredient', value: '40% of treats' },
        { label: 'Dental Benefits', value: 'Chew sticks' },
        { label: 'Calorie Range', value: '3-15 per treat' },
        { label: 'Training Size', value: 'Available' }
      ]
    },
    {
      id: 'toys', name: 'Toys', icon: '🎾',
      color: 0x5BA4D9, emissive: 0x4090C0, size: 1.1, orbit: 12, speed: 0.55,
      desc: 'Interactive puzzles, tough chew toys, and feather wands to keep your pet active and entertained.',
      nutrition: [
        { label: 'Mental Stimulation', value: 'Puzzle feeders' },
        { label: 'Exercise', value: 'Active play toys' },
        { label: 'Durability', value: 'Heavy-chewer rated' },
        { label: 'Enrichment', value: 'Reduces boredom' }
      ]
    },
    {
      id: 'health', name: 'Health', icon: '💊',
      color: 0x6BC5A0, emissive: 0x50A880, size: 0.9, orbit: 15, speed: 0.35,
      desc: 'Supplements, calming aids, and paw care — vet-recommended for joint, gut, and skin health.',
      nutrition: [
        { label: 'Probiotics', value: '6 strain formula' },
        { label: 'Joint Support', value: 'Glucosamine + MSM' },
        { label: 'Calming', value: 'Pheromone-based' },
        { label: 'Natural', value: 'Beeswax & botanicals' }
      ]
    },
    {
      id: 'accessories', name: 'Accessories', icon: '🎀',
      color: 0x9B8EC4, emissive: 0x8070B0, size: 1.05, orbit: 18, speed: 0.25,
      desc: 'Collars, beds, feeders, and perches — handcrafted, eco-friendly, and built to last.',
      nutrition: [
        { label: 'Eco-Friendly', value: 'Bamboo & recycled' },
        { label: 'Ergonomic', value: 'Elevated feeders' },
        { label: 'Premium', value: 'Italian leather' },
        { label: 'Self-Cleaning', value: 'Automatic options' }
      ]
    }
  ];

  function init() {
    // Loading
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
      loadProgress += Math.random() * 15 + 5;
      if (loadProgress >= 100) loadProgress = 100;
      document.getElementById('loader-fill').style.width = loadProgress + '%';
      if (loadProgress >= 100) {
        clearInterval(loadInterval);
        setTimeout(startScene, 400);
      }
    }, 150);
  }

  function startScene() {
    // Hide loader
    document.getElementById('journey-loader').classList.add('hidden');
    document.getElementById('journey-top').style.display = '';
    document.getElementById('journey-hint').style.display = '';

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-999, -999);

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.008);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    // Renderer
    const canvas = document.getElementById('journey-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050510);

    // Lights
    const ambient = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambient);

    const sunLight = new THREE.PointLight(0xFFD700, 2, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Starfield
    createStarfield();

    // Central Sun
    createSun();

    // Planets
    categoryConfig.forEach(cat => createPlanet(cat));

    // Events
    window.addEventListener('resize', onResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousedown', onDragStart);
    canvas.addEventListener('mouseup', onDragEnd);
    canvas.addEventListener('mouseleave', onDragEnd);
    canvas.addEventListener('wheel', onScroll, { passive: true });

    // Touch
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onDragEnd);

    // Animate
    animate();
  }

  function createStarfield() {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    starField = new THREE.Points(geo, mat);
    scene.add(starField);
  }

  function createSun() {
    // Core sphere
    const geo = new THREE.SphereGeometry(2, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.9
    });
    sunMesh = new THREE.Mesh(geo, mat);
    scene.add(sunMesh);

    // Glow
    const glowGeo = new THREE.SphereGeometry(2.6, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFFA500,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    sunGlow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(sunGlow);

    // Outer glow
    const outerGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(outerGeo, outerMat));
  }

  function createPlanet(config) {
    const group = new THREE.Group();

    // Orbit ring
    const orbitGeo = new THREE.RingGeometry(config.orbit - 0.02, config.orbit + 0.02, 128);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
    orbitMesh.rotation.x = -Math.PI / 2;
    scene.add(orbitMesh);

    // Planet sphere
    const geo = new THREE.SphereGeometry(config.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.emissive,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);

    // Glow
    const glowGeo = new THREE.SphereGeometry(config.size * 1.3, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);

    group.add(mesh);
    group.add(glow);

    // Random start angle
    const angle = Math.random() * Math.PI * 2;

    // Get products for this category
    const products = WowStore.getProducts({ category: config.id, sort: 'bestselling' });

    planets.push({
      group,
      mesh,
      glow,
      glowMat,
      orbitMesh,
      orbitMat,
      config,
      angle,
      products,
      hovered: false
    });

    scene.add(group);
  }

  function animate() {
    if (!isAnimating) return;
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Rotate starfield slowly
    if (starField) {
      starField.rotation.y += 0.0001;
      starField.rotation.x += 0.00005;
    }

    // Pulse sun
    if (sunMesh) {
      const s = 1 + Math.sin(elapsed * 1.5) * 0.03;
      sunMesh.scale.set(s, s, s);
      sunGlow.scale.set(s * 1.1, s * 1.1, s * 1.1);
    }

    // Move planets
    planets.forEach(p => {
      p.angle += p.config.speed * 0.005;
      const x = Math.cos(p.angle) * p.config.orbit;
      const z = Math.sin(p.angle) * p.config.orbit;
      const y = Math.sin(p.angle * 2) * 0.5;
      p.group.position.set(x, y, z);

      // Self-rotation
      p.mesh.rotation.y += 0.005;

      // Hover effect
      if (p.hovered) {
        p.glowMat.opacity = 0.2 + Math.sin(elapsed * 3) * 0.05;
        const hs = 1.15;
        p.mesh.scale.set(hs, hs, hs);
      } else {
        p.glowMat.opacity = 0.08;
        p.mesh.scale.set(1, 1, 1);
      }
    });

    // Smooth camera
    camera.position.x += (cameraPosition.x - camera.position.x) * 0.05;
    camera.position.y += (cameraPosition.y - camera.position.y) * 0.05;
    camera.position.z += (cameraPosition.z - camera.position.z) * 0.05;

    camera.lookAt(
      cameraTarget.x + rotation.y * 0.5,
      cameraTarget.y,
      cameraTarget.z + rotation.x * 0.5
    );

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const meshes = planets.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    let foundPlanet = null;
    if (intersects.length > 0 && !isDragging) {
      const hit = intersects[0].object;
      foundPlanet = planets.find(p => p.mesh === hit);
    }

    planets.forEach(p => { p.hovered = false; });

    if (foundPlanet) {
      foundPlanet.hovered = true;
      hoveredPlanet = foundPlanet;
      document.getElementById('journey-canvas').style.cursor = 'pointer';

      // Position label
      const pos = foundPlanet.group.position.clone().project(camera);
      const label = document.getElementById('journey-label');
      const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-pos.y * 0.5 + 0.5) * window.innerHeight - 60;
      label.style.left = x + 'px';
      label.style.top = y + 'px';
      label.classList.add('visible');
      document.getElementById('label-name').textContent = `${foundPlanet.config.icon} ${foundPlanet.config.name}`;
      document.getElementById('label-count').textContent = `${foundPlanet.products.length} products — click to explore`;
    } else {
      hoveredPlanet = null;
      document.getElementById('journey-canvas').style.cursor = isDragging ? 'grabbing' : 'grab';
      document.getElementById('journey-label').classList.remove('visible');
    }

    renderer.render(scene, camera);
  }

  // ---- Events ----
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      rotation.y = dx * 0.01;
      rotation.x = dy * 0.01;
      cameraPosition.x = Math.sin(rotation.y) * 22;
      cameraPosition.z = Math.cos(rotation.y) * 22;
      cameraPosition.y = 8 + rotation.x * 5;
      cameraPosition.y = Math.max(2, Math.min(20, cameraPosition.y));
    }
  }

  function onClick(e) {
    if (isDragging) return;

    // Check planet click
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = planets.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const planet = planets.find(p => p.mesh === hit);
      if (planet) openPanel(planet);
    }
  }

  function onDragStart(e) {
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
  }

  function onDragEnd() {
    isDragging = false;
  }

  function onScroll(e) {
    const z = cameraPosition.z + e.deltaY * 0.02;
    cameraPosition.z = Math.max(8, Math.min(40, z));
    cameraPosition.x = Math.sin(rotation.y) * cameraPosition.z;
  }

  function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true;
      dragStart.x = e.touches[0].clientX;
      dragStart.y = e.touches[0].clientY;
      mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      rotation.y += dx * 0.003;
      rotation.x += dy * 0.003;
      cameraPosition.x = Math.sin(rotation.y) * 22;
      cameraPosition.z = Math.cos(rotation.y) * 22;
      cameraPosition.y = 8 + rotation.x * 5;
      cameraPosition.y = Math.max(2, Math.min(20, cameraPosition.y));
      dragStart.x = e.touches[0].clientX;
      dragStart.y = e.touches[0].clientY;
    }
  }

  // ---- Panel ----
  function openPanel(planet) {
    const panel = document.getElementById('journey-panel');
    const cat = planet.config;

    document.getElementById('panel-category').textContent = cat.icon + ' ' + cat.name.toUpperCase();
    document.getElementById('panel-title').textContent = 'Explore ' + cat.name;
    document.getElementById('panel-desc').textContent = cat.desc;

    // Product cards
    document.getElementById('panel-products').innerHTML = planet.products.map(p => {
      const img = WowStore.getProductImage(p);
      return `
        <div class="journey-product-card" onclick="window.location.href='product.html?id=${p.id}'">
          <div class="journey-product-img"><img src="${img}" alt="${p.name}" loading="lazy"></div>
          <div class="journey-product-info">
            <div class="journey-product-name">${p.name}</div>
            <div class="journey-product-price">${WowStore.formatPrice(p.price)}</div>
            ${p.subscribable ? `<div class="journey-product-sub">Subscribe ${WowStore.formatPrice(p.subscribePrice)}</div>` : ''}
          </div>
          <div class="journey-product-btn" onclick="event.stopPropagation(); addToCartFromJourney(${p.id})">+</div>
        </div>`;
    }).join('');

    // Nutrition facts
    document.getElementById('nutrition-facts').innerHTML = cat.nutrition.map(f =>
      `<div class="fact"><span class="fact-label">${f.label}</span><span class="fact-value">${f.value}</span></div>`
    ).join('');

    panel.classList.add('open');

    // Zoom camera towards planet
    const pos = planet.group.position;
    cameraTarget.x = pos.x * 0.3;
    cameraTarget.z = pos.z * 0.3;
  }

  function closePanel() {
    document.getElementById('journey-panel').classList.remove('open');
    cameraTarget.x = 0;
    cameraTarget.y = 0;
    cameraTarget.z = 0;
  }

  function resetCamera() {
    cameraPosition = { x: 0, y: 8, z: 22 };
    cameraTarget = { x: 0, y: 0, z: 0 };
    rotation = { x: 0, y: 0 };
    closePanel();
  }

  // Init
  init();

  return { closePanel, resetCamera };
})();

// Global cart helper for journey
function addToCartFromJourney(productId) {
  const product = WowStore.getProduct(productId);
  if (!product) return;
  WowStore.addToCart(productId, 1, false);
  if (typeof WowApp !== 'undefined') {
    WowApp.updateCartBadge();
    WowApp.showToast(`${product.name} added to cart!`, '🛒');
  }
}
