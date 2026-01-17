import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, set, onValue, remove, update } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

const ShoppingListContext = createContext();
const SHOPPING_LIST_PATH = 'shoppingLists/shared/items';
const STORE_LAYOUT_PATH = 'shoppingLists/shared/storeLayout';
const PRODUCT_DATABASE_PATH = 'productDatabase';

// Standard-Laden-Layout (kann später angepasst werden)
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

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  return context;
};

export const ShoppingListProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [storeCategories, setStoreCategories] = useState(DEFAULT_STORE_CATEGORIES);
  const [productDatabase, setProductDatabase] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    // Realtime Listener für die Einkaufsliste
    const shoppingListRef = ref(database, SHOPPING_LIST_PATH);
    
    const unsubscribe = onValue(shoppingListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemsArray = Object.entries(data).map(([id, item]) => ({
          id,
          ...item
        }));
        // Sortiere nach order Property
        itemsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(itemsArray);
      } else {
        setItems([]);
      }
    });

    // Listener für Store Layout
    const layoutRef = ref(database, STORE_LAYOUT_PATH);
    const layoutUnsubscribe = onValue(layoutRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStoreCategories(data);
      }
    });

    // Listener für Produktdatenbank
    const productsRef = ref(database, PRODUCT_DATABASE_PATH);
    const productsUnsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        setProductDatabase(data);
        console.log('Produktdatenbank geladen für Kategorie-Lookup:', data.length, 'Produkte');
      }
    });

    return () => {
      unsubscribe();
      layoutUnsubscribe();
      productsUnsubscribe();
    };
  }, [user]);

  // Hilfsfunktion: Finde Kategorie für ein Produkt
  const findCategoryForProduct = (productName) => {
    if (!productName) return 'sonstiges';
    
    const normalizedName = productName.toLowerCase().trim();
    
    // Suche nach exakter Übereinstimmung
    let product = productDatabase.find(p => 
      p.name.toLowerCase().trim() === normalizedName
    );
    
    if (product && product.category) {
      console.log(`Kategorie gefunden für "${productName}": ${product.category}`);
      return product.category;
    }
    
    // Suche nach Teilübereinstimmung (z.B. "Tomaten (Dose)" findet "Tomaten")
    product = productDatabase.find(p => {
      const dbName = p.name.toLowerCase().trim();
      return normalizedName.includes(dbName) || dbName.includes(normalizedName);
    });
    
    if (product && product.category) {
      console.log(`Kategorie gefunden (Teilübereinstimmung) für "${productName}": ${product.category}`);
      return product.category;
    }
    
    console.log(`Keine Kategorie gefunden für "${productName}" - verwende "sonstiges"`);
    return 'sonstiges';
  };

  // Rezept zur Einkaufsliste hinzufügen
  const addRecipeToList = async (recipe) => {
    if (!user) return;

    const updates = {};
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
    let orderCounter = maxOrder + 1;
    
    recipe.ingredients.forEach(ingredient => {
      const existingItem = items.find(
        item => item.item.toLowerCase() === ingredient.item.toLowerCase()
      );

      // Bestimme die Kategorie aus der Produktdatenbank
      const category = findCategoryForProduct(ingredient.item);

      if (existingItem) {
        if (existingItem.unit === ingredient.unit && ingredient.amount && !isNaN(parseFloat(ingredient.amount))) {
          const existingAmount = parseFloat(existingItem.amount) || 0;
          const newAmount = parseFloat(ingredient.amount) || 0;
          updates[`${SHOPPING_LIST_PATH}/${existingItem.id}`] = {
            ...existingItem,
            amount: (existingAmount + newAmount).toString(),
            recipes: [...(existingItem.recipes || []), recipe.title]
          };
        } else {
          const newId = Date.now().toString() + Math.random().toString(36).substring(2);
          updates[`${SHOPPING_LIST_PATH}/${newId}`] = {
            ...ingredient,
            checked: false,
            recipes: [recipe.title],
            order: orderCounter++,
            category // Verwende gefundene Kategorie
          };
        }
      } else {
        const newId = Date.now().toString() + Math.random().toString(36).substring(2);
        updates[`${SHOPPING_LIST_PATH}/${newId}`] = {
          ...ingredient,
          checked: false,
          recipes: [recipe.title],
          order: orderCounter++,
          category // Verwende gefundene Kategorie
        };
      }
    });

    try {
      await update(ref(database), updates);
      console.log('Rezept zur Einkaufsliste hinzugefügt mit automatischen Kategorien');
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  // Einzelnes Item hinzufügen
  const addItem = async (item, amount, unit, category = 'sonstiges') => {
    if (!user) return;

    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order || 0)) : 0;
    const newId = Date.now().toString();
    const itemRef = ref(database, `${SHOPPING_LIST_PATH}/${newId}`);
    
    try {
      await set(itemRef, {
        item,
        amount,
        unit,
        checked: false,
        recipes: [],
        order: maxOrder + 1,
        category
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

    const itemRef = ref(database, `${SHOPPING_LIST_PATH}/${id}`);
    
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

    const itemRef = ref(database, `${SHOPPING_LIST_PATH}/${id}`);
    
    try {
      await remove(itemRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  // Item bearbeiten
  const updateItem = async (id, updates) => {
    if (!user) return;

    const itemRef = ref(database, `${SHOPPING_LIST_PATH}/${id}`);
    
    try {
      await update(itemRef, updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  // Reihenfolge ändern (Drag & Drop)
  const reorderItems = async (reorderedItems) => {
    if (!user) return;

    const updates = {};
    reorderedItems.forEach((item, index) => {
      updates[`${SHOPPING_LIST_PATH}/${item.id}/order`] = index;
    });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Sortieren:', error);
    }
  };

  // Nach Laden-Layout sortieren
  const sortByStoreLayout = async () => {
    if (!user) return;

    const updates = {};
    
    // Gruppiere Items nach Kategorie
    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.category || 'sonstiges';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    // Sortiere nach Store Layout
    let order = 0;
    storeCategories
      .sort((a, b) => a.order - b.order)
      .forEach(category => {
        const categoryItems = itemsByCategory[category.id] || [];
        categoryItems.forEach(item => {
          updates[`${SHOPPING_LIST_PATH}/${item.id}/order`] = order++;
        });
      });

    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('Fehler beim Sortieren:', error);
    }
  };

  // Store Layout aktualisieren
  const updateStoreLayout = async (newLayout) => {
    if (!user) return;

    const layoutRef = ref(database, STORE_LAYOUT_PATH);
    
    try {
      await set(layoutRef, newLayout);
    } catch (error) {
      console.error('Fehler beim Speichern des Layouts:', error);
    }
  };

  // Abgehakte Items entfernen
  const clearCheckedItems = async () => {
    if (!user) return;

    const updates = {};
    items.forEach(item => {
      if (item.checked) {
        updates[`${SHOPPING_LIST_PATH}/${item.id}`] = null;
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

    const listRef = ref(database, SHOPPING_LIST_PATH);
    
    try {
      await remove(listRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const value = {
    items,
    storeCategories,
    addRecipeToList,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    reorderItems,
    sortByStoreLayout,
    updateStoreLayout,
    clearCheckedItems,
    clearAll
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};