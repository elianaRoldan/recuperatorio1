import { FirebaseService } from './firebase-config.js';

const AUTH_STORAGE_KEY = "fvp_current_user";
const USERS_STORAGE_KEY = "fvp_registered_users";

// Usuarios por defecto (1 Administrador + 1 Cliente de prueba)
const DEFAULT_USERS = [
  {
    id: "user-admin-1",
    name: "Administrador Fruit Valley",
    email: "admin@fruitvalley.com",
    passwordHash: "patagonia2026", // En un entorno de producción se almacena hash
    role: "admin",
    businessType: "Administración Central",
    phone: "+54 9 298 440001",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "user-client-1",
    name: "Carolina Gómez",
    email: "carolina@ejemplo.com",
    passwordHash: "cliente123",
    role: "customer",
    businessType: "Consumidor Final",
    phone: "+54 9 11 44556677",
    createdAt: "2026-02-15T00:00:00.000Z"
  }
];

export const Auth = {
  /**
   * Obtiene la lista de usuarios registrados
   */
  getUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  /**
   * Obtiene el usuario autenticado actualmente
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Inicia sesión verificando credenciales con Firebase y local
   */
  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    let firebaseUser = null;
    try {
      const fbAuth = await FirebaseService.getAuth();
      if (fbAuth) {
        try {
          const cred = await fbAuth.signInWithEmailAndPassword(cleanEmail, cleanPass);
          firebaseUser = cred.user;
        } catch (fbErr) {
          // Si el usuario existe localmente (ej: admin o demo), auto-aprovisionar en Firebase Auth
          if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
            const users = this.getUsers();
            const existingLocal = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === cleanPass);
            if (existingLocal) {
              try {
                const newCred = await fbAuth.createUserWithEmailAndPassword(cleanEmail, cleanPass);
                firebaseUser = newCred.user;
                if (existingLocal.name) {
                  await firebaseUser.updateProfile({ displayName: existingLocal.name }).catch(() => {});
                }
              } catch (createErr) {
                console.info("Info auto-provisioning Firebase:", createErr.message);
              }
            }
          } else {
            console.info("Aviso Firebase Auth login:", fbErr.code, fbErr.message);
          }
        }
      }
    } catch (e) {}

    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Si autenticó exitosamente en Firebase pero no está en el navegador actual
    if (firebaseUser && !user) {
      user = {
        id: firebaseUser.uid || ('user-' + Date.now()),
        name: firebaseUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordHash: cleanPass,
        role: cleanEmail.includes('admin') ? 'admin' : 'customer',
        businessType: 'Consumidor Final',
        phone: '',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    if (!user) {
      return { success: false, message: "El correo electrónico no se encuentra registrado." };
    }

    if (user.passwordHash !== cleanPass) {
      return { success: false, message: "Contraseña incorrecta. Por favor verifica tus datos." };
    }

    // Guardar sesión activa (sin exponer password)
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessType: user.businessType,
      phone: user.phone
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  },

  /**
   * Registra un nuevo usuario en Firebase Auth y almacenamiento
   */
  async register(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanPass = (userData.password || '').trim();
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Ya existe una cuenta registrada con este correo electrónico." };
    }

    // Crear usuario en Firebase Auth
    let fbUid = null;
    try {
      const fbAuth = await FirebaseService.getAuth();
      if (fbAuth) {
        try {
          const cred = await fbAuth.createUserWithEmailAndPassword(cleanEmail, cleanPass);
          if (cred && cred.user) {
            fbUid = cred.user.uid;
            if (userData.name) {
              await cred.user.updateProfile({ displayName: userData.name.trim() }).catch(() => {});
            }
          }
        } catch (fbErr) {
          if (fbErr.code === 'auth/email-already-in-use') {
            try {
              const cred = await fbAuth.signInWithEmailAndPassword(cleanEmail, cleanPass);
              if (cred && cred.user) fbUid = cred.user.uid;
            } catch (_) {}
          } else {
            console.info("Aviso Firebase Auth register:", fbErr.code, fbErr.message);
          }
        }
      }
    } catch (e) {}

    const newUser = {
      id: fbUid || ('user-' + Date.now()),
      name: userData.name.trim(),
      email: cleanEmail,
      passwordHash: cleanPass,
      role: "customer", // Por seguridad los registros son tipo cliente
      businessType: userData.businessType || "Consumidor Final",
      phone: userData.phone || "",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Auto login
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      businessType: newUser.businessType,
      phone: newUser.phone
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Cierra la sesión activa
   */
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = "index.html";
  },

  /**
   * Comprueba si el usuario actual tiene permisos de administrador
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  /**
   * Acceso directo al panel administrativo sin barrera de login
   */
  requireAdmin(_redirectUrl = null) {
    // Acceso administrativo directo habilitado según requerimiento
    return true;
  },

  /**
   * Renderiza el estado del usuario en la barra de navegación
   */
  renderNavUser(containerId = 'nav-user-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = this.getCurrentUser();
    if (user) {
      const isAdm = user.role === 'admin';
      container.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-sm btn-patagonia-light dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle text-success"></i>
            <span class="d-none d-sm-inline fw-semibold text-truncate" style="max-width: 130px;">${user.name}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li class="dropdown-header">
              <div class="fw-bold text-dark">${user.name}</div>
              <small class="text-muted">${user.email}</small>
              <div class="mt-1"><span class="badge ${isAdm ? 'bg-success' : 'bg-secondary'}">${isAdm ? 'Administrador' : 'Cliente'}</span></div>
            </li>
            <li><hr class="dropdown-divider"></li>
            ${isAdm ? '<li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Panel de Control</a></li>' : ''}
            <li><a class="dropdown-item text-danger" href="#" id="fvp-logout-btn"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</a></li>
          </ul>
        </div>
      `;

      document.getElementById('fvp-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-patagonia-light d-flex align-items-center gap-1 text-nowrap">
          <i class="bi bi-person"></i>
          <span>Ingresar</span>
        </a>
      `;
    }
  }
};
