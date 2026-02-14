/**
 * productHelpers - Hilfsfunktionen für Produkt-Verwaltung
 * 
 * Enthält Utility-Funktionen für Gruppierung, Filterung und Kategorien
 */

/**
 * Gibt Kategorie-Namen für ID zurück
 * 
 * @param {string} categoryId - Kategorie-ID
 * @param {array} storeCategories - Verfügbare Kategorien
 * @returns {string} Kategorie-Name oder "Sonstiges"
 */
export const getCategoryName = (categoryId, storeCategories) => {
    const category = storeCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Sonstiges';
  };
  
  /**
   * Gruppiert Produkte nach Kategorie
   * 
   * @param {array} products - Array von Produkten
   * @returns {object} Gruppierte Produkte {categoryId: [products]}
   */
  export const groupProductsByCategory = (products) => {
    return products.reduce((acc, product) => {
      const category = product.category || 'sonstiges';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  };
  
  /**
   * Sortiert Produkte alphabetisch nach Name
   * 
   * @param {array} products - Array von Produkten
   * @returns {array} Sortierte Produkte
   */
  export const sortProductsByName = (products) => {
    return [...products].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  };
  
  /**
   * Filtert Produkte nach Kategorie
   * 
   * @param {array} products - Alle Produkte
   * @param {string} categoryId - Kategorie-ID
   * @returns {array} Gefilterte Produkte
   */
  export const filterByCategory = (products, categoryId) => {
    return products.filter(product => product.category === categoryId);
  };
  
  /**
   * Sucht Produkte nach Name
   * 
   * @param {array} products - Alle Produkte
   * @param {string} searchTerm - Suchbegriff
   * @returns {array} Gefilterte Produkte
   */
  export const searchProducts = (products, searchTerm) => {
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term)
    );
  };
  
  /**
   * Validiert Produkt-Daten
   * 
   * @param {object} product - Zu validierendes Produkt
   * @returns {object} { isValid: boolean, errors: string[] }
   */
  export const validateProduct = (product) => {
    const errors = [];
  
    // Name ist Pflichtfeld
    if (!product.name || product.name.trim() === '') {
      errors.push('Produktname ist erforderlich');
    }
  
    // Kategorie ist Pflichtfeld
    if (!product.category) {
      errors.push('Kategorie ist erforderlich');
    }
  
    // Name sollte mindestens 2 Zeichen haben
    if (product.name && product.name.trim().length < 2) {
      errors.push('Produktname sollte mindestens 2 Zeichen haben');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Prüft ob Produkt bereits existiert (nach Name)
   * 
   * @param {array} products - Alle Produkte
   * @param {string} productName - Zu prüfender Produktname
   * @returns {boolean} true wenn Produkt existiert
   */
  export const productExists = (products, productName) => {
    return products.some(p => 
      p.name.toLowerCase() === productName.toLowerCase()
    );
  };
  
  /**
   * Gibt Statistiken über Produkte zurück
   * 
   * @param {array} products - Alle Produkte
   * @param {array} categories - Verfügbare Kategorien
   * @returns {object} Statistiken {total, byCategory, withUnit, withoutUnit}
   */
  export const getProductStats = (products, categories) => {
    const byCategory = {};
    let withUnit = 0;
    let withoutUnit = 0;
  
    categories.forEach(cat => {
      byCategory[cat.id] = 0;
    });
  
    products.forEach(product => {
      if (byCategory[product.category] !== undefined) {
        byCategory[product.category]++;
      }
      
      if (product.commonUnit && product.commonUnit.trim()) {
        withUnit++;
      } else {
        withoutUnit++;
      }
    });
  
    return {
      total: products.length,
      byCategory,
      withUnit,
      withoutUnit
    };
  };
  
  /**
   * Normalisiert Produktname (Großbuchstabe am Anfang)
   * 
   * @param {string} name - Produktname
   * @returns {string} Normalisierter Name
   */
  export const normalizeProductName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };