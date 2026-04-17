/**
 * AdminContext - FIXED mit userProfiles/
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, remove } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lade isAdmin aus userProfiles/
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const profileRef = ref(database, `userProfiles/${user.uid}/isAdmin`);
    
    const unsubscribe = onValue(profileRef, (snapshot) => {
      setIsAdmin(snapshot.val() === true);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!isAdmin) {
      setAllowedEmails([]);
      return;
    }

    const emailsRef = ref(database, 'admin/allowedEmails');
    
    const unsubscribe = onValue(emailsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const emailsArray = Object.entries(data).map(([hash, emailData]) => ({
          hash,
          ...emailData
        }));
        setAllowedEmails(emailsArray);
      } else {
        setAllowedEmails([]);
      }
    });

    return unsubscribe;
  }, [isAdmin]);

  const addAllowedEmail = async (email, makeAdmin = false) => {
    if (!user || !isAdmin) {
      throw new Error('Keine Admin-Berechtigung');
    }
    
    try {
      const emailHash = await sha256(email.toLowerCase().trim());
      const emailRef = ref(database, `admin/allowedEmails/${emailHash}`);
      
      await set(emailRef, {
        email: email.toLowerCase().trim(),
        isAdmin: makeAdmin,
        addedBy: user.uid,
        addedAt: new Date().toISOString()
      });
      
      console.log('E-Mail hinzugefügt:', email);
      
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      throw error;
    }
  };

  const removeAllowedEmail = async (emailHash) => {
    if (!user || !isAdmin) {
      throw new Error('Keine Admin-Berechtigung');
    }
    
    try {
      const emailRef = ref(database, `admin/allowedEmails/${emailHash}`);
      await remove(emailRef);
      
      console.log('E-Mail entfernt');
      
    } catch (error) {
      console.error('Fehler beim Entfernen:', error);
      throw error;
    }
  };

  const checkEmailAllowed = async (email) => {
    try {
      const emailHash = await sha256(email.toLowerCase().trim());
      return allowedEmails.some(e => e.hash === emailHash);
    } catch (error) {
      console.error('Fehler beim Prüfen:', error);
      return false;
    }
  };

  const value = {
    isAdmin,
    allowedEmails,
    loading,
    addAllowedEmail,
    removeAllowedEmail,
    checkEmailAllowed
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};