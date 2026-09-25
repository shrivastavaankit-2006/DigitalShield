import { createContext } from 'react';

export const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  progress: null,
  loading: true,
  isFirebaseConfigured: false,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
  refreshProgress: async () => {},
  saveProgress: async () => {}
});
