import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, GripVertical, Store, Settings, ChevronRight } from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';
import { useProductDatabase } from '../context/ProductDatabaseContext';
import StoreSelectorModal from './StoreSelectorModal';

const ShoppingList = () => {
  const navigate = useNavigate();
  const { 
    items, 
    storeCategories,
    currentListType,
    setCurrentListType,
    addItem, 
    toggleItem, 
    removeItem, 
    updateItem,
    reorderItems,
    sortByStoreLayout,
    clearCheckedItems, 
    clearAll 
  } = useShoppingList();
  const { searchProducts, findProduct, addProduct } = useProductDatabase();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ item: '', amount: '', unit: '', category: 'sonstiges' });
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ item: '', amount: '', unit: '', category: 'sonstiges' });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const itemInputRef = useRef(null);

  const handleAddItem = async (e, keepFormOpen = false) => {
    e.preventDefault();
    if (newItem.item.trim()) {
      // Füge das Produkt zur Datenbank hinzu falls es neu ist
      const addedProduct = await addProduct(newItem.item.trim(), newItem.category, newItem.unit || '');

      // Füge zur Einkaufsliste hinzu
      await addItem(newItem.item.trim(), newItem.amount, newItem.unit, newItem.category);
      
      // Reset Form
      setNewItem({ item: '', amount: '', unit: '', category: 'sonstiges' });
      setSearchResults([]);
      setShowSuggestions(false);
      
      if (keepFormOpen) {
        // Fokus zurück auf Input für schnelles Weitermachen
        setTimeout(() => {
          itemInputRef.current?.focus();
        }, 0);
      } else {
        setShowAddForm(false);
      }
    }
  };

  const handleSearchInput = (value) => {
    setNewItem({ ...newItem, item: value });
    
    if (value.length >= 2) {
      const results = searchProducts(value);
      setSearchResults(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectProduct = (product) => {
    setNewItem({
      item: product.name,
      amount: '',
      unit: product.commonUnit,
      category: product.category
    });
    setShowSuggestions(false);
    setSearchResults([]);
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      item: item.item,
      amount: item.amount,
      unit: item.unit,
      category: item.category || 'sonstiges'
    });
  };

  const handleSaveEdit = () => {
    if (editForm.item.trim()) {
      updateItem(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ item: '', amount: '', unit: '', category: 'sonstiges' });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.index === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const uncheckedItems = items.filter(item => !item.checked);
    const newItems = [...uncheckedItems];
    const [removed] = newItems.splice(draggedItem.index, 1);
    newItems.splice(dropIndex, 0, removed);

    // Füge gecheckte Items wieder hinzu
    const checkedItems = items.filter(item => item.checked);
    const allItems = [...newItems, ...checkedItems];

    reorderItems(allItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleSortByStore = () => {
    setShowStoreSelector(true);
  };

  const handleStoreSelected = (storeId) => {
    sortByStoreLayout();
  };

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  const getCategoryName = (categoryId) => {
    const category = storeCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Sonstiges';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Store Selector Modal */}
      <StoreSelectorModal
        isOpen={showStoreSelector}
        onClose={() => setShowStoreSelector(false)}
        onSelectStore={handleStoreSelected}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Einkaufsliste</h1>
                <p className="text-sm text-gray-600">
                  {uncheckedItems.length} {uncheckedItems.length === 1 ? 'Artikel' : 'Artikel'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Store Layout Settings */}
              <button
                onClick={() => navigate('/stores')}
                className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                title="Läden verwalten"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Sort by Store Button */}
              {uncheckedItems.length > 1 && (
                <button
                  onClick={handleSortByStore}
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                  title="Nach Laden sortieren"
                >
                  <Store className="w-5 h-5" />
                </button>
              )}
              
              {/* Add Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Liste-Umschalter */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentListType('shared')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                currentListType === 'shared'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👥 Gemeinsam
            </button>
            <button
              onClick={() => setCurrentListType('personal')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                currentListType === 'personal'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👤 Persönlich
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-96 md:rounded-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Artikel hinzufügen</h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artikel *
                </label>
                <input
                  ref={itemInputRef}
                  type="text"
                  value={newItem.item}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // Verzögerung damit onClick auf Vorschlag noch funktioniert
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="z.B. Tomaten"
                  autoFocus
                  autoComplete="off"
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((product, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {getCategoryName(product.category)}
                          </span>
                          <span>• übliche Einheit: {product.commonUnit}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Info für neues Produkt - Nur anzeigen wenn KEINE Suggestions */}
                {newItem.item.length >= 2 && searchResults.length === 0 && !showSuggestions && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-xs text-amber-800">
                      💡 Neues Produkt - wird zur Datenbank hinzugefügt
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie (Laden-Bereich)
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {storeCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hilft beim automatischen Sortieren nach Laden-Layout
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menge
                  </label>
                  <input
                    type="text"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Einheit
                  </label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="g"
                  />
                </div>
              </div>
              
              {/* NEUE BUTTON-LOGIK */}
              <div className="space-y-2">
                {/* Primärer Button: Hinzufügen & Weiter */}
                <button
                  type="button"
                  onClick={(e) => handleAddItem(e, true)}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Hinzufügen & Weiter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {/* Sekundäre Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleAddItem(e, false)}
                    className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Nur Hinzufügen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ item: '', amount: '', unit: '', category: 'sonstiges' });
                      setSearchResults([]);
                      setShowSuggestions(false);
                    }}
                    className="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Hint */}
      {uncheckedItems.length > 1 && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <GripVertical className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Sortier-Tipp</p>
              <p className="text-xs text-blue-700">
                Ziehe Artikel mit dem Griff-Symbol um die Reihenfolge zu ändern, oder nutze den Button oben für automatisches Sortieren nach Laden-Layout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Items */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">Deine Einkaufsliste ist leer</p>
            <p className="text-gray-400 text-sm">Füge Rezepte hinzu oder erstelle eigene Einträge</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unchecked Items */}
            {uncheckedItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {uncheckedItems.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={editingId !== item.id}
                    onDragStart={(e) => handleDragStart(e, item, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 flex items-center gap-3 transition-all ${
                      index !== uncheckedItems.length - 1 ? 'border-b border-gray-100' : ''
                    } ${
                      dragOverIndex === index ? 'border-t-4 border-blue-500' : ''
                    } ${
                      draggedItem?.index === index ? 'opacity-50' : ''
                    } ${
                      editingId !== item.id ? 'cursor-move' : ''
                    }`}
                  >
                    {editingId === item.id ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editForm.item}
                            onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                            placeholder="Menge"
                          />
                          <input
                            type="text"
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                            placeholder="Einheit"
                          />
                        </div>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {storeCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 p-2 text-green-600 hover:bg-green-50 rounded font-medium text-sm"
                          >
                            <Check className="w-5 h-5 inline mr-1" />
                            Speichern
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded font-medium text-sm"
                          >
                            <X className="w-5 h-5 inline mr-1" />
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Drag Handle */}
                        <div className="cursor-move touch-none">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="w-5 h-5 text-green-600 rounded cursor-pointer flex-shrink-0"
                        />

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800">{item.item}</div>
                          {(item.amount || item.unit) && (
                            <div className="text-sm text-gray-600">
                              {item.amount} {item.unit}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {getCategoryName(item.category)}
                            </span>
                            {item.recipes && item.recipes.length > 0 && (
                              <span className="text-xs text-gray-500">
                                aus: {item.recipes.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Erledigt ({checkedItems.length})
                  </h2>
                  <button
                    onClick={clearCheckedItems}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Aufräumen
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm opacity-60">
                  {checkedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 flex items-center gap-3 ${
                        index !== checkedItems.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 text-green-600 rounded cursor-pointer"
                      />
                      <div className="flex-1 line-through text-gray-500">
                        <div className="font-medium">{item.item}</div>
                        {(item.amount || item.unit) && (
                          <div className="text-sm">
                            {item.amount} {item.unit}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clear All Button */}
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Möchtest du wirklich die gesamte Liste löschen?')) {
                    clearAll();
                  }
                }}
                className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Gesamte Liste löschen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;