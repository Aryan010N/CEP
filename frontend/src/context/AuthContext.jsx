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
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('../services/firebase');
          const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (docSnap.exists()) {
            const extendedData = docSnap.data();
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || extendedData.displayName || "Resident",
              ...extendedData,
              community_id: extendedData.communityId || extendedData.community_id
            });
          } else {
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "Resident",
              role: 'resident',
              community_id: 'comm_emerald_1'
            });
          }
        } catch (error) {
          console.error("Failed to load user from Firestore", error);
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "Resident",
            role: 'resident',
            community_id: 'comm_emerald_1'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);


  // Firebase Login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  // Firebase Signup + Firestore User Record
  const signup = async ({ email, password, name, role, community_id, wing, room_number, phone }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName: name,
        role: role || 'resident',
        communityId: community_id || 'comm_emerald_1',
        wing: wing || 'Wing A',
        room_number: room_number || '',
        phone: phone || '',
        createdAt: new Date().toISOString()
      });

      return userCredential.user;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  // Firebase Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
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
