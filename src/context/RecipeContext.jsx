/**
 * RecipeContext - Rezeptverwaltung für die gesamte App
 * 
 * Dieser Context verwaltet alle Rezepte der App.
 * Er stellt CRUD-Funktionen (Create, Read, Update, Delete) bereit
 * und synchronisiert alle Änderungen in Echtzeit über Firebase.
 * 
 * WICHTIG:
 * - Rezepte werden für ALLE User geteilt (nicht pro User!)
 * - Echtzeit-Synchronisation (alle Clients sehen sofort Änderungen)
 * - Automatisches Re-Rendering bei Änderungen
 * 
 * FIREBASE STRUKTUR:
 * ```
 * recipes/
 *   ├─ RECIPE_ID_1/
 *   │   ├─ title: "Spaghetti Carbonara"
 *   │   ├─ description: "..."
 *   │   ├─ ingredients: [...]
 *   │   ├─ instructions: [...]
 *   │   ├─ prepTime: 15
 *   │   ├─ cookTime: 20
 *   │   ├─ servings: 4
 *   │   ├─ difficulty: "einfach"
 *   │   ├─ category: "Hauptgericht"
 *   │   ├─ tags: ["pasta", "schnell"]
 *   │   ├─ image: "https://..."
 *   │   └─ notes: "Tipps..."
 *   └─ RECIPE_ID_2/
 *       └─ ...
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, remove, push } from 'firebase/database';

// ============================================================================
// CONTEXT ERSTELLEN
// ============================================================================

/**
 * RecipeContext - Der eigentliche Context
 * 
 * Enthält Rezepte und CRUD-Funktionen
 */
const RecipeContext = createContext();

// ============================================================================
// CUSTOM HOOK: useRecipes
// ============================================================================

/**
 * useRecipes - Custom Hook zum Zugriff auf Rezepte
 * 
 * Verwendung in Komponenten:
 * ```
 * const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
 * ```
 * 
 * Dieser Hook:
 * 1. Holt den Context mit useContext()
 * 2. Wirft einen Fehler wenn außerhalb des Providers verwendet
 * 3. Gibt die Rezept-Daten zurück
 * 
 * @returns {object} Recipe Context Daten (recipes, loading, addRecipe, updateRecipe, deleteRecipe)
 * @throws {Error} Wenn außerhalb von RecipeProvider verwendet
 */
export const useRecipes = () => {
  const context = useContext(RecipeContext);
  
  // Fehlerbehandlung: Hook muss innerhalb des Providers sein!
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  
  return context;
};

// ============================================================================
// PROVIDER KOMPONENTE
// ============================================================================

/**
 * RecipeProvider - Provider-Komponente für Rezeptverwaltung
 * 
 * Diese Komponente:
 * 1. Lädt alle Rezepte aus Firebase
 * 2. Synchronisiert Änderungen in Echtzeit
 * 3. Stellt CRUD-Funktionen bereit
 * 4. Konvertiert Firebase-Objekte zu Arrays
 * 5. Verwaltet Loading-State
 * 
 * VERWENDUNG:
 * Sollte die gesamte App umschließen (nach AuthProvider):
 * ```
 * <AuthProvider>
 *   <RecipeProvider>
 *     <App />
 *   </RecipeProvider>
 * </AuthProvider>
 * ```
 * 
 * @param {object} props - React Props
 * @param {ReactNode} props.children - Kind-Komponenten
 */
export const RecipeProvider = ({ children }) => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /**
   * recipes - Array aller Rezepte
   * 
   * Struktur eines Rezepts:
   * {
   *   id: string,              // Firebase-generierte ID
   *   title: string,           // "Spaghetti Carbonara"
   *   description: string,     // Kurzbeschreibung
   *   ingredients: [           // Array von Zutaten
   *     { item: string, amount: number, unit: string }
   *   ],
   *   instructions: string[],  // Array von Schritten
   *   prepTime: number,        // Minuten
   *   cookTime: number,        // Minuten
   *   servings: number,        // Anzahl Portionen
   *   difficulty: string,      // "einfach", "mittel", "schwer"
   *   category: string,        // "Hauptgericht", "Dessert", etc.
   *   tags: string[],          // ["pasta", "schnell", "vegetarisch"]
   *   image: string,           // URL zum Bild
   *   notes: string            // Zusätzliche Tipps
   * }
   * 
   * WICHTIG: Array (nicht Object!) für einfache Iteration in UI
   */
  const [recipes, setRecipes] = useState([]);
  
  /**
   * loading - Lädt die Rezept-Datenbank gerade?
   * 
   * true = Initial Load läuft (beim App-Start)
   * false = Daten sind geladen (oder Fehler)
   * 
   * WICHTIG:
   * - Verhindert Flackern beim App-Start
   * - UI kann Loading-Spinner zeigen
   * - Wird nur beim ersten Load verwendet (nicht bei Updates!)
   */
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FIREBASE SYNC (useEffect)
  // ==========================================================================
  
  /**
   * Effect: Synchronisiert Rezepte mit Firebase in Echtzeit
   * 
   * Läuft nur einmal beim Mount (leeres Dependency-Array)
   * 
   * ABLAUF:
   * 1. Registriere onValue Listener
   * 2. Bei jedem Datenbank-Update:
   *    - Lade neue Daten
   *    - Konvertiere zu Array
   *    - Setze State
   * 3. Cleanup: Entferne Listener
   * 
   * ECHTZEIT-SYNC:
   * - Änderungen in Firebase → automatisch in App sichtbar
   * - Mehrere Clients → alle sehen gleiche Daten
   * - Kein manuelles Reload nötig!
   */
  useEffect(() => {
    /**
     * Firebase Referenz zu Rezepten
     * 
     * Pfad: /recipes
     * (Root-Level, nicht pro User - gemeinsame Rezeptdatenbank)
     */
    const recipesRef = ref(database, 'recipes');
    
    /**
     * onValue - Echtzeit-Listener für Rezepte
     * 
     * Wird aufgerufen:
     * - Sofort beim Registrieren (Initial Load)
     * - Bei JEDEM Update in Firebase (Add, Update, Delete)
     * - Automatisch von Firebase getriggert
     * 
     * Parameter "snapshot":
     * - Enthält die aktuellen Daten
     * - snapshot.val() gibt die Rohdaten zurück
     * 
     * WICHTIG: Dies ist ein PUSH-System!
     * Firebase schickt Updates an uns, wir müssen nicht pollen.
     */
    const unsubscribe = onValue(recipesRef, (snapshot) => {
      const data = snapshot.val();
      
      // --------------------------------------------------------------------
      // Fall 1: Rezepte vorhanden
      // --------------------------------------------------------------------
      if (data) {
        /**
         * FIREBASE DATENSTRUKTUR vs. REACT STATE
         * 
         * Firebase speichert als Object:
         * {
         *   "recipe-id-1": { title: "...", ... },
         *   "recipe-id-2": { title: "...", ... }
         * }
         * 
         * React UI braucht Array:
         * [
         *   { id: "recipe-id-1", title: "...", ... },
         *   { id: "recipe-id-2", title: "...", ... }
         * ]
         * 
         * KONVERTIERUNG:
         * 1. Object.entries() → Array von [key, value] Paaren
         * 2. map() → Erstelle Objekte mit id-Property
         * 3. Spread Operator (...recipe) → Kopiere alle Properties
         */
        const recipesArray = Object.entries(data).map(([id, recipe]) => ({
          id,           // Füge ID als Property hinzu
          ...recipe     // Kopiere alle anderen Properties (title, ingredients, etc.)
        }));
        
        /**
         * BEISPIEL-TRANSFORMATION:
         * 
         * Firebase Input:
         * {
         *   "-NxAbC123": { title: "Carbonara", prepTime: 15 },
         *   "-NxAbC124": { title: "Pizza", prepTime: 30 }
         * }
         * 
         * Nach Konvertierung:
         * [
         *   { id: "-NxAbC123", title: "Carbonara", prepTime: 15 },
         *   { id: "-NxAbC124", title: "Pizza", prepTime: 30 }
         * ]
         */
        setRecipes(recipesArray);
        
      // --------------------------------------------------------------------
      // Fall 2: Keine Rezepte vorhanden (leere Datenbank)
      // --------------------------------------------------------------------
      } else {
        /**
         * Leeres Array setzen
         * 
         * Passiert wenn:
         * - Noch keine Rezepte erstellt wurden
         * - Alle Rezepte gelöscht wurden
         * 
         * UI zeigt dann "Keine Rezepte vorhanden"
         */
        setRecipes([]);
      }
      
      /**
       * Loading beenden
       * 
       * Wird beim ersten Callback auf false gesetzt.
       * Bei weiteren Updates bleibt es false.
       * 
       * → UI weiß: Daten sind geladen (auch wenn leer)
       */
      setLoading(false);
    });

    /**
     * Cleanup-Funktion
     * 
     * WICHTIG: Muss den Listener entfernen!
     * 
     * Wird aufgerufen wenn:
     * - Komponente unmountet
     * - Effect neu läuft (hier nie, da [] Dependencies)
     * 
     * Verhindert:
     * - Memory Leaks
     * - Mehrfache Listener
     * - Updates nach Unmount
     */
    return () => unsubscribe();
    
  }, []); // Leeres Array = Effect läuft nur einmal beim Mount

  // ==========================================================================
  // CRUD FUNKTIONEN
  // ==========================================================================

  /**
   * addRecipe - Erstellt neues Rezept in Firebase
   * 
   * ABLAUF:
   * 1. Erstelle Referenz zu /recipes
   * 2. Generiere neue eindeutige ID mit push()
   * 3. Speichere Rezept-Daten unter dieser ID
   * 4. Gib ID zurück (für Navigation, etc.)
   * 
   * WICHTIG:
   * - Firebase generiert automatisch eindeutige ID
   * - Format: "-NxAbC123def456" (Push-ID)
   * - Zeitbasiert sortierbar
   * - Kollisionsfrei
   * 
   * @param {object} recipeData - Rezept-Objekt (ohne id!)
   * @returns {Promise<string>} ID des neuen Rezepts
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * const newRecipe = {
   *   title: "Spaghetti Carbonara",
   *   description: "Klassisches italienisches Gericht",
   *   ingredients: [
   *     { item: "Spaghetti", amount: 400, unit: "g" },
   *     { item: "Eier", amount: 4, unit: "Stück" }
   *   ],
   *   instructions: [
   *     "Wasser zum Kochen bringen",
   *     "Spaghetti kochen"
   *   ],
   *   prepTime: 15,
   *   cookTime: 20,
   *   servings: 4,
   *   difficulty: "einfach",
   *   category: "Hauptgericht",
   *   tags: ["pasta", "schnell"],
   *   image: "https://...",
   *   notes: "..."
   * };
   * 
   * const recipeId = await addRecipe(newRecipe);
   * console.log('Rezept erstellt mit ID:', recipeId);
   * navigate(`/recipe/${recipeId}`);
   * ```
   */
  const addRecipe = async (recipeData) => {
    try {
      /**
       * Referenz zur Rezept-Collection
       */
      const recipesRef = ref(database, 'recipes');
      
      /**
       * push() - Generiert neue eindeutige ID
       * 
       * Erstellt Referenz wie: /recipes/-NxAbC123
       * 
       * WICHTIG:
       * - ID wird AUTOMATISCH generiert
       * - Nicht in recipeData enthalten!
       * - Zeitbasiert → chronologisch sortierbar
       */
      const newRecipeRef = push(recipesRef);
      
      /**
       * set() - Speichert Daten unter der neuen ID
       * 
       * Schreibt recipeData nach /recipes/-NxAbC123
       */
      await set(newRecipeRef, recipeData);
      
      /**
       * Gib generierte ID zurück
       * 
       * Nützlich für:
       * - Navigation zum neuen Rezept
       * - Success-Message mit Link
       * - Weitere Operationen mit diesem Rezept
       */
      return newRecipeRef.key;
      
    } catch (error) {
      /**
       * Fehlerbehandlung
       * 
       * Mögliche Fehler:
       * - Keine Internetverbindung
       * - Firebase Permissions (sollte nicht passieren)
       * - Netzwerk-Timeout
       */
      console.error('Fehler beim Hinzufügen:', error);
      
      // Werfe Fehler weiter (für UI-Fehlerbehandlung)
      throw error;
    }
  };

  /**
   * updateRecipe - Aktualisiert existierendes Rezept
   * 
   * ABLAUF:
   * 1. Erstelle Referenz zu /recipes/{id}
   * 2. Überschreibe komplette Daten mit set()
   * 
   * WICHTIG:
   * - set() überschreibt ALLE Daten (kein Merge!)
   * - recipeData muss VOLLSTÄNDIG sein
   * - Fehlende Felder werden gelöscht!
   * 
   * Alternative: update() für partielles Update
   * (Hier nicht implementiert, da wir immer vollständig speichern)
   * 
   * @param {string} id - Rezept-ID
   * @param {object} recipeData - Komplettes Rezept-Objekt (ohne id!)
   * @returns {Promise<void>}
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * const updatedRecipe = {
   *   title: "Spaghetti Carbonara (Updated)",
   *   // ... ALLE anderen Felder auch angeben!
   * };
   * 
   * await updateRecipe(recipeId, updatedRecipe);
   * console.log('Rezept aktualisiert');
   * ```
   * 
   * ACHTUNG - FEHLENDE FELDER:
   * ```
   * // ❌ FALSCH - Felder fehlen werden gelöscht!
   * await updateRecipe(id, { title: "New Title" });
   * // → ingredients, instructions, etc. sind jetzt weg!
   * 
   * // ✅ RICHTIG - Alle Felder angeben
   * const existingRecipe = recipes.find(r => r.id === id);
   * await updateRecipe(id, {
   *   ...existingRecipe,
   *   title: "New Title"
   * });
   * ```
   */
  const updateRecipe = async (id, recipeData) => {
    try {
      /**
       * Referenz zum spezifischen Rezept
       * 
       * Pfad: /recipes/{id}
       * Beispiel: /recipes/-NxAbC123
       */
      const recipeRef = ref(database, `recipes/${id}`);
      
      /**
       * set() - Überschreibt komplette Rezept-Daten
       * 
       * WICHTIG: Komplettes Objekt überschreiben!
       * Alte Daten werden KOMPLETT ersetzt.
       */
      await set(recipeRef, recipeData);
      
      /**
       * Kein Return-Wert nötig
       * 
       * onValue-Listener aktualisiert automatisch den State!
       * UI zeigt sofort die neuen Daten.
       */
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  /**
   * deleteRecipe - Löscht Rezept aus Firebase
   * 
   * ABLAUF:
   * 1. Erstelle Referenz zu /recipes/{id}
   * 2. Lösche mit remove()
   * 
   * WICHTIG:
   * - Unwiderruflich! (Keine Undo-Funktion)
   * - UI sollte Bestätigung zeigen
   * - Alle Daten werden gelöscht
   * 
   * @param {string} id - Rezept-ID zum Löschen
   * @returns {Promise<void>}
   * @throws {Error} Bei Firebase-Fehler
   * 
   * VERWENDUNG:
   * ```
   * // Mit Bestätigung (empfohlen!)
   * if (window.confirm('Rezept wirklich löschen?')) {
   *   await deleteRecipe(recipeId);
   *   console.log('Rezept gelöscht');
   *   navigate('/');
   * }
   * ```
   * 
   * BEST PRACTICE:
   * - Immer Bestätigung zeigen
   * - Nach Löschen navigieren (Rezept-Detail wäre 404)
   * - Success-Message zeigen
   * - Optional: "Undo" innerhalb von X Sekunden
   */
  const deleteRecipe = async (id) => {
    try {
      /**
       * Referenz zum zu löschenden Rezept
       */
      const recipeRef = ref(database, `recipes/${id}`);
      
      /**
       * remove() - Löscht Daten aus Firebase
       * 
       * Nach dem Löschen:
       * - onValue-Listener wird getriggert
       * - State wird automatisch aktualisiert
       * - UI zeigt Rezept nicht mehr an
       */
      await remove(recipeRef);
      
      /**
       * Kein Return-Wert nötig
       * 
       * UI aktualisiert sich automatisch!
       */
      
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================
  
  /**
   * value - Bereitgestellte Daten und Funktionen
   * 
   * Verfügbar über useRecipes():
   * - recipes: Array aller Rezepte (mit id!)
   * - loading: Boolean (true während Initial Load)
   * - addRecipe: Funktion zum Erstellen
   * - updateRecipe: Funktion zum Aktualisieren
   * - deleteRecipe: Funktion zum Löschen
   */
  const value = {
    recipes,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe
  };

  // ==========================================================================
  // PROVIDER RETURN
  // ==========================================================================
  
  /**
   * Provider ohne Conditional Rendering
   * 
   * UNTERSCHIED zu AuthContext:
   * - Kein {!loading && children}
   * - Children werden immer gerendert
   * 
   * WARUM?
   * - UI kann selbst entscheiden ob Loading-Spinner
   * - Verschiedene Komponenten brauchen unterschiedliche Loading-UX
   * - Flexibler als globales Blocking
   * 
   * UI-KOMPONENTEN PRÜFEN:
   * ```
   * const { recipes, loading } = useRecipes();
   * 
   * if (loading) return <LoadingSpinner />;
   * if (recipes.length === 0) return <EmptyState />;
   * return <RecipesList recipes={recipes} />;
   * ```
   */
  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};