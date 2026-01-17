import React, { useState } from 'react';
import { X, Save, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';

const StoreLayoutEditor = ({ isOpen, onClose }) => {
  const { storeCategories, updateStoreLayout } = useShoppingList();
  const [categories, setCategories] = useState([...storeCategories].sort((a, b) => a.order - b.order));
  const [newCategory, setNewCategory] = useState({ name: '', id: '' });
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

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

  const handleRemoveCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleSave = async () => {
    const updatedCategories = categories.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));

    await updateStoreLayout(updatedCategories);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Laden-Layout anpassen</h2>
            <p className="text-sm text-gray-600 mt-1">
              Ordne die Kategorien in der Reihenfolge deines Supermarkts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tipp:</strong> Ziehe die Kategorien in die Reihenfolge, wie sie in deinem Supermarkt angeordnet sind. 
              So kannst du deine Einkaufsliste automatisch nach dem Laden-Layout sortieren und sparst Zeit beim Einkaufen!
            </p>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 mb-3">Kategorien (in Reihenfolge)</h3>
            {categories.map((category, index) => (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 cursor-move hover:border-blue-300 transition-colors"
              >
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.id}</p>
                </div>
                <button
                  onClick={() => handleRemoveCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Category */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Neue Kategorie hinzufügen</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie-Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="z.B. Bio-Produkte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie-ID (für System)
                </label>
                <input
                  type="text"
                  value={newCategory.id}
                  onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                  placeholder="z.B. bio-produkte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kleinbuchstaben und Bindestriche, z.B. "bio-produkte"
                </p>
              </div>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name.trim() || !newCategory.id.trim()}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Kategorie hinzufügen
              </button>
            </div>
          </div>

          {/* Actions */}
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
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
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