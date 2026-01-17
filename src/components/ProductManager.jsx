import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Edit2, Trash2, Save, X, Plus } from 'lucide-react';
import { useProductDatabase } from '../context/ProductDatabaseContext';
import { useShoppingList } from '../context/ShoppingListContext';

const ProductManager = () => {
  const navigate = useNavigate();
  const { products, addProduct } = useProductDatabase();
  const { storeCategories } = useShoppingList();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', commonUnit: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'sonstiges', commonUnit: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Hilfsfunktion ZUERST definieren
  const getCategoryName = (categoryId) => {
    const category = storeCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Sonstiges';
  };

  // Produkte filtern - NACH getCategoryName
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(product.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gruppiere nach Kategorie
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'sonstiges';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const handleStartEdit = (product, index) => {
    setEditingId(index);
    setEditForm({
      name: product.name,
      category: product.category,
      commonUnit: product.commonUnit
    });
  };

  const handleSaveEdit = async (index) => {
    if (!editForm.name.trim()) return;

    try {
      // Erstelle neue Produktliste mit geändertem Produkt
      const newProducts = [...products];
      newProducts[index] = {
        name: editForm.name.trim(),
        category: editForm.category,
        commonUnit: editForm.commonUnit
      };

      // Speichere in Firebase
      const { database } = await import('../firebaseConfig');
      const { ref, set } = await import('firebase/database');
      const productsRef = ref(database, 'productDatabase');
      await set(productsRef, newProducts);

      setMessage({ type: 'success', text: 'Produkt aktualisiert!' });
      setEditingId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      setMessage({ type: 'error', text: 'Fehler beim Aktualisieren' });
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Produkt wirklich löschen?')) return;

    try {
      const newProducts = products.filter((_, i) => i !== index);

      const { database } = await import('../firebaseConfig');
      const { ref, set } = await import('firebase/database');
      const productsRef = ref(database, 'productDatabase');
      await set(productsRef, newProducts);

      setMessage({ type: 'success', text: 'Produkt gelöscht!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setMessage({ type: 'error', text: 'Fehler beim Löschen' });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    try {
      await addProduct(newProduct.name.trim(), newProduct.category, newProduct.commonUnit);
      setMessage({ type: 'success', text: 'Produkt hinzugefügt!' });
      setNewProduct({ name: '', category: 'sonstiges', commonUnit: '' });
      setShowAddForm(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      setMessage({ type: 'error', text: 'Fehler beim Hinzufügen' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Produktdatenbank</h1>
                <p className="text-sm text-gray-600">{products.length} Produkte</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Neues Produkt
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Neues Produkt hinzufügen</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produktname *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="z.B. Avocado"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {storeCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Übliche Einheit
                </label>
                <input
                  type="text"
                  value={newProduct.commonUnit}
                  onChange={(e) => setNewProduct({ ...newProduct, commonUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="z.B. Stück, kg, g, ml"
                />
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
                    setNewProduct({ name: '', category: 'sonstiges', commonUnit: '' });
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

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Produkte durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Keine Produkte gefunden</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProducts)
              .sort(([catA], [catB]) => {
                const orderA = storeCategories.find(c => c.id === catA)?.order || 999;
                const orderB = storeCategories.find(c => c.id === catB)?.order || 999;
                return orderA - orderB;
              })
              .map(([categoryId, categoryProducts]) => (
                <div key={categoryId}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {getCategoryName(categoryId)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({categoryProducts.length})
                    </span>
                  </h2>
                  <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                    {categoryProducts.map((product, idx) => {
                      const globalIndex = products.findIndex(p => 
                        p.name === product.name && 
                        p.category === product.category
                      );
                      
                      return (
                        <div key={idx} className="p-4">
                          {editingId === globalIndex ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                autoFocus
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                  {storeCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={editForm.commonUnit}
                                  onChange={(e) => setEditForm({ ...editForm, commonUnit: e.target.value })}
                                  placeholder="Einheit"
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(globalIndex)}
                                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  Speichern
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">
                                  Einheit: {product.commonUnit || 'keine Angabe'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStartEdit(product, globalIndex)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(globalIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;