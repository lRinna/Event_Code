// ===== FIREBASE SETUP (shared by scan.html and admin.html) =====
// 1. Create a free project at https://console.firebase.google.com
// 2. Enable Firestore Database (test mode is fine to start).
// 3. Project settings > General > "Your apps" > add a Web app > copy the
//    firebaseConfig object it gives you and paste the values below.
// Until this is filled in, the app automatically falls back to a
// localStorage-only shim (fine for local testing, NOT shared across devices).
(function(){
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD9CTaMO5WpgyRRxWdL6ASyFkGlG2mZITI",
    authDomain: "event-checkin-9823.firebaseapp.com",
    projectId: "event-checkin-9823",
    storageBucket: "event-checkin-9823.firebasestorage.app",
    messagingSenderId: "630919355429",
    appId: "1:630919355429:web:0eee7bcd6bb286ee1833cc"
  };

  const firebaseConfigured = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf('YOUR_') !== 0;

  if (firebaseConfigured && window.firebase) {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      const db = firebase.firestore();
      const COLLECTION = 'checkin_kv';
      window.storage = {
        async get(key){
          try {
            const doc = await db.collection(COLLECTION).doc(key).get();
            return doc.exists ? { value: doc.data().value } : null;
          } catch(e){ console.error('[checkin] Firestore get failed', key, e); return null; }
        },
        async set(key, value){
          try {
            await db.collection(COLLECTION).doc(key).set({ value });
            return true;
          } catch(e){ console.error('[checkin] Firestore set failed', key, e); return false; }
        }
      };
      console.info('[checkin] Using Firebase Firestore for shared guest data.');
    } catch(e){
      console.error('[checkin] Firebase init failed — falling back to local-only storage.', e);
    }
  }

  // Local-testing shim: used automatically until FIREBASE_CONFIG above is
  // filled in with a real project (or if Firebase init fails for any reason).
  // Data saved here stays in this one browser only — it is NOT shared with
  // other devices, so it's for local testing, not the real event.
  if (!window.storage) {
    console.warn('[checkin] Firebase not configured — using a localStorage-based shim for local testing. Data will not be shared across devices.');
    const SHIM_PREFIX = 'checkin_shim:';
    window.storage = {
      async get(key){
        try {
          const raw = localStorage.getItem(SHIM_PREFIX + key);
          return raw === null ? null : { value: raw };
        } catch(e){ return null; }
      },
      async set(key, value){
        try {
          localStorage.setItem(SHIM_PREFIX + key, value);
          return true;
        } catch(e){ return false; }
      }
    };
  }
})();
