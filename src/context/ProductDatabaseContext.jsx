/**
 * ProductDatabaseContext - VEREINFACHT wie RecipeContext
 * 
 * KONZEPT:
 * - Jeder User hat seine Produkte in productDatabaseV2/private/{uid}/
 * - Wenn User in Gruppe ist: Sieht alle Produkte aller Gruppenmitglieder
 * - Auto-Deduplizierung (case-insensitive)
 * - KEINE separaten Gruppen-Produkte!
 * 
 * FIREBASE STRUKTUR:
 * ```
 * productDatabaseV2/
 *   private/
 *     {userId}/
 *       0: { name, category, commonUnit }
 *       1: { ... }
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useGroup } from './GroupContext.jsx';

const ProductDatabaseContext = createContext();

// DEFAULT_PRODUCTS als Initial-Daten
const DEFAULT_PRODUCTS = [
  // Obst & Gemüse
  { name: 'Tomaten', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Gurken', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Paprika', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Zwiebeln', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Knoblauch', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Kartoffeln', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Karotten', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Äpfel', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Bananen', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Salat', category: 'obst-gemuese', commonUnit: 'Stück' },
  
  // Backwaren
  { name: 'Brot', category: 'backwaren', commonUnit: 'Stück' },
  { name: 'Brötchen', category: 'backwaren', commonUnit: 'Stück' },
  { name: 'Toast', category: 'backwaren', commonUnit: 'Packung' },
  
  // Fleisch & Fisch
  { name: 'Hähnchenbrust', category: 'fleisch-fisch', commonUnit: 'kg' },
  { name: 'Hackfleisch', category: 'fleisch-fisch', commonUnit: 'kg' },
  { name: 'Lachs', category: 'fleisch-fisch', commonUnit: 'kg' },
  
  // Milchprodukte
  { name: 'Milch', category: 'milchprodukte', commonUnit: 'l' },
  { name: 'Butter', category: 'milchprodukte', commonUnit: 'Stück' },
  { name: 'Käse', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Joghurt', category: 'milchprodukte', commonUnit: 'Becher' },
  { name: 'Eier', category: 'milchprodukte', commonUnit: 'Stück' },
  
  // Tiefkühl
  { name: 'Pizza', category: 'tiefkuehl', commonUnit: 'Stück' },
  { name: 'Erbsen (TK)', category: 'tiefkuehl', commonUnit: 'Packung' },
  
  // Konserven
  { name: 'Tomaten (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Mais (Dose)', category: 'konserven', commonUnit: 'Dose' },
  
  // Nudeln, Reis & Getreide
  { name: 'Spaghetti', category: 'nudeln-reis', commonUnit: 'Packung' },
  { name: 'Penne', category: 'nudeln-reis', commonUnit: 'Packung' },
  { name: 'Reis', category: 'nudeln-reis', commonUnit: 'kg' },
  { name: 'Mehl', category: 'nudeln-reis', commonUnit: 'kg' },
  
  // Gewürze & Öle
  { name: 'Salz', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Pfeffer', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Olivenöl', category: 'gewuerze', commonUnit: 'Flasche' },
  
  // Getränke
  { name: 'Wasser', category: 'getraenke', commonUnit: 'Kasten' },
  { name: 'Saft', category: 'getraenke', commonUnit: 'Flasche' },
  
  // Süßigkeiten
  { name: 'Schokolade', category: 'suessigkeiten', commonUnit: 'Tafel' },
  { name: 'Chips', category: 'suessigkeiten', commonUnit: 'Tüte' },
  
  // Haushalt
  { name: 'Küchenrolle', category: 'haushalt', commonUnit: 'Packung' },
  { name: 'Spülmittel', category: 'haushalt', commonUnit: 'Flasche' }
];

export const useProductDatabase = () => {
  const context = useContext(ProductDatabaseContext);
  if (!context) {
    throw new Error('useProductDatabase must be used within ProductDatabaseProvider');
  }
  return context;
};

export const ProductDatabaseProvider = ({ children }) => {
  const { user } = useAuth();
  const { group, hasGroup, members } = useGroup();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FIREBASE SYNC - LÄDT PRODUKTE VON ALLEN GRUPPENMITGLIEDERN
  // ==========================================================================
  
  useEffect(() => {
    if (!user) {
      setProducts(DEFAULT_PRODUCTS);
      setLoading(false);
      return;
    }

    // Liste der User-IDs deren Produkte geladen werden sollen
    const userIdsToLoad = hasGroup && members.length > 0
      ? members.map(m => m.uid)  // Alle Gruppenmitglieder
      : [user.uid];               // Nur ich

    const unsubscribers = [];
    const allProductsByUser = {}; // { userId: [...products] }

    // Für jeden User: Lade seine Produkte
    userIdsToLoad.forEach(userId => {
      const userProductsRef = ref(database, `productDatabaseV2/private/${userId}`);
      
      const unsubscribe = onValue(userProductsRef, async (snapshot) => {
        const data = snapshot.val();
        
        if (data && Array.isArray(data)) {
          allProductsByUser[userId] = data;
        } else if (data === null && userId === user.uid) {
          // Nur für eigenen User: Initialisiere mit Defaults
          await set(userProductsRef, DEFAULT_PRODUCTS);
          allProductsByUser[userId] = DEFAULT_PRODUCTS;
        } else {
          allProductsByUser[userId] = [];
        }
        
        // Merge und dedupliziere alle Produkte
        const mergedProducts = mergeAndDeduplicateProducts(allProductsByUser);
        setProducts(mergedProducts);
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
   * Merged Produkte von allen Usern und entfernt Duplikate
   * 
   * Regel: Case-insensitive Name-Matching
   * Bevorzugung: "Schönerer" Name (Großbuchstaben am Anfang)
   * 
   * WICHTIG: Speichert _ownerId und _originalIndex für Edit/Delete!
   */
  const mergeAndDeduplicateProducts = (productsByUser) => {
    const productMap = new Map(); // key: normalized name, value: {product, ownerId, originalIndex}
    
    // Sammle alle Produkte mit Ownership
    Object.entries(productsByUser).forEach(([userId, userProducts]) => {
      userProducts.forEach((product, originalIndex) => {
        const normalizedName = product.name.toLowerCase().trim();
        
        if (!productMap.has(normalizedName)) {
          // Erstes Vorkommen - nehme es
          productMap.set(normalizedName, {
            ...product,
            _ownerId: userId,
            _originalIndex: originalIndex,
            _isOwn: userId === user.uid
          });
        } else {
          // Duplikat gefunden
          const existing = productMap.get(normalizedName);
          
          // Bevorzuge eigene Produkte
          if (userId === user.uid && existing._ownerId !== user.uid) {
            productMap.set(normalizedName, {
              ...product,
              _ownerId: userId,
              _originalIndex: originalIndex,
              _isOwn: true
            });
          }
          // Sonst: Bevorzuge Namen mit Großbuchstaben am Anfang
          else if (product.name[0] === product.name[0].toUpperCase() && 
                   existing.name[0] === existing.name[0].toLowerCase()) {
            productMap.set(normalizedName, {
              ...existing,
              name: product.name // Nehme schöneren Namen, behalte aber ownership
            });
          }
        }
      });
    });
    
    // Konvertiere Map zu Array
    return Array.from(productMap.values());
  };

  // ==========================================================================
  // CRUD FUNKTIONEN - Schreibt in eigenes private/{uid}/
  // ==========================================================================

  const addProduct = async (name, category, commonUnit) => {
    if (!user) return;

    const userProductsRef = ref(database, `productDatabaseV2/private/${user.uid}`);
    
    // Hole aktuelle eigene Produkte
    const snapshot = await new Promise((resolve) => {
      onValue(userProductsRef, resolve, { onlyOnce: true });
    });
    
    const currentProducts = snapshot.val() || [];

    // Duplikat-Check in EIGENEN Produkten (case-insensitive)
    const normalizedName = name.toLowerCase().trim();
    const exists = currentProducts.some(
      p => p.name.toLowerCase().trim() === normalizedName
    );

    if (exists) {
      throw new Error('Du hast dieses Produkt bereits hinzugefügt');
    }

    const newProduct = {
      name: name.trim(),
      category,
      commonUnit
    };

    const updatedProducts = [...currentProducts, newProduct];

    try {
      await set(userProductsRef, updatedProducts);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      throw error;
    }
  };

  const findProduct = (searchTerm) => {
    const normalized = searchTerm.toLowerCase().trim();

    // Exakte Übereinstimmung
    let product = products.find(
      p => p.name.toLowerCase().trim() === normalized
    );

    if (product) return product;

    // Teilübereinstimmung
    product = products.find(p =>
      p.name.toLowerCase().trim().startsWith(normalized)
    );

    return product || null;
  };

  const searchProducts = (searchTerm, limit = 10) => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const normalized = searchTerm.toLowerCase().trim();

    const results = products
      .map(product => {
        const productName = product.name.toLowerCase();

        if (productName === normalized) {
          return { product, relevance: 1000 };
        }

        if (productName.startsWith(normalized)) {
          return { product, relevance: 900 };
        }

        const words = productName.split(' ');
        const wordMatch = words.some(word => word.startsWith(normalized));
        if (wordMatch) {
          return { product, relevance: 800 };
        }

        const position = productName.indexOf(normalized);
        if (position !== -1) {
          return { product, relevance: 700 - position };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        return a.product.name.localeCompare(b.product.name);
      })
      .slice(0, limit)
      .map(r => r.product);

    return results;
  };

  /**
   * Aktualisiert ein Produkt
   * NUR möglich wenn es dem aktuellen User gehört!
   */
  const updateProduct = async (product, newData) => {
    if (!user || !product._isOwn) {
      throw new Error('Du kannst nur deine eigenen Produkte bearbeiten');
    }

    const userProductsRef = ref(database, `productDatabaseV2/private/${user.uid}`);
    
    // Hole aktuelle eigene Produkte
    const snapshot = await new Promise((resolve) => {
      onValue(userProductsRef, resolve, { onlyOnce: true });
    });
    
    const currentProducts = snapshot.val() || [];
    
    // Aktualisiere an originalIndex
    currentProducts[product._originalIndex] = {
      name: newData.name.trim(),
      category: newData.category,
      commonUnit: newData.commonUnit
    };

    try {
      await set(userProductsRef, currentProducts);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  /**
   * Löscht ein Produkt
   * NUR möglich wenn es dem aktuellen User gehört!
   */
  const deleteProduct = async (product) => {
    if (!user || !product._isOwn) {
      throw new Error('Du kannst nur deine eigenen Produkte löschen');
    }

    const userProductsRef = ref(database, `productDatabaseV2/private/${user.uid}`);
    
    // Hole aktuelle eigene Produkte
    const snapshot = await new Promise((resolve) => {
      onValue(userProductsRef, resolve, { onlyOnce: true });
    });
    
    const currentProducts = snapshot.val() || [];
    
    // Entferne an originalIndex
    const updatedProducts = currentProducts.filter((_, i) => i !== product._originalIndex);

    try {
      await set(userProductsRef, updatedProducts);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  const value = {
    products,
    loading,
    hasGroup,
    addProduct,
    updateProduct,
    deleteProduct,
    findProduct,
    searchProducts,
    DEFAULT_PRODUCTS
  };

  return (
    <ProductDatabaseContext.Provider value={value}>
      {children}
    </ProductDatabaseContext.Provider>
  );
};