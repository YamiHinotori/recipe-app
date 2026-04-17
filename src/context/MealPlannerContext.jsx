/**
 * MealPlannerContext - Wochenplaner mit Gruppen-Support
 * 
 * V2: ZWEI SEPARATE WOCHENPLANER
 * - Persönlich (private): Nur eigener Wochenplan
 * - Gemeinsam (groups): Gemeinsamer Wochenplan für die Gruppe
 * 
 * FIREBASE STRUKTUR:
 * ```
 * mealPlannerV2/
 *   private/
 *     {userId}/          ← Persönlicher Wochenplan
 *       monday/
 *         mealText: "..." oder recipeId: "..."
 *       tuesday/
 *         ...
 *   
 *   groups/
 *     {groupId}/         ← Gemeinsamer Wochenplan
 *       monday/
 *         mealText: "..." oder recipeId: "..."
 *         plannedBy: "user-id"
 *       tuesday/
 *         ...
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useGroup } from './GroupContext.jsx';

const MealPlannerContext = createContext();

const WEEK_DAYS = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' }
];

export const useMealPlanner = () => {
  const context = useContext(MealPlannerContext);
  if (!context) {
    throw new Error('useMealPlanner must be used within MealPlannerProvider');
  }
  return context;
};

export const MealPlannerProvider = ({ children }) => {
  const { user } = useAuth();
  const { group, hasGroup } = useGroup();
  
  const [weekPlan, setWeekPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('group'); // 'private' oder 'group' - Standard: gemeinsam

  // WICHTIG: Wenn keine Gruppe, automatisch auf private umschalten
  useEffect(() => {
    if (!hasGroup && scope === 'group') {
      setScope('private');
    }
  }, [hasGroup, scope]);

  // ==========================================================================
  // FIREBASE SYNC - LÄDT JE NACH SCOPE
  // ==========================================================================
  
  useEffect(() => {
    if (!user) {
      setWeekPlan({});
      setLoading(false);
      return;
    }

    let planPath;
    
    if (scope === 'private') {
      // PERSÖNLICHER WOCHENPLAN
      planPath = `mealPlannerV2/private/${user.uid}`;
    } else {
      // GEMEINSAMER WOCHENPLAN
      if (!group?.id) {
        setWeekPlan({});
        setLoading(false);
        return;
      }
      planPath = `mealPlannerV2/groups/${group.id}`;
    }

    const planRef = ref(database, planPath);
    
    const unsubscribe = onValue(planRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        setWeekPlan(data);
      } else {
        setWeekPlan({});
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, scope, group]);

  // ==========================================================================
  // HELPER FUNKTIONEN
  // ==========================================================================

  const getPlanPath = () => {
    if (scope === 'private') {
      return `mealPlannerV2/private/${user.uid}`;
    } else {
      // Bei scope 'group' ABER keine Gruppe: return null
      if (!group?.id) return null;
      return `mealPlannerV2/groups/${group.id}`;
    }
  };

  // ==========================================================================
  // CRUD FUNKTIONEN
  // ==========================================================================

  const setDayMeal = async (dayKey, mealData) => {
    if (!user) return;

    const planPath = getPlanPath();
    if (!planPath) return;

    try {
      const dayRef = ref(database, `${planPath}/${dayKey}`);
      
      // Bei Gruppen-Planer: plannedBy hinzufügen
      const dataToSave = scope === 'group' 
        ? { ...mealData, plannedBy: user.uid }
        : mealData;
      
      await set(dayRef, dataToSave);
    } catch (error) {
      console.error('Fehler beim Setzen der Mahlzeit:', error);
      throw error;
    }
  };

  const clearDay = async (dayKey) => {
    if (!user) return;

    const planPath = getPlanPath();
    if (!planPath) return;

    try {
      const dayRef = ref(database, `${planPath}/${dayKey}`);
      await remove(dayRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  const updateDayNotes = async (dayKey, notes) => {
    if (!user) return;

    const planPath = getPlanPath();
    if (!planPath) return;

    try {
      const dayRef = ref(database, `${planPath}/${dayKey}`);
      await update(dayRef, { notes });
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Notizen:', error);
      throw error;
    }
  };

  const clearWeek = async () => {
    if (!user) return;

    const planPath = getPlanPath();
    if (!planPath) return;

    try {
      const planRef = ref(database, planPath);
      await remove(planRef);
    } catch (error) {
      console.error('Fehler beim Löschen der Woche:', error);
      throw error;
    }
  };

  // ==========================================================================
  // GETTER FUNKTIONEN
  // ==========================================================================

  const getDayMeal = (dayKey) => {
    return weekPlan[dayKey] || null;
  };

  const isDayPlanned = (dayKey) => {
    return !!weekPlan[dayKey];
  };

  const getPlannedDaysCount = () => {
    return Object.values(weekPlan).filter(day => day !== null).length;
  };

  const value = {
    weekPlan,
    loading,
    scope,
    setScope,
    hasGroup,
    WEEK_DAYS,
    setDayMeal,
    clearDay,
    updateDayNotes,
    clearWeek,
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