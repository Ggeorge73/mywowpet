/* ============================================
   WowPetStore — Firebase Auth & Database Backend
   ============================================ */

const WowFirebase = (() => {
  let isMock = true;
  let auth = null;
  let db = null;
  let currentUser = null;
  let authStateCallback = null;

  // IMPORTANT: Replace these placeholders with your real Firebase Web App credentials!
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Check if credentials are set
  const hasCredentials = firebaseConfig.apiKey && 
                         !firebaseConfig.apiKey.startsWith("YOUR_") && 
                         firebaseConfig.projectId && 
                         !firebaseConfig.projectId.startsWith("YOUR_");

  // ---- Initialize Firebase ----
  function init() {
    if (!hasCredentials) {
      console.warn("🐾 [WowPetStore] Firebase credentials are not configured. Running in Local Storage Fallback Mode.");
      isMock = true;
      setupMockAuthListener();
      return;
    }

    try {
      // Initialize Firebase App
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      auth = firebase.auth();
      db = firebase.firestore();
      isMock = false;
      console.log("🐾 [WowPetStore] Firebase Auth and Firestore DB initialized successfully.");
      
      // Setup Real Auth Listener
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          currentUser = user;
          console.log(`🐾 [WowPetStore] User authenticated: ${user.email} (${user.uid})`);
          await handleUserLogin(user);
        } else {
          currentUser = null;
          console.log("🐾 [WowPetStore] User signed out.");
          handleUserLogout();
        }
        if (authStateCallback) authStateCallback(currentUser);
      });
    } catch (error) {
      console.error("🐾 [WowPetStore] Firebase initialization failed:", error);
      isMock = true;
      setupMockAuthListener();
    }
  }

  // ---- Mock Auth for Fallback Mode ----
  function setupMockAuthListener() {
    // Check if there's a simulated login session
    try {
      const mockSession = JSON.parse(localStorage.getItem('wow_mock_user'));
      if (mockSession) {
        currentUser = mockSession;
        console.log(`🐾 [WowPetStore - Mock] Logged in as: ${currentUser.email}`);
      }
    } catch (e) {
      currentUser = null;
    }
  }

  function triggerMockAuthChange() {
    if (authStateCallback) authStateCallback(currentUser);
  }

  // ---- Auth Actions ----

  async function signInWithEmail(email, password) {
    if (isMock) {
      return simulateEmailSignIn(email, password);
    }
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signUpWithEmail(email, password, fullName) {
    if (isMock) {
      return simulateEmailSignUp(email, password, fullName);
    }
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Set display name
    await user.updateProfile({ displayName: fullName });
    
    // Save additional profile details in local storage temporarily
    localStorage.setItem('wow_guest_name', fullName);
    return userCredential;
  }

  async function signInWithGoogle() {
    if (isMock) {
      return simulateSocialSignIn('Google', 'google-user@example.com', 'Google Pet Lover');
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
  }

  async function signInWithFacebook() {
    if (isMock) {
      return simulateSocialSignIn('Facebook', 'fb-user@example.com', 'Facebook Pet Lover');
    }
    const provider = new firebase.auth.FacebookAuthProvider();
    return auth.signInWithPopup(provider);
  }

  async function signInWithApple() {
    if (isMock) {
      return simulateSocialSignIn('Apple', 'apple-user@example.com', 'Apple Pet Lover');
    }
    const provider = new firebase.auth.OAuthProvider('apple.com');
    return auth.signInWithPopup(provider);
  }

  async function logout() {
    if (isMock) {
      currentUser = null;
      localStorage.removeItem('wow_mock_user');
      handleUserLogout();
      triggerMockAuthChange();
      return Promise.resolve();
    }
    return auth.signOut();
  }

  async function sendPasswordReset(email) {
    if (isMock) {
      console.log(`🐾 [WowPetStore - Mock] Password reset email simulated to: ${email}`);
      return Promise.resolve();
    }
    return auth.sendPasswordResetEmail(email);
  }

  function onAuthStateChanged(callback) {
    authStateCallback = callback;
    // Immediate trigger for current state
    if (isMock || (auth && auth.currentUser === null)) {
      callback(currentUser);
    }
  }

  function getCurrentUser() {
    return currentUser;
  }

  function isMockMode() {
    return isMock;
  }

  // ---- Firestore Syncing Logic ----

  async function handleUserLogin(firebaseUser) {
    try {
      const userRef = db.collection('users').doc(firebaseUser.uid);
      const doc = await userRef.get();
      
      const guestCart = JSON.parse(localStorage.getItem('wow_cart')) || [];
      const guestPets = JSON.parse(localStorage.getItem('wow_pets')) || [];
      const guestWishlist = JSON.parse(localStorage.getItem('wow_wishlist')) || [];
      const guestLoyalty = JSON.parse(localStorage.getItem('wow_loyalty')) || { points: 0, history: [] };
      const guestSubs = JSON.parse(localStorage.getItem('wow_subscriptions')) || [];
      const guestOrders = JSON.parse(localStorage.getItem('wow_orders')) || [];
      const guestGame = JSON.parse(localStorage.getItem('wow_game_high')) || { score: 0, correct: 0, played: 0 };
      const guestStreak = JSON.parse(localStorage.getItem('wow_streak')) || { current: 0, lastVisit: '', history: [] };

      let mergedData = {};

      if (!doc.exists) {
        // First login: Upload guest data to cloud
        mergedData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          profile: {
            name: firebaseUser.displayName || localStorage.getItem('wow_guest_name') || 'Pet Parent',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip: ''
          },
          pets: guestPets,
          cart: guestCart,
          orders: guestOrders,
          loyalty: guestLoyalty,
          wishlist: guestWishlist,
          subscriptions: guestSubs,
          gameHighScore: guestGame,
          streak: guestStreak
        };
        await userRef.set(mergedData);
        console.log("🐾 [WowPetStore] New user document created in Firestore with guest history.");
      } else {
        // Return login: Fetch cloud document, merge with guest data
        const cloudData = doc.data();
        
        // Merge carts (combine quantities of same products)
        const cart = [...cloudData.cart];
        guestCart.forEach(gItem => {
          const match = cart.find(cItem => cItem.productId === gItem.productId && cItem.isSubscription === gItem.isSubscription);
          if (match) {
            match.qty = Math.max(match.qty, gItem.qty);
          } else {
            cart.push(gItem);
          }
        });

        // Merge wishlists (unique union)
        const wishlist = Array.from(new Set([...(cloudData.wishlist || []), ...guestWishlist]));

        // Merge pets (combine by id or unique name)
        const pets = [...(cloudData.pets || [])];
        guestPets.forEach(gPet => {
          if (!pets.some(p => p.name.toLowerCase() === gPet.name.toLowerCase())) {
            pets.push(gPet);
          }
        });

        // Merge loyalty (take max points, append history)
        const loyalty = {
          points: Math.max(cloudData.loyalty?.points || 0, guestLoyalty.points || 0),
          history: mergeLoyaltyHistory(cloudData.loyalty?.history || [], guestLoyalty.history || [])
        };

        // Merge game high score (take highest score)
        const gameHighScore = {
          score: Math.max(cloudData.gameHighScore?.score || 0, guestGame.score || 0),
          correct: Math.max(cloudData.gameHighScore?.correct || 0, guestGame.correct || 0),
          played: (cloudData.gameHighScore?.played || 0) + (guestGame.played || 0)
        };

        // Merge streak (take maximum streak)
        const streak = (cloudData.streak?.current || 0) >= (guestStreak.current || 0) ? cloudData.streak : guestStreak;

        // Build final profile
        mergedData = {
          ...cloudData,
          cart,
          wishlist,
          pets,
          loyalty,
          gameHighScore,
          streak,
          orders: cloudData.orders || guestOrders,
          subscriptions: cloudData.subscriptions || guestSubs
        };

        // Save merged back to Firestore
        await userRef.update(mergedData);
        console.log("🐾 [WowPetStore] Merged local guest data with cloud user data.");
      }

      // Update Local Storage & replace WowStore internal state
      replaceLocalState(mergedData);
    } catch (err) {
      console.error("🐾 [WowPetStore] Failed to sync data with Firestore on login:", err);
    }
  }

  function handleUserLogout() {
    // Clear user-specific storage keys
    localStorage.removeItem('wow_cart');
    localStorage.removeItem('wow_pets');
    localStorage.removeItem('wow_wishlist');
    localStorage.removeItem('wow_loyalty');
    localStorage.removeItem('wow_subscriptions');
    localStorage.removeItem('wow_orders');
    localStorage.removeItem('wow_game_high');
    localStorage.removeItem('wow_streak');
    localStorage.removeItem('wow_guest_name');
    
    // Clear page triggers
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }

  // Helper: merge arrays and sort by date descending
  function mergeLoyaltyHistory(h1, h2) {
    const combined = [...h1, ...h2];
    const unique = [];
    const seen = new Set();
    combined.forEach(item => {
      const key = `${item.date}_${item.description}_${item.points}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    return unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Update localStorage with cloud user data and notify store modules
  function replaceLocalState(data) {
    localStorage.setItem('wow_cart', JSON.stringify(data.cart || []));
    localStorage.setItem('wow_pets', JSON.stringify(data.pets || []));
    localStorage.setItem('wow_wishlist', JSON.stringify(data.wishlist || []));
    localStorage.setItem('wow_loyalty', JSON.stringify(data.loyalty || { points: 0, history: [] }));
    localStorage.setItem('wow_subscriptions', JSON.stringify(data.subscriptions || []));
    localStorage.setItem('wow_orders', JSON.stringify(data.orders || []));
    localStorage.setItem('wow_game_high', JSON.stringify(data.gameHighScore || { score: 0, correct: 0, played: 0 }));
    localStorage.setItem('wow_streak', JSON.stringify(data.streak || { current: 0, lastVisit: '', history: [] }));
    if (data.profile) {
      localStorage.setItem('wow_profile_info', JSON.stringify(data.profile));
    }
    
    // Dispatch events to re-render cart elements
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data.cart || [] }));
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data }));
  }

  // ---- Asynchronous Cloud Data Syncing on Local Changes ----
  async function syncUserData() {
    if (isMock || !currentUser) return;
    
    try {
      const userRef = db.collection('users').doc(currentUser.uid);
      const data = {
        cart: JSON.parse(localStorage.getItem('wow_cart')) || [],
        pets: JSON.parse(localStorage.getItem('wow_pets')) || [],
        wishlist: JSON.parse(localStorage.getItem('wow_wishlist')) || [],
        loyalty: JSON.parse(localStorage.getItem('wow_loyalty')) || { points: 0, history: [] },
        subscriptions: JSON.parse(localStorage.getItem('wow_subscriptions')) || [],
        orders: JSON.parse(localStorage.getItem('wow_orders')) || [],
        gameHighScore: JSON.parse(localStorage.getItem('wow_game_high')) || { score: 0, correct: 0, played: 0 },
        streak: JSON.parse(localStorage.getItem('wow_streak')) || { current: 0, lastVisit: '', history: [] },
        profile: JSON.parse(localStorage.getItem('wow_profile_info')) || {}
      };
      
      await userRef.update(data);
      console.log("🐾 [WowPetStore] Firestore user data synced successfully.");
    } catch (err) {
      console.error("🐾 [WowPetStore] Failed to write local updates to Firestore:", err);
    }
  }

  // Place order into root database collection
  async function writeOrderToRootDb(order) {
    if (isMock) return;
    try {
      const orderData = {
        ...order,
        userId: currentUser ? currentUser.uid : 'guest',
        email: currentUser ? currentUser.email : (localStorage.getItem('wow_checkout_email') || 'anonymous'),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('orders').doc(order.id).set(orderData);
      console.log(`🐾 [WowPetStore] Transacted order ${order.id} written to global database.`);
    } catch (err) {
      console.error("🐾 [WowPetStore] Firestore global order write failed:", err);
    }
  }

  // ---- Simulation Functions for Mock Mode ----

  function simulateEmailSignIn(email, password) {
    const mockUsers = JSON.parse(localStorage.getItem('wow_mock_database') || '{}');
    const user = mockUsers[email.toLowerCase()];
    if (!user || user.password !== password) {
      return Promise.reject(new Error("Invalid email or password."));
    }
    
    currentUser = { uid: user.uid, email: user.email, displayName: user.name };
    localStorage.setItem('wow_mock_user', JSON.stringify(currentUser));
    
    // Simulate sync
    replaceLocalState(user.data);
    triggerMockAuthChange();
    return Promise.resolve({ user: currentUser });
  }

  function simulateEmailSignUp(email, password, fullName) {
    const mockUsers = JSON.parse(localStorage.getItem('wow_mock_database') || '{}');
    if (mockUsers[email.toLowerCase()]) {
      return Promise.reject(new Error("An account already exists with this email."));
    }

    const uid = 'mock_uid_' + Math.floor(Math.random() * 1000000);
    const guestCart = JSON.parse(localStorage.getItem('wow_cart')) || [];
    const guestPets = JSON.parse(localStorage.getItem('wow_pets')) || [];
    const guestWishlist = JSON.parse(localStorage.getItem('wow_wishlist')) || [];
    const guestLoyalty = JSON.parse(localStorage.getItem('wow_loyalty')) || { points: 0, history: [] };
    const guestSubs = JSON.parse(localStorage.getItem('wow_subscriptions')) || [];
    const guestOrders = JSON.parse(localStorage.getItem('wow_orders')) || [];
    const guestGame = JSON.parse(localStorage.getItem('wow_game_high')) || { score: 0, correct: 0, played: 0 };
    const guestStreak = JSON.parse(localStorage.getItem('wow_streak')) || { current: 0, lastVisit: '', history: [] };

    const newUser = {
      uid,
      email,
      name: fullName,
      password,
      data: {
        cart: guestCart,
        pets: guestPets,
        wishlist: guestWishlist,
        loyalty: guestLoyalty,
        subscriptions: guestSubs,
        orders: guestOrders,
        gameHighScore: guestGame,
        streak: guestStreak,
        profile: { name: fullName, phone: '', address: '', city: '', state: '', zip: '' }
      }
    };

    mockUsers[email.toLowerCase()] = newUser;
    localStorage.setItem('wow_mock_database', JSON.stringify(mockUsers));
    
    currentUser = { uid, email, displayName: fullName };
    localStorage.setItem('wow_mock_user', JSON.stringify(currentUser));
    
    replaceLocalState(newUser.data);
    triggerMockAuthChange();
    return Promise.resolve({ user: currentUser });
  }

  function simulateSocialSignIn(providerName, email, defaultName) {
    const mockUsers = JSON.parse(localStorage.getItem('wow_mock_database') || '{}');
    let user = mockUsers[email.toLowerCase()];

    if (!user) {
      const uid = 'mock_' + providerName.toLowerCase() + '_' + Math.floor(Math.random() * 1000000);
      user = {
        uid,
        email,
        name: defaultName,
        data: {
          cart: JSON.parse(localStorage.getItem('wow_cart')) || [],
          pets: JSON.parse(localStorage.getItem('wow_pets')) || [],
          wishlist: JSON.parse(localStorage.getItem('wow_wishlist')) || [],
          loyalty: JSON.parse(localStorage.getItem('wow_loyalty')) || { points: 0, history: [] },
          subscriptions: JSON.parse(localStorage.getItem('wow_subscriptions')) || [],
          orders: JSON.parse(localStorage.getItem('wow_orders')) || [],
          gameHighScore: JSON.parse(localStorage.getItem('wow_game_high')) || { score: 0, correct: 0, played: 0 },
          streak: JSON.parse(localStorage.getItem('wow_streak')) || { current: 0, lastVisit: '', history: [] },
          profile: { name: defaultName, phone: '', address: '', city: '', state: '', zip: '' }
        }
      };
      mockUsers[email.toLowerCase()] = user;
      localStorage.setItem('wow_mock_database', JSON.stringify(mockUsers));
    }

    currentUser = { uid: user.uid, email: user.email, displayName: user.name };
    localStorage.setItem('wow_mock_user', JSON.stringify(currentUser));
    
    replaceLocalState(user.data);
    triggerMockAuthChange();
    return Promise.resolve({ user: currentUser });
  }

  // Allows mock mode to update simulated database document
  function syncMockDataLocally() {
    if (!currentUser) return;
    const mockUsers = JSON.parse(localStorage.getItem('wow_mock_database') || '{}');
    const user = mockUsers[currentUser.email.toLowerCase()];
    if (user) {
      user.data = {
        cart: JSON.parse(localStorage.getItem('wow_cart')) || [],
        pets: JSON.parse(localStorage.getItem('wow_pets')) || [],
        wishlist: JSON.parse(localStorage.getItem('wow_wishlist')) || [],
        loyalty: JSON.parse(localStorage.getItem('wow_loyalty')) || { points: 0, history: [] },
        subscriptions: JSON.parse(localStorage.getItem('wow_subscriptions')) || [],
        orders: JSON.parse(localStorage.getItem('wow_orders')) || [],
        gameHighScore: JSON.parse(localStorage.getItem('wow_game_high')) || { score: 0, correct: 0, played: 0 },
        streak: JSON.parse(localStorage.getItem('wow_streak')) || { current: 0, lastVisit: '', history: [] },
        profile: JSON.parse(localStorage.getItem('wow_profile_info')) || {}
      };
      mockUsers[currentUser.email.toLowerCase()] = user;
      localStorage.setItem('wow_mock_database', JSON.stringify(mockUsers));
      console.log("🐾 [WowPetStore - Mock] Sync simulated database document.");
    }
  }

  return {
    init,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    logout,
    sendPasswordReset,
    onAuthStateChanged,
    getCurrentUser,
    isMockMode,
    syncUserData,
    syncMockDataLocally,
    writeOrderToRootDb
  };
})();
