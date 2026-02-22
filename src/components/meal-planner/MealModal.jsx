import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, ShoppingCart } from 'lucide-react';
import { useMealPlanner } from '../../context/MealPlannerContext';
import { useShoppingList } from '../../context/ShoppingListContext';
import ModalHeader from '../global/ModalHeader';
import RecipeSelector from './RecipeSelector';

/**
 * MealModal - Modal zum Bearbeiten/Hinzufügen einer Mahlzeit
 * 
 * ZWEI Modi:
 * 1. Freitext: Einfach Text eingeben
 * 2. Rezept: Aus Liste wählen
 * 
 * Features:
 * - Mode-Toggle (Freitext ↔ Rezept)
 * - Notizen (optional)
 * - Bei Rezept: Zur Einkaufsliste hinzufügen
 * - Löschen
 */
const MealModal = ({ dayKey, recipes, onClose }) => {
  const { WEEK_DAYS, getDayMeal, setDayMeal, clearDay } = useMealPlanner();
  const { addRecipeToList } = useShoppingList();
  
  // Hole aktuellen Tag-Namen
  const dayLabel = WEEK_DAYS.find(d => d.key === dayKey)?.label || '';
  
  // Hole existierende Mahlzeit (falls vorhanden)
  const existingMeal = getDayMeal(dayKey);

  // ==========================================================================
  // STATE
  // ==========================================================================
  
  /**
   * mode - "text" oder "recipe"
   * 
   * Bestimmt welches Formular angezeigt wird
   */
  const [mode, setMode] = useState(() => {
    if (existingMeal) {
      return existingMeal.recipeId ? 'recipe' : 'text';
    }
    return 'text'; // Default: Freitext
  });

  /**
   * Freitext-Modus
   */
  const [mealText, setMealText] = useState(existingMeal?.mealText || '');

  /**
   * Rezept-Modus
   */
  const [selectedRecipe, setSelectedRecipe] = useState(() => {
    if (existingMeal?.recipeId) {
      // Finde Rezept aus Liste
      return recipes.find(r => r.id === existingMeal.recipeId) || null;
    }
    return null;
  });

  /**
   * Notizen (beide Modi)
   */
  const [notes, setNotes] = useState(existingMeal?.notes || '');

  /**
   * Feedback-Messages
   */
  const [message, setMessage] = useState({ type: '', text: '' });

  // ==========================================================================
  // FUNKTIONEN
  // ==========================================================================

  /**
   * Zeigt temporäre Nachricht
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Mode wechseln
   */
  const handleModeChange = (newMode) => {
    setMode(newMode);
    // State zurücksetzen beim Wechsel
    if (newMode === 'text') {
      setSelectedRecipe(null);
    } else {
      setMealText('');
    }
  };

  /**
   * Speichern
   */
  const handleSave = async () => {
    try {
      // Validierung
      if (mode === 'text' && !mealText.trim()) {
        showMessage('error', 'Bitte gib eine Mahlzeit ein');
        return;
      }

      if (mode === 'recipe' && !selectedRecipe) {
        showMessage('error', 'Bitte wähle ein Rezept aus');
        return;
      }

      // Daten vorbereiten
      let mealData = { notes };

      if (mode === 'text') {
        mealData.mealText = mealText.trim();
      } else {
        mealData.recipeId = selectedRecipe.id;
        mealData.recipeName = selectedRecipe.title;
      }

      // Speichern
      await setDayMeal(dayKey, mealData);
      
      showMessage('success', 'Gespeichert!');
      
      // Modal nach kurzer Verzögerung schließen
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      showMessage('error', 'Fehler beim Speichern');
    }
  };

  /**
   * Löschen
   */
  const handleDelete = async () => {
    if (!existingMeal) return;

    if (!window.confirm(`Mahlzeit für ${dayLabel} wirklich löschen?`)) {
      return;
    }

    try {
      await clearDay(dayKey);
      showMessage('success', 'Gelöscht!');
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      showMessage('error', 'Fehler beim Löschen');
    }
  };

  /**
   * Rezept zur Einkaufsliste hinzufügen
   */
  const handleAddToShoppingList = async () => {
    if (!selectedRecipe) return;

    try {
      await addRecipeToList(selectedRecipe);
      showMessage('success', 'Zur Einkaufsliste hinzugefügt!');
    } catch (error) {
      showMessage('error', 'Fehler beim Hinzufügen');
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8 md:my-16">
        
        {/* Modal Header */}
        <ModalHeader
          icon={<span className="text-2xl">📅</span>}
          title={`${dayLabel} planen`}
          onClose={onClose}
          iconBgColor="bg-blue-100"
        />

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Feedback-Message */}
          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('text')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'text'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Freitext
            </button>
            <button
              onClick={() => handleModeChange('recipe')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'recipe'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🍳 Rezept
            </button>
          </div>

          {/* FREITEXT-MODUS */}
          {mode === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was gibt es?
              </label>
              <input
                type="text"
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                placeholder="z.B. Pizza bestellen"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          )}

          {/* REZEPT-MODUS */}
          {mode === 'recipe' && (
            <div className="space-y-4">
              <RecipeSelector
                recipes={recipes}
                selectedRecipe={selectedRecipe}
                onSelectRecipe={setSelectedRecipe}
              />

              {/* Zur Einkaufsliste Button */}
              {selectedRecipe && (
                <button
                  onClick={handleAddToShoppingList}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Zur Einkaufsliste hinzufügen
                </button>
              )}
            </div>
          )}

          {/* Notizen (beide Modi) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notizen (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Parmesan nicht vergessen"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Löschen-Button (oben, nur wenn Mahlzeit existiert) */}
          {existingMeal && (
            <div className="pt-4 border-t">
              <button
                onClick={handleDelete}
                className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 className="w-5 h-5" />
                Mahlzeit löschen
              </button>
            </div>
          )}

          {/* Speichern/Abbrechen Buttons (unten, 2-Spalten) */}
          <div className="flex gap-3 pt-4">
            {/* Abbrechen */}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Abbrechen
            </button>

            {/* Speichern */}
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-5 h-5" />
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealModal;