import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, INITIAL_DEMO_USERS } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Map Firebase error codes to user-friendly messages
const mapAuthError = (err) => {
  switch (err.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Invalid email or password.";
    case 'auth/email-already-in-use':
      return "An account with this email already exists.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters.";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    default:
      return err.message || "Authentication failed.";
  }
};

export function AuthProvider({ children }) {
  // Demo Mode toggle — persisted
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('cep_demo_mode');
    return saved === null ? true : saved === 'true'; // Default ON for first load
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track initial auth load

  // Listen for real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (isDemoMode) {
        // If demo mode is active, we don't sync firebase auth directly to currentUser 
        // to avoid clashing with the quick evaluator logins.
        setIsLoading(false);
        return;
      }

      if (firebaseUser) {
        // Fetch extended attributes from localStorage (temporary Phase 1 mock for DB)
        const extendedDataRaw = localStorage.getItem(`cep_user_${firebaseUser.uid}`);
        let extendedData = {
          role: 'resident',
          community_id: 'comm_emerald_1',
          wing: 'Wing A',
          room_number: 'Room 101',
          phone: '+91 99999 00000'
        };

        if (extendedDataRaw) {
          try {
            extendedData = JSON.parse(extendedDataRaw);
          } catch (e) {
            console.error("Failed to parse extended user data", e);
          }
        }

        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || extendedData.name || "Resident",
          ...extendedData
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  // Demo mode persistance sync
  useEffect(() => {
    localStorage.setItem('cep_demo_mode', String(isDemoMode));
    
    // When toggling demo mode ON, set a default demo user
    if (isDemoMode) {
      setCurrentUser(INITIAL_DEMO_USERS[0]);
    } else {
      // When toggling OFF, check if Firebase has a user logged in
      if (auth.currentUser) {
        const firebaseUser = auth.currentUser;
        const extendedDataRaw = localStorage.getItem(`cep_user_${firebaseUser.uid}`);
        let extendedData = { role: 'resident' };
        if (extendedDataRaw) {
          try { extendedData = JSON.parse(extendedDataRaw); } catch (e) {}
        }
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          ...extendedData
        });
      } else {
        setCurrentUser(null);
      }
    }
  }, [isDemoMode]);


  // Firebase Login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Let onAuthStateChanged handle setting the user if demo mode is off
      
      // If demo mode is on but they logged in manually, switch demo mode off
      if (isDemoMode) {
        setIsDemoMode(false);
      }
      return userCredential.user;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  // Firebase Signup + LocalStorage extended mock
  const signup = async ({ email, password, name, role, community_id, wing, room_number, phone }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Temporary Phase 1: Store extended attributes in localStorage
      // Phase 2 will move this to Firestore `users/{uid}` document.
      const extendedData = {
        name,
        role: role || 'resident',
        community_id: community_id || 'comm_emerald_1',
        wing: wing || 'Wing A',
        room_number: room_number || 'Room 101',
        phone: phone || '+91 99999 00000',
      };
      localStorage.setItem(`cep_user_${userCredential.user.uid}`, JSON.stringify(extendedData));

      if (isDemoMode) setIsDemoMode(false);

      return userCredential.user;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  // Firebase Logout
  const logout = async () => {
    if (isDemoMode) {
      setCurrentUser(null);
      return;
    }
    await signOut(auth);
    setCurrentUser(null);
  };

  // Instant 1-Click Role Switcher for Assessment / Demo (only works in demo mode)
  const switchDemoRole = (roleKey) => {
    if (!isDemoMode) return;
    const target = INITIAL_DEMO_USERS.find(u => u.role === roleKey || u.uid === roleKey);
    if (target) {
      setCurrentUser(target);
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    switchDemoRole,
    toggleDemoMode,
    isDemoMode,
    isAuthenticated: !!currentUser,
    role: currentUser?.role || 'resident',
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
