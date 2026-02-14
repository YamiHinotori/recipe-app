import React from 'react';
import { Save, ChefHat } from 'lucide-react';
import useRecipeForm from '../../hooks/useRecipeForm';
import IngredientList from './IngredientList';
import InstructionList from './InstructionList';
import ModalHeader from '../global/ModalHeader';

/**
 * RecipeForm - Modal-Formular zum Erstellen und Bearbeiten von Rezepten
 * 
 * Props:
 * @param {string|null} editingId - ID des zu bearbeitenden Rezepts (null beim Erstellen)
 * @param {function} onSave - Callback beim Speichern des Formulars
 * @param {function} onCancel - Callback beim Abbrechen
 */
const RecipeForm = ({ editingId, onSave, onCancel }) => {
  // Custom Hook verwaltet gesamte Formular-Logik
  const {
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
  } = useRecipeForm(editingId, onSave);

  return (
    // Vollbild-Overlay mit Scroll-Unterstützung
    <div className="fixed inset-0 bg-black/50 z-20 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-lg max-w-3xl w-full">
          
          {/* Modal-Header */}
          <ModalHeader
            icon={<ChefHat className="w-5 h-5 text-orange-600" />}
            title={editingId ? 'Rezept bearbeiten' : 'Neues Rezept'}
            onClose={onCancel}
            iconBgColor="bg-orange-100"
          />

          {/* Formular mit scrollbarem Inhalt */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* === GRUNDINFORMATIONEN === */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Grundinformationen</h3>
              
              {/* Titel (Pflichtfeld) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Beschreibung */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                  placeholder="Kurze Beschreibung des Rezepts..."
                />
              </div>

              {/* Bild URL */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bild URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => updateField('image', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com/bild.jpg"
                />
              </div>

              {/* Zeitangaben und Portionen (Grid-Layout) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Vorbereitungszeit */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vorbereitung (Min)
                  </label>
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => updateField('prepTime', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Kochzeit */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kochen (Min)
                  </label>
                  <input
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => updateField('cookTime', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Portionen */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Portionen
                  </label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => updateField('servings', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                {/* Schwierigkeitsgrad */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Schwierigkeit
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="einfach">Einfach</option>
                    <option value="mittel">Mittel</option>
                    <option value="schwer">Schwer</option>
                  </select>
                </div>
              </div>

              {/* Kategorie und Tags */}
              <div className="grid grid-cols-2 gap-3">
                {/* Kategorie */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kategorie
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="z.B. Hauptgericht"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tags (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => updateField('tags', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="pasta, schnell, vegan"
                  />
                </div>
              </div>
            </div>

            {/* === ZUTATEN === */}
            <IngredientList
              ingredients={ingredients}
              onAdd={addIngredient}
              onUpdate={updateIngredient}
              onRemove={removeIngredient}
            />

            {/* === ZUBEREITUNG === */}
            <InstructionList
              instructions={instructions}
              onAdd={addInstruction}
              onUpdate={updateInstruction}
              onRemove={removeInstruction}
            />

            {/* === NOTIZEN === */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Notizen / Tipps
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Zusätzliche Hinweise, Variationen, Aufbewahrungstipps..."
              />
            </div>

            {/* === AKTIONS-BUTTONS === */}
            <div className="flex gap-3 pt-4 border-t">
              {/* Speichern */}
              <button
                type="submit"
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Speichern
              </button>

              {/* Abbrechen */}
              <button
                type="button"
                onClick={onCancel}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecipeForm;