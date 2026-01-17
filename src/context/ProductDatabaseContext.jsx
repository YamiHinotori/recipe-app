import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

const ProductDatabaseContext = createContext();

// Vordefinierte Produktdatenbank
const DEFAULT_PRODUCTS = [
  // Obst & Gemüse
  { name: 'Tomaten', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Gurken', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Paprika', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Zwiebeln', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Kartoffeln', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Möhren', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Salat', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Spinat', category: 'obst-gemuese', commonUnit: 'g' },
  { name: 'Brokkoli', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Blumenkohl', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Äpfel', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Bananen', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Orangen', category: 'obst-gemuese', commonUnit: 'kg' },
  { name: 'Zitronen', category: 'obst-gemuese', commonUnit: 'Stück' },
  { name: 'Knoblauch', category: 'obst-gemuese', commonUnit: 'Zehen' },
  { name: 'Ingwer', category: 'obst-gemuese', commonUnit: 'g' },
  { name: 'Champignons', category: 'obst-gemuese', commonUnit: 'g' },
  
  // Backwaren
  { name: 'Brot', category: 'backwaren', commonUnit: 'Stück' },
  { name: 'Brötchen', category: 'backwaren', commonUnit: 'Stück' },
  { name: 'Toast', category: 'backwaren', commonUnit: 'Packung' },
  { name: 'Baguette', category: 'backwaren', commonUnit: 'Stück' },
  
  // Fleisch & Fisch
  { name: 'Hähnchenbrust', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Hackfleisch', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Schweinefilet', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Rindfleisch', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Lachs', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Thunfisch', category: 'fleisch-fisch', commonUnit: 'Dose' },
  { name: 'Garnelen', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Bacon', category: 'fleisch-fisch', commonUnit: 'g' },
  { name: 'Würstchen', category: 'fleisch-fisch', commonUnit: 'Packung' },
  
  // Milchprodukte
  { name: 'Milch', category: 'milchprodukte', commonUnit: 'l' },
  { name: 'Butter', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Käse', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Joghurt', category: 'milchprodukte', commonUnit: 'Becher' },
  { name: 'Sahne', category: 'milchprodukte', commonUnit: 'ml' },
  { name: 'Schmand', category: 'milchprodukte', commonUnit: 'Becher' },
  { name: 'Quark', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Frischkäse', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Mozzarella', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Parmesan', category: 'milchprodukte', commonUnit: 'g' },
  { name: 'Eier', category: 'milchprodukte', commonUnit: 'Stück' },
  
  // Tiefkühlware
  { name: 'Tiefkühlpizza', category: 'tiefkuehl', commonUnit: 'Stück' },
  { name: 'Pommes', category: 'tiefkuehl', commonUnit: 'Packung' },
  { name: 'Erbsen (TK)', category: 'tiefkuehl', commonUnit: 'g' },
  { name: 'Spinat (TK)', category: 'tiefkuehl', commonUnit: 'g' },
  { name: 'Beeren (TK)', category: 'tiefkuehl', commonUnit: 'g' },
  { name: 'Eis', category: 'tiefkuehl', commonUnit: 'Packung' },
  
  // Konserven
  { name: 'Tomaten (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Kichererbsen (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Kidneybohnen (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Mais (Dose)', category: 'konserven', commonUnit: 'Dose' },
  { name: 'Kokosmilch', category: 'konserven', commonUnit: 'Dose' },
  
  // Nudeln, Reis & Getreide
  { name: 'Spaghetti', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Penne', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Fusilli', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Reis', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Basmatireis', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Couscous', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Quinoa', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Mehl', category: 'nudeln-reis', commonUnit: 'g' },
  { name: 'Haferflocken', category: 'nudeln-reis', commonUnit: 'g' },
  
  // Gewürze & Öle
  { name: 'Salz', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Pfeffer', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Paprikapulver', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Currypulver', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Oregano', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Basilikum', category: 'gewuerze', commonUnit: 'Packung' },
  { name: 'Olivenöl', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Sonnenblumenöl', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Essig', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Sojasauce', category: 'gewuerze', commonUnit: 'ml' },
  { name: 'Honig', category: 'gewuerze', commonUnit: 'g' },
  { name: 'Senf', category: 'gewuerze', commonUnit: 'Glas' },
  { name: 'Ketchup', category: 'gewuerze', commonUnit: 'Flasche' },
  
  // Getränke
  { name: 'Wasser', category: 'getraenke', commonUnit: 'l' },
  { name: 'Sprudelwasser', category: 'getraenke', commonUnit: 'l' },
  { name: 'Saft', category: 'getraenke', commonUnit: 'l' },
  { name: 'Cola', category: 'getraenke', commonUnit: 'l' },
  { name: 'Bier', category: 'getraenke', commonUnit: 'Flasche' },
  { name: 'Wein', category: 'getraenke', commonUnit: 'Flasche' },
  { name: 'Kaffee', category: 'getraenke', commonUnit: 'g' },
  { name: 'Tee', category: 'getraenke', commonUnit: 'Packung' },
  
  // Süßigkeiten & Snacks
  { name: 'Schokolade', category: 'suessigkeiten', commonUnit: 'Tafel' },
  { name: 'Chips', category: 'suessigkeiten', commonUnit: 'Tüte' },
  { name: 'Gummibärchen', category: 'suessigkeiten', commonUnit: 'Tüte' },
  { name: 'Kekse', category: 'suessigkeiten', commonUnit: 'Packung' },
  { name: 'Nüsse', category: 'suessigkeiten', commonUnit: 'g' },
  
  // Haushalt & Drogerie
  { name: 'Toilettenpapier', category: 'haushalt', commonUnit: 'Packung' },
  { name: 'Küchenpapier', category: 'haushalt', commonUnit: 'Rolle' },
  { name: 'Spülmittel', category: 'haushalt', commonUnit: 'Flasche' },
  { name: 'Waschmittel', category: 'haushalt', commonUnit: 'Packung' },
  { name: 'Zahnpasta', category: 'haushalt', commonUnit: 'Tube' },
  { name: 'Shampoo', category: 'haushalt', commonUnit: 'Flasche' },
  { name: 'Seife', category: 'haushalt', commonUnit: 'Stück' }
];

export const useProductDatabase = () => {
  const context = useContext(ProductDatabaseContext);
  if (!context) {
    throw new Error('useProductDatabase must be used within ProductDatabaseProvider');
  }
  return context;
};

export const ProductDatabaseProvider = ({ children }) => {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProducts(DEFAULT_PRODUCTS);
      return;
    }

    // Listener für Produktdatenbank
    const productsRef = ref(database, 'productDatabase');
    
    const unsubscribe = onValue(productsRef, async (snapshot) => {
      const data = snapshot.val();
      console.log('=== PRODUKTDATENBANK GELADEN ===');
      console.log('Rohdaten aus Firebase:', data);
      console.log('Datentyp:', typeof data, 'IsArray:', Array.isArray(data));
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('✅ Produktdatenbank gefunden - Anzahl Produkte:', data.length);
        console.log('Erste 5 Produkte:', data.slice(0, 5));
        setProducts(data);
      } else if (data === null || data === undefined) {
        console.log('⚠️ Keine Produktdatenbank vorhanden - erstelle neue mit Standard-Produkten');
        console.log('Anzahl Standard-Produkte:', DEFAULT_PRODUCTS.length);
        try {
          await set(productsRef, DEFAULT_PRODUCTS);
          console.log('✅ Standard-Produkte erfolgreich gespeichert');
          setProducts(DEFAULT_PRODUCTS);
        } catch (error) {
          console.error('❌ Fehler beim Speichern der Standard-Produkte:', error);
          // Verwende trotzdem die Standard-Produkte lokal
          setProducts(DEFAULT_PRODUCTS);
        }
      } else {
        console.log('⚠️ Unerwartete Datenstruktur:', data);
        // Versuche trotzdem die Daten zu verwenden
        setProducts(DEFAULT_PRODUCTS);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Produkt zur Datenbank hinzufügen
  const addProduct = async (name, category, commonUnit) => {
    if (!user) return;

    // Normalisiere den Namen für Vergleich
    const normalizedName = name.trim();
    
    // Prüfe ob Produkt bereits existiert (case-insensitive)
    const existingProduct = products.find(
      p => p.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (existingProduct) {
      console.log('Produkt existiert bereits:', existingProduct);
      return existingProduct;
    }

    // Erstelle neues Produkt mit exaktem Namen
    const newProduct = { 
      name: normalizedName, 
      category, 
      commonUnit 
    };

    const newProducts = [...products, newProduct];

    const productsRef = ref(database, 'productDatabase');
    
    try {
      await set(productsRef, newProducts);
      console.log('Neues Produkt hinzugefügt:', newProduct);
      return newProduct;
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Produkts:', error);
      return null;
    }
  };

  // Produkt in Datenbank finden
  const findProduct = (searchTerm) => {
    if (!searchTerm) return null;
    
    const search = searchTerm.toLowerCase().trim();
    
    // Exakte Übereinstimmung
    let product = products.find(p => p.name.toLowerCase() === search);
    if (product) return product;
    
    // Teilübereinstimmung
    product = products.find(p => p.name.toLowerCase().includes(search));
    if (product) return product;
    
    return null;
  };

  // Produkte nach Suchbegriff filtern (für Autocomplete)
  const searchProducts = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const search = searchTerm.toLowerCase().trim();
    
    const filtered = products.filter(p => {
      const productName = p.name.toLowerCase();
      // Suche nach dem Begriff irgendwo im Namen
      return productName.includes(search);
    });
    
    // Sortiere nach Relevanz
    filtered.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      
      // Exakte Treffer zuerst
      const aExact = aLower === search;
      const bExact = bLower === search;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Treffer am Wortanfang (nach Leerzeichen oder am Anfang)
      const aWordStart = aLower.startsWith(search) || aLower.includes(' ' + search);
      const bWordStart = bLower.startsWith(search) || bLower.includes(' ' + search);
      if (aWordStart && !bWordStart) return -1;
      if (!aWordStart && bWordStart) return 1;
      
      // Treffer am Anfang des Produktnamens
      const aStarts = aLower.startsWith(search);
      const bStarts = bLower.startsWith(search);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // Position des Treffers (je früher, desto besser)
      const aIndex = aLower.indexOf(search);
      const bIndex = bLower.indexOf(search);
      if (aIndex !== bIndex) return aIndex - bIndex;
      
      // Sonst alphabetisch
      return a.name.localeCompare(b.name);
    });
    
    console.log(`Suche nach "${searchTerm}": ${filtered.length} Ergebnisse gefunden`, filtered.map(p => p.name));
    return filtered.slice(0, 10); // Max 10 Vorschläge
  };

  const value = {
    products,
    addProduct,
    findProduct,
    searchProducts
  };

  return (
    <ProductDatabaseContext.Provider value={value}>
      {children}
    </ProductDatabaseContext.Provider>
  );
};