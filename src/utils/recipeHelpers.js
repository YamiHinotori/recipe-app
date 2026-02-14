/**
 * recipeHelpers - Hilfsfunktionen für Rezeptverwaltung
 * 
 * Enthält Utility-Funktionen für Formular-Initialisierung,
 * Datenvalidierung und -transformation
 */

/**
 * Gibt ein leeres Formularobjekt mit Standardwerten zurück
 * 
 * @returns {object} Leeres Rezept-Formular
 */
export const getEmptyForm = () => {
    return {
      title: '',
      description: '',
      image: '',
      prepTime: 0,
      cookTime: 0,
      servings: 4,
      difficulty: 'mittel',
      category: 'Hauptgericht',
      tags: '',
      ingredients: [{ item: '', amount: '', unit: '' }],
      instructions: [''],
      notes: ''
    };
  };
  
  /**
   * Bereitet Formulardaten für das Speichern vor
   * 
   * Konvertiert Typen, filtert leere Einträge und validiert Daten
   * 
   * @param {object} formData - Rohe Formulardaten
   * @returns {object} Bereinigte und validierte Rezeptdaten
   */
  export const prepareRecipeData = (formData) => {
    return {
      ...formData,
      
      // Tags von String zu Array konvertieren und bereinigen
      tags: formData.tags 
        ? formData.tags.split(',')
            .map(t => t.trim())        // Leerzeichen entfernen
            .filter(t => t)             // Leere Einträge entfernen
        : [],
      
      // Nur ausgefüllte Zutaten behalten
      ingredients: formData.ingredients
        .filter(i => i.item.trim()),
      
      // Nur ausgefüllte Zubereitungsschritte behalten
      instructions: formData.instructions
        .filter(i => i.trim()),
      
      // Numerische Werte sicherstellen
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 4
    };
  };
  
  /**
   * Validiert Rezeptdaten vor dem Speichern
   * 
   * @param {object} recipeData - Zu validierende Rezeptdaten
   * @returns {object} { isValid: boolean, errors: string[] }
   */
  export const validateRecipe = (recipeData) => {
    const errors = [];
  
    // Titel ist Pflichtfeld
    if (!recipeData.title || recipeData.title.trim() === '') {
      errors.push('Titel ist erforderlich');
    }
  
    // Mindestens eine Zutat erforderlich
    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      errors.push('Mindestens eine Zutat ist erforderlich');
    }
  
    // Mindestens ein Zubereitungsschritt erforderlich
    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      errors.push('Mindestens ein Zubereitungsschritt ist erforderlich');
    }
  
    // Portionen müssen positiv sein
    if (recipeData.servings < 1) {
      errors.push('Portionen müssen mindestens 1 sein');
    }
  
    // Bild-URL validieren (falls vorhanden)
    if (recipeData.image && !isValidUrl(recipeData.image)) {
      errors.push('Bild-URL ist ungültig');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Prüft ob ein String eine gültige URL ist
   * 
   * @param {string} string - Zu prüfender String
   * @returns {boolean} true wenn gültige URL
   */
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  /**
   * Berechnet die Gesamtzeit für ein Rezept
   * 
   * @param {object} recipe - Rezept mit prepTime und cookTime
   * @returns {number} Gesamtzeit in Minuten
   */
  export const getTotalTime = (recipe) => {
    return (recipe.prepTime || 0) + (recipe.cookTime || 0);
  };
  
  /**
   * Formatiert Zeitangaben für Anzeige
   * 
   * @param {number} minutes - Zeit in Minuten
   * @returns {string} Formatierte Zeit (z.B. "1h 30min" oder "45 min")
   */
  export const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };