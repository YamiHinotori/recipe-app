import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStoreLayouts } from '../context/StoreLayoutsContext';
import StoresManagerHeader from '../components/stores/StoresManagerHeader';
import AddStoreModal from '../components/stores/AddStoreModal';
import StoreLayoutEditor from '../components/stores/StoreLayoutEditor';
import InfoBanner from '../components/stores/InfoBanner';
import StoresList from '../components/stores/StoresList';
import MessageBanner from '../components/global/MessageBanner';
import EmptyState from '../components/global/EmptyState';

/**
 * StoresManager - ANGEPASST mit Ownership-Checks
 * 
 * Funktionen:
 * - Läden erstellen (eigene)
 * - Läden umbenennen (nur eigene!)
 * - Läden löschen (nur eigene!)
 * - Aktiven Laden auswählen (alle sichtbar)
 * - Layout-Editor öffnen (nur für eigene)
 */
const StoresManager = () => {
  const navigate = useNavigate();
  const { 
    storeLayouts, 
    selectedStoreId,
    setSelectedStoreId,
    createStore, 
    renameStore, 
    deleteStore 
  } = useStoreLayouts();

  // UI-Zustand
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [editingLayoutStoreId, setEditingLayoutStoreId] = useState(null);
  
  // Formular-Zustand
  const [newStoreName, setNewStoreName] = useState('');
  
  // Umbenennen-Zustand
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  // Feedback-Nachricht
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Zeigt temporäre Erfolgsmeldung
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Erstellt neuen Laden
   */
  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    try {
      await createStore(newStoreName.trim());
      showMessage('success', 'Laden erstellt!');
      setNewStoreName('');
      setShowAddForm(false);
    } catch (error) {
      showMessage('error', 'Fehler beim Erstellen');
    }
  };

  /**
   * Startet Umbenennen-Modus
   * NUR für eigene Stores!
   */
  const handleStartRename = (store) => {
    if (!store._isOwn) {
      showMessage('error', 'Du kannst nur deine eigenen Läden umbenennen');
      return;
    }
    
    setEditingId(store.id);
    setEditName(store.name);
  };

  /**
   * Speichert umbenannten Laden
   */
  const handleSaveRename = async () => {
    if (!editName.trim()) return;

    try {
      await renameStore(editingId, editName.trim());
      showMessage('success', 'Laden umbenannt!');
      setEditingId(null);
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Umbenennen');
    }
  };

  /**
   * Bricht Umbenennen ab
   */
  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  /**
   * Löscht Laden nach Bestätigung
   * NUR eigene Läden!
   */
  const handleDelete = async (storeId) => {
    const store = storeLayouts.find(s => s.id === storeId);
    
    if (!store._isOwn) {
      showMessage('error', 'Du kannst nur deine eigenen Läden löschen');
      return;
    }
    
    // Eigene Läden zählen
    const ownStores = storeLayouts.filter(s => s._isOwn);
    if (ownStores.length === 1) {
      showMessage('error', 'Du kannst deinen letzten Laden nicht löschen!');
      return;
    }

    if (!window.confirm('Laden wirklich löschen?')) return;

    try {
      await deleteStore(storeId);
      showMessage('success', 'Laden gelöscht!');
    } catch (error) {
      showMessage('error', error.message || 'Fehler beim Löschen');
    }
  };

  /**
   * Öffnet Layout-Editor für Laden
   * NUR für eigene Läden!
   */
  const handleEditLayout = (storeId) => {
    const store = storeLayouts.find(s => s.id === storeId);
    
    if (!store._isOwn) {
      showMessage('error', 'Du kannst nur deine eigenen Läden bearbeiten');
      return;
    }
    
    setEditingLayoutStoreId(storeId);
    setSelectedStoreId(storeId);
    setShowLayoutEditor(true);
  };

  /**
   * Schließt Layout-Editor
   */
  const handleCloseLayoutEditor = () => {
    setShowLayoutEditor(false);
    setEditingLayoutStoreId(null);
  };

  /**
   * Schließt Hinzufügen-Modal
   */
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setNewStoreName('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      
      {/* Layout-Editor Modal */}
      <StoreLayoutEditor
        isOpen={showLayoutEditor}
        onClose={handleCloseLayoutEditor}
      />

      {/* Header mit Zurück-Button und Hinzufügen-Button */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <StoresManagerHeader
            storeCount={storeLayouts.length}
            onBack={() => navigate('/settings')}
            onAddStore={() => setShowAddForm(true)}
          />
        </div>
      </div>

      {/* Feedback-Nachricht */}
      {message.text && (
        <MessageBanner type={message.type} text={message.text} />
      )}

      {/* Neuen Laden hinzufügen Modal */}
      {showAddForm && (
        <AddStoreModal
          storeName={newStoreName}
          onStoreNameChange={setNewStoreName}
          onSubmit={handleAddStore}
          onClose={handleCloseAddForm}
        />
      )}

      {/* Info-Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <InfoBanner />
      </div>

      {/* Läden-Liste */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {storeLayouts.length === 0 ? (
          <EmptyState
            title="Noch keine Läden angelegt"
            description="Erstelle deinen ersten Laden!"
          />
        ) : (
          <StoresList
            stores={storeLayouts}
            selectedStoreId={selectedStoreId}
            editingId={editingId}
            editName={editName}
            onSelectStore={setSelectedStoreId}
            onEditLayout={handleEditLayout}
            onStartRename={handleStartRename}
            onSaveRename={handleSaveRename}
            onCancelRename={handleCancelRename}
            onEditNameChange={setEditName}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default StoresManager;