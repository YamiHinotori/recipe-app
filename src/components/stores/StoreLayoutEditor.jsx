import React, { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { useStoreLayouts } from '../../context/StoreLayoutsContext';
import ModalHeader from '../global/ModalHeader';
import InstructionsBanner from './InstructionsBanner';
import CategoriesList from './CategoriesList';
import AddCategoryForm from './AddCategoryForm';

/**
 * StoreLayoutEditor - Editor für Laden-Kategorien und deren Reihenfolge
 * 
 * Ermöglicht:
 * - Drag & Drop Sortierung der Kategorien
 * - Hinzufügen neuer Kategorien
 * - Löschen von Kategorien
 * - Speichern des Layouts
 * 
 * Props:
 * @param {boolean} isOpen - Modal-Sichtbarkeit
 * @param {function} onClose - Callback beim Schließen
 */
const StoreLayoutEditor = ({ isOpen, onClose }) => {
  const { getActiveStore, updateStoreCategories, selectedStoreId } = useStoreLayouts();
  const activeStore = getActiveStore();
  
  // Kategorien-Liste (sortiert)
  const [categories, setCategories] = useState([]);
  
  // Neue Kategorie Formular
  const [newCategory, setNewCategory] = useState({ name: '', id: '' });
  
  // Drag & Drop Zustand
  const [draggedItem, setDraggedItem] = useState(null);

  /**
   * Lädt Kategorien wenn Store sich ändert
   */
  useEffect(() => {
    if (activeStore?.categories) {
      setCategories([...activeStore.categories].sort((a, b) => a.order - b.order));
    }
  }, [activeStore]);

  /**
   * Drag & Drop: Start
   */
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Drag & Drop: Over (Neuanordnung während Drag)
   */
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    newCategories.splice(draggedItem, 1);
    newCategories.splice(index, 0, draggedCategory);

    setCategories(newCategories);
    setDraggedItem(index);
  };

  /**
   * Fügt neue Kategorie hinzu
   */
  const handleAddCategory = () => {
    if (!newCategory.name.trim() || !newCategory.id.trim()) return;

    const newCat = {
      id: newCategory.id.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.name,
      order: categories.length + 1
    };

    setCategories([...categories, newCat]);
    setNewCategory({ name: '', id: '' });
  };

  /**
   * Entfernt Kategorie
   */
  const handleRemoveCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  /**
   * Speichert Layout mit aktualisierten Order-Werten
   */
  const handleSave = async () => {
    if (!selectedStoreId) return;
    
    // Order-Werte basierend auf Array-Position aktualisieren
    const updatedCategories = categories.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));

    await updateStoreCategories(selectedStoreId, updatedCategories);
    onClose();
  };

  // Modal nicht rendern wenn geschlossen oder kein Store
  if (!isOpen || !activeStore) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal-Header */}
        <div className="sticky top-0 bg-white z-10">
          <ModalHeader
            icon={<Settings className="w-5 h-5 text-purple-600" />}
            title="Laden-Layout anpassen"
            onClose={onClose}
            iconBgColor="bg-purple-100"
          />
          
          {/* Untertitel mit Laden-Name */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {activeStore.name} - Kategorien sortieren
            </p>
          </div>
        </div>

        {/* Modal-Inhalt */}
        <div className="p-6 space-y-6">
          
          {/* Hinweis-Banner */}
          <InstructionsBanner />

          {/* Kategorien-Liste mit Drag & Drop */}
          <CategoriesList
            categories={categories}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onRemoveCategory={handleRemoveCategory}
          />

          {/* Neue Kategorie hinzufügen */}
          <AddCategoryForm
            newCategory={newCategory}
            onCategoryChange={setNewCategory}
            onAddCategory={handleAddCategory}
          />

          {/* Speichern / Abbrechen Buttons */}
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