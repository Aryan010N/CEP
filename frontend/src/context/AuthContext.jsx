import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DEMO_USERS } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cep_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    // Default to Resident demo user
    return INITIAL_DEMO_USERS[0];
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('cep_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse stored users list", e);
      }
    }
    return INITIAL_DEMO_USERS;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cep_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cep_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cep_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Login simulation / sync
  const login = async (email, password) => {
    const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      throw new Error("No account found with this email. Please check your credentials or register.");
    }
    setCurrentUser(found);
    return found;
  };

  // Signup simulation / sync
  const signup = async ({ email, password, name, role, community_id, wing, room_number, phone }) => {
    const existing = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const newUser = {
      uid: `usr_${Date.now()}`,
      email,
      name,
      role: role || 'resident',
      community_id: community_id || 'comm_emerald_1',
      wing: wing || 'Wing A',
      room_number: room_number || 'Room 101',
      phone: phone || '+91 99999 00000',
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = async () => {
    setCurrentUser(null);
  };

  // Instant 1-Click Role Switcher for Assessment / Demo
  const switchDemoRole = (roleKey) => {
    const target = INITIAL_DEMO_USERS.find(u => u.role === roleKey || u.uid === roleKey);
    if (target) {
      setCurrentUser(target);
    }
  };

  const value = {
    currentUser,
    usersList,
    login,
    signup,
    logout,
    switchDemoRole,
    isAuthenticated: !!currentUser,
    role: currentUser?.role || 'resident',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
