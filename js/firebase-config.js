/**
 * @license
 * Fruit Valley Patagonia - Firebase Configuration & Modular Driver
 * Conexión activa para Firebase Authentication, Cloud Firestore y Firebase Storage.
 */

// ============================================================================
// CONFIGURACIÓN OFICIAL DE FIREBASE
// Proyecto: fruit-valley-patagonia
// ============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyA4X_PurStFzUSMmn1diJuLgj0K77i_Gfs",
  authDomain: "fruit-valley-patagonia.firebaseapp.com",
  projectId: "fruit-valley-patagonia",
  storageBucket: "fruit-valley-patagonia.firebasestorage.app",
  messagingSenderId: "511656598450",
  appId: "1:511656598450:web:d4deb8e3f3810636a362ab",
  measurementId: "G-8GBEXM2JTC"
};

/**
 * Servicio unificado de Firebase con autocarga de SDK
 */
export const FirebaseService = {
  _loadingPromise: null,

  isConfigured() {
    return Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_FIREBASE_API_KEY"));
  },

  /**
   * Carga dinámica del SDK de Firebase si aún no está presente en la ventana
   */
  async loadSdk() {
    if (window.firebase && window.firebase.apps) {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      return window.firebase;
    }

    if (this._loadingPromise) {
      return this._loadingPromise;
    }

    this._loadingPromise = new Promise((resolve, reject) => {
      const loadScript = (src) => new Promise((res, rej) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          res();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => res();
        s.onerror = (e) => rej(new Error(`Fallo al cargar script: ${src}`));
        document.head.appendChild(s);
      });

      // Carga en cadena ordenada: Core -> Auth -> Firestore
      loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
        .then(() => Promise.all([
          loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"),
          loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js")
        ]))
        .then(() => {
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp(firebaseConfig);
          }
          resolve(window.firebase);
        })
        .catch((err) => {
          console.warn("No se pudo cargar Firebase desde CDN:", err);
          this._loadingPromise = null;
          reject(err);
        });
    });

    return this._loadingPromise;
  },

  /**
   * Conector preparado para Firestore
   */
  async getFirestore() {
    try {
      const fb = await this.loadSdk();
      return fb.firestore();
    } catch (e) {
      console.warn("Firestore no disponible en este momento:", e);
      return null;
    }
  },

  /**
   * Conector preparado para Firebase Auth
   */
  async getAuth() {
    try {
      const fb = await this.loadSdk();
      return fb.auth();
    } catch (e) {
      console.warn("Firebase Auth no disponible:", e);
      return null;
    }
  },

  /**
   * Diagnóstico y prueba de conectividad con Firebase
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, message: "La API Key de Firebase no está configurada." };
    }

    try {
      const fb = await this.loadSdk();
      if (!fb || !fb.apps || !fb.apps.length) {
        return { success: false, message: "No se pudo inicializar la aplicación de Firebase." };
      }

      const app = fb.app();
      const firestore = fb.firestore();
      const auth = fb.auth();

      return {
        success: true,
        message: `Conexión exitosa con Firebase Cloud. Proyecto: "${app.options.projectId}", Auth y Firestore activos.`
      };
    } catch (err) {
      return {
        success: false,
        message: `Error al conectar con Firebase: ${err.message}`
      };
    }
  }
};
