/**
 * ShoppingListContext - Zentrale Einkaufslisten-Verwaltung
 * 
 * Dieser Context ist das HERZSTÜCK der App und verwaltet die gesamte
 * Einkaufslisten-Logik inkl. Rezept-Integration und Store-Layout-Sortierung.
 * 
 * HAUPTFUNKTIONEN:
 * - Verwaltung von zwei Listen-Typen (shared / personal)
 * - Echtzeit-Synchronisation über Firebase
 * - Rezepte zur Liste hinzufügen (mit automatischer Mengen-Zusammenfassung)
 * - Drag & Drop Sortierung
 * - Automatische Sortierung nach Laden-Layout
 * - Automatische Kategorie-Zuordnung über Produktdatenbank
 * 
 * WICHTIGE KONZEPTE:
 * 
 * 1. ZWEI LISTEN-TYPEN:
 *    - "shared": Gemeinsame Liste für alle User (z.B. Familie)
 *    - "personal": Private Liste nur für einen User
 * 
 * 2. KATEGORIEN:
 *    - Jedes Item hat eine Kategorie (z.B. "obst-gemuese")
 *    - Kategorien werden automatisch über Produktdatenbank zugeordnet
 *    - Ermöglicht Sortierung nach Laden-Layout
 * 
 * 3. REZEPT-INTEGRATION:
 *    - Rezept-Zutaten werden automatisch zur Liste hinzugefügt
 *    - Gleiche Zutaten werden zusammengefasst (Mengen addiert)
 *    - Tracking welche Rezepte das Item verwenden
 * 
 * FIREBASE STRUKTUR:
 * ```
 * shoppingLists/
 *   ├─ shared/
 *   │   └─ items/
 *   │       ├─ ITEM_ID_1/
 *   │       │   ├─ item: "Tomaten"
 *   │       │   ├─ amount: "500"
 *   │       │   ├─ unit: "g"
 *   │       │   ├─ category: "obst-gemuese"
 *   │       │   ├─ checked: false
 *   │       │   ├─ order: 0
 *   │       │   └─ recipes: ["Carbonara", "Pizza"]
 *   │       └─ ITEM_ID_2/
 *   │           └─ ...
 *   └─ personal/
 *       ├─ USER_ID_1/
 *       │   └─ items/
 *       │       └─ ...
 *       └─ USER_ID_2/
 *           └─ items/
 *               └─ ...
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, set, onValue, remove, update } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useStoreLayouts } from './StoreLayoutsContext.jsx';

// ============================================================================
// CONTEXT UND KONSTANTEN
// ============================================================================

/**
 * ShoppingListContext - Der eigentliche Context
 */
const ShoppingListContext = createContext();

/**
 * PRODUCT_DATABASE_PATH - Pfad zur Produktdatenbank
 * 
 * Wird für automatische Kategorie-Zuordnung verwendet
 */
const PRODUCT_DATABASE_PATH = 'productDatabase';

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * getShoppingListPath - Dynamischer Pfad basierend auf Listen-Typ
 * 
 * Erstellt den korrekten Firebase-Pfad für die aktuelle Liste.
 * 
 * ZWEI MODI:
 * 
 * 1. SHARED (Gemeinsame Liste):
 *    - Alle User sehen die gleichen Items
 *    - Pfad: shoppingLists/shared/items
 *    - Use Case: Familie, WG
 * 
 * 2. PERSONAL (Private Liste):
 *    - Nur der User selbst sieht seine Items
 *    - Pfad: shoppingLists/personal/{userId}/items
 *    - Use Case: Persönliche Liste, Meal Prep
 * 
 * @param {string} listType - "shared" oder "personal"
 * @param {string} userId - User-ID (nur für personal benötigt)
 * @returns {string} Firebase-Pfad zur Liste
 * 
 * BEISPIELE:
 * ```
 * getShoppingListPath('shared', 'user123')
 * // → "shoppingLists/shared/items"
 * 
 * getShoppingListPath('personal', 'user123')
 * // → "shoppingLists/personal/user123/items"
 * ```
 */
const getShoppingListPath = (listType, userId) => {
  if (listType === 'shared') {
    // Shared: Ein Pfad für alle User
    return 'shoppingLists/shared/items';
  } else {
    // Personal: Pfad enthält User-ID
    return `shoppingLists/personal/${userId}/items`;
  }
};

/**
 * DEFAULT_STORE_CATEGORIES - Fallback Laden-Layout
 * 
 * WICHTIG: Dies ist nur ein FALLBACK!
 * 
 * Die echten Kategorien kommen aus StoreLayoutsContext.
 * Dieser Default wird nur verwendet wenn:
 * - Noch keine Läden konfiguriert wurden
 * - StoreLayoutsContext nicht verfügbar ist
 * 
 * STRUKTUR:
 * - id: Eindeutige ID (muss mit Produktdatenbank übereinstimmen!)
 * - name: Anzeigename
 * - order: Sortierungs-Reihenfolge im Laden
 * 
 * WARUM 'sonstiges' order: 99?
 * - Soll immer am Ende sein
 * - Auffangkategorie für unbekannte Produkte
 */
const DEFAULT_STORE_CATEGORIES = [
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
// CUSTOM HOOK: useShoppingList
// ============================================================================

/**
 * useShoppingList - Custom Hook zum Zugriff auf Einkaufsliste
 * 
 * Verwendung:
 * ```
 * const { 
 *   items, 
 *   addItem, 
 *   toggleItem, 
 *   sortByStoreLayout 
 * } = useShoppingList();
 * ```
 * 
 * @returns {object} ShoppingList Context Daten
 * @throws {Error} Wenn außerhalb von Provider verwendet
 */
export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  
  return context;
};

// ============================================================================
// PROVIDER KOMPONENTE
// ============================================================================

/**
 * ShoppingListProvider - Provider für Einkaufslisten-Verwaltung
 * 
 * Diese Komponente ist SEHR KOMPLEX und verwaltet:
 * 1. Items der aktuellen Liste (shared oder personal)
 * 2. Produktdatenbank für Kategorie-Lookup
 * 3. Listen-Typ Wechsel (shared ↔ personal)
 * 4. Integration mit StoreLayoutsContext
 * 5. Echtzeit-Synchronisation
 * 
 * DEPENDENCIES:
 * - AuthContext (für User)
 * - StoreLayoutsContext (für Laden-Layout)
 * - ProductDatabaseContext (indirekt über Firebase)
 */
export const ShoppingListProvider = ({ children }) => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /**
   * items - Array aller Items der aktuellen Liste
   * 
   * Struktur eines Items:
   * {
   *   id: string,              // Firebase-generierte ID
   *   item: string,            // "Tomaten"
   *   amount: string,          // "500" (als String wegen Flexibilität)
   *   unit: string,            // "g", "kg", "Stück", etc.
   *   category: string,        // "obst-gemuese" (für Sortierung)
   *   checked: boolean,        // Abgehakt?
   *   order: number,           // Sortierungs-Position
   *   recipes: string[]        // ["Carbonara", "Pizza"]
   * }
   * 
   * WICHTIG: Sortiert nach 'order' Property!
   */
  const [items, setItems] = useState([]);
  
  /**
   * productDatabase - Lokale Kopie der Produktdatenbank
   * 
   * ZWECK:
   * - Automatische Kategorie-Zuordnung
   * - Schnelles Lookup ohne zusätzliche Firebase-Calls
   * - Wird parallel zur Liste geladen
   * 
   * Wird verwendet von: findCategoryForProduct()
   */
  const [productDatabase, setProductDatabase] = useState([]);
  
  /**
   * currentListType - Aktueller Listen-Typ
   * 
   * "shared": Gemeinsame Liste für alle User
   * "personal": Private Liste nur für diesen User
   * 
   * WICHTIG:
   * - Beim Wechsel wird komplette Liste neu geladen!
   * - User kann jederzeit zwischen Listen wechseln
   * - State wird in UI (Toggle-Button) gesteuert
   */
  const [currentListType, setCurrentListType] = useState('shared');
  
  /**
   * user - Aktueller User aus AuthContext
   * 
   * Benötigt für:
   * - Prüfung ob eingeloggt
   * - User-ID für personal Liste
   * - Firebase-Zugriff
   */
  const { user } = useAuth();
  
  /**
   * getActiveCategories - Funktion aus StoreLayoutsContext
   * 
   * Holt die Kategorien des aktuell ausgewählten Ladens.
   * Fallback auf DEFAULT_STORE_CATEGORIES wenn nicht verfügbar.
   */
  const { getActiveCategories } = useStoreLayouts();
  
  /**
   * storeCategories - Aktive Laden-Kategorien
   * 
   * Kommt entweder von:
   * - StoreLayoutsContext (wenn Laden ausgewählt)
   * - DEFAULT_STORE_CATEGORIES (Fallback)
   * 
   * Wird verwendet für:
   * - sortByStoreLayout() - Sortierung nach Laden
   * - UI-Anzeige der Kategorien
   */
  const storeCategories = getActiveCategories();

  // ==========================================================================
  // FIREBASE SYNC (useEffect)
  // ==========================================================================
  
  /**
   * Effect: Synchronisiert Einkaufsliste und Produktdatenbank
   * 
   * Läuft neu bei:
   * - User Login/Logout
   * - Listen-Typ Wechsel (shared ↔ personal)
   * 
   * ZWEI LISTENER:
   * 1. shoppingListRef - Für Items der Liste
   * 2. productsRef - Für Produktdatenbank (Kategorie-Lookup)
   */
  useEffect(() => {
    
    // ------------------------------------------------------------------------
    // GUARD: User muss eingeloggt sein
    // ------------------------------------------------------------------------
    if (!user) {
      // Nicht eingeloggt → Liste leeren
      setItems([]);
      return;
    }

    // ------------------------------------------------------------------------
    // LISTENER 1: Einkaufsliste
    // ------------------------------------------------------------------------
    
    /**
     * Aktueller Pfad basierend auf Listen-Typ
     * 
     * Beispiele:
     * - shared: "shoppingLists/shared/items"
     * - personal: "shoppingLists/personal/user123/items"
     */
    const listPath = getShoppingListPath(currentListType, user.uid);
    console.log('Lade Einkaufsliste:', currentListType, 'Pfad:', listPath);

    /**
     * Firebase Referenz zur aktuellen Liste
     */
    const shoppingListRef = ref(database, listPath);
    
    /**
     * onValue - Echtzeit-Listener für Liste
     * 
     * Triggert bei:
     * - Initial Load
     * - Jeder Änderung (Add, Update, Delete, Reorder)
     * - Von jedem Client (Echtzeit-Sync!)
     */
    const unsubscribe = onValue(shoppingListRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        /**
         * OBJECT → ARRAY KONVERTIERUNG
         * 
         * Firebase gibt Object zurück:
         * {
         *   "item-id-1": { item: "Tomaten", ... },
         *   "item-id-2": { item: "Milch", ... }
         * }
         * 
         * React UI braucht Array:
         * [
         *   { id: "item-id-1", item: "Tomaten", ... },
         *   { id: "item-id-2", item: "Milch", ... }
         * ]
         */
        const itemsArray = Object.entries(data).map(([id, item]) => ({
          id,      // Füge ID als Property hinzu
          ...item  // Kopiere alle anderen Properties
        }));
        
        /**
         * SORTIERUNG nach 'order' Property
         * 
         * WICHTIG:
         * - Jedes Item hat ein 'order' Property (number)
         * - Niedrigere order = weiter oben in der Liste
         * - Ermöglicht Drag & Drop Sortierung
         * - Ermöglicht Store-Layout Sortierung
         * 
         * || 0 als Fallback für Items ohne order
         */
        itemsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setItems(itemsArray);
        
      } else {
        // Keine Items → Leeres Array
        setItems([]);
      }
    });

    // ------------------------------------------------------------------------
    // LISTENER 2: Produktdatenbank
    // ------------------------------------------------------------------------
    
    /**
     * Firebase Referenz zur Produktdatenbank
     * 
     * ZWECK:
     * - Kategorie-Lookup für neue Items
     * - Automatische Kategorie-Zuordnung
     */
    const productsRef = ref(database, PRODUCT_DATABASE_PATH);
    
    /**
     * onValue - Listener für Produktdatenbank
     * 
     * Lädt parallel zur Einkaufsliste!
     * Wird für findCategoryForProduct() benötigt.
     */
    const productsUnsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data && Array.isArray(data)) {
        setProductDatabase(data);
        console.log('Produktdatenbank geladen für Kategorie-Lookup:', data.length, 'Produkte');
      }
    });

    /**
     * Cleanup-Funktion
     * 
     * Entfernt BEIDE Listener!
     */
    return () => {
      unsubscribe();
      productsUnsubscribe();
    };
    
  }, [user, currentListType]); // Neu laden wenn User oder Liste sich ändert

  // ==========================================================================
  // HILFSFUNKTIONEN (INTERN)
  // ==========================================================================

  /**
   * findCategoryForProduct - Findet Kategorie für Produktname
   * 
   * SUCHLOGIK:
   * 1. Exakte Übereinstimmung (case-insensitive)
   * 2. Teilübereinstimmung
   * 3. Fallback auf "sonstiges"
   * 
   * BEISPIELE:
   * ```
   * findCategoryForProduct('Tomaten')
   * // → "obst-gemuese" (exakte Übereinstimmung)
   * 
   * findCategoryForProduct('Tomaten (Dose)')
   * // → "konserven" (Teilübereinstimmung mit "Tomaten (Dose)" in DB)
   * // ODER "obst-gemuese" (Teilübereinstimmung mit "Tomaten")
   * 
   * findCategoryForProduct('Unbekanntes Produkt')
   * // → "sonstiges" (Fallback)
   * ```
   * 
   * WICHTIG:
   * - Nutzt lokale productDatabase (kein Firebase-Call!)
   * - Case-insensitive Vergleich
   * - Trim für Leerzeichen
   * 
   * @param {string} productName - Name des Produkts
   * @returns {string} Kategorie-ID (z.B. "obst-gemuese")
   */
  const findCategoryForProduct = (productName) => {
    if (!productName) return 'sonstiges';
    
    const normalizedName = productName.toLowerCase().trim();
    
    // ------------------------------------------------------------------------
    // VERSUCH 1: Exakte Übereinstimmung
    // ------------------------------------------------------------------------
    let product = productDatabase.find(p => 
      p.name.toLowerCase().trim() === normalizedName
    );
    
    if (product && product.category) {
      console.log(`Kategorie gefunden für "${productName}": ${product.category}`);
      return product.category;
    }
    
    // ------------------------------------------------------------------------
    // VERSUCH 2: Teilübereinstimmung
    // ------------------------------------------------------------------------
    /**
     * Teilübereinstimmung findet:
     * - "Tomaten (Dose)" wenn "Tomaten" gesucht wird
     * - "Tomaten" wenn "Cherry Tomaten" gesucht wird
     * 
     * Beide Richtungen werden geprüft!
     */
    product = productDatabase.find(p => {
      const dbName = p.name.toLowerCase().trim();
      return normalizedName.includes(dbName) || dbName.includes(normalizedName);
    });
    
    if (product && product.category) {
      console.log(`Kategorie gefunden (Teilübereinstimmung) für "${productName}": ${product.category}`);
      return product.category;
    }
    
    // ------------------------------------------------------------------------
    // FALLBACK: Sonstiges
    // ------------------------------------------------------------------------
    console.log(`Keine Kategorie gefunden für "${productName}" - verwende "sonstiges"`);
    return 'sonstiges';
  };

  // ==========================================================================
  // PUBLIC FUNKTIONEN (für UI)
  // ==========================================================================

  /**
   * addRecipeToList - Fügt alle Zutaten eines Rezepts zur Liste hinzu
   * 
   * KOMPLEXE LOGIK:
   * 
   * 1. DUPLIKAT-ERKENNUNG:
   *    - Prüft ob Zutat bereits in Liste
   *    - Vergleich: case-insensitive
   * 
   * 2. MENGEN-ZUSAMMENFASSUNG:
   *    - Wenn Zutat existiert + gleiche Einheit → Mengen addieren
   *    - Wenn unterschiedliche Einheit → Separates Item erstellen
   * 
   * 3. REZEPT-TRACKING:
   *    - Jedes Item merkt sich aus welchen Rezepten es kommt
   *    - recipes: ["Carbonara", "Pizza"]
   *    - Nützlich für "Warum ist das auf der Liste?"
   * 
   * 4. AUTOMATISCHE KATEGORIE:
   *    - Nutzt findCategoryForProduct()
   *    - Ermöglicht spätere Store-Layout-Sortierung
   * 
   * @param {object} recipe - Rezept-Objekt mit ingredients Array
   * @returns {Promise<void>}
   * 
   * BEISPIEL-ABLAUF:
   * ```
   * // Liste ist leer
   * 
   * addRecipeToList({
   *   title: "Carbonara",
   *   ingredients: [
   *     { item: "Spaghetti", amount: "400", unit: "g" },
   *     { item: "Eier", amount: "4", unit: "Stück" }
   *   ]
   * })
   * // → 2 neue Items
   * 
   * addRecipeToList({
   *   title: "Aglio e Olio",
   *   ingredients: [
   *     { item: "Spaghetti", amount: "400", unit: "g" },
   *     { item: "Knoblauch", amount: "3", unit: "Zehen" }
   *   ]
   * })
   * // → Spaghetti: 800g (400+400), recipes: ["Carbonara", "Aglio e Olio"]
   * // → Knoblauch: neu hinzugefügt
   * ```
   */
  const addRecipeToList = async (recipe) => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const updates = {};
    
    /**
     * Finde höchste order für neue Items
     * 
     * Neue Items sollen am Ende der Liste erscheinen
     */
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
    let orderCounter = maxOrder + 1;
    
    /**
     * Iteriere über alle Zutaten des Rezepts
     */
    recipe.ingredients.forEach(ingredient => {
      
      // ----------------------------------------------------------------------
      // Prüfe ob Zutat bereits existiert
      // ----------------------------------------------------------------------
      const existingItem = items.find(
        item => item.item.toLowerCase() === ingredient.item.toLowerCase()
      );

      /**
       * Bestimme Kategorie über Produktdatenbank
       * 
       * Automatisch zugeordnet für spätere Sortierung!
       */
      const category = findCategoryForProduct(ingredient.item);

      // ----------------------------------------------------------------------
      // Fall 1: Item existiert bereits
      // ----------------------------------------------------------------------
      if (existingItem) {
        
        /**
         * Prüfe ob Einheiten kompatibel sind
         * 
         * Kompatibel = gleiche Einheit + numerische Mengen
         */
        if (existingItem.unit === ingredient.unit && 
            ingredient.amount && 
            !isNaN(parseFloat(ingredient.amount))) {
          
          /**
           * MENGEN-ADDITION
           * 
           * Beispiel:
           * - Existing: "400g"
           * - Ingredient: "200g"
           * - Result: "600g"
           */
          const existingAmount = parseFloat(existingItem.amount) || 0;
          const newAmount = parseFloat(ingredient.amount) || 0;
          
          /**
           * Update existierendes Item:
           * - Neue Gesamtmenge
           * - Rezept zum recipes-Array hinzufügen
           */
          updates[`${listPath}/${existingItem.id}`] = {
            ...existingItem,
            amount: (existingAmount + newAmount).toString(),
            recipes: [...(existingItem.recipes || []), recipe.title]
          };
          
        } else {
          /**
           * Unterschiedliche Einheiten → Neues Item
           * 
           * Beispiel:
           * - Existing: "400g Spaghetti"
           * - Ingredient: "2 Packungen Spaghetti"
           * → Beide Items bleiben getrennt
           */
          const newId = Date.now().toString() + Math.random().toString(36).substring(2);
          updates[`${listPath}/${newId}`] = {
            ...ingredient,
            checked: false,
            recipes: [recipe.title],
            order: orderCounter++,
            category
          };
        }
        
      // ----------------------------------------------------------------------
      // Fall 2: Item existiert noch nicht
      // ----------------------------------------------------------------------
      } else {
        /**
         * Erstelle komplett neues Item
         */
        const newId = Date.now().toString() + Math.random().toString(36).substring(2);
        updates[`${listPath}/${newId}`] = {
          ...ingredient,
          checked: false,
          recipes: [recipe.title],
          order: orderCounter++,
          category
        };
      }
    });

    /**
     * Batch-Update: Alle Änderungen in EINEM Firebase-Call
     * 
     * VORTEIL:
     * - Atomare Operation
     * - Nur ein Netzwerk-Request
     * - Effizienter als einzelne set() Calls
     */
    try {
      await update(ref(database), updates);
      console.log('Rezept zur Einkaufsliste hinzugefügt mit automatischen Kategorien');
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  /**
   * addItem - Fügt einzelnes Item zur Liste hinzu
   * 
   * VERWENDUNG:
   * - Manuelles Hinzufügen über UI
   * - Einfacher als addRecipeToList
   * - Keine Duplikat-Prüfung (User entscheidet)
   * 
   * @param {string} item - Produktname
   * @param {string} amount - Menge
   * @param {string} unit - Einheit
   * @param {string} category - Kategorie-ID (default: "sonstiges")
   * @returns {Promise<void>}
   * 
   * BEISPIEL:
   * ```
   * await addItem('Tomaten', '500', 'g', 'obst-gemuese');
   * ```
   */
  const addItem = async (item, amount, unit, category = 'sonstiges') => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    
    /**
     * Neue Items erscheinen am Ende der Liste
     */
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
    
    /**
     * Einfache ID-Generierung
     * 
     * Timestamp als ID (eindeutig genug für diese Use Case)
     */
    const newId = Date.now().toString();
    const itemRef = ref(database, `${listPath}/${newId}`);
    
    try {
      await set(itemRef, {
        item,
        amount,
        unit,
        checked: false,
        recipes: [],        // Leer da manuell hinzugefügt
        order: maxOrder + 1,
        category
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  /**
   * toggleItem - Hakt Item ab oder macht Abhaken rückgängig
   * 
   * EINFACHE FUNKTION:
   * - Findet Item anhand ID
   * - Invertiert checked Boolean
   * - Update in Firebase
   * 
   * @param {string} id - Item-ID
   * @returns {Promise<void>}
   * 
   * VERWENDUNG:
   * ```
   * // Im Shop: Item abhaken
   * onClick={() => toggleItem(item.id)}
   * ```
   */
  const toggleItem = async (id) => {
    if (!user) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const itemRef = ref(database, `${listPath}/${id}`);
    
    try {
      /**
       * update() statt set() für partielles Update
       * 
       * Nur checked wird geändert, Rest bleibt gleich
       */
      await update(itemRef, {
        checked: !item.checked
      });
    } catch (error) {
      console.error('Fehler beim Abhaken:', error);
    }
  };

  /**
   * removeItem - Löscht Item aus Liste
   * 
   * @param {string} id - Item-ID
   * @returns {Promise<void>}
   */
  const removeItem = async (id) => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const itemRef = ref(database, `${listPath}/${id}`);
    
    try {
      await remove(itemRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  /**
   * updateItem - Aktualisiert Item-Properties
   * 
   * VERWENDUNG:
   * - Inline-Bearbeitung (Item-Name, Menge, Einheit ändern)
   * - Kategorie ändern
   * 
   * @param {string} id - Item-ID
   * @param {object} updates - Zu aktualisierende Properties
   * @returns {Promise<void>}
   * 
   * BEISPIEL:
   * ```
   * // Name ändern
   * await updateItem(id, { item: 'Cherry Tomaten' });
   * 
   * // Menge und Einheit ändern
   * await updateItem(id, { amount: '1', unit: 'kg' });
   * 
   * // Mehrere Properties
   * await updateItem(id, {
   *   item: 'Bio Tomaten',
   *   amount: '750',
   *   category: 'obst-gemuese'
   * });
   * ```
   */
  const updateItem = async (id, updates) => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const itemRef = ref(database, `${listPath}/${id}`);
    
    try {
      await update(itemRef, updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  /**
   * reorderItems - Ändert Reihenfolge der Items (Drag & Drop)
   * 
   * ABLAUF:
   * 1. UI: User zieht Items per Drag & Drop
   * 2. UI: Erstellt neues Array mit neuer Reihenfolge
   * 3. Ruft reorderItems() mit neuem Array
   * 4. Funktion: Setzt order-Property basierend auf Array-Index
   * 5. Firebase: Speichert neue order-Werte
   * 6. Listener: Aktualisiert UI automatisch
   * 
   * @param {array} reorderedItems - Items in neuer Reihenfolge
   * @returns {Promise<void>}
   * 
   * WICHTIG:
   * - Batch-Update (alle orders in einem Call)
   * - Array-Index = neue order
   * - Effizient durch gezieltes Update nur der order-Property
   * 
   * BEISPIEL:
   * ```
   * // Vorher: ["Milch", "Brot", "Eier"]
   * // User zieht "Eier" nach oben
   * // Nachher: ["Eier", "Milch", "Brot"]
   * 
   * reorderItems([
   *   { id: "3", item: "Eier", order: 2 },    // Neuer Index: 0
   *   { id: "1", item: "Milch", order: 0 },   // Neuer Index: 1
   *   { id: "2", item: "Brot", order: 1 }     // Neuer Index: 2
   * ])
   * // → Firebase: item-3/order: 0, item-1/order: 1, item-2/order: 2
   * ```
   */
  const reorderItems = async (reorderedItems) => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const updates = {};
    
    /**
     * Setze order basierend auf Index im Array
     * 
     * Index 0 → order: 0 (oben)
     * Index 1 → order: 1
     * Index 2 → order: 2 (unten)
     */
    reorderedItems.forEach((item, index) => {
      updates[`${listPath}/${item.id}/order`] = index;
    });

    try {
      /**
       * Batch-Update: Alle order-Werte in einem Call
       */
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Sortieren:', error);
    }
  };

  /**
   * sortByStoreLayout - Sortiert Liste nach Laden-Layout
   * 
   * HAUPTFEATURE der App! 🎯
   * 
   * ABLAUF:
   * 1. Gruppiere Items nach Kategorie
   * 2. Iteriere über Kategorien in Store-Layout-Reihenfolge
   * 3. Weise jedem Item neue order zu
   * 4. Speichere in Firebase
   * 
   * EFFEKT:
   * - Liste ist sortiert wie der Laden aufgebaut ist
   * - Effizienter Einkauf (kein Hin-und-Her)
   * - Keine Vergesslichkeit
   * 
   * @returns {Promise<void>}
   * 
   * BEISPIEL:
   * ```
   * // Vorher (unsortiert):
   * ["Chips", "Tomaten", "Milch", "Brot"]
   * 
   * // Laden-Layout:
   * 1. Obst & Gemüse
   * 2. Backwaren
   * 3. Milchprodukte
   * 4. Süßigkeiten
   * 
   * sortByStoreLayout()
   * 
   * // Nachher (sortiert):
   * ["Tomaten", "Brot", "Milch", "Chips"]
   * ```
   */
  const sortByStoreLayout = async () => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const updates = {};
    
    /**
     * SCHRITT 1: Gruppiere Items nach Kategorie
     * 
     * Erstellt Object:
     * {
     *   "obst-gemuese": [item1, item2],
     *   "milchprodukte": [item3],
     *   ...
     * }
     */
    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.category || 'sonstiges';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    /**
     * SCHRITT 2: Sortiere nach Store-Layout
     * 
     * Iteriere über Kategorien in der Reihenfolge des Ladens
     */
    let order = 0;
    storeCategories
      .sort((a, b) => a.order - b.order)  // Sortiere Kategorien nach order
      .forEach(category => {
        const categoryItems = itemsByCategory[category.id] || [];
        
        /**
         * Weise jedem Item in dieser Kategorie eine order zu
         * 
         * Items innerhalb Kategorie behalten ihre relative Reihenfolge
         */
        categoryItems.forEach(item => {
          updates[`${listPath}/${item.id}/order`] = order++;
        });
      });

    try {
      /**
       * Batch-Update: Alle order-Werte auf einmal
       */
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Sortieren:', error);
    }
  };

  /**
   * updateStoreLayout - DEPRECATED
   * 
   * Diese Funktion wurde durch StoreLayoutsContext ersetzt!
   * 
   * WARUM DEPRECATED?
   * - Store-Layouts werden jetzt zentral in StoreLayoutsContext verwaltet
   * - Mehrere Läden möglich (nicht nur ein Layout)
   * - Bessere Separation of Concerns
   * 
   * Bleibt aus Kompatibilitätsgründen hier, zeigt aber Warning.
   */
  const updateStoreLayout = async (newLayout) => {
    console.warn('updateStoreLayout ist deprecated - verwende StoreLayoutsContext');
  };

  /**
   * clearCheckedItems - Entfernt alle abgehakten Items
   * 
   * VERWENDUNG:
   * - Nach dem Einkauf "Aufräumen"
   * - Entfernt erledigte Items
   * - Abgehakte bleiben sichtbar bis manuell gelöscht
   * 
   * @returns {Promise<void>}
   * 
   * ABLAUF:
   * 1. Finde alle Items mit checked: true
   * 2. Setze sie auf null (Firebase-Löschung)
   * 3. Batch-Update
   */
  const clearCheckedItems = async () => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const updates = {};
    
    /**
     * Setze abgehakte Items auf null
     * 
     * null in Firebase = Löschen
     */
    items.forEach(item => {
      if (item.checked) {
        updates[`${listPath}/${item.id}`] = null;
      }
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Aufräumen:', error);
    }
  };

  /**
   * clearAll - Löscht ALLE Items der Liste
   * 
   * ACHTUNG: Unwiderruflich!
   * 
   * UI sollte Bestätigung zeigen!
   * 
   * @returns {Promise<void>}
   */
  const clearAll = async () => {
    if (!user) return;

    const listPath = getShoppingListPath(currentListType, user.uid);
    const listRef = ref(database, listPath);
    
    try {
      /**
       * remove() löscht kompletten Pfad
       * 
       * Alle Items weg!
       */
      await remove(listRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
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
   *    - items: Aktuelle Liste
   *    - storeCategories: Kategorien des Ladens
   *    - currentListType: shared / personal
   * 
   * 2. LISTEN-TYP:
   *    - setCurrentListType: Wechsel zwischen shared/personal
   * 
   * 3. CRUD:
   *    - addItem: Einzelnes Item hinzufügen
   *    - toggleItem: Abhaken
   *    - removeItem: Löschen
   *    - updateItem: Bearbeiten
   * 
   * 4. SPEZIALFUNKTIONEN:
   *    - addRecipeToList: Rezept hinzufügen (mit Mengen-Merge)
   *    - reorderItems: Drag & Drop
   *    - sortByStoreLayout: Nach Laden sortieren
   *    - clearCheckedItems: Abgehakte entfernen
   *    - clearAll: Alles löschen
   * 
   * 5. DEPRECATED:
   *    - updateStoreLayout: Verwende StoreLayoutsContext
   */
  const value = {
    items,
    storeCategories,
    currentListType,
    setCurrentListType,
    addRecipeToList,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    reorderItems,
    sortByStoreLayout,
    updateStoreLayout,      // DEPRECATED
    clearCheckedItems,
    clearAll
  };

  // ==========================================================================
  // PROVIDER RETURN
  // ==========================================================================
  
  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};