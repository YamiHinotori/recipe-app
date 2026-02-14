import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useShoppingList } from '../context/ShoppingListContext';
import { useProductDatabase } from '../context/ProductDatabaseContext';
import ShoppingListHeader from '../components/shopping-list/ShoppingListHeader';
import ListTypeToggle from '../components/shopping-list/ListTypeToggle';
import AddItemModal from '../components/shopping-list/AddItemModal';
import DragDropHint from '../components/shopping-list/DragDropHint';
import ItemsList from '../components/shopping-list/ItemsList';
import StoreSelectorModal from '../components/shopping-list/StoreSelectorModal';
import EmptyState from '../components/global/EmptyState';

/**
 * ShoppingList - Hauptseite der Einkaufsliste
 * 
 * Funktionen:
 * - Anzeige aller Einkaufslisteneinträge
 * - Hinzufügen, Bearbeiten, Löschen von Einträgen
 * - Abhaken/Abholen von Einträgen
 * - Drag & Drop Sortierung
 * - Automatische Sortierung nach Laden-Layout
 * - Umschalten zwischen gemeinsamer und persönlicher Liste
 * - Autocomplete mit Produktdatenbank
 */
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
  const { searchProducts, addProduct } = useProductDatabase();
  
  // UI-Zustand
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  
  // Formular-Zustand für neuen Artikel
  const [newItem, setNewItem] = useState({ 
    item: '', 
    amount: '', 
    unit: '', 
    category: 'sonstiges' 
  });
  
  // Autocomplete-Zustand
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Bearbeitungs-Zustand
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    item: '', 
    amount: '', 
    unit: '', 
    category: 'sonstiges' 
  });
  
  // Drag & Drop Zustand
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  const itemInputRef = useRef(null);

  /**
   * Fügt neuen Artikel zur Liste hinzu
   * @param {boolean} keepFormOpen - Formular offen lassen für schnelles Hinzufügen
   */
  const handleAddItem = async (e, keepFormOpen = false) => {
    e.preventDefault();
    if (newItem.item.trim()) {
      // Produkt zur Datenbank hinzufügen (falls neu)
      await addProduct(newItem.item.trim(), newItem.category, newItem.unit || '');

      // Zur Einkaufsliste hinzufügen
      await addItem(newItem.item.trim(), newItem.amount, newItem.unit, newItem.category);
      
      // Formular zurücksetzen
      setNewItem({ item: '', amount: '', unit: '', category: 'sonstiges' });
      setSearchResults([]);
      setShowSuggestions(false);
      
      if (keepFormOpen) {
        // Fokus zurück für schnelles Weitermachen
        setTimeout(() => itemInputRef.current?.focus(), 0);
      } else {
        setShowAddForm(false);
      }
    }
  };

  /**
   * Verarbeitet Sucheingabe für Autocomplete
   */
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

  /**
   * Wählt Produkt aus Autocomplete-Vorschlägen aus
   */
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

  /**
   * Startet Bearbeitungsmodus für Artikel
   */
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      item: item.item,
      amount: item.amount,
      unit: item.unit,
      category: item.category || 'sonstiges'
    });
  };

  /**
   * Speichert Bearbeitungen
   */
  const handleSaveEdit = () => {
    if (editForm.item.trim()) {
      updateItem(editingId, editForm);
      setEditingId(null);
    }
  };

  /**
   * Bricht Bearbeitung ab
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ item: '', amount: '', unit: '', category: 'sonstiges' });
  };

  /**
   * Drag & Drop: Start
   */
  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Drag & Drop: Over (Hover während Drag)
   */
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  /**
   * Drag & Drop: Leave (Maus verlässt Drop-Zone)
   */
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  /**
   * Drag & Drop: Drop (Element fallen lassen)
   */
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.index === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    // Nur nicht-abgehakte Items sortieren
    const uncheckedItems = items.filter(item => !item.checked);
    const newItems = [...uncheckedItems];
    const [removed] = newItems.splice(draggedItem.index, 1);
    newItems.splice(dropIndex, 0, removed);

    // Abgehakte Items wieder anhängen
    const checkedItems = items.filter(item => item.checked);
    const allItems = [...newItems, ...checkedItems];

    reorderItems(allItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  /**
   * Drag & Drop: End (Drag beendet)
   */
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  /**
   * Öffnet Laden-Auswahl für Sortierung
   */
  const handleSortByStore = () => {
    setShowStoreSelector(true);
  };

  /**
   * Sortiert nach ausgewähltem Laden
   */
  const handleStoreSelected = (storeId) => {
    sortByStoreLayout();
  };

  /**
   * Schließt Formular und setzt alles zurück
   */
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setNewItem({ item: '', amount: '', unit: '', category: 'sonstiges' });
    setSearchResults([]);
    setShowSuggestions(false);
  };

  /**
   * Löscht gesamte Liste nach Bestätigung
   */
  const handleClearAll = () => {
    if (window.confirm('Möchtest du wirklich die gesamte Liste löschen?')) {
      clearAll();
    }
  };

  // Gefilterte Items
  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  /**
   * Gibt Kategorie-Namen für ID zurück
   */
  const getCategoryName = (categoryId) => {
    const category = storeCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Sonstiges';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Laden-Auswahl Modal */}
      <StoreSelectorModal
        isOpen={showStoreSelector}
        onClose={() => setShowStoreSelector(false)}
        onSelectStore={handleStoreSelected}
      />

      {/* Header mit Titel und Aktions-Buttons */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ShoppingListHeader
            itemCount={uncheckedItems.length}
            onBack={() => navigate('/')}
            onManageStores={() => navigate('/stores')}
            onSortByStore={handleSortByStore}
            onAddItem={() => setShowAddForm(true)}
            showSortButton={uncheckedItems.length > 1}
          />
        </div>
        
        {/* Toggle zwischen gemeinsamer und persönlicher Liste */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <ListTypeToggle
            currentListType={currentListType}
            onToggle={setCurrentListType}
          />
        </div>
      </div>

      {/* Formular zum Hinzufügen von Artikeln */}
      {showAddForm && (
        <AddItemModal
          formData={newItem}
          onFormChange={setNewItem}
          searchResults={searchResults}
          showSuggestions={showSuggestions}
          storeCategories={storeCategories}
          itemInputRef={itemInputRef}
          onSearchInput={handleSearchInput}
          onSelectProduct={handleSelectProduct}
          onAddItem={handleAddItem}
          onClose={handleCloseAddForm}
          getCategoryName={getCategoryName}
          setShowSuggestions={setShowSuggestions}
        />
      )}

      {/* Hinweis für Drag & Drop */}
      {uncheckedItems.length > 1 && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <DragDropHint />
        </div>
      )}

      {/* Einkaufslisten-Einträge */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <EmptyState
            title="Deine Einkaufsliste ist leer"
            description="Füge Rezepte hinzu oder erstelle eigene Einträge"
          />
        ) : (
          <ItemsList
            uncheckedItems={uncheckedItems}
            checkedItems={checkedItems}
            editingId={editingId}
            editForm={editForm}
            draggedItem={draggedItem}
            dragOverIndex={dragOverIndex}
            storeCategories={storeCategories}
            onToggleItem={toggleItem}
            onRemoveItem={removeItem}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditFormChange={setEditForm}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onClearChecked={clearCheckedItems}
            onClearAll={handleClearAll}
            getCategoryName={getCategoryName}
          />
        )}
      </div>
    </div>
  );
};

export default ShoppingList;