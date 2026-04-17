/**
 * CategoriesContext - Kategorienverwaltung mit Gruppen-Support
 * 
 * KONZEPT:
 * - Jeder User hat seine Kategorien in categoriesV2/private/{uid}/
 * - Wenn User in Gruppe ist: Sieht alle Kategorien aller Gruppenmitglieder
 * - Auto-Deduplizierung (case-insensitive)
 * - Default-Kategorien als Fallback
 * 
 * FIREBASE STRUKTUR:
 * ```
 * categoriesV2/
 *   private/
 *     {userId}/
 *       0: { id: 'bio', name: 'Bio-Produkte' }
 *       1: { id: 'asiatisch', name: 'Asiatisch' }
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useGroup } from './GroupContext.jsx';

const CategoriesContext = createContext();

// DEFAULT_CATEGORIES als Basis
const DEFAULT_CATEGORIES = [
  { id: 'obst-gemuese', name: 'Obst & Gemüse' },
  { id: 'backwaren', name: 'Backwaren' },
  { id: 'fleisch-fisch', name: 'Fleisch & Fisch' },
  { id: 'milchprodukte', name: 'Milchprodukte' },
  { id: 'tiefkuehl', name: 'Tiefkühlware' },
  { id: 'konserven', name: 'Konserven' },
  { id: 'nudeln-reis', name: 'Nudeln, Reis & Getreide' },
  { id: 'gewuerze', name: 'Gewürze & Öle' },
  { id: 'getraenke', name: 'Getränke' },
  { id: 'suessigkeiten', name: 'Süßigkeiten & Snacks' },
  { id: 'haushalt', name: 'Haushalt & Drogerie' },
  { id: 'sonstiges', name: 'Sonstiges' }
];

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const { user } = useAuth();
  const { group, hasGroup, members } = useGroup();
  
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FIREBASE SYNC - LÄDT KATEGORIEN VON ALLEN GRUPPENMITGLIEDERN
  // ==========================================================================
  
  useEffect(() => {
    if (!user) {
      setCategories(DEFAULT_CATEGORIES);
      setLoading(false);
      return;
    }

    // Liste der User-IDs deren Kategorien geladen werden sollen
    const userIdsToLoad = hasGroup && members.length > 0
      ? members.map(m => m.uid)  // Alle Gruppenmitglieder
      : [user.uid];               // Nur ich

    const unsubscribers = [];
    const allCategoriesByUser = {}; // { userId: [...categories] }

    // Für jeden User: Lade seine Kategorien
    userIdsToLoad.forEach(userId => {
      const userCategoriesRef = ref(database, `categoriesV2/private/${userId}`);
      
      const unsubscribe = onValue(userCategoriesRef, async (snapshot) => {
        const data = snapshot.val();
        
        if (data && Array.isArray(data)) {
          allCategoriesByUser[userId] = data;
        } else if (data === null && userId === user.uid) {
          // Nur für eigenen User: Initialisiere mit Defaults
          await set(userCategoriesRef, DEFAULT_CATEGORIES);
          allCategoriesByUser[userId] = DEFAULT_CATEGORIES;
        } else {
          allCategoriesByUser[userId] = [];
        }
        
        // Merge und dedupliziere alle Kategorien
        const mergedCategories = mergeAndDeduplicateCategories(allCategoriesByUser);
        setCategories(mergedCategories);
        setLoading(false);
      });
      
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, hasGroup, members]);

  // ==========================================================================
  // MERGE & DEDUPLIZIERUNG
  // ==========================================================================

  /**
   * Merged Kategorien von allen Usern und entfernt Duplikate
   * Regel: Case-insensitive Name/ID-Matching
   */
  const mergeAndDeduplicateCategories = (categoriesByUser) => {
    const categoryMap = new Map(); // key: normalized id, value: category
    
    // Sammle alle Kategorien
    Object.values(categoriesByUser).forEach(userCategories => {
      userCategories.forEach(cat => {
        const normalizedId = cat.id.toLowerCase().trim();
        
        if (!categoryMap.has(normalizedId)) {
          // Erstes Vorkommen
          categoryMap.set(normalizedId, {
            id: cat.id,
            name: cat.name
          });
        }
      });
    });
    
    // Konvertiere Map zu Array
    return Array.from(categoryMap.values());
  };

  // ==========================================================================
  // CRUD FUNKTIONEN - Schreibt in eigenes private/{uid}/
  // ==========================================================================

  const addCategory = async (name, id) => {
    if (!user) return;

    const userCategoriesRef = ref(database, `categoriesV2/private/${user.uid}`);
    
    // Hole aktuelle eigene Kategorien
    const snapshot = await new Promise((resolve) => {
      onValue(userCategoriesRef, resolve, { onlyOnce: true });
    });
    
    const currentCategories = snapshot.val() || DEFAULT_CATEGORIES;

    // Duplikat-Check (case-insensitive)
    const normalizedId = id.toLowerCase().trim();
    const exists = currentCategories.some(
      c => c.id.toLowerCase().trim() === normalizedId
    );

    if (exists) {
      throw new Error('Diese Kategorie existiert bereits');
    }

    const newCategory = {
      id: id.toLowerCase().replace(/\s+/g, '-'),
      name: name.trim()
    };

    const updatedCategories = [...currentCategories, newCategory];

    try {
      await set(userCategoriesRef, updatedCategories);
    } catch (error) {
      console.error('❌ Fehler beim Hinzufügen:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!user) return;

    const userCategoriesRef = ref(database, `categoriesV2/private/${user.uid}`);
    
    // Hole aktuelle eigene Kategorien
    const snapshot = await new Promise((resolve) => {
      onValue(userCategoriesRef, resolve, { onlyOnce: true });
    });
    
    const currentCategories = snapshot.val() || DEFAULT_CATEGORIES;
    
    // Entferne Kategorie
    const updatedCategories = currentCategories.filter(c => c.id !== categoryId);

    try {
      await set(userCategoriesRef, updatedCategories);
    } catch (error) {
      console.error('❌ Fehler beim Löschen:', error);
      throw error;
    }
  };

  const getCategoryById = (id) => {
    return categories.find(c => c.id === id);
  };

  const getCategoryName = (id) => {
    const cat = getCategoryById(id);
    return cat ? cat.name : 'Sonstiges';
  };

  const value = {
    categories,
    loading,
    hasGroup,
    addCategory,
    deleteCategory,
    getCategoryById,
    getCategoryName,
    DEFAULT_CATEGORIES
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};