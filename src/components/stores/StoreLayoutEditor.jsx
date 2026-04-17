import React, { useState, useEffect } from 'react';
import { Save, Settings, Plus, GripVertical, X, Package } from 'lucide-react';
import { useStoreLayouts } from '../../context/StoreLayoutsContext';
import { useCategories } from '../../context/CategoriesContext';
import ModalHeader from '../global/ModalHeader';

/**
 * StoreLayoutEditor - NEU mit globalen Kategorien
 * 
 * Zeigt:
 * - "Im Laden" (sortierbar) - categoryOrder
 * - "Verfügbare Kategorien" (zum Hinzufügen)
 * - "Neue Kategorie erstellen"
 * 
 * Props:
 * @param {boolean} isOpen - Modal sichtbar?
 * @param {function} onClose - Callback beim Schließen
 */
const StoreLayoutEditor = ({ isOpen, onClose }) => {
  const { getActiveStore, updateStoreCategoryOrder, selectedStoreId } = useStoreLayouts();
  const { categories: globalCategories, addCategory } = useCategories();
  const activeStore = getActiveStore();
  
  // Kategorien im Laden (sortiert)
  const [inStoreCategories, setInStoreCategories] = useState([]);
  
  // Neue Kategorie Formular
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState(null);

  /**
   * Lädt categoryOrder wenn Store sich ändert
   */
  useEffect(() => {
    if (activeStore?.categoryOrder && globalCategories) {
      // Nur Kategorien die im Store sind, in richtiger Reihenfolge
      const ordered = activeStore.categoryOrder
        .map(catId => globalCategories.find(c => c.id === catId))
        .filter(Boolean);
      
      setInStoreCategories(ordered);
    } else {
      setInStoreCategories([]);
    }
  }, [activeStore, globalCategories]);

  /**
   * Kategorien die NICHT im Laden sind
   */
  const availableCategories = globalCategories.filter(
    cat => !inStoreCategories.some(c => c.id === cat.id)
  );

  /**
   * Fügt Kategorie zum Laden hinzu
   */
  const handleAddToStore = (category) => {
    setInStoreCategories([...inStoreCategories, category]);
  };

  /**
   * Entfernt Kategorie aus Laden
   */
  const handleRemoveFromStore = (categoryId) => {
    setInStoreCategories(inStoreCategories.filter(c => c.id !== categoryId));
  };

  /**
   * Erstellt neue Kategorie
   */
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const id = newCategoryName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      await addCategory(newCategoryName.trim(), id);
      setNewCategoryName('');
      setShowNewCategoryForm(false);
    } catch (error) {
      alert(error.message || 'Fehler beim Erstellen');
    }
  };

  /**
   * Drag & Drop
   */
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCategories = [...inStoreCategories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);

    setInStoreCategories(newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /**
   * Speichert nur Category-IDs als categoryOrder
   */
  const handleSave = async () => {
    if (!selectedStoreId) return;
    
    const categoryOrder = inStoreCategories.map(c => c.id);
    
    try {
      await updateStoreCategoryOrder(selectedStoreId, categoryOrder);
      onClose();
    } catch (error) {
      alert(error.message || 'Fehler beim Speichern');
    }
  };

  if (!isOpen || !activeStore) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
          <ModalHeader
            icon={<Settings className="w-5 h-5 text-purple-600" />}
            title="Laden-Layout anpassen"
            onClose={onClose}
            iconBgColor="bg-purple-100"
          />
          
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600">
              {activeStore.name} - Kategorien sortieren
            </p>
          </div>
        </div>

        {/* Inhalt */}
        <div className="p-6 space-y-6">
          
          {/* Hinweis */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Tipp:</strong> Ziehe Kategorien per Drag & Drop in die Reihenfolge, 
              wie sie in deinem Laden angeordnet sind. Produkte ohne Kategorie landen in "Sonstiges".
            </p>
          </div>

          {/* Im Laden - Sortierbar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Im Laden ({inStoreCategories.length})
            </h3>
            
            {inStoreCategories.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Noch keine Kategorien hinzugefügt.<br/>
                  Füge Kategorien aus "Verfügbare Kategorien" hinzu.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {inStoreCategories.map((cat, index) => (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border-2 rounded-lg p-3 flex items-center justify-between cursor-move hover:border-green-400 transition-colors ${
                      draggedIndex === index ? 'opacity-50 border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-800">{cat.name}</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFromStore(cat.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Aus Laden entfernen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verfügbare Kategorien */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Verfügbare Kategorien ({availableCategories.length})
            </h3>
            
            {availableCategories.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                Alle Kategorien sind bereits im Laden
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleAddToStore(cat)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Neue Kategorie erstellen */}
          <div>
            {!showNewCategoryForm ? (
              <button
                onClick={() => setShowNewCategoryForm(true)}
                className="w-full bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Neue Kategorie erstellen
              </button>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="z.B. Bio-Produkte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCategory}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Erstellen
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName('');
                    }}
                    className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Speichern / Abbrechen */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-5 h-5" />
              Layout speichern
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLayoutEditor;