import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Map Firebase Auth and Firestore error codes to user-friendly messages
const mapAuthError = (err) => {
  if (!err) return "Authentication failed. Please try again.";
  
  switch (err.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Invalid email or password.";
    case 'auth/email-already-in-use':
      return "An account with this email already exists.";
    case 'auth/weak-password':
      return "Password should be at least 8 characters with a number and capital letter.";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    case 'auth/network-request-failed':
      return "Network connection failed. Please verify your internet connection.";
    case 'permission-denied':
      return "Firestore database permission denied. Please verify user security rules.";
    case 'unavailable':
      return "Database server is currently unavailable. Please check your network.";
    default:
      return err.message || "Authentication or registration failed.";
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track active signup execution to prevent race condition with onAuthStateChanged
  const isSigningUpRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isSigningUpRef.current) {
        return;
      }

      if (firebaseUser) {
        try {
          const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (docSnap.exists()) {
            const extendedData = docSnap.data();
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || extendedData.displayName || "Resident",
              ...extendedData,
              community_id: extendedData.communityId || extendedData.community_id || 'comm_emerald_1'
            });
          } else {
            // Self-healing: If user exists in Auth but Firestore doc is missing, create it
            const fallbackData = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "Resident",
              role: 'resident',
              communityId: 'comm_emerald_1',
              community_id: 'comm_emerald_1',
              wing: 'Wing A',
              room_number: '',
              phone: '',
              createdAt: new Date().toISOString()
            };

            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), fallbackData, { merge: true });
            } catch (healErr) {
              console.warn("Could not self-heal user document in Firestore:", healErr);
            }

            setCurrentUser({
              uid: firebaseUser.uid,
              name: fallbackData.displayName,
              ...fallbackData
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
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Fetch Firestore user doc immediately so role is available without waiting for async onAuthStateChanged
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const merged = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName || data.displayName || "User",
            ...data,
            community_id: data.communityId || data.community_id || 'comm_emerald_1'
          };
          setCurrentUser(merged);
          return merged;
        }
      } catch (e) {
        console.warn("Failed immediate user doc fetch on login:", e);
      }
      return userCredential.user;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  // Firebase Signup + Firestore User Record with Transactional Rollback
  const signup = async ({ email, password, name, role, community_id, wing, room_number, phone }) => {
    isSigningUpRef.current = true;
    let userCredential = null;

    try {
      // 1. Create Firebase Auth User
      userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Set Firebase Auth Display Name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // 3. Persist User Record into Cloud Firestore users/{uid}
      const userDocData = {
        email: email.trim(),
        displayName: name,
        role: role || 'resident',
        communityId: community_id || 'comm_emerald_1',
        community_id: community_id || 'comm_emerald_1',
        wing: wing || 'Wing A',
        room_number: room_number || '',
        phone: phone || '',
        cepCredits: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

      // 4. Immediately synchronize React Context state
      const fullUserData = {
        uid: userCredential.user.uid,
        ...userDocData,
        name: name
      };
      setCurrentUser(fullUserData);

      return fullUserData;
    } catch (error) {
      console.error("Registration error encountered:", error);

      // Rollback / Compensation: If Auth user was created but Firestore write failed, delete orphaned user
      if (userCredential && userCredential.user) {
        try {
          await deleteUser(userCredential.user);
          console.warn("Rolled back orphaned Firebase Auth user after Firestore failure");
        } catch (cleanupErr) {
          console.error("Failed to delete orphaned Auth user during rollback:", cleanupErr);
        }
      }

      throw new Error(mapAuthError(error));
    } finally {
      isSigningUpRef.current = false;
      setIsLoading(false);
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
