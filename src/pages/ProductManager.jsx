import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useProductDatabase } from '../context/ProductDatabaseContext';
import { useShoppingList } from '../context/ShoppingListContext';
import ProductManagerHeader from '../components/products/ProductManagerHeader';
import AddProductModal from '../components/products/AddProductModal';
import SearchBar from '../components/products/SearchBar';
import ProductsGroupedList from '../components/products/ProductsGroupedList';
import MessageBanner from '../components/global/MessageBanner';
import EmptyState from '../components/global/EmptyState';
import { groupProductsByCategory, getCategoryName } from '../utils/productHelpers';

/**
 * ProductManager - Verwaltung der Produktdatenbank
 * 
 * Funktionen:
 * - Produkte hinzufügen, bearbeiten, löschen
 * - Suche nach Produktname oder Kategorie
 * - Gruppierung nach Kategorien
 * - Kategorie und Einheit verwalten
 */
const ProductManager = () => {
  const navigate = useNavigate();
  const { products, addProduct } = useProductDatabase();
  const { storeCategories } = useShoppingList();
  
  // UI-Zustand
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Suche
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bearbeiten
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', category: '', commonUnit: '' });
  
  // Neues Produkt
  const [newProduct, setNewProduct] = useState({ name: '', category: 'sonstiges', commonUnit: '' });
  
  // Feedback
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Zeigt temporäre Erfolgsmeldung
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Filtert Produkte nach Suchbegriff
   */
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(product.category, storeCategories).toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Gruppiert gefilterte Produkte nach Kategorie
   */
  const groupedProducts = groupProductsByCategory(filteredProducts);

  /**
   * Startet Bearbeitungs-Modus
   */
  const handleStartEdit = (product, index) => {
    setEditingId(index);
    setEditForm({
      name: product.name,
      category: product.category,
      commonUnit: product.commonUnit
    });
  };

  /**
   * Speichert bearbeitetes Produkt
   */
  const handleSaveEdit = async (index) => {
    if (!editForm.name.trim()) return;

    try {
      const newProducts = [...products];
      newProducts[index] = {
        name: editForm.name.trim(),
        category: editForm.category,
        commonUnit: editForm.commonUnit
      };

      // Firebase direkt aktualisieren
      const { database } = await import('../firebaseConfig');
      const { ref, set } = await import('firebase/database');
      const productsRef = ref(database, 'productDatabase');
      await set(productsRef, newProducts);

      showMessage('success', 'Produkt aktualisiert!');
      setEditingId(null);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      showMessage('error', 'Fehler beim Aktualisieren');
    }
  };

  /**
   * Bricht Bearbeitung ab
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', category: '', commonUnit: '' });
  };

  /**
   * Löscht Produkt nach Bestätigung
   */
  const handleDelete = async (index) => {
    if (!window.confirm('Produkt wirklich löschen?')) return;

    try {
      const newProducts = products.filter((_, i) => i !== index);

      const { database } = await import('../firebaseConfig');
      const { ref, set } = await import('firebase/database');
      const productsRef = ref(database, 'productDatabase');
      await set(productsRef, newProducts);

      showMessage('success', 'Produkt gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      showMessage('error', 'Fehler beim Löschen');
    }
  };

  /**
   * Fügt neues Produkt hinzu
   */
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    try {
      await addProduct(newProduct.name.trim(), newProduct.category, newProduct.commonUnit);
      showMessage('success', 'Produkt hinzugefügt!');
      setNewProduct({ name: '', category: 'sonstiges', commonUnit: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      showMessage('error', 'Fehler beim Hinzufügen');
    }
  };

  /**
   * Schließt Hinzufügen-Modal
   */
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setNewProduct({ name: '', category: 'sonstiges', commonUnit: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      
      {/* Header mit Zurück und Hinzufügen */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <ProductManagerHeader
            productCount={products.length}
            onBack={() => navigate('/admin')}
            onAddProduct={() => setShowAddForm(true)}
          />
        </div>
      </div>

      {/* Feedback-Nachricht */}
      {message.text && (
        <MessageBanner type={message.type} text={message.text} />
      )}

      {/* Neues Produkt Modal */}
      {showAddForm && (
        <AddProductModal
          product={newProduct}
          categories={storeCategories}
          onProductChange={setNewProduct}
          onSubmit={handleAddProduct}
          onClose={handleCloseAddForm}
        />
      )}

      {/* Suchleiste */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Produkte-Liste (gruppiert nach Kategorien) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {Object.keys(groupedProducts).length === 0 ? (
          <EmptyState
            title="Keine Produkte gefunden"
            description={searchTerm ? "Versuche einen anderen Suchbegriff" : "Füge dein erstes Produkt hinzu"}
          />
        ) : (
          <ProductsGroupedList
            groupedProducts={groupedProducts}
            products={products}
            categories={storeCategories}
            editingId={editingId}
            editForm={editForm}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditFormChange={setEditForm}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ProductManager;