import { useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { AuthContext } from './AuthContextBase';
import { auth, isFirebaseConfigured } from '../firebase/firebase';
import { getUserProgress, saveUserProgress } from '../services/progressService';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(isFirebaseConfigured && auth));

  // Load progress for current user
  const refreshProgress = useCallback(async (userId) => {
    const targetId = userId || currentUser?.uid;
    if (!targetId) {
      setProgress(null);
      return null;
    }
    const data = await getUserProgress(targetId);
    setProgress(data);
    return data;
  }, [currentUser]);

  // Save progress wrapper
  const saveProgress = useCallback(async (progressData) => {
    if (!currentUser?.uid) return null;
    const updated = await saveUserProgress(currentUser.uid, progressData);
    setProgress(updated);
    return updated;
  }, [currentUser]);

  // Clean legacy mock user from localStorage if present
  useEffect(() => {
    try {
      localStorage.removeItem('ds_current_user');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Auth State Listener
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          await refreshProgress(user.uid);
        } else {
          setProgress(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [refreshProgress]);

  // Sign Up with Firebase Authentication
  const signUp = async (email, password, displayName) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured. Please check your project setup.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    setCurrentUser(userCredential.user);
    refreshProgress(userCredential.user.uid).catch((err) => {
      console.warn('Progress load notice:', err.message);
    });
    return userCredential.user;
  };

  // Login with Firebase Authentication
  const login = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured. Please check your project setup.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCredential.user);
    refreshProgress(userCredential.user.uid).catch((err) => {
      console.warn('Progress load notice:', err.message);
    });
    return userCredential.user;
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    try {
      localStorage.removeItem('ds_current_user');
    } catch {
      // Ignore
    }
    setCurrentUser(null);
    setProgress(null);
  };

  const value = {
    currentUser,
    progress,
    loading,
    isFirebaseConfigured,
    signUp,
    login,
    logout,
    refreshProgress,
    saveProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

