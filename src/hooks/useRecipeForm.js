import { useState, useEffect } from 'react';
import { useRecipes } from '../context/RecipeContext';
import { getEmptyForm, prepareRecipeData } from '../utils/recipeHelpers';

/**
 * useRecipeForm - Custom Hook für Rezeptformular-Logik
 * 
 * Verwaltet den gesamten Zustand und die Logik für das Rezeptformular
 * Unterstützt sowohl Erstellen als auch Bearbeiten von Rezepten
 * 
 * @param {string|null} editingId - ID des zu bearbeitenden Rezepts (null beim Erstellen)
 * @param {function} onSave - Callback beim Speichern
 * @returns {object} Formular-Zustand und Handler-Funktionen
 */
const useRecipeForm = (editingId, onSave) => {
  const { recipes } = useRecipes();
  
  // Hauptformular-Zustand
  const [formData, setFormData] = useState(getEmptyForm());

  /**
   * Lädt Rezeptdaten beim Bearbeiten
   */
  useEffect(() => {
    if (editingId) {
      const recipe = recipes.find(r => r.id === editingId);
      if (recipe) {
        setFormData({
          ...recipe,
          // Tags von Array zu String konvertieren für Textfeld
          tags: Array.isArray(recipe.tags) 
            ? recipe.tags.join(', ') 
            : (recipe.tags || '')
        });
      }
    } else {
      setFormData(getEmptyForm());
    }
  }, [editingId, recipes]);

  /**
   * Aktualisiert ein einzelnes Formularfeld
   */
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Verarbeitet Formular-Absendung
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Bereitet Daten für API vor (validiert, konvertiert Typen)
    const recipeData = prepareRecipeData(formData);
    
    // Ruft übergeordnete Speicherfunktion auf
    onSave(recipeData);
  };

  // === ZUTATEN-VERWALTUNG ===

  const ingredients = formData.ingredients || [];

  /**
   * Fügt neue leere Zutat hinzu
   */
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', amount: '', unit: '' }]
    }));
  };

  /**
   * Aktualisiert eine bestimmte Zutat
   */
  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  /**
   * Entfernt eine Zutat
   */
  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // === ANWEISUNGEN-VERWALTUNG ===

  const instructions = formData.instructions || [];

  /**
   * Fügt neuen leeren Zubereitungsschritt hinzu
   */
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  /**
   * Aktualisiert einen bestimmten Zubereitungsschritt
   */
  const updateInstruction = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  /**
   * Entfernt einen Zubereitungsschritt
   */
  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  // Gibt alle Zustandsvariablen und Handler zurück
  return {
    formData,
    updateField,
    handleSubmit,
    ingredients,
    addIngredient,
    updateIngredient,
    removeIngredient,
    instructions,
    addInstruction,
    updateInstruction,
    removeInstruction
  };
};

export default useRecipeForm;