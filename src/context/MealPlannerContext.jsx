/**
 * MealPlannerContext - Wochenplaner-Verwaltung
 * 
 * Verwaltet die Essensplanung für die aktuelle Woche.
 * Nur für den eingeloggten User sichtbar (private Daten).
 * 
 * FEATURES:
 * - Planung für 7 Tage (Mo-So)
 * - ZWEI Modi pro Tag:
 *   1. Freitext: "Pizza bestellen"
 *   2. Rezept: Auswahl aus vorhandenen Rezepten
 * - Notizen pro Tag (optional)
 * - Bei Rezept: Verknüpfung für Navigation + Einkaufsliste
 * 
 * FIREBASE STRUKTUR:
 * ```
 * mealPlanner/
 *   {userId}/
 *     currentWeek/
 *       monday/
 *         mealText: "Pizza bestellen"   // Freitext-Modus
 *         // ODER
 *         recipeId: "recipe-123"        // Rezept-Modus
 *         recipeName: "Carbonara"
 *         notes: "Extra Käse"           // Optional
 *       tuesday/
 *         // kann leer sein
 *       ...
 * ```
 * 
 * WICHTIG:
 * - Nur aktuelle Woche (keine Historie)
 * - Pro User privat (nicht geteilt)
 * - Tage können leer bleiben
 * - Jederzeit editierbar
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

// ============================================================================
// CONTEXT UND KONSTANTEN
// ============================================================================

/**
 * MealPlannerContext - Der eigentliche Context
 */
const MealPlannerContext = createContext();

/**
 * WEEK_DAYS - Wochentage in deutscher Reihenfolge
 * 
 * WICHTIG:
 * - Keys müssen mit Firebase-Pfaden übereinstimmen!
 * - Reihenfolge: Montag bis Sonntag (deutscher Standard)
 */
const WEEK_DAYS = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' }
];

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useMealPlanner - Hook zum Zugriff auf Wochenplaner
 * 
 * @returns {object} MealPlanner Context Daten
 * @throws {Error} Wenn außerhalb von Provider verwendet
 */
export const useMealPlanner = () => {
  const context = useContext(MealPlannerContext);
  
  if (!context) {
    throw new Error('useMealPlanner must be used within MealPlannerProvider');
  }
  
  return context;
};

// ============================================================================
// PROVIDER KOMPONENTE
// ============================================================================

/**
 * MealPlannerProvider - Provider für Wochenplaner
 * 
 * Verwaltet:
 * - Mahlzeiten der aktuellen Woche
 * - CRUD-Operationen für Tage
 * - Integration mit Rezepten
 */
export const MealPlannerProvider = ({ children }) => {
  
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  
  /**
   * weekPlan - Object mit allen Tagen der Woche
   * 
   * Struktur:
   * {
   *   monday: {
   *     mealText: "Pizza",        // Freitext ODER
   *     recipeId: "recipe-123",   // Rezept-ID
   *     recipeName: "Carbonara",  // Rezept-Name (für Anzeige)
   *     notes: "Extra Käse"       // Optional
   *   },
   *   tuesday: null,              // Leer
   *   ...
   * }
   * 
   * WICHTIG:
   * - null = Tag ist leer/ungeplant
   * - Entweder mealText ODER recipeId (nie beides!)
   */
  const [weekPlan, setWeekPlan] = useState({});
  
  /**
   * loading - Lädt der Wochenplaner gerade?
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * user - Aktueller User aus AuthContext
   */
  const { user } = useAuth();

  // ==========================================================================
  // FIREBASE SYNC
  // ==========================================================================
  
  /**
   * Effect: Synchronisiert Wochenplaner mit Firebase
   * 
   * WICHTIG:
   * - Nur für eingeloggten User
   * - Nur dessen eigene Daten (private)
   * - Pfad: mealPlanner/{userId}/currentWeek
   */
  useEffect(() => {
    
    // Guard: User muss eingeloggt sein
    if (!user) {
      setWeekPlan({});
      setLoading(false);
      return;
    }

    /**
     * Firebase Referenz zum Wochenplaner des Users
     * 
     * Pfad: mealPlanner/{userId}/currentWeek
     * → Nur dieser User hat Zugriff (Firebase Rules!)
     */
    const planRef = ref(database, `mealPlanner/${user.uid}/currentWeek`);
    
    /**
     * Echtzeit-Listener für Wochenplaner
     */
    const unsubscribe = onValue(planRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        /**
         * Firebase-Daten direkt als Object verwenden
         * 
         * Keine Array-Konvertierung nötig, da wir nach Keys zugreifen
         * (monday, tuesday, etc.)
         */
        setWeekPlan(data);
      } else {
        /**
         * Keine Daten → Leerer Wochenplaner
         */
        setWeekPlan({});
      }
      
      setLoading(false);
    });

    /**
     * Cleanup
     */
    return () => unsubscribe();
    
  }, [user]);

  // ==========================================================================
  // CRUD FUNKTIONEN
  // ==========================================================================

  /**
   * setDayMeal - Setzt/Aktualisiert Mahlzeit für einen Tag
   * 
   * ZWEI MODI:
   * 
   * 1. FREITEXT-MODUS:
   *    mealData = { mealText: "Pizza bestellen", notes: "..." }
   * 
   * 2. REZEPT-MODUS:
   *    mealData = { 
   *      recipeId: "recipe-123", 
   *      recipeName: "Carbonara",
   *      notes: "..."
   *    }
   * 
   * @param {string} dayKey - Wochentag (z.B. "monday")
   * @param {object} mealData - Mahlzeit-Daten
   * @returns {Promise<void>}
   * 
   * BEISPIELE:
   * ```
   * // Freitext
   * await setDayMeal('monday', {
   *   mealText: 'Pizza bestellen',
   *   notes: 'Mit extra Käse'
   * });
   * 
   * // Rezept
   * await setDayMeal('tuesday', {
   *   recipeId: 'recipe-123',
   *   recipeName: 'Spaghetti Carbonara',
   *   notes: 'Für 4 Personen'
   * });
   * ```
   */
  const setDayMeal = async (dayKey, mealData) => {
    if (!user) return;

    /**
     * Pfad zum spezifischen Tag
     * 
     * z.B. mealPlanner/{userId}/currentWeek/monday
     */
    const dayRef = ref(database, `mealPlanner/${user.uid}/currentWeek/${dayKey}`);
    
    try {
      /**
       * set() überschreibt komplette Tag-Daten
       * 
       * Alte Daten werden ersetzt (z.B. Wechsel von Freitext zu Rezept)
       */
      await set(dayRef, mealData);
      
    } catch (error) {
      console.error('Fehler beim Setzen der Mahlzeit:', error);
      throw error;
    }
  };

  /**
   * clearDay - Löscht Mahlzeit eines Tages
   * 
   * Setzt Tag zurück auf leer/ungeplant.
   * 
   * @param {string} dayKey - Wochentag (z.B. "wednesday")
   * @returns {Promise<void>}
   * 
   * VERWENDUNG:
   * ```
   * await clearDay('wednesday');
   * // Mittwoch ist jetzt leer
   * ```
   */
  const clearDay = async (dayKey) => {
    if (!user) return;

    const dayRef = ref(database, `mealPlanner/${user.uid}/currentWeek/${dayKey}`);
    
    try {
      /**
       * remove() löscht Tag komplett
       * 
       * Tag wird zu null in weekPlan
       */
      await remove(dayRef);
      
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  /**
   * updateDayNotes - Aktualisiert nur Notizen eines Tages
   * 
   * WICHTIG:
   * - Ändert nur notes-Property
   * - mealText/recipeId bleiben unverändert
   * 
   * @param {string} dayKey - Wochentag
   * @param {string} notes - Neue Notizen
   * @returns {Promise<void>}
   * 
   * VERWENDUNG:
   * ```
   * await updateDayNotes('friday', 'Parmesan kaufen');
   * ```
   */
  const updateDayNotes = async (dayKey, notes) => {
    if (!user) return;

    const dayRef = ref(database, `mealPlanner/${user.uid}/currentWeek/${dayKey}`);
    
    try {
      /**
       * update() für partielles Update
       * 
       * Nur notes wird geändert, Rest bleibt
       */
      await update(dayRef, { notes });
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Notizen:', error);
      throw error;
    }
  };

  /**
   * clearWeek - Löscht komplette Woche
   * 
   * ACHTUNG: Unwiderruflich!
   * UI sollte Bestätigung zeigen.
   * 
   * @returns {Promise<void>}
   */
  const clearWeek = async () => {
    if (!user) return;

    const planRef = ref(database, `mealPlanner/${user.uid}/currentWeek`);
    
    try {
      /**
       * remove() löscht kompletten Wochenplaner
       */
      await remove(planRef);
      
    } catch (error) {
      console.error('Fehler beim Löschen der Woche:', error);
      throw error;
    }
  };

  // ==========================================================================
  // HELPER FUNKTIONEN
  // ==========================================================================

  /**
   * getDayMeal - Holt Mahlzeit für einen Tag
   * 
   * @param {string} dayKey - Wochentag
   * @returns {object|null} Mahlzeit-Daten oder null
   * 
   * VERWENDUNG:
   * ```
   * const meal = getDayMeal('monday');
   * if (meal) {
   *   if (meal.mealText) {
   *     console.log('Freitext:', meal.mealText);
   *   } else if (meal.recipeId) {
   *     console.log('Rezept:', meal.recipeName);
   *   }
   * }
   * ```
   */
  const getDayMeal = (dayKey) => {
    return weekPlan[dayKey] || null;
  };

  /**
   * isDayPlanned - Prüft ob Tag geplant ist
   * 
   * @param {string} dayKey - Wochentag
   * @returns {boolean} true wenn geplant
   * 
   * VERWENDUNG:
   * ```
   * if (isDayPlanned('tuesday')) {
   *   console.log('Dienstag ist geplant');
   * }
   * ```
   */
  const isDayPlanned = (dayKey) => {
    return !!weekPlan[dayKey];
  };

  /**
   * getPlannedDaysCount - Zählt geplante Tage
   * 
   * @returns {number} Anzahl geplanter Tage (0-7)
   * 
   * VERWENDUNG:
   * ```
   * const count = getPlannedDaysCount();
   * console.log(`${count} von 7 Tagen geplant`);
   * ```
   */
  const getPlannedDaysCount = () => {
    return Object.values(weekPlan).filter(day => day !== null).length;
  };

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================
  
  const value = {
    // State
    weekPlan,
    loading,
    
    // Konstanten
    WEEK_DAYS,
    
    // CRUD
    setDayMeal,
    clearDay,
    updateDayNotes,
    clearWeek,
    
    // Helpers
    getDayMeal,
    isDayPlanned,
    getPlannedDaysCount
  };

  return (
    <MealPlannerContext.Provider value={value}>
      {children}
    </MealPlannerContext.Provider>
  );
};