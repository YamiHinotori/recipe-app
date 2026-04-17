/**
 * StoreLayoutsContext - VEREINFACHT wie Recipes/Products
 * 
 * KONZEPT:
 * - Jeder User hat seine Stores in storeLayoutsV2/private/{uid}/
 * - Wenn User in Gruppe ist: Sieht alle Stores aller Gruppenmitglieder
 * - Merged ALLE Kategorien von ALLEN Stores für ProductManager
 * - KEINE separaten Gruppen-Stores!
 * 
 * FIREBASE STRUKTUR:
 * ```
 * storeLayoutsV2/
 *   private/
 *     {userId}/
 *       {storeId}/
 *         name: "REWE"
 *         categories: [...]
 *         createdAt: "..."
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useGroup } from './GroupContext.jsx';

const StoreLayoutsContext = createContext();

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

export const useStoreLayouts = () => {
  const context = useContext(StoreLayoutsContext);
  if (!context) {
    throw new Error('useStoreLayouts must be used within StoreLayoutsProvider');
  }
  return context;
};

export const StoreLayoutsProvider = ({ children }) => {
  const { user } = useAuth();
  const { group, hasGroup, members } = useGroup();
  
  const [storeLayouts, setStoreLayouts] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FIREBASE SYNC - LÄDT STORES VON ALLEN GRUPPENMITGLIEDERN
  // ==========================================================================
  
  useEffect(() => {
    if (!user) {
      setStoreLayouts([]);
      setSelectedStoreId(null);
      setLoading(false);
      return;
    }

    // Liste der User-IDs deren Stores geladen werden sollen
    const userIdsToLoad = hasGroup && members.length > 0
      ? members.map(m => m.uid)  // Alle Gruppenmitglieder
      : [user.uid];               // Nur ich

    const unsubscribers = [];
    const allStoresByUser = {}; // { userId: {...stores} }

    // Für jeden User: Lade seine Stores
    userIdsToLoad.forEach(userId => {
      const userStoresRef = ref(database, `storeLayoutsV2/private/${userId}`);
      
      const unsubscribe = onValue(userStoresRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          allStoresByUser[userId] = data;
        } else {
          allStoresByUser[userId] = {};
        }
        
        // Merge alle Stores mit Ownership
        const mergedStores = mergeStores(allStoresByUser, userId === user.uid);
        setStoreLayouts(mergedStores);
        
        // Auto-Select ersten Store wenn noch keiner ausgewählt
        if (!selectedStoreId && mergedStores.length > 0) {
          setSelectedStoreId(mergedStores[0].id);
        }
        
        setLoading(false);
      });
      
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, hasGroup, members]);

  // ==========================================================================
  // MERGE STORES & KATEGORIEN
  // ==========================================================================

  /**
   * Merged Stores von allen Usern mit Ownership-Tracking
   */
  const mergeStores = (storesByUser, isCurrentUser) => {
    const allStores = [];
    
    Object.entries(storesByUser).forEach(([userId, userStores]) => {
      Object.entries(userStores).forEach(([storeId, storeData]) => {
        allStores.push({
          id: storeId,
          ...storeData,
          _ownerId: userId,
          _isOwn: userId === user.uid
        });
      });
    });
    
    return allStores;
  };

  /**
   * Merged ALLE Kategorien von ALLEN Stores
   * → Für ProductManager damit alle Kategorien bekannt sind!
   */
  const getAllCategories = () => {
    const categoryMap = new Map();
    
    // Sammle alle Kategorien von allen Stores
    storeLayouts.forEach(store => {
      if (store.categories && Array.isArray(store.categories)) {
        store.categories.forEach(cat => {
          if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.id, cat);
          }
        });
      }
    });
    
    // Füge DEFAULT_CATEGORIES hinzu (falls nicht vorhanden)
    DEFAULT_CATEGORIES.forEach(cat => {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, cat);
      }
    });
    
    // Sortiere nach Order
    return Array.from(categoryMap.values()).sort((a, b) => a.order - b.order);
  };

  // ==========================================================================
  // CRUD FUNKTIONEN - Schreibt in eigenes private/{uid}/
  // ==========================================================================

  const createStore = async (storeName) => {
    if (!user) return;

    const userStoresRef = ref(database, `storeLayoutsV2/private/${user.uid}`);
    const newStoreRef = push(userStoresRef);
    
    try {
      await set(newStoreRef, {
        name: storeName,
        categoryOrder: [],  // ← Leer, User muss Kategorien hinzufügen
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Store erstellt:', storeName);
      return newStoreRef.key;
    } catch (error) {
      console.error('❌ Fehler beim Erstellen:', error);
      throw error;
    }
  };

  const renameStore = async (storeId, newName) => {
    if (!user) return;

    // Finde Store und prüfe Ownership
    const store = storeLayouts.find(s => s.id === storeId);
    if (!store || !store._isOwn) {
      throw new Error('Du kannst nur deine eigenen Stores umbenennen');
    }

    const storeRef = ref(database, `storeLayoutsV2/private/${user.uid}/${storeId}/name`);
    
    try {
      await set(storeRef, newName);
      console.log('✅ Store umbenannt:', newName);
    } catch (error) {
      console.error('❌ Fehler beim Umbenennen:', error);
      throw error;
    }
  };

  const deleteStore = async (storeId) => {
    if (!user) return;

    // Finde Store und prüfe Ownership
    const store = storeLayouts.find(s => s.id === storeId);
    if (!store || !store._isOwn) {
      throw new Error('Du kannst nur deine eigenen Stores löschen');
    }

    const storeRef = ref(database, `storeLayoutsV2/private/${user.uid}/${storeId}`);
    
    try {
      await remove(storeRef);
      
      // Wenn gelöschter Store ausgewählt war, wähle anderen
      if (selectedStoreId === storeId) {
        const remaining = storeLayouts.filter(s => s.id !== storeId);
        if (remaining.length > 0) {
          setSelectedStoreId(remaining[0].id);
        } else {
          setSelectedStoreId(null);
        }
      }
      
      console.log('✅ Store gelöscht');
    } catch (error) {
      console.error('❌ Fehler beim Löschen:', error);
      throw error;
    }
  };

  const updateStoreCategoryOrder = async (storeId, categoryOrder) => {
    if (!user) return;

    // Finde Store und prüfe Ownership
    const store = storeLayouts.find(s => s.id === storeId);
    if (!store || !store._isOwn) {
      throw new Error('Du kannst nur deine eigenen Stores bearbeiten');
    }

    const orderRef = ref(database, `storeLayoutsV2/private/${user.uid}/${storeId}/categoryOrder`);
    
    try {
      await set(orderRef, categoryOrder);
      console.log('✅ Kategorien-Reihenfolge aktualisiert');
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  // ==========================================================================
  // HELPER FUNKTIONEN
  // ==========================================================================

  const getActiveStore = () => {
    if (!selectedStoreId) return null;
    return storeLayouts.find(s => s.id === selectedStoreId);
  };

  /**
   * Gibt Kategorien für aktiven Store zurück
   * → Sortiert nach categoryOrder des Stores
   * 
   * WICHTIG: Nutzt globale Kategorien aus CategoriesContext!
   * Diese Funktion wird von ShoppingListContext aufgerufen
   */
  const getActiveCategories = (globalCategories) => {
    const store = getActiveStore();
    if (!store || !globalCategories) return [];
    
    const categoryOrder = store.categoryOrder || [];
    
    // Sortiere Kategorien nach Store-Reihenfolge
    const orderedCategories = [];
    categoryOrder.forEach((catId, index) => {
      const cat = globalCategories.find(c => c.id === catId);
      if (cat) {
        orderedCategories.push({
          ...cat,
          order: index + 1
        });
      }
    });
    
    return orderedCategories;
  };

  /**
   * DEPRECATED: getAllCategories nicht mehr nötig
   * Nutze stattdessen useCategories() aus CategoriesContext!
   */

  const value = {
    storeLayouts,
    selectedStoreId,
    setSelectedStoreId,
    loading,
    hasGroup,
    createStore,
    renameStore,
    deleteStore,
    updateStoreCategoryOrder,  // ← Geändert!
    getActiveStore,
    getActiveCategories  // ← Braucht jetzt globalCategories Parameter
  };

  return (
    <StoreLayoutsContext.Provider value={value}>
      {children}
    </StoreLayoutsContext.Provider>
  );
};