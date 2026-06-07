/* ============================================
   WowPetStore — Data Store
   Product catalog, reviews, and helpers
   ============================================ */

const WowStore = (() => {

  // ---- Product Catalog ----
  const products = [
    {
      id: 1,
      name: "Wilderness Grain-Free Salmon Recipe",
      category: "food",
      petType: "dog",
      brand: "Wild Nature",
      price: 54.99,
      subscribePrice: 46.74,
      subscribeDiscount: 15,
      rating: 4.8,
      reviewCount: 342,
      image: "",
      images: [],
      badge: "bestseller",
      tags: ["grain-free", "high-protein", "wild-caught"],
      dietary: ["grain-free", "high-protein"],
      lifeStage: ["adult"],
      breedSize: ["all"],
      weight: "24 lbs",
      description: "Premium wild-caught salmon recipe packed with protein and omega fatty acids for a healthy coat and strong muscles. Made with real deboned salmon as the first ingredient.",
      ingredients: "Deboned Salmon, Salmon Meal, Sweet Potatoes, Peas, Canola Oil, Lentils, Potato Protein, Flaxseed, Natural Flavor, Salmon Oil, Calcium Carbonate, Dried Chicory Root, Choline Chloride, Taurine, Dried Kelp, Blueberries, Cranberries, DL-Methionine, Vitamin E Supplement",
      feedingGuide: "10-20 lbs: 3/4 - 1 1/4 cups | 20-40 lbs: 1 1/4 - 2 cups | 40-60 lbs: 2 - 2 3/4 cups | 60-80 lbs: 2 3/4 - 3 1/2 cups | 80-100 lbs: 3 1/2 - 4 cups",
      subscribable: true,
      inStock: true
    },
    {
      id: 2,
      name: "Organic Turkey & Sweet Potato Feast",
      category: "food",
      petType: "dog",
      brand: "Pure Paws",
      price: 62.99,
      subscribePrice: 53.54,
      subscribeDiscount: 15,
      rating: 4.9,
      reviewCount: 218,
      image: "",
      images: [],
      badge: "new",
      tags: ["organic", "limited-ingredient", "vet-recommended"],
      dietary: ["organic", "limited-ingredient"],
      lifeStage: ["adult", "senior"],
      breedSize: ["medium", "large"],
      weight: "28 lbs",
      description: "USDA certified organic turkey recipe with wholesome sweet potatoes. Perfect for dogs with sensitive stomachs. No artificial preservatives, colors, or flavors.",
      ingredients: "Organic Turkey, Organic Sweet Potatoes, Organic Peas, Organic Chickpeas, Organic Flaxseed, Organic Coconut Oil, Organic Carrots, Organic Blueberries, Organic Spinach, Calcium Carbonate, Vitamins & Minerals",
      feedingGuide: "20-40 lbs: 1 1/2 - 2 1/4 cups | 40-60 lbs: 2 1/4 - 3 cups | 60-80 lbs: 3 - 3 3/4 cups | 80+ lbs: 3 3/4 - 4 1/2 cups",
      subscribable: true,
      inStock: true
    },
    {
      id: 3,
      name: "Puppy Growth Formula Chicken & Rice",
      category: "food",
      petType: "dog",
      brand: "Tiny Tails",
      price: 42.99,
      subscribePrice: 36.54,
      subscribeDiscount: 15,
      rating: 4.7,
      reviewCount: 156,
      image: "",
      images: [],
      badge: null,
      tags: ["puppy", "vet-recommended", "dha-enriched"],
      dietary: ["high-protein"],
      lifeStage: ["puppy"],
      breedSize: ["all"],
      weight: "15 lbs",
      description: "Specially formulated for growing puppies with DHA for brain development and calcium for strong bones. Real chicken as the #1 ingredient.",
      ingredients: "Deboned Chicken, Chicken Meal, Brown Rice, Oatmeal, Barley, Chicken Fat, Dried Egg, Fish Oil (DHA), Flaxseed, Calcium Carbonate, Vitamins & Minerals, Probiotics",
      feedingGuide: "Puppies 5-10 lbs: 1/2 - 1 cup | 10-20 lbs: 1 - 1 3/4 cups | 20-40 lbs: 1 3/4 - 3 cups | 40-60 lbs: 3 - 4 cups",
      subscribable: true,
      inStock: true
    },
    {
      id: 4,
      name: "Indoor Cat Chicken & Pea Formula",
      category: "food",
      petType: "cat",
      brand: "Whisker Wellness",
      price: 38.99,
      subscribePrice: 33.14,
      subscribeDiscount: 15,
      rating: 4.6,
      reviewCount: 289,
      image: "",
      images: [],
      badge: "bestseller",
      tags: ["indoor", "hairball-control", "weight-management"],
      dietary: ["grain-free"],
      lifeStage: ["adult"],
      breedSize: ["all"],
      weight: "12 lbs",
      description: "Tailored nutrition for indoor cats with added fiber for hairball control and controlled calories to maintain a healthy weight.",
      ingredients: "Deboned Chicken, Chicken Meal, Peas, Tapioca, Chicken Fat, Dried Egg, Natural Flavor, Pea Fiber, Cellulose, Cranberries, Probiotics, Taurine",
      feedingGuide: "5-8 lbs: 1/3 - 1/2 cup | 8-12 lbs: 1/2 - 2/3 cup | 12-16 lbs: 2/3 - 3/4 cup",
      subscribable: true,
      inStock: true
    },
    {
      id: 5,
      name: "Wild-Caught Tuna Pâté Variety Pack",
      category: "food",
      petType: "cat",
      brand: "Ocean Whiskers",
      price: 29.99,
      subscribePrice: 25.49,
      subscribeDiscount: 15,
      rating: 4.8,
      reviewCount: 412,
      image: "",
      images: [],
      badge: null,
      tags: ["wet-food", "grain-free", "variety-pack"],
      dietary: ["grain-free", "high-protein"],
      lifeStage: ["adult", "senior"],
      breedSize: ["all"],
      weight: "24 cans (3 oz each)",
      description: "Premium wild-caught tuna pâté in three delicious flavors. High in protein, low in carbs. Perfect for picky eaters.",
      ingredients: "Tuna, Water, Chicken Liver, Tapioca, Sunflower Oil, Tricalcium Phosphate, Guar Gum, Taurine, Vitamins & Minerals",
      feedingGuide: "Feed 1 can per 3 lbs of body weight daily, adjust as needed.",
      subscribable: true,
      inStock: true
    },
    {
      id: 6,
      name: "Freeze-Dried Raw Beef Bites",
      category: "treats",
      petType: "dog",
      brand: "Raw Rewards",
      price: 18.99,
      subscribePrice: 16.14,
      subscribeDiscount: 15,
      rating: 4.9,
      reviewCount: 567,
      image: "",
      images: [],
      badge: "bestseller",
      tags: ["raw", "single-ingredient", "training"],
      dietary: ["raw", "high-protein"],
      lifeStage: ["puppy", "adult", "senior"],
      breedSize: ["all"],
      weight: "5 oz",
      description: "100% pure beef, freeze-dried to lock in nutrients and flavor. Single-ingredient treats perfect for training or rewarding.",
      ingredients: "100% Beef",
      feedingGuide: "Feed as a treat or reward. Limit treats to 10% of daily caloric intake.",
      subscribable: true,
      inStock: true
    },
    {
      id: 7,
      name: "Dental Health Chew Sticks",
      category: "treats",
      petType: "dog",
      brand: "SmilePup",
      price: 24.99,
      subscribePrice: 21.24,
      subscribeDiscount: 15,
      rating: 4.5,
      reviewCount: 198,
      image: "",
      images: [],
      badge: null,
      tags: ["dental", "vet-recommended", "daily-chew"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["medium", "large"],
      weight: "30 count",
      description: "Clinically proven to reduce tartar buildup by up to 70%. Triple-enzyme formula with a taste dogs love.",
      ingredients: "Rice Flour, Glycerin, Gelatin, Wheat Gluten, Sodium Tripolyphosphate, Natural Poultry Flavor, Dried Parsley, Zinc Sulfate",
      feedingGuide: "Give one chew stick per day for dogs over 25 lbs.",
      subscribable: true,
      inStock: true
    },
    {
      id: 8,
      name: "Catnip Crunch Bites",
      category: "treats",
      petType: "cat",
      brand: "Kitty Bliss",
      price: 8.99,
      subscribePrice: 7.64,
      subscribeDiscount: 15,
      rating: 4.7,
      reviewCount: 334,
      image: "",
      images: [],
      badge: null,
      tags: ["catnip", "crunchy", "no-artificial"],
      dietary: [],
      lifeStage: ["adult"],
      breedSize: ["all"],
      weight: "3 oz",
      description: "Irresistible crunchy treats filled with premium catnip. No artificial colors, flavors, or preservatives.",
      ingredients: "Chicken Meal, Ground Rice, Chicken Fat, Dried Catnip, Natural Flavor, Mixed Tocopherols",
      feedingGuide: "Feed 5-10 pieces per day as a treat.",
      subscribable: true,
      inStock: true
    },
    {
      id: 9,
      name: "Indestructible Tough Chew Ball",
      category: "toys",
      petType: "dog",
      brand: "TuffPlay",
      price: 16.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.4,
      reviewCount: 223,
      image: "",
      images: [],
      badge: "new",
      tags: ["durable", "large-breed", "fetch"],
      dietary: [],
      lifeStage: ["puppy", "adult"],
      breedSize: ["large", "giant"],
      weight: "1 ball",
      description: "Made from ultra-durable natural rubber. Designed for aggressive chewers. Bounces unpredictably for fun fetch sessions.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 10,
      name: "Interactive Puzzle Feeder",
      category: "toys",
      petType: "dog",
      brand: "BrainPaws",
      price: 22.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.6,
      reviewCount: 178,
      image: "",
      images: [],
      badge: null,
      tags: ["puzzle", "slow-feeder", "mental-stimulation"],
      dietary: [],
      lifeStage: ["puppy", "adult", "senior"],
      breedSize: ["all"],
      weight: "1 unit",
      description: "3-level difficulty puzzle toy that challenges your dog's problem-solving skills. Slows eating and prevents boredom.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 11,
      name: "Feather Wand Interactive Cat Toy",
      category: "toys",
      petType: "cat",
      brand: "Pounce & Play",
      price: 12.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.8,
      reviewCount: 445,
      image: "",
      images: [],
      badge: "bestseller",
      tags: ["interactive", "feather", "exercise"],
      dietary: [],
      lifeStage: ["puppy", "adult"],
      breedSize: ["all"],
      weight: "1 wand + 3 refills",
      description: "Premium feather wand with natural feathers and a bell. Encourages natural hunting instincts and provides exercise.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 12,
      name: "Probiotic Daily Supplement",
      category: "health",
      petType: "dog",
      brand: "Gut Health Co.",
      price: 32.99,
      subscribePrice: 28.04,
      subscribeDiscount: 15,
      rating: 4.7,
      reviewCount: 156,
      image: "",
      images: [],
      badge: null,
      tags: ["probiotic", "digestive", "vet-recommended"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["all"],
      weight: "90 chews",
      description: "Veterinarian-formulated probiotic with 6 strains of beneficial bacteria. Supports digestive health and immune function.",
      ingredients: "Active Cultures: Lactobacillus acidophilus, L. plantarum, L. brevis, L. fermentum, Enterococcus faecium, Bifidobacterium animalis. Inactive: Chicken Liver Flavor, Brewer's Yeast, Microcrystalline Cellulose",
      feedingGuide: "Under 25 lbs: 1 chew daily | 25-75 lbs: 2 chews daily | 75+ lbs: 3 chews daily",
      subscribable: true,
      inStock: true
    },
    {
      id: 13,
      name: "Hip & Joint Glucosamine Chews",
      category: "health",
      petType: "dog",
      brand: "FlexiPaws",
      price: 34.99,
      subscribePrice: 29.74,
      subscribeDiscount: 15,
      rating: 4.8,
      reviewCount: 289,
      image: "",
      images: [],
      badge: null,
      tags: ["joint-health", "glucosamine", "senior"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["medium", "large", "giant"],
      weight: "120 chews",
      description: "Advanced joint support with Glucosamine, Chondroitin, and MSM. Helps maintain healthy cartilage and joint flexibility.",
      ingredients: "Glucosamine HCl, Chondroitin Sulfate, MSM, Organic Turmeric, Green-Lipped Mussel, Vitamin C, Vitamin E, Chicken Liver Flavor",
      feedingGuide: "Under 25 lbs: 1 chew | 25-50 lbs: 2 chews | 50-75 lbs: 3 chews | 75+ lbs: 4 chews daily",
      subscribable: true,
      inStock: true
    },
    {
      id: 14,
      name: "Calming Diffuser Kit for Cats",
      category: "health",
      petType: "cat",
      brand: "Serene Kitty",
      price: 26.99,
      subscribePrice: 22.94,
      subscribeDiscount: 15,
      rating: 4.3,
      reviewCount: 132,
      image: "",
      images: [],
      badge: null,
      tags: ["calming", "pheromone", "anxiety"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["all"],
      weight: "1 diffuser + 1 refill (30 days)",
      description: "Drug-free calming solution that mimics natural feline facial pheromones. Reduces stress, scratching, and hiding behaviors.",
      ingredients: "Synthetic Feline Facial Pheromone Analog",
      feedingGuide: "Plug in diffuser in the room where your cat spends the most time. Replace refill every 30 days.",
      subscribable: true,
      inStock: true
    },
    {
      id: 15,
      name: "Premium Leather Collar — Tan",
      category: "accessories",
      petType: "dog",
      brand: "Heritage Hound",
      price: 39.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.9,
      reviewCount: 87,
      image: "",
      images: [],
      badge: "new",
      tags: ["leather", "premium", "handcrafted"],
      dietary: [],
      lifeStage: ["adult"],
      breedSize: ["medium", "large"],
      weight: "1 collar",
      description: "Handcrafted from full-grain Italian leather. Solid brass hardware that gets more beautiful with age. Built to last a lifetime.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 16,
      name: "Elevated Bamboo Feeding Station",
      category: "accessories",
      petType: "dog",
      brand: "Eco Paws",
      price: 44.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.6,
      reviewCount: 93,
      image: "",
      images: [],
      badge: null,
      tags: ["elevated", "eco-friendly", "bamboo"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["medium", "large"],
      weight: "1 station + 2 bowls",
      description: "Sustainable bamboo feeding station with stainless steel bowls. Elevated design promotes better digestion and reduces neck strain.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 17,
      name: "Self-Cleaning Litter Box",
      category: "accessories",
      petType: "cat",
      brand: "CleanPaws Pro",
      price: 149.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.4,
      reviewCount: 167,
      image: "",
      images: [],
      badge: null,
      tags: ["automatic", "self-cleaning", "odor-control"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["all"],
      weight: "1 unit",
      description: "Fully automatic self-cleaning litter box with carbon filter for odor control. Works with any clumping litter. Quiet operation.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 18,
      name: "Timothy Hay Premium Blend",
      category: "food",
      petType: "small-pet",
      brand: "Meadow Fresh",
      price: 16.99,
      subscribePrice: 14.44,
      subscribeDiscount: 15,
      rating: 4.7,
      reviewCount: 145,
      image: "",
      images: [],
      badge: null,
      tags: ["hay", "natural", "rabbits"],
      dietary: [],
      lifeStage: ["adult"],
      breedSize: ["all"],
      weight: "48 oz",
      description: "Hand-selected, sun-dried Timothy hay. Essential fiber for rabbits, guinea pigs, and chinchillas. Promotes healthy digestion.",
      ingredients: "100% Timothy Hay",
      feedingGuide: "Provide unlimited hay daily. Should make up 80% of rabbit/guinea pig diet.",
      subscribable: true,
      inStock: true
    },
    {
      id: 19,
      name: "Hamster Gourmet Seed Mix",
      category: "food",
      petType: "small-pet",
      brand: "Tiny Bites",
      price: 11.99,
      subscribePrice: 10.19,
      subscribeDiscount: 15,
      rating: 4.5,
      reviewCount: 89,
      image: "",
      images: [],
      badge: null,
      tags: ["seed-mix", "fortified", "hamster"],
      dietary: [],
      lifeStage: ["adult"],
      breedSize: ["all"],
      weight: "2 lbs",
      description: "Balanced seed mix fortified with vitamins and minerals. Contains sunflower seeds, pumpkin seeds, dried fruits, and mealworms.",
      ingredients: "Sunflower Seeds, Millet, Oats, Pumpkin Seeds, Dried Banana, Dried Cranberries, Dried Mealworms, Flaxseed, Vitamins & Minerals",
      feedingGuide: "Feed 1-2 tablespoons per day for dwarf hamsters, 2-3 tablespoons for Syrian hamsters.",
      subscribable: true,
      inStock: true
    },
    {
      id: 20,
      name: "Premium Parakeet Seed Blend",
      category: "food",
      petType: "bird",
      brand: "Feather Fresh",
      price: 14.99,
      subscribePrice: 12.74,
      subscribeDiscount: 15,
      rating: 4.6,
      reviewCount: 112,
      image: "",
      images: [],
      badge: null,
      tags: ["seed-blend", "parakeet", "fortified"],
      dietary: [],
      lifeStage: ["adult"],
      breedSize: ["all"],
      weight: "5 lbs",
      description: "Colorful, vitamin-fortified seed blend designed specifically for parakeets and budgies. No artificial dyes or preservatives.",
      ingredients: "White Millet, Canary Seed, Oat Groats, Red Millet, Safflower, Sunflower Hearts, Dried Papaya, Vitamins & Minerals",
      feedingGuide: "Fill food dish daily, providing approximately 1-2 teaspoons per bird.",
      subscribable: true,
      inStock: true
    },
    {
      id: 21,
      name: "Cozy Donut Plush Dog Bed",
      category: "accessories",
      petType: "dog",
      brand: "SnugglePaws",
      price: 49.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.8,
      reviewCount: 312,
      image: "",
      images: [],
      badge: "bestseller",
      tags: ["bed", "plush", "calming"],
      dietary: [],
      lifeStage: ["puppy", "adult", "senior"],
      breedSize: ["small", "medium"],
      weight: "1 bed (30\" diameter)",
      description: "Ultra-soft faux fur donut bed with raised edges for burrowing. Machine washable. Provides a sense of security for anxious dogs.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    },
    {
      id: 22,
      name: "Senior Cat Kidney Support Formula",
      category: "food",
      petType: "cat",
      brand: "Golden Years",
      price: 45.99,
      subscribePrice: 39.09,
      subscribeDiscount: 15,
      rating: 4.7,
      reviewCount: 134,
      image: "",
      images: [],
      badge: null,
      tags: ["senior", "kidney-support", "vet-recommended"],
      dietary: ["limited-ingredient"],
      lifeStage: ["senior"],
      breedSize: ["all"],
      weight: "10 lbs",
      description: "Veterinarian-formulated for senior cats with kidney sensitivities. Controlled phosphorus and sodium with added omega fatty acids.",
      ingredients: "Chicken, Brewers Rice, Corn Gluten Meal, Pork Fat, Dried Egg, Fish Oil, Calcium Carbonate, L-Carnitine, Taurine, Vitamins & Minerals",
      feedingGuide: "6-8 lbs: 1/3 - 1/2 cup | 8-12 lbs: 1/2 - 3/4 cup | 12+ lbs: 3/4 - 1 cup daily",
      subscribable: true,
      inStock: true
    },
    {
      id: 23,
      name: "Natural Beeswax Paw Balm",
      category: "health",
      petType: "dog",
      brand: "Paw Protect",
      price: 14.99,
      subscribePrice: 12.74,
      subscribeDiscount: 15,
      rating: 4.9,
      reviewCount: 201,
      image: "",
      images: [],
      badge: null,
      tags: ["paw-care", "natural", "moisturizing"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["all"],
      weight: "2 oz tin",
      description: "All-natural paw protection with beeswax, shea butter, and vitamin E. Protects against hot pavement, salt, and rough terrain.",
      ingredients: "Organic Beeswax, Shea Butter, Coconut Oil, Vitamin E, Jojoba Oil, Calendula Extract",
      feedingGuide: "Apply thin layer to paw pads before walks. Reapply as needed.",
      subscribable: true,
      inStock: true
    },
    {
      id: 24,
      name: "Luxury Cat Window Perch",
      category: "accessories",
      petType: "cat",
      brand: "SkyView",
      price: 34.99,
      subscribePrice: null,
      subscribeDiscount: 0,
      rating: 4.5,
      reviewCount: 156,
      image: "",
      images: [],
      badge: "new",
      tags: ["window-perch", "suction-cup", "scenic"],
      dietary: [],
      lifeStage: ["adult", "senior"],
      breedSize: ["all"],
      weight: "1 perch (holds up to 30 lbs)",
      description: "Heavy-duty suction cup window perch with fleece-lined cushion. Gives your cat the perfect bird-watching spot. Easy to install.",
      ingredients: "",
      feedingGuide: "",
      subscribable: false,
      inStock: true
    }
  ];

  // ---- Shopify Product ID Mappings ----
  const shopifyProductIds = {
    1: '7989696430163',
    2: '7989696462931',
    3: '7989696561235',
    4: '7989696626771',
    5: '7989696790611',
    6: '7989696921683',
    7: '7989696987219',
    8: '7989697019987',
    9: '7989697052755',
    10: '7989697085523',
    11: '7989697151059',
    12: '7989697183827',
    13: '7989697216595',
    14: '7989697249363',
    15: '7989697314899',
    16: '7989697609811',
    17: '7989697642579',
    18: '7989697675347',
    19: '7989697740883',
    20: '7989697839187',
    21: '7989697871955',
    22: '7989698199635',
    23: '7989698297939',
    24: '7989698330707'
  };

  products.forEach(p => {
    p.shopifyId = shopifyProductIds[p.id] || '7989696430163'; // Fallback to Wilderness Salmon
  });

  // ---- Product image colors (gradient placeholders) ----
  const productColors = {
    food: ['#F4A460', '#DEB887'],
    treats: ['#E8745A', '#F09A86'],
    toys: ['#5BA4D9', '#8DC3E8'],
    health: ['#6BC5A0', '#98D9BE'],
    accessories: ['#9B8EC4', '#B8AED6']
  };

  // ---- Product Images (realistic photos) ----
  const productImages = {
    1: 'assets/images/dog_food.jpg',
    2: 'assets/images/dog_food.jpg',
    3: 'assets/images/dog_food.jpg',
    4: 'assets/images/cat_food.jpg',
    5: 'assets/images/cat_food.jpg',
    6: 'assets/images/dog_treats.jpg',
    7: 'assets/images/dog_treats.jpg',
    8: 'assets/images/cat_treats.jpg',
    9: 'assets/images/dog_toy.jpg',
    10: 'assets/images/dog_toy.jpg',
    11: 'assets/images/cat_toy.jpg',
    12: 'assets/images/health_supplement.jpg',
    13: 'assets/images/health_supplement.jpg',
    14: 'assets/images/cat_accessories.jpg',
    15: 'assets/images/dog_accessories.jpg',
    16: 'assets/images/dog_accessories.jpg',
    17: 'assets/images/cat_accessories.jpg',
    18: 'assets/images/small_pet.jpg',
    19: 'assets/images/small_pet.jpg',
    20: 'assets/images/bird_pet.jpg',
    21: 'assets/images/dog_bed.jpg',
    22: 'assets/images/cat_food.jpg',
    23: 'assets/images/health_supplement.jpg',
    24: 'assets/images/cat_accessories.jpg'
  };

  function getProductImage(product) {
    return productImages[product.id] || 'assets/images/dog_food.jpg';
  }

  // Product video mapping (category-based)
  const productVideos = {
    'food': { dog: 'assets/videos/dog_happy.mp4', cat: 'assets/videos/cat_playing.mp4', default: 'assets/videos/hero.mp4' },
    'treats': { dog: 'assets/videos/dog_park.mp4', cat: 'assets/videos/cat_curious.mp4', default: 'assets/videos/corgi_ball.mp4' },
    'toys': { dog: 'assets/videos/corgi_ball.mp4', cat: 'assets/videos/cat_playing.mp4', default: 'assets/videos/dog_running.mp4' },
    'health': { dog: 'assets/videos/dog_happy.mp4', cat: 'assets/videos/cat_sleeping.mp4', default: 'assets/videos/puppy_cute.mp4' },
    'accessories': { dog: 'assets/videos/dog_park.mp4', cat: 'assets/videos/cat_sleeping.mp4', default: 'assets/videos/hero.mp4' }
  };

  function getProductVideo(product) {
    const catVideos = productVideos[product.category];
    if (!catVideos) return 'assets/videos/hero.mp4';
    if (product.pet && catVideos[product.pet]) return catVideos[product.pet];
    return catVideos.default || 'assets/videos/hero.mp4';
  }

  // ---- Reviews ----
  const reviews = [
    { id: 1, productId: 1, author: "Sarah M.", rating: 5, text: "My golden retriever absolutely loves this food! His coat has never looked better and he has so much energy.", pet: "Max — Golden Retriever", date: "2024-03-15", avatar: "🐕" },
    { id: 2, productId: 1, author: "James K.", rating: 5, text: "Finally found a grain-free food that doesn't upset my dog's stomach. Highly recommend!", pet: "Bella — Lab Mix", date: "2024-03-10", avatar: "🐾" },
    { id: 3, productId: 1, author: "Emily R.", rating: 4, text: "Great quality, but a bit pricey. Subscribe & Save discount makes it more affordable though.", pet: "Charlie — Border Collie", date: "2024-03-05", avatar: "🐶" },
    { id: 4, productId: 4, author: "Lisa T.", rating: 5, text: "Fewer hairballs since switching to this food. My indoor cats love the taste.", pet: "Luna & Mochi — Domestic Short Hair", date: "2024-03-12", avatar: "🐱" },
    { id: 5, productId: 6, author: "Mike D.", rating: 5, text: "The only treats my picky eater will actually eat. Pure beef, nothing else. Perfect for training.", pet: "Rocky — German Shepherd", date: "2024-03-08", avatar: "🦴" },
    { id: 6, productId: 11, author: "Anna W.", rating: 5, text: "My cat goes absolutely crazy for this wand toy! Best cat toy purchase ever.", pet: "Whiskers — Tabby", date: "2024-03-14", avatar: "🐈" }
  ];

  // ---- Testimonials ----
  const testimonials = [
    {
      text: "My Wow Pet transformed how I shop for my pets. The Subscribe & Save feature means I never run out of Luna's food, and I save 15% every month!",
      author: "Jessica R.",
      pet: "Pet Parent of Luna (Labrador)",
      avatar: "👩",
      rating: 5
    },
    {
      text: "The quality of products here is unmatched. Every treat and toy I've ordered has been premium quality. My cats are living their best lives.",
      author: "David M.",
      pet: "Pet Parent of Milo & Oscar (Cats)",
      avatar: "👨",
      rating: 5
    },
    {
      text: "I love that I can filter by my dog's specific dietary needs. Finding grain-free, large breed senior food has never been easier!",
      author: "Patricia L.",
      pet: "Pet Parent of Bear (Great Dane)",
      avatar: "👩‍🦳",
      rating: 5
    }
  ];

  // ---- Categories ----
  const categories = [
    { id: "dog", name: "Dogs", icon: "🐕", count: 14 },
    { id: "cat", name: "Cats", icon: "🐈", count: 7 },
    { id: "small-pet", name: "Small Pets", icon: "🐹", count: 2 },
    { id: "bird", name: "Birds", icon: "🦜", count: 1 }
  ];

  const productCategories = [
    { id: "food", name: "Food", icon: "🥘" },
    { id: "treats", name: "Treats", icon: "🦴" },
    { id: "toys", name: "Toys", icon: "🎾" },
    { id: "health", name: "Health", icon: "💊" },
    { id: "accessories", name: "Accessories", icon: "🎀" }
  ];

  // ---- Filter Definitions ----
  const filters = {
    dietary: [
      { id: "grain-free", label: "Grain-Free" },
      { id: "organic", label: "Organic" },
      { id: "high-protein", label: "High Protein" },
      { id: "limited-ingredient", label: "Limited Ingredient" },
      { id: "raw", label: "Raw" }
    ],
    lifeStage: [
      { id: "puppy", label: "Puppy / Kitten" },
      { id: "adult", label: "Adult" },
      { id: "senior", label: "Senior" }
    ],
    breedSize: [
      { id: "small", label: "Small (under 20 lbs)" },
      { id: "medium", label: "Medium (20-50 lbs)" },
      { id: "large", label: "Large (50-100 lbs)" },
      { id: "giant", label: "Giant (100+ lbs)" }
    ]
  };

  // ---- Loyalty Tiers ----
  const loyaltyTiers = [
    { name: "Bronze", icon: "🥉", minPoints: 0, multiplier: 1 },
    { name: "Silver", icon: "🥈", minPoints: 500, multiplier: 1.25 },
    { name: "Gold", icon: "🥇", minPoints: 1500, multiplier: 1.5 },
    { name: "Platinum", icon: "💎", minPoints: 3000, multiplier: 2 }
  ];

  // ---- Promo Codes ----
  const promoCodes = {
    "WELCOME15": { discount: 0.15, type: "percent", description: "15% off your first order" },
    "PET10": { discount: 0.10, type: "percent", description: "10% off" },
    "FREESHIP": { discount: 5.99, type: "fixed", description: "Free shipping" },
    "PETIQ10": { discount: 0.10, type: "percent", description: "10% off — Pet Nutrition IQ Silver" },
    "PETIQ15": { discount: 0.15, type: "percent", description: "15% off — Pet Nutrition IQ Gold" },
    "PETIQ25": { discount: 0.25, type: "percent", description: "25% off — Pet Nutrition IQ Perfect Score" },
    "STREAK7": { discount: 0.10, type: "percent", description: "10% off — 7-Day Streak Reward" },
    "STREAK14": { discount: 0.15, type: "percent", description: "15% off — 14-Day Streak Reward" },
    "STREAK30": { discount: 0.25, type: "percent", description: "25% off — 30-Day Streak Reward" }
  };

  // ---- Game High Score (localStorage) ----
  function getGameHighScore() {
    try { return JSON.parse(localStorage.getItem('wow_game_high')) || { score: 0, correct: 0, played: 0 }; }
    catch { return { score: 0, correct: 0, played: 0 }; }
  }

  function setGameHighScore(score, correct) {
    const prev = getGameHighScore();
    const data = {
      score: Math.max(prev.score, score),
      correct: Math.max(prev.correct, correct),
      played: prev.played + 1
    };
    localStorage.setItem('wow_game_high', JSON.stringify(data));
    return data;
  }

  // ---- Helper Functions ----

  function getProduct(id) {
    return products.find(p => p.id === parseInt(id));
  }

  function getProducts(filterObj = {}) {
    let filtered = [...products];

    if (filterObj.petType) {
      filtered = filtered.filter(p => p.petType === filterObj.petType);
    }
    if (filterObj.category) {
      filtered = filtered.filter(p => p.category === filterObj.category);
    }
    if (filterObj.dietary && filterObj.dietary.length > 0) {
      filtered = filtered.filter(p =>
        filterObj.dietary.some(d => p.dietary.includes(d))
      );
    }
    if (filterObj.lifeStage && filterObj.lifeStage.length > 0) {
      filtered = filtered.filter(p =>
        filterObj.lifeStage.some(ls => p.lifeStage.includes(ls))
      );
    }
    if (filterObj.breedSize && filterObj.breedSize.length > 0) {
      filtered = filtered.filter(p =>
        filterObj.breedSize.some(bs => p.breedSize.includes(bs) || p.breedSize.includes('all'))
      );
    }
    if (filterObj.subscribable) {
      filtered = filtered.filter(p => p.subscribable);
    }
    if (filterObj.search) {
      const q = filterObj.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    if (filterObj.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filterObj.minPrice);
    }
    if (filterObj.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filterObj.maxPrice);
    }

    // Sort
    if (filterObj.sort) {
      switch (filterObj.sort) {
        case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
        case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
        case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        case 'newest': filtered.sort((a, b) => b.id - a.id); break;
        case 'bestselling':
        default: filtered.sort((a, b) => b.reviewCount - a.reviewCount); break;
      }
    }

    return filtered;
  }

  function getProductReviews(productId) {
    const staticFiltered = reviews.filter(r => r.productId === parseInt(productId));
    let custom = [];
    try {
      custom = JSON.parse(localStorage.getItem('wow_custom_reviews')) || [];
    } catch (e) {
      custom = [];
    }
    const customFiltered = custom.filter(r => r.productId === parseInt(productId));
    
    // Combine, avoiding duplicates by id
    const combined = [...staticFiltered];
    customFiltered.forEach(cRev => {
      if (!combined.some(r => r.id === cRev.id)) {
        combined.push(cRev);
      }
    });
    
    // Sort by date descending
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function addReview(productId, review) {
    let custom = [];
    try {
      custom = JSON.parse(localStorage.getItem('wow_custom_reviews')) || [];
    } catch (e) {
      custom = [];
    }
    
    // Add if it doesn't already exist
    if (!custom.some(r => r.id === review.id)) {
      custom.push(review);
      localStorage.setItem('wow_custom_reviews', JSON.stringify(custom));
    }
    
    // Write to Firebase
    if (typeof WowFirebase !== 'undefined') {
      WowFirebase.writeReview(review);
    }
  }

  function getRelatedProducts(productId, limit = 4) {
    const product = getProduct(productId);
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p.petType === product.petType || p.category === product.category))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  function getBundleProducts(productId) {
    const product = getProduct(productId);
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && p.petType === product.petType && p.category !== product.category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
  }

  function generateProductGradient(product) {
    const colors = productColors[product.category] || ['#D4A853', '#B8913A'];
    return `linear-gradient(135deg, ${colors[0]}22, ${colors[1]}33)`;
  }

  function generateProductEmoji(product) {
    const emojiMap = {
      'food': { 'dog': '🥩', 'cat': '🐟', 'small-pet': '🌿', 'bird': '🌾' },
      'treats': { 'dog': '🦴', 'cat': '🐠', 'small-pet': '🥕', 'bird': '🌻' },
      'toys': { 'dog': '🎾', 'cat': '🪶', 'small-pet': '🏠', 'bird': '🔔' },
      'health': { 'dog': '💊', 'cat': '💉', 'small-pet': '🩺', 'bird': '💧' },
      'accessories': { 'dog': '🦮', 'cat': '🛏️', 'small-pet': '🏡', 'bird': '🪺' }
    };
    return emojiMap[product.category]?.[product.petType] || '🐾';
  }

  function formatPrice(price) {
    return '$' + price.toFixed(2);
  }

  function renderStars(rating) {
    let html = '<div class="stars">';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<span>★</span>';
      } else if (i - 0.5 <= rating) {
        html += '<span>★</span>';
      } else {
        html += '<span class="star-empty">★</span>';
      }
    }
    html += '</div>';
    return html;
  }

  // ---- Cart (localStorage) ----
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('wow_cart')) || [];
    } catch { return []; }
  }

  function triggerSync() {
    if (typeof WowFirebase !== 'undefined') {
      if (WowFirebase.isMockMode()) {
        WowFirebase.syncMockDataLocally();
      } else {
        WowFirebase.syncUserData();
      }
    }
  }

  function saveCart(cart) {
    localStorage.setItem('wow_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    triggerSync();
  }

  function addToCart(productId, qty = 1, isSubscription = false, frequency = '4weeks') {
    const cart = getCart();
    const existing = cart.find(item => item.productId === productId && item.isSubscription === isSubscription);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId, qty, isSubscription, frequency });
    }
    saveCart(cart);
    return cart;
  }

  function updateCartQty(productId, qty, isSubscription = false) {
    let cart = getCart();
    if (qty <= 0) {
      cart = cart.filter(item => !(item.productId === productId && item.isSubscription === isSubscription));
    } else {
      const item = cart.find(item => item.productId === productId && item.isSubscription === isSubscription);
      if (item) item.qty = qty;
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(productId, isSubscription = false) {
    let cart = getCart().filter(item => !(item.productId === productId && item.isSubscription === isSubscription));
    saveCart(cart);
    return cart;
  }

  function clearCart() {
    saveCart([]);
    localStorage.removeItem('wow_applied_promo');
  }

  function getCartTotal() {
    const cart = getCart();
    let subtotal = 0;
    let savings = 0;
    cart.forEach(item => {
      const product = getProduct(item.productId);
      if (!product) return;
      const price = item.isSubscription && product.subscribePrice ? product.subscribePrice : product.price;
      subtotal += price * item.qty;
      if (item.isSubscription && product.subscribePrice) {
        savings += (product.price - product.subscribePrice) * item.qty;
      }
    });

    const activeCode = localStorage.getItem('wow_applied_promo');
    let promoDiscount = 0;
    if (activeCode && promoCodes[activeCode]) {
      const promo = promoCodes[activeCode];
      promoDiscount = promo.type === 'percent' ? (subtotal * promo.discount) : promo.discount;
    }

    const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
    const shipping = discountedSubtotal >= 49 ? 0 : 5.99;
    const tax = discountedSubtotal * 0.08;

    return { 
      subtotal, 
      savings, 
      shipping, 
      tax, 
      promoDiscount, 
      total: discountedSubtotal + shipping + tax 
    };
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  // ---- Pet Profiles (localStorage) ----
  function getPets() {
    try {
      return JSON.parse(localStorage.getItem('wow_pets')) || [];
    } catch { return []; }
  }

  function savePet(pet) {
    const pets = getPets();
    if (pet.id) {
      const idx = pets.findIndex(p => p.id === pet.id);
      if (idx !== -1) pets[idx] = pet;
    } else {
      pet.id = Date.now();
      pets.push(pet);
    }
    localStorage.setItem('wow_pets', JSON.stringify(pets));
    triggerSync();
    return pets;
  }

  function removePet(petId) {
    const pets = getPets().filter(p => p.id !== petId);
    localStorage.setItem('wow_pets', JSON.stringify(pets));
    triggerSync();
    return pets;
  }

  // ---- Loyalty Points (localStorage) ----
  function getLoyalty() {
    try {
      return JSON.parse(localStorage.getItem('wow_loyalty')) || { points: 750, history: [
        { date: '2024-03-15', description: 'Purchase — Order #1042', points: 320 },
        { date: '2024-03-01', description: 'Welcome Bonus', points: 200 },
        { date: '2024-02-20', description: 'Purchase — Order #1038', points: 180 },
        { date: '2024-02-10', description: 'Review Bonus', points: 50 }
      ]};
    } catch { return { points: 750, history: [] }; }
  }

  function addLoyaltyPoints(points, description) {
    const loyalty = getLoyalty();
    loyalty.points += points;
    loyalty.history.unshift({
      date: new Date().toISOString().split('T')[0],
      description,
      points
    });
    localStorage.setItem('wow_loyalty', JSON.stringify(loyalty));
    triggerSync();
    return loyalty;
  }

  function getLoyaltyTier(points) {
    let tier = loyaltyTiers[0];
    for (const t of loyaltyTiers) {
      if (points >= t.minPoints) tier = t;
    }
    return tier;
  }

  function getNextTier(points) {
    for (const t of loyaltyTiers) {
      if (points < t.minPoints) return t;
    }
    return null;
  }

  // ---- Wishlist (localStorage) ----
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wow_wishlist')) || []; }
    catch { return []; }
  }

  function toggleWishlist(productId) {
    let list = getWishlist();
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
    }
    localStorage.setItem('wow_wishlist', JSON.stringify(list));
    triggerSync();
    return list;
  }

  function isInWishlist(productId) {
    return getWishlist().includes(productId);
  }

  // ---- Subscriptions (localStorage) ----
  function getSubscriptions() {
    try {
      return JSON.parse(localStorage.getItem('wow_subscriptions')) || [
        { id: 1, productId: 1, frequency: '4weeks', status: 'active', nextDelivery: '2024-04-15', startDate: '2024-01-15' },
        { id: 2, productId: 4, frequency: '4weeks', status: 'active', nextDelivery: '2024-04-12', startDate: '2024-02-12' }
      ];
    } catch { return []; }
  }

  function saveSubscriptions(subs) {
    localStorage.setItem('wow_subscriptions', JSON.stringify(subs));
    triggerSync();
  }

  // ---- Order History (localStorage) ----
  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem('wow_orders')) || [
        {
          id: '#WOW-1042',
          date: '2024-03-15',
          status: 'delivered',
          items: [
            { productId: 1, qty: 1, price: 46.74, isSubscription: true },
            { productId: 6, qty: 2, price: 18.99 }
          ],
          total: 84.72,
          pointsEarned: 320
        },
        {
          id: '#WOW-1038',
          date: '2024-02-20',
          status: 'delivered',
          items: [
            { productId: 4, qty: 1, price: 33.14, isSubscription: true },
            { productId: 11, qty: 1, price: 12.99 }
          ],
          total: 46.13,
          pointsEarned: 180
        }
      ];
    } catch { return []; }
  }

  function addOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem('wow_orders', JSON.stringify(orders));
    triggerSync();
    return orders;
  }

  // ---- Validate Promo ----
  function validatePromo(code) {
    const promo = promoCodes[code.toUpperCase()];
    if (promo) {
      localStorage.setItem('wow_applied_promo', code.toUpperCase());
    }
    return promo || null;
  }

  // ---- Public API ----
  return {
    products,
    categories,
    productCategories,
    filters,
    loyaltyTiers,
    testimonials,
    getProduct,
    getProducts,
    getProductReviews,
    addReview,
    getRelatedProducts,
    getBundleProducts,
    generateProductGradient,
    generateProductEmoji,
    getProductImage,
    productImages,
    getProductVideo,
    productVideos,
    formatPrice,
    renderStars,
    getCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    getPets,
    savePet,
    removePet,
    getLoyalty,
    addLoyaltyPoints,
    getLoyaltyTier,
    getNextTier,
    getWishlist,
    toggleWishlist,
    isInWishlist,
    getSubscriptions,
    saveSubscriptions,
    getOrders,
    addOrder,
    validatePromo,
    productColors,
    getGameHighScore,
    setGameHighScore,
    triggerSync
  };
})();
