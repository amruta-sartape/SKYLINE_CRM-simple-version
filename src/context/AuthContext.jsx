import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithFirebase,
  logoutFirebase,
  sendPasswordReset,
  getStoredUsers,
  saveStoredUsers,
  formatFirebaseError,
  FIXED_ACCOUNTS
} from '../services/firebase';

const AuthContext = createContext(null);
const STORAGE_ACTIVE_AUTH = 'skyline_crm_active_auth_profile';

export const AuthProvider = ({ children }) => {
  // Current logged in user profile (contains uid, email, role, firstName, etc.)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loadingAuthState, setLoadingAuthState] = useState(false);

  // Users directory for admin user management
  const [users, setUsers] = useState(() => getStoredUsers());

  // Sync active auth user to storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_ACTIVE_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_AUTH);
      }
    } catch (e) {
      console.error('Failed to sync auth user', e);
    }
  }, [currentUser]);

  // Sync users list to storage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  /**
   * Direct login with predefined credentials and role validation
   */
  const login = async (usernameOrEmail, password, requestedRole) => {
    try {
      const res = await loginWithFirebase(usernameOrEmail, password, requestedRole);

      if (res.success && res.profile) {
        setCurrentUser(res.profile);
        return { success: true, user: res.profile };
      }

      return { success: false, message: 'Invalid credentials. Please verify your username and password.' };
    } catch (error) {
      const formatted = formatFirebaseError(error);
      return { success: false, message: formatted };
    }
  };

  /**
   * Request Password Reset Email
   */
  const requestPasswordReset = async (email) => {
    try {
      await sendPasswordReset(email);
      return { success: true };
    } catch (error) {
      return { success: false, message: formatFirebaseError(error) };
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    await logoutFirebase();
    setCurrentUser(null);
  };

  /**
   * Switch Active Role
   */
  const switchRole = (role) => {
    const roleKey = role.toLowerCase();
    if (FIXED_ACCOUNTS[roleKey]) {
      setCurrentUser(FIXED_ACCOUNTS[roleKey]);
      return;
    }
    const allUsers = getStoredUsers();
    const matched = allUsers.find((u) => u.role.toLowerCase() === role.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
    }
  };

  /**
   * Admin User Management Handlers
   */
  const addUser = (userData) => {
    const newUser = {
      uid: `uid-${Date.now().toString(36)}`,
      id: `usr-${Date.now().toString().slice(-4)}`,
      ...userData,
      status: userData.status || 'Active',
      createdAt: new Date().toISOString()
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    saveStoredUsers(updated);
    return newUser;
  };

  const updateUser = (id, updatedFields) => {
    const updated = users.map((u) =>
      u.id === id || u.uid === id ? { ...u, ...updatedFields } : u
    );
    setUsers(updated);
    saveStoredUsers(updated);
    if (currentUser?.id === id || currentUser?.uid === id) {
      setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
    }
  };

  const removeUser = (id) => {
    const updated = users.filter((u) => u.id !== id && u.uid !== id);
    setUsers(updated);
    saveStoredUsers(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loadingAuthState,
        login,
        logout,
        requestPasswordReset,
        switchRole,
        addUser,
        updateUser,
        removeUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
