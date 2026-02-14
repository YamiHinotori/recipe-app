/**
 * ProductDatabaseContext - Produktdatenbank für Autocomplete
 * 
 * Dieser Context verwaltet eine zentrale Datenbank aller verfügbaren Produkte.
 * Diese wird verwendet für:
 * - Autocomplete beim Hinzufügen von Artikeln
 * - Vorschläge beim Tippen
 * - Kategorie-Zuordnung von Produkten
 * - Übliche Einheiten (z.B. "Milch" → "l")
 * 
 * WICHTIG: 
 * - Ein User = eine gemeinsame Produktdatenbank für alle User!
 * - Neue Produkte werden automatisch zur Datenbank hinzugefügt
 * - Synchronisiert über Firebase Realtime Database
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

// ============================================================================
// CONTEXT ERSTELLEN
// ============================================================================

/**
 * ProductDatabaseContext - Der eigentliche Context
 * 
 * Enthält die Produktdatenbank und Funktionen zum Suchen/Hinzufügen
 */
const ProductDatabaseContext = createContext();

// ============================================================================
// DEFAULT PRODUKTDATENBANK
// ============================================================================

/**
 * DEFAULT_PRODUCTS - Vordefinierte Produktliste
 * 
 * WICHTIG: Diese Liste wird GEBRAUCHT für:
 * 
 * 1. INITIALISIERUNG
 *    - Wenn ein User sich zum ersten Mal anmeldet
 *    - Firebase hat noch keine Produktdatenbank
 *    - → Diese Produkte werden automatisch in Firebase gespeichert
 * 
 * 2. FALLBACK FÜR NICHT-EINGELOGGTE USER
 *    - User können App ohne Login testen
 *    - Autocomplete funktioniert trotzdem mit diesen Produkten
 * 
 * 3. RESET-FUNKTION
 *    - Falls Datenbank korrupt wird
 *    - Admin kann zurück auf Standard setzen
 * 
 * STRUKTUR EINES PRODUKTS:
 * {
 *   name: string,        // z.B. "Tomaten"
 *   category: string,    // z.B. "obst-gemuese" (muss mit Store-Kategorien übereinstimmen)
 *   commonUnit: string   // z.B. "kg", "Stück", "l"
 * }
 * 
 * KATEGORIEN (sollten mit ShoppingList storeCategories übereinstimmen):
 * - obst-gemuese
 * - backwaren
 * - fleisch-fisch
 * - milchprodukte
 * - tiefkuehl
 * - konserven
 * - nudeln-reis
 * - gewuerze
 * - getraenke
 * - suessigkeiten
 * - haushalt
 */
const DEFAULT_PRODUCTS = [
  // Obst & Gemüse
  { name: 'Tomaten', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Gurken', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Paprika', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Zwiebeln', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Kartoffeln', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Möhren', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Salat', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Spinat', category: 'obst-gemuese', commonUnit: 'g' },
  { name: 'Brokkoli', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Blumenkohl', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Äpfel', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Bananen', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Orangen', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Zitronen', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Knoblauch', category: 'obst-gemuese', commonUnit: 'Zehen' },
  { name: 'Ingwer', category: 'obst-gemuese', commonUnit: 'g' },
  { name: 'Champignons', category: 'obst-gemuese', commonUnit: 'g' },
  
  // Backwaren
  { name: 'Brot', category: 'backwaren', commonUnit: 'Stück' },
  { name: 'Brötchen', category: 'backwaren', commonUnit: 'Stück' },
  { name: 'Toast', category: 'backwaren', commonUnit: 'Packung' },
  { name: 'Baguette', category: 'backwaren', commonUnit: 'Stück' },
  
  // Fleisch & Fisch
  { name: 'Hähnchenbrust', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Hackfleisch', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Schweinefilet', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Rindfleisch', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Lachs', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Thunfisch', category: 'fleisch-fisch', commonUnit: 'Dose' },
  { name: 'Garnelen', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Bacon', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Würstchen', category: 'fleisch-fisch', commonUnit: 'Packung' },
  
  // Milchprodukte
  { name: 'Milch', category: 'milchprodukte', commonUnit: 'l' },
  { name: 'Butter', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Käse', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Joghurt', category: 'milchprodukte', commonUnit: 'Becher' },
  { name: 'Sahne', category: 'milchprodukte', commonUnit: 'ml' },
  { name: 'Schmand', category: 'milchprodukte', commonUnit: 'Becher' },
  { name: 'Quark', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Frischkäse', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Mozzarella', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Parmesan', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Eier', category: 'milchprodukte', commonUnit: 'Stück' },
  
  // Tiefkühlware
  { name: 'Tiefkühlpizza', category: 'tiefkuehl', commonUnit: 'Stück' },
  { name: 'Pommes', category: 'tiefkuehl', commonUnit: 'Packung' },
  { name: 'Erbsen (TK)', category: 'tiefkuehl', commonUnit: 'g' },
  { name: 'Spinat (TK)', category: 'tiefkuehl', commonUnit: 'g' },
  { name: 'Beeren (TK)', category: 'tiefkuehl', commonUnit: 'g' },
  { name: 'Eis', category: 'tiefkuehl', commonUnit: 'Packung' },
  
  // Konserven
  { name: 'Tomaten (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Kichererbsen (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Kidneybohnen (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Mais (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Kokosmilch', category: 'konserven', commonUnit: 'Dose' },
  
  // Nudeln, Reis & Getreide
  { name: 'Spaghetti', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Penne', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Fusilli', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Reis', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Basmatireis', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Couscous', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Quinoa', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Mehl', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Haferflocken', category: 'nudeln-reis', commonUnit: 'g' },
  
  // Gewürze & Öle
  { name: 'Salz', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Pfeffer', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Paprikapulver', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Currypulver', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Oregano', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Basilikum', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Olivenöl', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Sonnenblumenöl', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Essig', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Sojasauce', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Honig', category: 'gewuerze', commonUnit: 'g' },
  { name: 'Senf', category: 'gewuerze', commonUnit: 'Glas' },
  { name: 'Ketchup', category: 'gewuerze', commonUnit: 'Flasche' },
  
  // Getränke
  { name: 'Wasser', category: 'getraenke', commonUnit: 'l' },
  { name: 'Sprudelwasser', category: 'getraenke', commonUnit: 'l' },
  { name: 'Saft', category: 'getraenke', commonUnit: 'l' },
  { name: 'Cola', category: 'getraenke', commonUnit: 'l' },
  { name: 'Bier', category: 'getraenke', commonUnit: 'Flasche' },
  { name: 'Wein', category: 'getraenke', commonUnit: 'Flasche' },
  { name: 'Kaffee', category: 'getraenke', commonUnit: 'g' },
  { name: 'Tee', category: 'getraenke', commonUnit: 'Packung' },
  
  // Süßigkeiten & Snacks
  { name: 'Schokolade', category: 'suessigkeiten', commonUnit: 'Tafel' },
  { name: 'Chips', category: 'suessigkeiten', commonUnit: 'Tüte' },
  { name: 'Gummibärchen', category: 'suessigkeiten', commonUnit: 'Tüte' },
  { name: 'Kekse', category: 'suessigkeiten', commonUnit: 'Packung' },
  { name: 'Nüsse', category: 'suessigkeiten', commonUnit: 'g' },
  
  // Haushalt & Drogerie
  { name: 'Toilettenpapier', category: 'haushalt', commonUnit: 'Packung' },
  { name: 'Küchenpapier', category: 'haushalt', commonUnit: 'Rolle' },
  { name: 'Spülmittel', category: 'haushalt', commonUnit: 'Flasche' },
  { name: 'Waschmittel', category: 'haushalt', commonUnit: 'Packung' },
  { name: 'Zahnpasta', category: 'haushalt', commonUnit: 'Tube' },
  { name: 'Shampoo', category: 'haushalt', commonUnit: 'Flasche' },
  { name: 'Seife', category: 'haushalt', commonUnit: 'Stück' }
];

// ============================================================================
// CUSTOM HOOK: useProductDatabase
// ============================================================================

/**
 * useProductDatabase - Custom Hook zum Zugriff auf die Produktdatenbank
 * 
 * Verwendung:
 * ```
 * const { products, searchProducts, addProduct } = useProductDatabase();
 * ```
 * 
 * @returns {object} ProductDatabase Context Daten
 * @throws {Error} Wenn außerhalb von Provider verwendet
 */
export const useProductDatabase = () => {
  const context = useContext(ProductDatabaseContext);
  
  if (!context) {
    throw new Error('useProductDatabase must be used within ProductDatabaseProvider');
  }
  
  return context;
};

// ============================================================================
// PROVIDER KOMPONENTE
// ============================================================================

/**
 * ProductDatabaseProvider - Provider für die Produktdatenbank
 * 
 * Diese Komponente:
 * 1. Lädt Produktdatenbank aus Firebase
 * 2. Initialisiert Firebase mit DEFAULT_PRODUCTS wenn leer
 * 3. Synchronisiert Änderungen in Echtzeit
 * 4. Stellt Suchfunktionen bereit
 * 5. Ermöglicht Hinzufügen neuer Produkte
 * 
 * FIREBASE STRUKTUR:
 * ```
 * productDatabase: [
 *   { name: "Tomaten", category: "obst-gemuese", commonUnit: "kg" },
 *   { name: "Milch", category: "milchprodukte", commonUnit: "l" },
 *   ...
 * ]
 * ```
 * 
 * WICHTIG: 
 * - Ein Array (nicht Object!) für einfache Iteration
 * - Direkt auf Root-Level (nicht pro User)
 * - Gemeinsame Datenbank für alle User
 */
export const ProductDatabaseProvider = ({ children }) => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /**
   * products - Aktuelle Produktliste
   * 
   * Startet mit DEFAULT_PRODUCTS und wird dann:
   * - Durch Firebase-Daten ersetzt (wenn User eingeloggt)
   * - Oder bleibt DEFAULT_PRODUCTS (wenn nicht eingeloggt)
   */
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  
  /**
   * user - Aktueller User aus AuthContext
   * 
   * Benötigt für:
   * - Prüfung ob User eingeloggt ist
   * - Firebase-Zugriff nur wenn eingeloggt
   */
  const { user } = useAuth();

  // ==========================================================================
  // FIREBASE SYNC (useEffect)
  // ==========================================================================
  
  /**
   * Effect: Synchronisiert Produktdatenbank mit Firebase
   * 
   * Läuft bei:
   * - Komponenten-Mount
   * - User Login/Logout (user ändert sich)
   * 
   * Zwei Szenarien:
   * 1. User NICHT eingeloggt → Nutze DEFAULT_PRODUCTS
   * 2. User eingeloggt → Lade/Synchronisiere Firebase
   */
  useEffect(() => {
    
    // ----------------------------------------------------------------------
    // SZENARIO 1: Nicht eingeloggt
    // ----------------------------------------------------------------------
    if (!user) {
      // Fallback auf DEFAULT_PRODUCTS
      // → User kann App testen ohne Login
      // → Autocomplete funktioniert trotzdem
      setProducts(DEFAULT_PRODUCTS);
      return;
    }

    // ----------------------------------------------------------------------
    // SZENARIO 2: Eingeloggt - Firebase Sync
    // ----------------------------------------------------------------------
    
    /**
     * Firebase Referenz zur Produktdatenbank
     * 
     * Pfad: /productDatabase
     * (Nicht pro User - eine gemeinsame Datenbank!)
     */
    const productsRef = ref(database, 'productDatabase');
    
    /**
     * onValue - Echtzeit-Listener für Produktdatenbank
     * 
     * Wird aufgerufen:
     * - Sofort beim Registrieren (initial load)
     * - Jedes Mal wenn Daten in Firebase sich ändern
     * 
     * → Echtzeit-Synchronisation!
     */
    const unsubscribe = onValue(productsRef, async (snapshot) => {
      const data = snapshot.val();
      
      // Debug-Ausgaben (können später entfernt werden)
      console.log('=== PRODUKTDATENBANK GELADEN ===');
      console.log('Rohdaten aus Firebase:', data);
      console.log('Datentyp:', typeof data, 'IsArray:', Array.isArray(data));
      
      // --------------------------------------------------------------------
      // Fall 1: Daten vorhanden und gültig
      // --------------------------------------------------------------------
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('✅ Produktdatenbank gefunden - Anzahl Produkte:', data.length);
        console.log('Erste 5 Produkte:', data.slice(0, 5));
        
        // Firebase-Daten verwenden
        setProducts(data);
        
      // --------------------------------------------------------------------
      // Fall 2: Keine Daten vorhanden (erste Initialisierung)
      // --------------------------------------------------------------------
      } else if (data === null || data === undefined) {
        console.log('⚠️ Keine Produktdatenbank vorhanden - erstelle neue mit Standard-Produkten');
        console.log('Anzahl Standard-Produkte:', DEFAULT_PRODUCTS.length);
        
        try {
          /**
           * Initialisierung: DEFAULT_PRODUCTS in Firebase speichern
           * 
           * Passiert nur einmal beim ersten Login!
           * Danach existiert die Datenbank in Firebase.
           */
          await set(productsRef, DEFAULT_PRODUCTS);
          console.log('✅ Standard-Produkte erfolgreich gespeichert');
          
          // State mit DEFAULT_PRODUCTS setzen
          setProducts(DEFAULT_PRODUCTS);
          
        } catch (error) {
          console.error('❌ Fehler beim Speichern der Standard-Produkte:', error);
          
          // Trotz Fehler: Verwende DEFAULT_PRODUCTS lokal
          // → App funktioniert auch ohne Firebase-Zugriff
          setProducts(DEFAULT_PRODUCTS);
        }
        
      // --------------------------------------------------------------------
      // Fall 3: Unerwartete Datenstruktur
      // --------------------------------------------------------------------
      } else {
        console.log('⚠️ Unerwartete Datenstruktur:', data);
        
        // Fallback auf DEFAULT_PRODUCTS
        setProducts(DEFAULT_PRODUCTS);
      }
    });

    /**
     * Cleanup-Funktion
     * 
     * Entfernt den Firebase-Listener
     * Verhindert Memory Leaks
     */
    return () => unsubscribe();
    
  }, [user]); // Effect läuft neu wenn user sich ändert

  // ==========================================================================
  // HILFSFUNKTIONEN
  // ==========================================================================

  /**
   * addProduct - Fügt neues Produkt zur Datenbank hinzu
   * 
   * FUNKTIONALITÄT:
   * 1. Prüft ob User eingeloggt (sonst Abbruch)
   * 2. Normalisiert Produktname (trim)
   * 3. Prüft auf Duplikate (case-insensitive)
   * 4. Fügt Produkt zu Array hinzu
   * 5. Speichert komplettes Array in Firebase
   * 
   * WICHTIG: 
   * - Duplikat-Prüfung verhindert mehrfache Einträge
   * - Case-insensitive: "Milch" = "milch" = "MILCH"
   * 
   * @param {string} name - Produktname
   * @param {string} category - Kategorie-ID
   * @param {string} commonUnit - Übliche Einheit
   * @returns {Promise<object|null>} Neues Produkt oder null bei Fehler
   * 
   * VERWENDUNG:
   * ```
   * const product = await addProduct('Avocado', 'obst-gemuese', 'Stück');
   * if (product) {
   *   console.log('Produkt hinzugefügt:', product);
   * }
   * ```
   */
  const addProduct = async (name, category, commonUnit) => {
    // Nur eingeloggte User dürfen Produkte hinzufügen
    if (!user) return;

    // Normalisiere den Namen (Leerzeichen entfernen)
    const normalizedName = name.trim();
    
    /**
     * Duplikat-Prüfung (case-insensitive)
     * 
     * Verhindert:
     * - "Milch" und "milch" beide in der Datenbank
     * - Mehrfache Vorschläge beim Autocomplete
     */
    const existingProduct = products.find(
      p => p.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (existingProduct) {
      console.log('Produkt existiert bereits:', existingProduct);
      // Gib existierendes Produkt zurück (kein Fehler!)
      return existingProduct;
    }

    /**
     * Erstelle neues Produkt-Objekt
     * 
     * WICHTIG: Exakten Namen verwenden (nicht lowercase!)
     * → "Milch" bleibt "Milch" (nicht "milch")
     */
    const newProduct = { 
      name: normalizedName, 
      category, 
      commonUnit 
    };

    // Neues Array mit zusätzlichem Produkt
    const newProducts = [...products, newProduct];

    // Firebase Referenz
    const productsRef = ref(database, 'productDatabase');
    
    try {
      /**
       * Speichere komplettes Array in Firebase
       * 
       * WICHTIG: Firebase überschreibt das gesamte Array!
       * → Kein "Anhängen", sondern komplettes Ersetzen
       * 
       * Warum?
       * - Garantiert Konsistenz
       * - Einfacher als einzelne Updates
       * - onValue-Listener aktualisiert automatisch alle Clients
       */
      await set(productsRef, newProducts);
      console.log('Neues Produkt hinzugefügt:', newProduct);
      
      return newProduct;
      
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Produkts:', error);
      return null;
    }
  };

  /**
   * findProduct - Findet Produkt nach exaktem oder partiellem Namen
   * 
   * SUCHLOGIK:
   * 1. Exakte Übereinstimmung (case-insensitive)
   * 2. Teilübereinstimmung (case-insensitive)
   * 
   * @param {string} searchTerm - Suchbegriff
   * @returns {object|null} Gefundenes Produkt oder null
   * 
   * VERWENDUNG:
   * ```
   * const product = findProduct('Milch');
   * if (product) {
   *   console.log('Kategorie:', product.category);
   *   console.log('Einheit:', product.commonUnit);
   * }
   * ```
   */
  const findProduct = (searchTerm) => {
    if (!searchTerm) return null;
    
    const search = searchTerm.toLowerCase().trim();
    
    // Versuch 1: Exakte Übereinstimmung
    let product = products.find(p => p.name.toLowerCase() === search);
    if (product) return product;
    
    // Versuch 2: Teilübereinstimmung
    // "Tom" findet "Tomaten"
    product = products.find(p => p.name.toLowerCase().includes(search));
    if (product) return product;
    
    // Nichts gefunden
    return null;
  };

  /**
   * searchProducts - Sucht Produkte für Autocomplete
   * 
   * FUNKTIONALITÄT:
   * 1. Filtert Produkte die den Suchbegriff enthalten
   * 2. Sortiert nach Relevanz:
   *    - Exakte Treffer zuerst
   *    - Treffer am Wortanfang
   *    - Treffer am Produktnamen-Anfang
   *    - Treffer nach Position
   *    - Rest alphabetisch
   * 3. Limitiert auf max. 10 Ergebnisse
   * 
   * MINIMUM: 2 Zeichen (sonst zu viele Ergebnisse)
   * 
   * @param {string} searchTerm - Suchbegriff (min. 2 Zeichen)
   * @returns {array} Array von Produkten (max. 10)
   * 
   * VERWENDUNG:
   * ```
   * const results = searchProducts('tom');
   * // Ergebnis: ["Tomaten", "Tomaten (Dose)", ...]
   * 
   * results.forEach(product => {
   *   console.log(product.name, product.category);
   * });
   * ```
   * 
   * SORTIER-BEISPIEL:
   * Suche nach "tom":
   * 1. "Tom" (exakt) ← wenn vorhanden
   * 2. "Tomaten" (startet mit "tom")
   * 3. "Cherry Tomaten" (enthält "tom" nach Leerzeichen)
   * 4. "Tomaten (Dose)" (startet mit "tom")
   * 5. ... alphabetisch sortiert
   */
  const searchProducts = (searchTerm) => {
    // Minimum 2 Zeichen für Suche
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const search = searchTerm.toLowerCase().trim();
    
    /**
     * SCHRITT 1: Filtern
     * 
     * Finde alle Produkte die den Suchbegriff enthalten
     */
    const filtered = products.filter(p => {
      const productName = p.name.toLowerCase();
      return productName.includes(search);
    });
    
    /**
     * SCHRITT 2: Sortieren nach Relevanz
     * 
     * Hierarchie der Relevanz:
     * 1. Exakte Treffer (höchste Priorität)
     * 2. Wortanfang-Treffer (nach Leerzeichen oder am Anfang)
     * 3. Produktnamen-Anfang (startet mit Suchbegriff)
     * 4. Position im Namen (je früher, desto besser)
     * 5. Alphabetisch (Fallback)
     */
    filtered.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      
      // Priorität 1: Exakte Treffer zuerst
      const aExact = aLower === search;
      const bExact = bLower === search;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Priorität 2: Wortanfang (z.B. "Cherry Tomaten" bei Suche "tom")
      const aWordStart = aLower.startsWith(search) || aLower.includes(' ' + search);
      const bWordStart = bLower.startsWith(search) || bLower.includes(' ' + search);
      if (aWordStart && !bWordStart) return -1;
      if (!aWordStart && bWordStart) return 1;
      
      // Priorität 3: Produktnamen-Anfang (z.B. "Tomaten" bei Suche "tom")
      const aStarts = aLower.startsWith(search);
      const bStarts = bLower.startsWith(search);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Priorität 4: Position des Treffers (je früher, desto besser)
      const aIndex = aLower.indexOf(search);
      const bIndex = bLower.indexOf(search);
      if (aIndex !== bIndex) return aIndex - bIndex;
      
      // Priorität 5: Alphabetisch (Fallback)
      return a.name.localeCompare(b.name);
    });
    
    // Debug-Ausgabe
    console.log(`Suche nach "${searchTerm}": ${filtered.length} Ergebnisse gefunden`, 
      filtered.map(p => p.name));
    
    /**
     * SCHRITT 3: Limitieren auf 10 Ergebnisse
     * 
     * Warum?
     * - Bessere Performance
     * - UI bleibt übersichtlich
     * - User muss spezifischer suchen bei >10 Treffern
     */
    return filtered.slice(0, 10);
  };

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================
  
  /**
   * value - Bereitgestellte Daten und Funktionen
   * 
   * Verfügbar über useProductDatabase():
   * - products: Array aller Produkte
   * - addProduct: Funktion zum Hinzufügen
   * - findProduct: Funktion zum Finden (exakt/partiell)
   * - searchProducts: Funktion für Autocomplete
   */
  const value = {
    products,
    addProduct,
    findProduct,
    searchProducts
  };

  // ==========================================================================
  // PROVIDER RETURN
  // ==========================================================================
  
  return (
    <ProductDatabaseContext.Provider value={value}>
      {children}
    </ProductDatabaseContext.Provider>
  );
};