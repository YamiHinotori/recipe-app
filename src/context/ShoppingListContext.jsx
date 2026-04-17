/**
 * ShoppingListContext - Einkaufsliste mit Gruppen-Support
 * 
 * V2: ZWEI SEPARATE LISTEN
 * - Persönlich (private): Nur eigene Items, niemand sonst sieht sie
 * - Gemeinsam (groups): Gemeinsame Liste, alle Gruppenmitglieder sehen & nutzen
 * 
 * FIREBASE STRUKTUR:
 * ```
 * shoppingListsV2/
 *   private/
 *     {userId}/          ← Persönliche Liste (nur dieser User)
 *       {itemId}/
 *         item, amount, unit, checked, category, order, recipes
 *   
 *   groups/
 *     {groupId}/         ← Gemeinsame Liste (alle Members)
 *       {itemId}/
 *         item, amount, unit, checked, category, order, recipes
 *         addedBy: "user-id"
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { database } from '../firebaseConfig';
import { ref, set, onValue, remove, update } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useGroup } from './GroupContext.jsx';
import { useStoreLayouts } from './StoreLayoutsContext.jsx';
import { useCategories } from './CategoriesContext';
import { useProductDatabase } from './ProductDatabaseContext';

const ShoppingListContext = createContext();

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  return context;
};

export const ShoppingListProvider = ({ children }) => {
  const { user } = useAuth();
  const { group, hasGroup } = useGroup();
  const { getActiveCategories, selectedStoreId, storeLayouts } = useStoreLayouts();
  const { categories: globalCategories } = useCategories();
  const { products } = useProductDatabase();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('group'); // 'private' oder 'group' - Standard: gemeinsam
  
  // Scope automatisch nach Gruppen-Status setzen
  // - In Gruppe: Standard ist 'group'
  // - Keine Gruppe: Standard ist 'private' (kann nicht 'group' sein)
  useEffect(() => {
    if (hasGroup) {
      setScope('group');
    } else {
      setScope('private');
    }
  }, [hasGroup]);
  
  const storeCategories = useMemo(() => {
    return getActiveCategories(globalCategories);
  }, [globalCategories, selectedStoreId]);

  // ==========================================================================
  // FIREBASE SYNC - LÄDT JE NACH SCOPE
  // ==========================================================================
  
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let listPath;
    
    if (scope === 'private') {
      // PERSÖNLICHE LISTE: Nur eigene Items
      listPath = `shoppingListsV2/private/${user.uid}`;
    } else {
      // GEMEINSAME LISTE: Items der Gruppe
      if (!group?.id) {
        setItems([]);
        setLoading(false);
        return;
      }
      listPath = `shoppingListsV2/groups/${group.id}`;
    }

    const listRef = ref(database, listPath);
    
    const unsubscribe = onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const itemsArray = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
          _isOwn: scope === 'private' || item.addedBy === user.uid
        }));
        
        itemsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(itemsArray);
      } else {
        setItems([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, scope, group]);

  // ==========================================================================
  // HELPER FUNKTIONEN
  // ==========================================================================

  const findCategoryForProduct = (productName) => {
    if (!productName) return 'sonstiges';
    
    const normalizedName = productName.toLowerCase().trim();
    
    // Suche in ProductDatabase
    const product = products.find(p => 
      p.name.toLowerCase().trim() === normalizedName ||
      normalizedName.includes(p.name.toLowerCase().trim()) ||
      p.name.toLowerCase().trim().includes(normalizedName)
    );
    
    return product?.category || 'sonstiges';
  };

  const getListPath = () => {
    if (scope === 'private') {
      return `shoppingListsV2/private/${user.uid}`;
    } else {
      // Bei scope 'group' ABER keine Gruppe: return null
      if (!group?.id) return null;
      return `shoppingListsV2/groups/${group.id}`;
    }
  };

  // ==========================================================================
  // CRUD FUNKTIONEN
  // ==========================================================================

  const addRecipeToList = async (recipe, targetScope = null) => {
    if (!user) return;

    // Verwende targetScope wenn übergeben, sonst aktuellen scope
    const useScope = targetScope || scope;
    
    let listPath;
    if (useScope === 'private') {
      listPath = `shoppingListsV2/private/${user.uid}`;
    } else {
      // Bei scope 'group' ABER keine Gruppe: Abbruch
      if (!group?.id) {
        console.error('Keine Gruppe vorhanden - kann nicht zur gemeinsamen Liste hinzufügen');
        return;
      }
      listPath = `shoppingListsV2/groups/${group.id}`;
    }
    
    if (!listPath) return;

    const updates = {};
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
    let orderCounter = maxOrder + 1;
    
    recipe.ingredients.forEach(ingredient => {
      const existingItem = items.find(
        item => item.item.toLowerCase() === ingredient.item.toLowerCase()
      );

      const category = findCategoryForProduct(ingredient.item);

      if (existingItem) {
        if (existingItem.unit === ingredient.unit && ingredient.amount && !isNaN(parseFloat(ingredient.amount))) {
          const existingAmount = parseFloat(existingItem.amount) || 0;
          const newAmount = parseFloat(ingredient.amount) || 0;
          
          const itemData = {
            ...existingItem,
            amount: (existingAmount + newAmount).toString(),
            recipes: [...(existingItem.recipes || []), recipe.title]
          };
          
          // Bei Gruppen-Liste: addedBy setzen
          if (useScope === 'group') {
            itemData.addedBy = user.uid;
          }
          
          updates[`${listPath}/${existingItem.id}`] = itemData;
        } else {
          const newId = Date.now().toString() + Math.random().toString(36).substring(2);
          const itemData = {
            ...ingredient,
            checked: false,
            recipes: [recipe.title],
            order: orderCounter++,
            category
          };
          
          if (useScope === 'group') {
            itemData.addedBy = user.uid;
          }
          
          updates[`${listPath}/${newId}`] = itemData;
        }
      } else {
        const newId = Date.now().toString() + Math.random().toString(36).substring(2);
        const itemData = {
          ...ingredient,
          checked: false,
          recipes: [recipe.title],
          order: orderCounter++,
          category
        };
        
        if (useScope === 'group') {
          itemData.addedBy = user.uid;
        }
        
        updates[`${listPath}/${newId}`] = itemData;
      }
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  const addItem = async (item, amount, unit, category = 'sonstiges') => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
    const newId = Date.now().toString();
    const itemRef = ref(database, `${listPath}/${newId}`);
    
    try {
      const itemData = {
        item,
        amount,
        unit,
        checked: false,
        recipes: [],
        order: maxOrder + 1,
        category
      };
      
      // Bei Gruppen-Liste: addedBy hinzufügen
      if (scope === 'group') {
        itemData.addedBy = user.uid;
      }
      
      await set(itemRef, itemData);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  const toggleItem = async (id) => {
    if (!user) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    const listPath = getListPath();
    if (!listPath) return;

    const itemRef = ref(database, `${listPath}/${id}`);
    
    try {
      await update(itemRef, {
        checked: !item.checked
      });
    } catch (error) {
      console.error('Fehler beim Abhaken:', error);
    }
  };

  const removeItem = async (id) => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const itemRef = ref(database, `${listPath}/${id}`);
    
    try {
      await remove(itemRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const updateItem = async (id, updates) => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const itemRef = ref(database, `${listPath}/${id}`);
    
    try {
      await update(itemRef, updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  const reorderItems = async (reorderedItems) => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const updates = {};
    reorderedItems.forEach((item, index) => {
      updates[`${listPath}/${item.id}/order`] = index;
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Sortieren:', error);
    }
  };

  const sortByStoreLayout = async (storeId = null) => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const updates = {};

    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.category || 'sonstiges';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    // Wenn storeId übergeben wurde, Kategorien direkt aus storeLayouts berechnen
    // (vermeidet Timing-Problem mit veralteter storeCategories-Closure)
    let categoriesToSort = storeCategories;
    if (storeId) {
      const targetStore = storeLayouts.find(s => s.id === storeId);
      if (targetStore) {
        const categoryOrder = targetStore.categoryOrder || [];
        const computed = categoryOrder
          .map((catId, index) => {
            const cat = globalCategories.find(c => c.id === catId);
            return cat ? { ...cat, order: index + 1 } : null;
          })
          .filter(Boolean);
        if (computed.length > 0) {
          categoriesToSort = computed;
        }
      }
    }

    let order = 0;
    categoriesToSort
      .sort((a, b) => a.order - b.order)
      .forEach(category => {
        const categoryItems = itemsByCategory[category.id] || [];
        categoryItems.forEach(item => {
          updates[`${listPath}/${item.id}/order`] = order++;
        });
      });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Sortieren:', error);
    }
  };

  const clearCheckedItems = async () => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const updates = {};
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

  const clearAll = async () => {
    if (!user) return;

    const listPath = getListPath();
    if (!listPath) return;

    const listRef = ref(database, listPath);
    
    try {
      await remove(listRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const value = {
    items,
    storeCategories,
    scope,
    setScope,
    hasGroup,
    loading,
    addRecipeToList,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    reorderItems,
    sortByStoreLayout,
    clearCheckedItems,
    clearAll
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};