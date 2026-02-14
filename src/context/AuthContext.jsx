/**
 * AuthContext - Authentifizierungs-Kontext für die gesamte App
 * 
 * Dieser Context verwaltet den Authentifizierungs-Status des Benutzers.
 * Er stellt Funktionen zum Login/Logout bereit und prüft ob ein Benutzer
 * berechtigt ist (E-Mail-Whitelist).
 * 
 * WICHTIG: Dieser Context ist ein zentraler Teil der App-Sicherheit!
 * 
 * Verwendet Firebase Authentication mit Google OAuth.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, database } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, set } from 'firebase/database';

// ============================================================================
// CONTEXT ERSTELLEN
// ============================================================================

/**
 * AuthContext - Der eigentliche Context
 * 
 * Wird mit createContext() erstellt und enthält später die Auth-Daten.
 * Standardmäßig undefined - wird erst durch den Provider befüllt.
 */
const AuthContext = createContext();

// ============================================================================
// WHITELIST KONFIGURATION
// ============================================================================

/**
 * ALLOWED_EMAILS - E-Mail Whitelist für berechtigte Benutzer
 * 
 * NUR Benutzer mit diesen E-Mail-Adressen dürfen sich anmelden!
 * 
 * Die E-Mails werden aus Umgebungsvariablen geladen (.env Datei):
 * - REACT_APP_ALLOWED_MAIL_EINS
 * - REACT_APP_ALLOWED_MAIL_ZWEI
 * 
 * SICHERHEITSHINWEIS: Niemals E-Mails direkt im Code hardcoden!
 * Immer Umgebungsvariablen verwenden.
 */
const ALLOWED_EMAILS = [
  process.env.REACT_APP_ALLOWED_MAIL_EINS,
  process.env.REACT_APP_ALLOWED_MAIL_ZWEI
];

// ============================================================================
// CUSTOM HOOK: useAuth
// ============================================================================

/**
 * useAuth - Custom Hook zum Zugriff auf den Auth-Context
 * 
 * Verwendung in Komponenten:
 * ```
 * const { user, loginWithGoogle, logout } = useAuth();
 * ```
 * 
 * Dieser Hook:
 * 1. Holt den Context mit useContext()
 * 2. Wirft einen Fehler wenn außerhalb des Providers verwendet
 * 3. Gibt die Auth-Daten zurück
 * 
 * @returns {object} Auth-Context Daten (user, loading, error, loginWithGoogle, logout)
 * @throws {Error} Wenn außerhalb von AuthProvider verwendet
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Fehlerbehandlung: Hook muss innerhalb des Providers sein!
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

// ============================================================================
// PROVIDER KOMPONENTE
// ============================================================================

/**
 * AuthProvider - Provider-Komponente für den Auth-Context
 * 
 * Diese Komponente:
 * 1. Verwaltet den Auth-Zustand (user, loading, error)
 * 2. Überwacht Auth-Änderungen (Login/Logout)
 * 3. Prüft die E-Mail-Whitelist
 * 4. Stellt Login/Logout Funktionen bereit
 * 5. Speichert User-Daten in Firebase Database
 * 
 * VERWENDUNG:
 * Muss die gesamte App umschließen (normalerweise in index.js oder App.js):
 * ```
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 * 
 * @param {object} props - React Props
 * @param {ReactNode} props.children - Kind-Komponenten (die gesamte App)
 */
export const AuthProvider = ({ children }) => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /**
   * user - Der aktuell eingeloggte Benutzer
   * 
   * null = nicht eingeloggt
   * object = eingeloggt (enthält email, displayName, photoURL, uid, etc.)
   */
  const [user, setUser] = useState(null);
  
  /**
   * loading - Lädt der Auth-Status gerade?
   * 
   * true = Firebase prüft noch den Auth-Status (beim App-Start)
   * false = Auth-Status ist bekannt
   * 
   * WICHTIG: Verhindert "Flackern" beim App-Start
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * error - Fehlermeldung (z.B. bei Login-Fehlern)
   * 
   * null = kein Fehler
   * string = Fehlermeldung die dem Benutzer angezeigt werden kann
   */
  const [error, setError] = useState(null);

  // ==========================================================================
  // AUTH STATE OBSERVER (useEffect)
  // ==========================================================================
  
  /**
   * Effect: Überwacht Auth-Status Änderungen
   * 
   * Dieser Effect läuft einmal beim Mount und richtet einen "Listener" ein,
   * der AUTOMATISCH reagiert wenn:
   * - Ein Benutzer sich einloggt
   * - Ein Benutzer sich ausloggt
   * - Die Seite neu geladen wird (Session-Check)
   * 
   * Firebase's onAuthStateChanged ist das Herzstück der Auth!
   */
  useEffect(() => {
    /**
     * Auth State Listener
     * 
     * Wird automatisch aufgerufen wenn sich der Auth-Status ändert.
     * Parameter "user" ist entweder:
     * - Ein User-Objekt (wenn eingeloggt)
     * - null (wenn ausgeloggt)
     */
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      // ----------------------------------------------------------------------
      // Fall 1: Benutzer ist eingeloggt
      // ----------------------------------------------------------------------
      if (user) {
        
        // WHITELIST-PRÜFUNG: Ist die E-Mail berechtigt?
        if (ALLOWED_EMAILS.includes(user.email)) {
          
          // ✅ E-Mail ist berechtigt - Login erlauben
          setUser(user);
          setError(null);
          
          // Debug-Ausgaben (können später entfernt werden)
          console.log('Eingeloggt als:', user.email);
          console.log('User ID:', user.uid);
          
          /**
           * User-Daten in Firebase Database speichern
           * 
           * Warum?
           * - Tracking des letzten Logins
           * - User-Profil Informationen verfügbar machen
           * - Basis für weitere Features (z.B. Benutzer-Liste im Admin)
           * 
           * Struktur in Firebase:
           * users/
           *   ├─ USER_UID_1/
           *   │   ├─ email: "user@example.com"
           *   │   ├─ displayName: "Max Mustermann"
           *   │   ├─ photoURL: "https://..."
           *   │   └─ lastLogin: "2024-..."
           *   └─ USER_UID_2/
           *       └─ ...
           */
          const userRef = ref(database, `users/${user.uid}`);
          await set(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          });
          
        } else {
          
          // ❌ E-Mail NICHT berechtigt - Sicherheitsmaßnahme!
          console.warn('Unerlaubter Login-Versuch:', user.email);
          
          // Sofort ausloggen (Sicherheit!)
          await signOut(auth);
          
          // State zurücksetzen
          setUser(null);
          setError('Zugriff verweigert. Diese E-Mail-Adresse ist nicht berechtigt.');
        }
        
      // ----------------------------------------------------------------------
      // Fall 2: Benutzer ist NICHT eingeloggt
      // ----------------------------------------------------------------------
      } else {
        setUser(null);
      }
      
      // Auth-Status ist jetzt bekannt - Loading beenden
      setLoading(false);
    });

    /**
     * Cleanup-Funktion
     * 
     * WICHTIG: Muss den Listener wieder entfernen!
     * Wird automatisch aufgerufen wenn:
     * - Die Komponente unmountet
     * - Der Effect neu läuft
     * 
     * Verhindert Memory Leaks.
     */
    return unsubscribe;
  }, []); // Leeres Array = Effect läuft nur einmal beim Mount

  // ==========================================================================
  // LOGIN FUNKTION
  // ==========================================================================
  
  /**
   * loginWithGoogle - Meldet Benutzer mit Google an
   * 
   * ABLAUF:
   * 1. Öffnet Google Login Popup
   * 2. Benutzer wählt Google-Account
   * 3. Firebase verarbeitet den Login
   * 4. Whitelist-Prüfung
   * 5. Bei Erfolg: User wird gesetzt (durch onAuthStateChanged)
   *    Bei Fehler: Sofort ausloggen + Fehler werfen
   * 
   * @returns {Promise<object>} User-Objekt bei Erfolg
   * @throws {Error} Bei Login-Fehler oder nicht-berechtigter E-Mail
   * 
   * VERWENDUNG:
   * ```
   * try {
   *   await loginWithGoogle();
   *   // Login erfolgreich
   * } catch (error) {
   *   // Login fehlgeschlagen
   * }
   * ```
   */
  const loginWithGoogle = async () => {
    // Fehler-State zurücksetzen
    setError(null);
    
    try {
      /**
       * signInWithPopup - Firebase Google Login
       * 
       * Öffnet Popup-Fenster mit Google Login.
       * "result" enthält User-Daten nach erfolgreichem Login.
       */
      const result = await signInWithPopup(auth, googleProvider);
      
      // WICHTIG: Whitelist-Prüfung SOFORT nach Login!
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        
        // Nicht berechtigt - sofort ausloggen!
        await signOut(auth);
        
        // Fehler werfen (wird in Login-Komponente gefangen)
        throw new Error('Diese E-Mail-Adresse ist nicht berechtigt.');
      }
      
      // ✅ Berechtigt - Login erfolgreich
      console.log('Login erfolgreich:', result.user.email);
      return result.user;
      
    } catch (error) {
      // Fehlerbehandlung
      console.error('Login-Fehler:', error);
      
      // Benutzerfreundliche Fehlermeldung setzen
      if (error.message.includes('nicht berechtigt')) {
        setError('Zugriff verweigert. Diese E-Mail-Adresse ist nicht berechtigt.');
      }
      
      // Fehler weiterwerfen (für Login-Komponente)
      throw error;
    }
  };

  // ==========================================================================
  // LOGOUT FUNKTION
  // ==========================================================================
  
  /**
   * logout - Meldet Benutzer ab
   * 
   * ABLAUF:
   * 1. Firebase signOut aufrufen
   * 2. Fehler-State zurücksetzen
   * 3. User wird auf null gesetzt (durch onAuthStateChanged)
   * 
   * @returns {Promise<void>}
   * @throws {Error} Bei Logout-Fehler (sehr selten)
   * 
   * VERWENDUNG:
   * ```
   * await logout();
   * ```
   */
  const logout = async () => {
    try {
      // Firebase Logout
      await signOut(auth);
      
      // Fehler-State zurücksetzen
      setError(null);
      
      console.log('Logout erfolgreich');
      
    } catch (error) {
      // Fehlerbehandlung (sehr selten)
      console.error('Logout-Fehler:', error);
      throw error;
    }
  };

  // ==========================================================================
  // CONTEXT VALUE - Was wird bereitgestellt?
  // ==========================================================================
  
  /**
   * value - Objekt mit allen Auth-Daten und Funktionen
   * 
   * Wird an alle Komponenten weitergegeben die useAuth() verwenden.
   * 
   * Enthält:
   * - user: Aktueller Benutzer (oder null)
   * - loading: Lädt der Auth-Status noch?
   * - error: Fehlermeldung (oder null)
   * - loginWithGoogle: Funktion zum Einloggen
   * - logout: Funktion zum Ausloggen
   */
  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    logout
  };

  // ==========================================================================
  // PROVIDER RETURN
  // ==========================================================================
  
  /**
   * Provider mit Conditional Rendering
   * 
   * WICHTIG: {!loading && children}
   * 
   * Warum?
   * - Verhindert Flackern beim App-Start
   * - App wird erst gerendert wenn Auth-Status bekannt ist
   * - Keine halb-geladenen Zustände
   * 
   * Während loading=true:
   * - Nichts wird angezeigt (oder Ladescreen in App.js)
   * 
   * Nach loading=false:
   * - Alle Kind-Komponenten werden gerendert
   * - Sie haben Zugriff auf den Auth-Context
   */
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};