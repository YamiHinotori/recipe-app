/**
 * StoreLayoutsContext - Verwaltung von Laden-Layouts
 * 
 * Dieser Context ermöglicht es, mehrere Supermärkte mit unterschiedlichen
 * Layouts zu verwalten. Jeder Laden hat seine eigene Kategorien-Reihenfolge.
 * 
 * HAUPTKONZEPT:
 * - Benutzer kann mehrere Läden anlegen (REWE, EDEKA, Aldi, etc.)
 * - Jeder Laden hat eigene Kategorien-Reihenfolge
 * - Beim Einkaufen: Laden auswählen → Liste wird entsprechend sortiert
 * 
 * USE CASE:
 * ```
 * REWE:
 *   1. Obst & Gemüse (vorne)
 *   2. Backwaren
 *   3. Milchprodukte
 *   ...
 * 
 * ALDI:
 *   1. Backwaren (bei Aldi vorne)
 *   2. Tiefkühl
 *   3. Obst & Gemüse
 *   ...
 * 
 * → Gleiche Einkaufsliste, unterschiedliche Sortierung!
 * ```
 * 
 * FIREBASE STRUKTUR:
 * ```
 * storeLayouts/
 *   ├─ STORE_ID_1/
 *   │   ├─ name: "REWE"
 *   │   ├─ createdAt: "2024-..."
 *   │   └─ categories: [
 *   │       { id: "obst-gemuese", name: "Obst & Gemüse", order: 1 },
 *   │       { id: "backwaren", name: "Backwaren", order: 2 },
 *   │       ...
 *   │     ]
 *   └─ STORE_ID_2/
 *       ├─ name: "ALDI"
 *       └─ categories: [
 *           { id: "backwaren", name: "Backwaren", order: 1 },
 *           { id: "tiefkuehl", name: "Tiefkühl", order: 2 },
 *           ...
 *         ]
 * ```
 * 
 * WICHTIG:
 * - Laden-Layouts sind für ALLE User geteilt (nicht pro User)
 * - selectedStoreId bestimmt welches Layout aktiv ist
 * - ShoppingListContext nutzt getActiveCategories() für Sortierung
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

// ============================================================================
// CONTEXT UND KONSTANTEN
// ============================================================================

/**
 * StoreLayoutsContext - Der eigentliche Context
 */
const StoreLayoutsContext = createContext();

/**
 * DEFAULT_CATEGORIES - Standard-Kategorien für neue Läden
 * 
 * VERWENDUNG:
 * - Wenn ein neuer Laden erstellt wird
 * - Als Fallback wenn keine Kategorien vorhanden
 * - Basis für Anpassungen durch den User
 * 
 * STRUKTUR:
 * - id: Eindeutige ID (WICHTIG: Muss mit Produktdatenbank übereinstimmen!)
 * - name: Anzeigename für UI
 * - order: Standard-Sortierung (kann pro Laden angepasst werden)
 * 
 * WARUM DIESE KATEGORIEN?
 * - Deckt Standard-Supermarkt ab
 * - Kompatibel mit Produktdatenbank
 * - "sonstiges" am Ende als Auffangkategorie (order: 99)
 * 
 * WICHTIG:
 * - Diese Kategorien sind ein TEMPLATE
 * - Jeder Laden kann eigene Reihenfolge haben
 * - Kategorien können hinzugefügt/entfernt werden
 */
const DEFAULT_CATEGORIES = [
  { id: 'obst-gemuese', name: 'Obst & Gemüse', order: 1 },
  { id: 'backwaren', name: 'Backwaren', order: 2 },
  { id: 'fleisch-fisch', name: 'Fleisch & Fisch', order: 3 },
  { id: 'milchprodukte', name: 'Milchprodukte', order: 4 },
  { id: 'tiefkuehl', name: 'Tiefkühlware', order: 5 },
  { id: 'konserven', name: 'Konserven', order: 6 },
  { id: 'nudeln-reis', name: 'Nudeln, Reis & Getreide', order: 7 },
  { id: 'gewuerze', name: 'Gewürze & Öle', order: 8 },
  { id: 'getraenke', name: 'Getränke', order: 9 },
  { id: 'suessigkeiten', name: 'Süßigkeiten & Snacks', order: 10 },
  { id: 'haushalt', name: 'Haushalt & Drogerie', order: 11 },
  { id: 'sonstiges', name: 'Sonstiges', order: 99 }
];

// ============================================================================
// CUSTOM HOOK: useStoreLayouts
// ============================================================================

/**
 * useStoreLayouts - Custom Hook zum Zugriff auf Laden-Layouts
 * 
 * Verwendung:
 * ```
 * const { 
 *   storeLayouts,
 *   selectedStoreId,
 *   createStore,
 *   getActiveCategories 
 * } = useStoreLayouts();
 * ```
 * 
 * @returns {object} StoreLayouts Context Daten
 * @throws {Error} Wenn außerhalb von Provider verwendet
 */
export const useStoreLayouts = () => {
  const context = useContext(StoreLayoutsContext);
  
  if (!context) {
    throw new Error('useStoreLayouts must be used within StoreLayoutsProvider');
  }
  
  return context;
};

// ============================================================================
// PROVIDER KOMPONENTE
// ============================================================================

/**
 * StoreLayoutsProvider - Provider für Laden-Layout-Verwaltung
 * 
 * Diese Komponente:
 * 1. Lädt alle verfügbaren Laden-Layouts
 * 2. Verwaltet welcher Laden aktuell ausgewählt ist
 * 3. Stellt CRUD-Funktionen für Läden bereit
 * 4. Ermöglicht Anpassung der Kategorien-Reihenfolge
 * 5. Liefert Kategorien des aktiven Ladens an ShoppingListContext
 * 
 * VERWENDUNG:
 * Sollte nach AuthProvider, aber vor ShoppingListProvider sein:
 * ```
 * <AuthProvider>
 *   <StoreLayoutsProvider>
 *     <ShoppingListProvider>
 *       <App />
 *     </ShoppingListProvider>
 *   </StoreLayoutsProvider>
 * </AuthProvider>
 * ```
 * 
 * @param {object} props - React Props
 * @param {ReactNode} props.children - Kind-Komponenten
 */
export const StoreLayoutsProvider = ({ children }) => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /**
   * storeLayouts - Array aller verfügbaren Läden
   * 
   * Struktur eines Store-Layouts:
   * {
   *   id: string,              // Firebase-generierte ID
   *   name: string,            // "REWE", "ALDI", etc.
   *   createdAt: string,       // ISO Timestamp
   *   categories: [            // Kategorien in Laden-Reihenfolge
   *     { id: string, name: string, order: number },
   *     ...
   *   ]
   * }
   * 
   * WICHTIG:
   * - Für ALLE User geteilt (nicht pro User)
   * - Jeder kann Läden hinzufügen/bearbeiten
   * - Use Case: Familie teilt sich Laden-Layouts
   */
  const [storeLayouts, setStoreLayouts] = useState([]);
  
  /**
   * selectedStoreId - ID des aktuell ausgewählten Ladens
   * 
   * null = Kein Laden ausgewählt (verwendet DEFAULT_CATEGORIES)
   * string = ID des aktiven Ladens
   * 
   * VERWENDUNG:
   * - User wählt Laden vor dem Einkaufen
   * - ShoppingList wird nach diesem Layout sortiert
   * - UI zeigt welcher Laden aktiv ist
   * 
   * AUTO-SELECTION:
   * - Beim ersten Load: Erster Laden wird automatisch ausgewählt
   * - Bei Löschen: Nächster verfügbarer Laden wird ausgewählt
   */
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  
  /**
   * user - Aktueller User aus AuthContext
   * 
   * Benötigt für:
   * - Prüfung ob eingeloggt
   * - Firebase-Zugriff
   */
  const { user } = useAuth();

  // ==========================================================================
  // FIREBASE SYNC (useEffect)
  // ==========================================================================
  
  /**
   * Effect: Synchronisiert Laden-Layouts mit Firebase
   * 
   * Läuft nur einmal beim Mount und bei User-Änderung.
   * 
   * AUTO-SELECTION LOGIK:
   * - Wenn noch kein Laden ausgewählt ist
   * - UND Läden vorhanden sind
   * - → Wähle ersten Laden automatisch
   * 
   * WARUM?
   * - Bessere UX (kein leerer Zustand)
   * - User kann sofort sortieren
   * - Sinnvoller Default
   */
  useEffect(() => {
    
    // ------------------------------------------------------------------------
    // GUARD: User muss eingeloggt sein
    // ------------------------------------------------------------------------
    if (!user) {
      // Nicht eingeloggt → State zurücksetzen
      setStoreLayouts([]);
      setSelectedStoreId(null);
      return;
    }

    // ------------------------------------------------------------------------
    // FIREBASE LISTENER
    // ------------------------------------------------------------------------
    
    /**
     * Firebase Referenz zu allen Laden-Layouts
     * 
     * Pfad: /storeLayouts
     * (Root-Level, für alle User)
     */
    const layoutsRef = ref(database, 'storeLayouts');
    
    /**
     * onValue - Echtzeit-Listener für Laden-Layouts
     * 
     * Triggert bei:
     * - Initial Load
     * - Neuer Laden erstellt
     * - Laden bearbeitet (Name, Kategorien)
     * - Laden gelöscht
     */
    const unsubscribe = onValue(layoutsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Store Layouts geladen:', data);
      
      // --------------------------------------------------------------------
      // Fall 1: Läden vorhanden
      // --------------------------------------------------------------------
      if (data) {
        /**
         * OBJECT → ARRAY KONVERTIERUNG
         * 
         * Firebase gibt Object:
         * {
         *   "store-id-1": { name: "REWE", ... },
         *   "store-id-2": { name: "ALDI", ... }
         * }
         * 
         * React UI braucht Array:
         * [
         *   { id: "store-id-1", name: "REWE", ... },
         *   { id: "store-id-2", name: "ALDI", ... }
         * ]
         */
        const layoutsArray = Object.entries(data).map(([id, layout]) => ({
          id,        // Füge ID als Property hinzu
          ...layout  // Kopiere alle anderen Properties
        }));
        
        setStoreLayouts(layoutsArray);
        
        /**
         * AUTO-SELECTION LOGIC
         * 
         * Wenn noch kein Laden ausgewählt ist:
         * → Wähle ersten Laden automatisch
         * 
         * WARUM?
         * - Bessere UX (kein "kein Laden ausgewählt" Zustand)
         * - User kann sofort sortieren
         * - Sinnvoller Default
         */
        if (!selectedStoreId && layoutsArray.length > 0) {
          setSelectedStoreId(layoutsArray[0].id);
        }
        
      // --------------------------------------------------------------------
      // Fall 2: Keine Läden vorhanden
      // --------------------------------------------------------------------
      } else {
        setStoreLayouts([]);
        // selectedStoreId bleibt (wird auf null gesetzt wenn User sich ausloggt)
      }
    });

    /**
     * Cleanup-Funktion
     * 
     * Entfernt Listener bei Unmount
     */
    return () => unsubscribe();
    
  }, [user]); // Neu laden wenn User sich ändert

  // ==========================================================================
  // CRUD FUNKTIONEN
  // ==========================================================================

  /**
   * createStore - Erstellt neuen Laden mit Standard-Kategorien
   * 
   * ABLAUF:
   * 1. Generiere neue eindeutige ID mit push()
   * 2. Erstelle Laden-Objekt mit:
   *    - Name (vom User)
   *    - DEFAULT_CATEGORIES (können später angepasst werden)
   *    - Timestamp
   * 3. Speichere in Firebase
   * 4. Gib ID zurück
   * 
   * WICHTIG:
   * - Neue Läden starten mit DEFAULT_CATEGORIES
   * - User kann danach Kategorien anpassen (Drag & Drop)
   * - Auto-Selection greift wenn dies der erste Laden ist
   * 
   * @param {string} storeName - Name des Ladens (z.B. "REWE")
   * @returns {Promise<string>} ID des neuen Ladens
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * const storeId = await createStore('REWE');
   * console.log('Laden erstellt mit ID:', storeId);
   * // Auto-Selection macht diesen Laden automatisch aktiv
   * ```
   */
  const createStore = async (storeName) => {
    if (!user) return;

    /**
     * Firebase Referenz zur Layouts-Collection
     */
    const layoutsRef = ref(database, 'storeLayouts');
    
    /**
     * push() - Generiert neue eindeutige ID
     * 
     * Format: "-NxAbC123..." (Firebase Push-ID)
     */
    const newStoreRef = push(layoutsRef);
    
    try {
      /**
       * Erstelle neuen Laden mit Standard-Daten
       * 
       * DEFAULT_CATEGORIES werden kopiert (nicht referenziert!)
       * → Jeder Laden hat eigene Kategorien-Instanz
       */
      await set(newStoreRef, {
        name: storeName,
        categories: DEFAULT_CATEGORIES,  // Kopie der Standard-Kategorien
        createdAt: new Date().toISOString()
      });
      
      console.log('Neuer Store erstellt:', storeName);
      
      /**
       * Gib ID zurück
       * 
       * Nützlich für:
       * - UI-Feedback
       * - Navigation
       * - Weitere Operationen
       */
      return newStoreRef.key;
      
    } catch (error) {
      console.error('Fehler beim Erstellen des Stores:', error);
      throw error;
    }
  };

  /**
   * renameStore - Benennt Laden um
   * 
   * EINFACHE OPERATION:
   * - Nur der Name wird geändert
   * - Kategorien bleiben gleich
   * - ID bleibt gleich
   * 
   * @param {string} storeId - Laden-ID
   * @param {string} newName - Neuer Name
   * @returns {Promise<void>}
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * await renameStore(storeId, 'REWE Markt');
   * ```
   */
  const renameStore = async (storeId, newName) => {
    if (!user) return;

    /**
     * Direkter Pfad zum name-Property
     * 
     * /storeLayouts/{storeId}/name
     * 
     * WARUM nicht komplettes Objekt?
     * - Effizienter (nur name wird übertragen)
     * - Vermeidet Race Conditions (categories werden nicht überschrieben)
     */
    const storeRef = ref(database, `storeLayouts/${storeId}/name`);
    
    try {
      /**
       * set() überschreibt nur den Namen
       * 
       * Alle anderen Properties bleiben unberührt
       */
      await set(storeRef, newName);
      console.log('Store umbenannt:', newName);
      
    } catch (error) {
      console.error('Fehler beim Umbenennen:', error);
      throw error;
    }
  };

  /**
   * deleteStore - Löscht Laden komplett
   * 
   * WICHTIG:
   * - Unwiderruflich!
   * - Alle Kategorien-Anpassungen gehen verloren
   * - UI sollte Bestätigung zeigen
   * 
   * AUTO-SELECTION NACH LÖSCHEN:
   * - Wenn gelöschter Laden aktiv war
   * - UND noch andere Läden vorhanden
   * - → Wähle ersten verbleibenden Laden
   * 
   * @param {string} storeId - Zu löschende Laden-ID
   * @returns {Promise<void>}
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * if (window.confirm('Laden wirklich löschen?')) {
   *   await deleteStore(storeId);
   * }
   * ```
   */
  const deleteStore = async (storeId) => {
    if (!user) return;

    /**
     * Referenz zum kompletten Laden
     */
    const storeRef = ref(database, `storeLayouts/${storeId}`);
    
    try {
      /**
       * remove() löscht kompletten Laden
       */
      await remove(storeRef);
      
      /**
       * AUTO-SELECTION LOGIK nach Löschen
       * 
       * Fall 1: Gelöschter Laden war aktiv + andere Läden vorhanden
       *         → Wähle ersten verbleibenden Laden
       * 
       * Fall 2: Letzter Laden wurde gelöscht
       *         → selectedStoreId wird null (onValue Listener setzt State)
       * 
       * Fall 3: Inaktiver Laden wurde gelöscht
       *         → Nichts tun (selectedStoreId bleibt)
       */
      if (selectedStoreId === storeId && storeLayouts.length > 1) {
        /**
         * Finde verbleibende Läden (ohne den gelöschten)
         */
        const remaining = storeLayouts.filter(s => s.id !== storeId);
        
        if (remaining.length > 0) {
          /**
           * Wähle ersten verbleibenden Laden
           * 
           * WICHTIG: Dies verhindert "kein Laden ausgewählt" Zustand
           */
          setSelectedStoreId(remaining[0].id);
        }
      }
      
      console.log('Store gelöscht');
      
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  /**
   * updateStoreCategories - Aktualisiert Kategorien eines Ladens
   * 
   * VERWENDUNG:
   * - Nach Drag & Drop im Layout-Editor
   * - Beim Hinzufügen/Entfernen von Kategorien
   * - Beim Umbenennen von Kategorien
   * 
   * WICHTIG:
   * - Überschreibt ALLE Kategorien
   * - categories-Array muss vollständig sein!
   * - Jede Kategorie braucht: id, name, order
   * 
   * @param {string} storeId - Laden-ID
   * @param {array} categories - Komplettes Kategorien-Array
   * @returns {Promise<void>}
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * // Nach Drag & Drop Sortierung
   * const reorderedCategories = categories.map((cat, index) => ({
   *   ...cat,
   *   order: index + 1
   * }));
   * 
   * await updateStoreCategories(storeId, reorderedCategories);
   * ```
   */
  const updateStoreCategories = async (storeId, categories) => {
    if (!user) return;

    /**
     * Direkter Pfad zu categories-Array
     * 
     * /storeLayouts/{storeId}/categories
     */
    const categoriesRef = ref(database, `storeLayouts/${storeId}/categories`);
    
    try {
      /**
       * set() ersetzt komplettes categories-Array
       * 
       * WICHTIG: Komplettes Array übergeben!
       * Fehlende Kategorien werden gelöscht.
       */
      await set(categoriesRef, categories);
      console.log('Store-Kategorien aktualisiert');
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  // ==========================================================================
  // HELPER FUNKTIONEN
  // ==========================================================================

  /**
   * getActiveStore - Gibt aktuell ausgewählten Laden zurück
   * 
   * VERWENDUNG:
   * - UI zeigt aktiven Laden an
   * - Zugriff auf alle Properties des Ladens
   * - Basis für getActiveCategories()
   * 
   * @returns {object|null} Laden-Objekt oder null wenn nichts ausgewählt
   * 
   * BEISPIEL:
   * ```
   * const activeStore = getActiveStore();
   * 
   * if (activeStore) {
   *   console.log('Aktiver Laden:', activeStore.name);
   *   console.log('Kategorien:', activeStore.categories);
   * } else {
   *   console.log('Kein Laden ausgewählt');
   * }
   * ```
   */
  const getActiveStore = () => {
    if (!selectedStoreId) return null;
    return storeLayouts.find(s => s.id === selectedStoreId);
  };

  /**
   * getActiveCategories - Gibt Kategorien des aktiven Ladens zurück
   * 
   * WICHTIGSTE FUNKTION für Integration mit ShoppingListContext!
   * 
   * LOGIK:
   * 1. Hole aktiven Laden mit getActiveStore()
   * 2. Wenn vorhanden: Gib dessen Kategorien zurück
   * 3. Wenn nicht: Fallback auf DEFAULT_CATEGORIES
   * 
   * VERWENDUNG IN SHOPPINGLISTCONTEXT:
   * ```
   * const { getActiveCategories } = useStoreLayouts();
   * const storeCategories = getActiveCategories();
   * 
   * // storeCategories wird für sortByStoreLayout() verwendet
   * ```
   * 
   * @returns {array} Kategorien-Array
   * 
   * WICHTIG:
   * - Niemals undefined/null (immer Array!)
   * - Fallback auf DEFAULT_CATEGORIES garantiert Funktionalität
   * - Optional Chaining (?.) für Sicherheit
   * 
   * BEISPIEL-RETURN:
   * ```
   * [
   *   { id: "obst-gemuese", name: "Obst & Gemüse", order: 1 },
   *   { id: "backwaren", name: "Backwaren", order: 2 },
   *   ...
   * ]
   * ```
   */
  const getActiveCategories = () => {
    const store = getActiveStore();
    
    /**
     * Optional Chaining + Fallback
     * 
     * store?.categories:
     * - Wenn store existiert UND categories Property hat → die Kategorien
     * - Sonst → undefined
     * 
     * || DEFAULT_CATEGORIES:
     * - Wenn links undefined/null → DEFAULT_CATEGORIES
     * 
     * ERGEBNIS:
     * - Immer ein Array (niemals undefined!)
     * - Entweder Store-Kategorien oder Default
     */
    return store?.categories || DEFAULT_CATEGORIES;
  };

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================
  
  /**
   * value - Bereitgestellte Daten und Funktionen
   * 
   * KATEGORIEN:
   * 
   * 1. STATE:
   *    - storeLayouts: Alle verfügbaren Läden
   *    - selectedStoreId: ID des aktiven Ladens
   * 
   * 2. SELECTION:
   *    - setSelectedStoreId: Laden auswählen
   * 
   * 3. CRUD:
   *    - createStore: Neuen Laden erstellen
   *    - renameStore: Laden umbenennen
   *    - deleteStore: Laden löschen
   *    - updateStoreCategories: Kategorien anpassen
   * 
   * 4. HELPERS:
   *    - getActiveStore: Aktiven Laden holen
   *    - getActiveCategories: Kategorien des aktiven Ladens holen
   */
  const value = {
    storeLayouts,
    selectedStoreId,
    setSelectedStoreId,
    createStore,
    renameStore,
    deleteStore,
    updateStoreCategories,
    getActiveStore,
    getActiveCategories
  };

  // ==========================================================================
  // PROVIDER RETURN
  // ==========================================================================
  
  return (
    <StoreLayoutsContext.Provider value={value}>
      {children}
    </StoreLayoutsContext.Provider>
  );
};