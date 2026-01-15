import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, database } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const AuthContext = createContext();

// WHITELIST: Nur diese E-Mail-Adressen dürfen sich anmelden
const ALLOWED_EMAILS = [
  process.env.REACT_APP_ALLOWED_MAIL_EINS,
  process.env.REACT_APP_ALLOWED_MAIL_ZWEI
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auth State Observer
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Überprüfe ob E-Mail in der Whitelist ist
        if (ALLOWED_EMAILS.includes(user.email)) {
          setUser(user);
          setError(null);
          console.log('Eingeloggt als:', user.email);
          console.log('User ID:', user.uid);
          
          // Speichere/Update User-Daten in der Database
          const userRef = ref(database, `users/${user.uid}`);
          await set(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          });
        } else {
          // E-Mail nicht in Whitelist - Logout erzwingen
          console.warn('Unerlaubter Login-Versuch:', user.email);
          await signOut(auth);
          setUser(null);
          setError('Zugriff verweigert. Diese E-Mail-Adresse ist nicht berechtigt.');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Überprüfe ob E-Mail erlaubt ist
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        await signOut(auth);
        throw new Error('Diese E-Mail-Adresse ist nicht berechtigt.');
      }
      
      console.log('Login erfolgreich:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('Login-Fehler:', error);
      if (error.message.includes('nicht berechtigt')) {
        setError('Zugriff verweigert. Diese E-Mail-Adresse ist nicht berechtigt.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setError(null);
      console.log('Logout erfolgreich');
    } catch (error) {
      console.error('Logout-Fehler:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};