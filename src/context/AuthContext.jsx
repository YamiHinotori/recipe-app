/**
 * AuthContext - Mit Einladungs-Modal Support
 * 
 * Prüft beim Login ob User eine Einladung hat und zeigt Modal
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, database } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, set, get, update, remove, increment } from 'firebase/database';

const AuthContext = createContext();

// ============================================================================
// HELPER: SHA-256 Hash
// ============================================================================

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getEmailData(email) {
  try {
    const emailHash = await sha256(email.toLowerCase().trim());
    const emailRef = ref(database, `admin/allowedEmails/${emailHash}`);
    const snapshot = await get(emailRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    return null;
  } catch (error) {
    console.error('Fehler beim Prüfen der E-Mail:', error);
    return null;
  }
}

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
  const [pendingInvitation, setPendingInvitation] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        const emailData = await getEmailData(firebaseUser.email);
        
        if (emailData) {
          // ✅ Prüfe ob User bereits in Gruppe ist
          let userGroupId = null;
          
          try {
            const existingProfileRef = ref(database, `userProfiles/${firebaseUser.uid}`);
            const existingProfile = await get(existingProfileRef);
            
            if (existingProfile.exists() && existingProfile.val().groupId) {
              userGroupId = existingProfile.val().groupId;
            }
          } catch (error) {
            console.error('Fehler beim Profil-Check:', error);
          }
          
          // ✅ Prüfe ob User eine Einladung hat (NEUE LOGIK!)
          if (!userGroupId) {
            try {
              const emailHash = await sha256(firebaseUser.email.toLowerCase().trim());
              const invitationRef = ref(database, `invitations/${emailHash}`);
              const invitationSnap = await get(invitationRef);
              
              if (invitationSnap.exists()) {
                const invitation = invitationSnap.val();
                console.log('📧 Einladung gefunden:', invitation);
                
                // Setze pending invitation - wird vom Modal angezeigt
                setPendingInvitation(invitation);
              }
            } catch (invError) {
              console.log('Fehler beim Einladungs-Check:', invError);
            }
          }
          
          // ✅ Speichere in userProfiles/
          const profileRef = ref(database, `userProfiles/${firebaseUser.uid}`);
          await set(profileRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            lastLogin: new Date().toISOString(),
            isAdmin: emailData.isAdmin || false,
            groupId: userGroupId
          });
          
          // Lade userProfile
          const profileSnapshot = await get(profileRef);
          const profile = profileSnapshot.val();
          
          // ✅ Kombiniere Firebase User + Profile
          const enrichedUser = {
            ...firebaseUser,
            isAdmin: profile.isAdmin,
            groupId: profile.groupId
          };
          
          setUser(enrichedUser);
          setError(null);
          
          console.log('✅ Login erfolgreich:', firebaseUser.email);
          console.log('   isAdmin:', profile.isAdmin);
          console.log('   groupId:', profile.groupId);
          
        } else {
          console.warn('❌ Unerlaubter Login-Versuch:', firebaseUser.email);
          await signOut(auth);
          setUser(null);
          setError('Zugriff verweigert. Diese E-Mail-Adresse ist nicht berechtigt.');
        }
        
      } else {
        setUser(null);
        setPendingInvitation(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const emailData = await getEmailData(result.user.email);
      
      if (!emailData) {
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
      setPendingInvitation(null);
      console.log('Logout erfolgreich');
    } catch (error) {
      console.error('Logout-Fehler:', error);
      throw error;
    }
  };

  // NEU: Einladung annehmen
  const acceptInvitation = async (invitation) => {
    if (!user || !invitation) return;
    
    try {
      console.log('✅ Akzeptiere Einladung:', invitation);
      
      // Füge User zur Gruppe hinzu (mit increment für memberCount!)
      const updates = {};
      updates[`groups/${invitation.groupId}/members/${user.uid}`] = true;
      updates[`groups/${invitation.groupId}/memberCount`] = increment(1); // ← Firebase Server-Side Increment!
      updates[`userProfiles/${user.uid}/groupId`] = invitation.groupId;
      
      await update(ref(database), updates);
      
      // Lösche Einladung
      const emailHash = await sha256(user.email.toLowerCase().trim());
      await remove(ref(database, `invitations/${emailHash}`));
      
      // Schließe Modal
      setPendingInvitation(null);
      
      console.log('✅ Gruppe beigetreten!');
      
      // Reload damit GroupContext die Änderung sieht
      window.location.reload();
      
    } catch (error) {
      console.error('Fehler beim Beitreten:', error);
      throw error;
    }
  };

  // NEU: Einladung ablehnen
  const declineInvitation = async () => {
    if (!user || !pendingInvitation) return;
    
    try {
      // Lösche Einladung
      const emailHash = await sha256(user.email.toLowerCase().trim());
      await remove(ref(database, `invitations/${emailHash}`));
      
      // Schließe Modal
      setPendingInvitation(null);
      
      console.log('❌ Einladung abgelehnt');
      
    } catch (error) {
      console.error('Fehler beim Ablehnen:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    pendingInvitation,
    loginWithGoogle,
    logout,
    acceptInvitation,
    declineInvitation
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};