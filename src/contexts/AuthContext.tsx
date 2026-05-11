import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { getUsers } from '../lib/api';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'chore_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const users = await getUsers();
    setAllUsers(users);
    return users;
  }

  useEffect(() => {
    async function init() {
      try {
        const users = await loadUsers();
        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
          const user = users.find((u) => u.id === storedId);
          if (user) setCurrentUser(user);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const refreshUsers = async () => {
    const users = await loadUsers();
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const user = users.find((u) => u.id === storedId);
      setCurrentUser(user || null);
    }
  };

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, user.id);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, login, logout, loading, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
