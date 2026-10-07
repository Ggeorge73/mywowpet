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
      image: "",
      images: [],
      badge: null,
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
      image: "",
      images: [],
      badge: null,
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
      image: "",
      images: [],
      badge: null,
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
      image: "",
      images: [],
      badge: null,
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
      image: "",
      images: [],
      badge: null,
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

  // ---- Shopify Storefront API ----
  const shopifyConfig = {
    domain: 'id0dxt-4y.myshopify.com',
    storefrontAccessToken: 'f19dc13ce0feb0bbfa7c9a79ac89eef4',
    apiVersion: '2026-04',
    canonicalStorefrontUrl: 'https://mywowpet.com'
  };

  // Product IDs are used for product lookup; variant IDs are required for carts.
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

  const shopifyVariantIds = {
    1: '45593123192915',
    2: '45593123225683',
    3: '45593123323987',
    4: '45593123487827',
    5: '45593123651667',
    6: '45593125060691',
    7: '45593125126227',
    8: '45593125158995',
    9: '45593125191763',
    10: '45593125814355',
    11: '45593125879891',
    12: '45593125912659',
    13: '45593125945427',
    14: '45593125978195',
    15: '45593126043731',
    16: '45593126338643',
    17: '45593126371411',
    18: '45593126404179',
    19: '45593139413075',
    20: '45593139970131',
    21: '45593140002899',
    22: '45593140461651',
    23: '45593143902291',
    24: '45593143967827'
  };

  products.forEach(p => {
    p.shopifyProductId = shopifyProductIds[p.id] || null;
    p.shopifyVariantId = shopifyVariantIds[p.id] || null;
    p.shopifyId = p.shopifyProductId;
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
    'food': { dog: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/dog_happy.mp4', cat: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/cat_playing.mp4', default: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/hero.mp4' },
    'treats': { dog: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/dog_park.mp4', cat: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/cat_curious.mp4', default: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/corgi_ball.mp4' },
    'toys': { dog: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/corgi_ball.mp4', cat: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/cat_playing.mp4', default: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/dog_running.mp4' },
    'health': { dog: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/dog_happy.mp4', cat: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/cat_sleeping.mp4', default: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/puppy_cute.mp4' },
    'accessories': { dog: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/dog_park.mp4', cat: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/cat_sleeping.mp4', default: 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/hero.mp4' }
  };

  function getProductVideo(product) {
    const catVideos = productVideos[product.category];
    if (!catVideos) return 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/hero.mp4';
    if (product.petType && catVideos[product.petType]) return catVideos[product.petType];
    return catVideos.default || 'https://pub-40ec11da72c446d3a4c39df5fdae319c.r2.dev/videos/hero.mp4';
  }

  // ---- Feature flags ----
  // Single switch for features that need Shopify-side setup before they can be
  // honoured at checkout. While a flag is false the UI must not advertise the
  // feature or let it change a displayed price.
  //  - subscriptions: Subscribe & Save / autoship. No Shopify selling plans exist
  //    yet (MWP-16), so a subscription line would be charged full price.
  //  - loyalty: points, tiers and rewards. Nothing redeems them at checkout yet.
  const FEATURES = Object.freeze({
    subscriptions: false,
    loyalty: false
  });

  // ---- Reviews ----
  // Only genuine customer submissions are shown (local + Firestore). The store is
  // pre-launch, so there are no seeded reviews, ratings or testimonials: inventing
  // them would breach the FTC Consumer Reviews and Testimonials Rule (16 CFR 465).

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

  // ---- Pricing constants ----
  // Named so tests can pin them and so a change is visible in review rather than
  // buried as a literal inside getCartTotal.
  const FREE_SHIPPING_THRESHOLD = 49;
  const SHIPPING_FLAT_RATE = 5.99;
  const TAX_RATE = 0.08;

  // ---- Discount codes ----
  // Shopify is the only source of truth for discount codes. The storefront never
  // validates a code or shows a discounted price locally: whatever the shopper
  // types is handed to cartCreate as `discountCodes` and Shopify decides at
  // checkout. (A client-side table used to show e.g. -25% for codes that do not
  // exist in Shopify, and checkout then charged full price.)
  const PROMO_STORAGE_KEY = 'wow_applied_promo';

  // ---- Storage helpers ----
  // JSON.parse only proves the stored value was parseable, not that it is still
  // the shape we wrote. A stale schema, an aborted sync, or a third-party write
  // can leave valid JSON of the wrong type behind; returning that as-is throws in
  // every downstream consumer (getCartCount, cart rendering, the Firestore sync)
  // and leaves the user with a permanently broken cart. Anything that is not an
  // array is treated as absent.
  function readList(key, fallback = []) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  // Object-shaped stores need the mirror-image guard: an array or a primitive is
  // parseable but has none of the fields callers read, so it must not pass through.
  function readRecord(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
      return parsed;
    } catch {
      return fallback;
    }
  }

  // ---- Game High Score (localStorage) ----
  function getGameHighScore() {
    return readRecord('wow_game_high', { score: 0, correct: 0, played: 0 });
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
        case 'rating': {
          // Real customer ratings only; unreviewed products keep catalog order.
          const score = p => getProductRating(p.id);
          filtered.sort((a, b) => (score(b).average - score(a).average) || (score(b).count - score(a).count));
          break;
        }
        case 'newest': filtered.sort((a, b) => b.id - a.id); break;
        // There is no sales data before launch, so "bestselling" (the default)
        // is curated catalog order rather than an invented ranking.
        case 'bestselling':
        default: break;
      }
    }

    return filtered;
  }

  function getProductReviews(productId) {
    let custom = [];
    try {
      custom = readList('wow_custom_reviews');
    } catch (e) {
      custom = [];
    }
    const customFiltered = custom.filter(r => r && r.productId === parseInt(productId));

    // De-duplicate by id
    const combined = [];
    customFiltered.forEach(cRev => {
      if (!combined.some(r => r.id === cRev.id)) {
        // Older submissions were stamped "Verified Buyer" by default with no
        // order behind them. Nothing here is tied to a Shopify order, so drop it.
        combined.push(cRev.pet === 'Verified Buyer' ? { ...cRev, pet: '' } : cRev);
      }
    });

    // Sort by date descending
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Aggregate rating computed from real reviews only. `count` is 0 (and
  // `average` 0) until a customer has actually reviewed the product, and callers
  // must not render stars in that case.
  function getProductRating(productId) {
    const ratings = getProductReviews(productId)
      .map(r => Number(r.rating))
      .filter(n => Number.isFinite(n) && n >= 1 && n <= 5);
    if (!ratings.length) return { average: 0, count: 0 };
    const average = ratings.reduce((sum, n) => sum + n, 0) / ratings.length;
    return { average: Math.round(average * 10) / 10, count: ratings.length };
  }

  // Shared rating line for cards, quick view and the product page. Renders the
  // neutral empty state (or nothing, with { emptyText: '' }) when unreviewed.
  function renderRatingSummary(productId, { emptyText = 'No reviews yet — be the first' } = {}) {
    const { average, count } = getProductRating(productId);
    if (!count) {
      return emptyText ? `<span class="rating-empty text-sm text-muted">${emptyText}</span>` : '';
    }
    return `${renderStars(average)}<span class="rating-count">${average} (${count} review${count === 1 ? '' : 's'})</span>`;
  }

  function addReview(productId, review) {
    let custom = [];
    try {
      custom = readList('wow_custom_reviews');
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
    const value = Number(price || 0);
    return '$' + value.toFixed(2);
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

  function toShopifyGid(type, id) {
    if (!id) return null;
    const value = String(id);
    return value.startsWith('gid://') ? value : `gid://shopify/${type}/${value}`;
  }

  function getShopifyProductGid(productOrId) {
    const product = typeof productOrId === 'object' ? productOrId : getProduct(productOrId);
    return product ? toShopifyGid('Product', product.shopifyProductId) : null;
  }

  function getShopifyVariantGid(productOrId) {
    const product = typeof productOrId === 'object' ? productOrId : getProduct(productOrId);
    return product ? toShopifyGid('ProductVariant', product.shopifyVariantId) : null;
  }

  async function shopifyRequest(query, variables = {}) {
    const response = await fetch(`https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken
      },
      body: JSON.stringify({ query, variables })
    });

    const payload = await response.json();
    if (!response.ok || payload.errors) {
      const message = payload.errors?.map(error => error.message).join('; ') || `Shopify request failed with status ${response.status}`;
      throw new Error(message);
    }
    return payload.data;
  }

  async function syncProductFromShopify(productId) {
    const localProduct = getProduct(productId);
    const productGid = getShopifyProductGid(localProduct);
    if (!localProduct || !productGid) return null;

    const query = `
      query ProductCommerceData($id: ID!) {
        product(id: $id) {
          id
          title
          availableForSale
          variants(first: 1) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    const data = await shopifyRequest(query, { id: productGid });
    const shopifyProduct = data.product;
    const variant = shopifyProduct?.variants?.nodes?.[0];
    if (!shopifyProduct || !variant) return null;

    localProduct.shopifyTitle = shopifyProduct.title;
    localProduct.shopifyVariantId = variant.id.replace('gid://shopify/ProductVariant/', '');
    localProduct.inStock = Boolean(shopifyProduct.availableForSale && variant.availableForSale);
    localProduct.price = parseFloat(variant.price.amount);
    localProduct.currencyCode = variant.price.currencyCode;
    return shopifyProduct;
  }

  function getMissingShopifyCartItems(cart = getCart()) {
    return cart
      .map(item => ({ item, product: getProduct(item.productId) }))
      .filter(entry => !entry.product || !getShopifyVariantGid(entry.product));
  }

  function buildShopifyCartLines(cart = getCart()) {
    return cart
      .map(item => {
        const product = getProduct(item.productId);
        const merchandiseId = getShopifyVariantGid(product);
        if (!product || !merchandiseId) return null;

        const line = {
          merchandiseId,
          quantity: Math.max(1, parseInt(item.qty, 10) || 1)
        };

        if (FEATURES.subscriptions && item.isSubscription && product.shopifySellingPlanId) {
          line.sellingPlanId = toShopifyGid('SellingPlan', product.shopifySellingPlanId);
        }

        return line;
      })
      .filter(Boolean);
  }

  function getCustomStorefrontUrl(path = '/') {
    const fallbackOrigin = shopifyConfig.canonicalStorefrontUrl.replace(/\/+$/, '');
    let origin = fallbackOrigin;

    try {
      const hostname = window.location.hostname;
      const isLocalPreview = ['localhost', '127.0.0.1', ''].includes(hostname);
      const isShopifyHosted = hostname.endsWith('.myshopify.com');

      if (window.location.protocol.startsWith('http') && !isLocalPreview && !isShopifyHosted) {
        origin = window.location.origin;
      }
    } catch (err) {
      origin = fallbackOrigin;
    }

    try {
      return new URL(path || '/', `${origin}/`).toString();
    } catch (err) {
      return `${fallbackOrigin}/`;
    }
  }

  function buildShopifyCheckoutUrl(checkoutUrl, returnUrl = getCustomStorefrontUrl('/')) {
    const url = new URL(checkoutUrl);
    url.searchParams.set('return_url', returnUrl);
    url.searchParams.set('return_to', returnUrl);
    return url.toString();
  }

  async function createShopifyCart(cart = getCart(), options = {}) {
    const lines = buildShopifyCartLines(cart);
    if (!lines.length) {
      throw new Error('No Shopify-ready cart lines were found.');
    }

    const returnUrl = options.returnUrl || getCustomStorefrontUrl('/');
    const input = {
      lines,
      attributes: [
        { key: 'source', value: 'my-wow-pet-custom-storefront' },
        { key: 'source_url', value: returnUrl },
        { key: 'return_url', value: returnUrl }
      ]
    };

    // Shopify validates the code; we only forward what the shopper typed.
    const discountCode = normalizePromoCode(options.discountCode);
    if (discountCode) {
      input.discountCodes = [discountCode];
    }

    if (options.email) {
      input.buyerIdentity = { email: options.email };
    }

    const query = `
      mutation CreateShopifyCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            discountCodes {
              code
              applicable
            }
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await shopifyRequest(query, { input });
    const result = data.cartCreate;
    if (result.userErrors?.length) {
      throw new Error(result.userErrors.map(error => error.message).join('; '));
    }

    return result.cart;
  }

  // ---- Cart (localStorage) ----
  function getCart() {
    return readList('wow_cart');
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
    // Subscription lines cannot be honoured at checkout until selling plans exist.
    if (!FEATURES.subscriptions) isSubscription = false;
    const product = getProduct(productId);
    if (!product || !getShopifyVariantGid(product) || product.inStock === false) {
      return null;
    }

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
    localStorage.removeItem(PROMO_STORAGE_KEY);
  }

  // Estimated totals only. Discount codes are never applied here: Shopify applies
  // them at checkout, so the cart must not show a price Shopify might not honour.
  function getCartTotal() {
    const cart = getCart();
    let subtotal = 0;
    let savings = 0;
    cart.forEach(item => {
      const product = getProduct(item.productId);
      if (!product) return;
      const subscriptionPriced = FEATURES.subscriptions && item.isSubscription && product.subscribePrice;
      const price = subscriptionPriced ? product.subscribePrice : product.price;
      subtotal += price * item.qty;
      if (subscriptionPriced) {
        savings += (product.price - product.subscribePrice) * item.qty;
      }
    });

    const shipping = getShippingEstimate(subtotal);
    const tax = subtotal * TAX_RATE;

    return {
      subtotal,
      savings,
      shipping,
      tax,
      // Kept for callers that still read it; always 0 by design.
      promoDiscount: 0,
      total: subtotal + shipping + tax
    };
  }

  // Shipping estimate for a subtotal, so every page uses the same rule.
  function getShippingEstimate(subtotal) {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  // ---- Pet Profiles (localStorage) ----
  function getPets() {
    return readList('wow_pets');
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

  // ---- Legacy demo data ----
  // Earlier builds seeded every new visitor with 750 points, two fake 2024 orders
  // and two "active" subscriptions, and synced them to Firestore. New visitors now
  // start empty; these matchers scrub the old seed wherever it was persisted.
  const DEMO_ORDER_IDS = ['#WOW-1042', '#WOW-1038'];
  const DEMO_LOYALTY_ENTRIES = [
    '2024-03-15|Purchase — Order #1042',
    '2024-03-01|Welcome Bonus',
    '2024-02-20|Purchase — Order #1038',
    '2024-02-10|Review Bonus'
  ];
  const DEMO_SUBSCRIPTION_STARTS = ['1|1|2024-01-15', '2|4|2024-02-12'];

  function isDemoLoyaltyEntry(entry) {
    return Boolean(entry) && DEMO_LOYALTY_ENTRIES.includes(`${entry.date}|${entry.description}`);
  }

  function isDemoSubscription(sub) {
    return Boolean(sub) && DEMO_SUBSCRIPTION_STARTS.includes(`${sub.id}|${sub.productId}|${sub.startDate}`);
  }

  // ---- Loyalty Points (localStorage) ----
  function getLoyalty() {
    const loyalty = readRecord('wow_loyalty', { points: 0, history: [] });
    // addLoyaltyPoints unshifts into history, so it has to be an array even
    // when a partial record was written.
    if (!Array.isArray(loyalty.history)) loyalty.history = [];
    if (typeof loyalty.points !== 'number' || !Number.isFinite(loyalty.points)) loyalty.points = 0;
    // Strip the demo history earlier builds seeded for every visitor (and synced
    // to Firestore), along with the points it accounted for.
    const demoPoints = loyalty.history
      .filter(isDemoLoyaltyEntry)
      .reduce((sum, h) => sum + (Number(h.points) || 0), 0);
    if (demoPoints) {
      loyalty.history = loyalty.history.filter(h => !isDemoLoyaltyEntry(h));
      loyalty.points = Math.max(0, loyalty.points - demoPoints);
    }
    return loyalty;
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
    return readList('wow_wishlist');
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
    return readList('wow_subscriptions').filter(sub => !isDemoSubscription(sub));
  }

  function saveSubscriptions(subs) {
    localStorage.setItem('wow_subscriptions', JSON.stringify(subs));
    triggerSync();
  }

  // ---- Order History (localStorage) ----
  function getOrders() {
    return readList('wow_orders').filter(order => !DEMO_ORDER_IDS.includes(order?.id));
  }

  function addOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem('wow_orders', JSON.stringify(orders));
    triggerSync();
    return orders;
  }

  // ---- Discount code entry ----
  // Remembers the code the shopper typed so checkout can forward it to Shopify.
  // It is deliberately not validated or priced here.
  function normalizePromoCode(code) {
    if (typeof code !== 'string') return '';
    return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 64);
  }

  function setPromoCode(code) {
    const normalized = normalizePromoCode(code);
    if (normalized) localStorage.setItem(PROMO_STORAGE_KEY, normalized);
    else localStorage.removeItem(PROMO_STORAGE_KEY);
    return normalized || null;
  }

  function getPromoCode() {
    return normalizePromoCode(localStorage.getItem(PROMO_STORAGE_KEY)) || null;
  }

  // ---- Public API ----
  return {
    products,
    categories,
    productCategories,
    filters,
    loyaltyTiers,
    FEATURES,
    shopifyConfig,
    shopifyProductIds,
    shopifyVariantIds,
    getProduct,
    getProducts,
    getProductReviews,
    getProductRating,
    renderRatingSummary,
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
    toShopifyGid,
    getShopifyProductGid,
    getShopifyVariantGid,
    shopifyRequest,
    syncProductFromShopify,
    getMissingShopifyCartItems,
    buildShopifyCartLines,
    getCustomStorefrontUrl,
    buildShopifyCheckoutUrl,
    createShopifyCart,
    getCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartTotal,
    getShippingEstimate,
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
    normalizePromoCode,
    setPromoCode,
    getPromoCode,
    productColors,
    FREE_SHIPPING_THRESHOLD,
    SHIPPING_FLAT_RATE,
    TAX_RATE,
    getGameHighScore,
    setGameHighScore,
    triggerSync
  };
})();
window.WowStore = WowStore;
