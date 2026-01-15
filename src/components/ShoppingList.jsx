import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, Share2 } from 'lucide-react';
import { useShoppingList } from '../context/ShoppingListContext';
import ShareListModal from './ShareListModal.jsx';

const ShoppingList = () => {
  const navigate = useNavigate();
  const { items, addItem, toggleItem, removeItem, updateItem, clearCheckedItems, clearAll } = useShoppingList();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newItem, setNewItem] = useState({ item: '', amount: '', unit: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ item: '', amount: '', unit: '' });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.item.trim()) {
      addItem(newItem.item, newItem.amount, newItem.unit);
      setNewItem({ item: '', amount: '', unit: '' });
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      item: item.item,
      amount: item.amount,
      unit: item.unit
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
    setEditForm({ item: '', amount: '', unit: '' });
  };

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                <h1 className="text-2xl font-bold text-gray-800">Einkaufsliste</h1>
                <p className="text-sm text-gray-600">
                  {uncheckedItems.length} {uncheckedItems.length === 1 ? 'Artikel' : 'Artikel'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                title="Liste teilen"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
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
      </div>

      {/* Share Modal */}
      <ShareListModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Add Item Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-96 md:rounded-lg p-6 animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Artikel hinzufügen</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artikel *
                </label>
                <input
                  type="text"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="z.B. Tomaten"
                  autoFocus
                />
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
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Hinzufügen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItem({ item: '', amount: '', unit: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
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
              <div className="bg-white rounded-lg shadow-sm">
                {uncheckedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center gap-3 ${
                      index !== uncheckedItems.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    {editingId === item.id ? (
                      <div className="flex-1 flex gap-2">
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
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="w-5 h-5 text-green-600 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.item}</div>
                          {(item.amount || item.unit) && (
                            <div className="text-sm text-gray-600">
                              {item.amount} {item.unit}
                            </div>
                          )}
                          {item.recipes && item.recipes.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              aus: {item.recipes.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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