import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, set, onValue, remove, update } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

const ShoppingListContext = createContext();

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  return context;
};

export const ShoppingListProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    // Realtime Listener für die Einkaufsliste
    const shoppingListRef = ref(database, `shoppingLists/${user.uid}/items`);
    
    const unsubscribe = onValue(shoppingListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Konvertiere Object zu Array
        const itemsArray = Object.entries(data).map(([id, item]) => ({
          id,
          ...item
        }));
        setItems(itemsArray);
      } else {
        setItems([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Rezept zur Einkaufsliste hinzufügen
  const addRecipeToList = async (recipe) => {
    if (!user) return;

    const updates = {};
    
    recipe.ingredients.forEach(ingredient => {
      // Suche nach existierendem Item mit gleichem Namen
      const existingItem = items.find(
        item => item.item.toLowerCase() === ingredient.item.toLowerCase()
      );

      if (existingItem) {
        // Item existiert bereits - Mengen addieren
        if (existingItem.unit === ingredient.unit && ingredient.amount && !isNaN(parseFloat(ingredient.amount))) {
          const existingAmount = parseFloat(existingItem.amount) || 0;
          const newAmount = parseFloat(ingredient.amount) || 0;
          updates[`shoppingLists/${user.uid}/items/${existingItem.id}`] = {
            ...existingItem,
            amount: (existingAmount + newAmount).toString(),
            recipes: [...(existingItem.recipes || []), recipe.title]
          };
        } else {
          // Unterschiedliche Einheiten - als neues Item
          const newId = Date.now() + Math.random().toString(36);
          updates[`shoppingLists/${user.uid}/items/${newId}`] = {
            ...ingredient,
            checked: false,
            recipes: [recipe.title]
          };
        }
      } else {
        // Neues Item
        const newId = Date.now() + Math.random().toString(36);
        updates[`shoppingLists/${user.uid}/items/${newId}`] = {
          ...ingredient,
          checked: false,
          recipes: [recipe.title]
        };
      }
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  // Einzelnes Item hinzufügen
  const addItem = async (item, amount, unit) => {
    if (!user) return;

    const newId = Date.now().toString();
    const itemRef = ref(database, `shoppingLists/${user.uid}/items/${newId}`);
    
    try {
      await set(itemRef, {
        item,
        amount,
        unit,
        checked: false,
        recipes: []
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  // Item abhaken/abhaken rückgängig
  const toggleItem = async (id) => {
    if (!user) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    const itemRef = ref(database, `shoppingLists/${user.uid}/items/${id}`);
    
    try {
      await update(itemRef, {
        checked: !item.checked
      });
    } catch (error) {
      console.error('Fehler beim Abhaken:', error);
    }
  };

  // Item löschen
  const removeItem = async (id) => {
    if (!user) return;

    const itemRef = ref(database, `shoppingLists/${user.uid}/items/${id}`);
    
    try {
      await remove(itemRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  // Item bearbeiten
  const updateItem = async (id, updates) => {
    if (!user) return;

    const itemRef = ref(database, `shoppingLists/${user.uid}/items/${id}`);
    
    try {
      await update(itemRef, updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  // Abgehakte Items entfernen
  const clearCheckedItems = async () => {
    if (!user) return;

    const updates = {};
    items.forEach(item => {
      if (item.checked) {
        updates[`shoppingLists/${user.uid}/items/${item.id}`] = null;
      }
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Aufräumen:', error);
    }
  };

  // Komplette Liste löschen
  const clearAll = async () => {
    if (!user) return;

    const listRef = ref(database, `shoppingLists/${user.uid}/items`);
    
    try {
      await remove(listRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const value = {
    items,
    addRecipeToList,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    clearCheckedItems,
    clearAll
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};