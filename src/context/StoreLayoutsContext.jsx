import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

const StoreLayoutsContext = createContext();

// Standard-Kategorien als Basis
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
  const [storeLayouts, setStoreLayouts] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStoreLayouts([]);
      setSelectedStoreId(null);
      return;
    }

    // Listener für Store Layouts
    const layoutsRef = ref(database, 'storeLayouts');
    
    const unsubscribe = onValue(layoutsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Store Layouts geladen:', data);
      
      if (data) {
        const layoutsArray = Object.entries(data).map(([id, layout]) => ({
          id,
          ...layout
        }));
        setStoreLayouts(layoutsArray);
        
        // Setze ersten Store als Standard wenn noch keiner ausgewählt
        if (!selectedStoreId && layoutsArray.length > 0) {
          setSelectedStoreId(layoutsArray[0].id);
        }
      } else {
        setStoreLayouts([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Neuen Store erstellen
  const createStore = async (storeName) => {
    if (!user) return;

    const layoutsRef = ref(database, 'storeLayouts');
    const newStoreRef = push(layoutsRef);
    
    try {
      await set(newStoreRef, {
        name: storeName,
        categories: DEFAULT_CATEGORIES,
        createdAt: new Date().toISOString()
      });
      
      console.log('Neuer Store erstellt:', storeName);
      return newStoreRef.key;
    } catch (error) {
      console.error('Fehler beim Erstellen des Stores:', error);
      throw error;
    }
  };

  // Store umbenennen
  const renameStore = async (storeId, newName) => {
    if (!user) return;

    const storeRef = ref(database, `storeLayouts/${storeId}/name`);
    
    try {
      await set(storeRef, newName);
      console.log('Store umbenannt:', newName);
    } catch (error) {
      console.error('Fehler beim Umbenennen:', error);
      throw error;
    }
  };

  // Store löschen
  const deleteStore = async (storeId) => {
    if (!user) return;

    const storeRef = ref(database, `storeLayouts/${storeId}`);
    
    try {
      await remove(storeRef);
      
      // Wenn gelöschter Store ausgewählt war, wähle anderen
      if (selectedStoreId === storeId && storeLayouts.length > 1) {
        const remaining = storeLayouts.filter(s => s.id !== storeId);
        if (remaining.length > 0) {
          setSelectedStoreId(remaining[0].id);
        }
      }
      
      console.log('Store gelöscht');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  // Kategorien eines Stores aktualisieren
  const updateStoreCategories = async (storeId, categories) => {
    if (!user) return;

    const categoriesRef = ref(database, `storeLayouts/${storeId}/categories`);
    
    try {
      await set(categoriesRef, categories);
      console.log('Store-Kategorien aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  // Hole aktiven Store
  const getActiveStore = () => {
    if (!selectedStoreId) return null;
    return storeLayouts.find(s => s.id === selectedStoreId);
  };

  // Hole Kategorien des aktiven Stores
  const getActiveCategories = () => {
    const store = getActiveStore();
    return store?.categories || DEFAULT_CATEGORIES;
  };

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

  return (
    <StoreLayoutsContext.Provider value={value}>
      {children}
    </StoreLayoutsContext.Provider>
  );
};