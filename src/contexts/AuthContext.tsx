import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, userRole: null, isOnline: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Try to get the role from localStorage first
          const cachedRole = localStorage.getItem(`userRole_${user.uid}`);
          if (cachedRole) {
            setUserRole(cachedRole as UserRole);
          }
          
          if (navigator.onLine) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const role = userDoc.data().role as UserRole;
              setUserRole(role);
              localStorage.setItem(`userRole_${user.uid}`, role);
            } else {
              // Set default role as AGENT if not specified
              const defaultRole = UserRole.AGENT;
              await setDoc(doc(db, 'users', user.uid), { role: defaultRole });
              setUserRole(defaultRole);
              localStorage.setItem(`userRole_${user.uid}`, defaultRole);
            }
          } else if (!cachedRole) {
            // If offline and no cached role, set default role
            setUserRole(UserRole.AGENT);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Set a default role if error occurs
          setUserRole(UserRole.AGENT);
        }
      } else {
        setUserRole(null);
        localStorage.removeItem(`userRole_${user?.uid}`);
      }
      setLoading(false);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    isOnline
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};