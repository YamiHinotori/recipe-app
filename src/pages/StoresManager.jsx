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
 * StoresManager - Verwaltung aller Läden und deren Layouts
 * 
 * Funktionen:
 * - Läden erstellen, umbenennen, löschen
 * - Aktiven Laden auswählen
 * - Layout-Editor für Kategorien-Reihenfolge öffnen
 * - Feedback-Nachrichten anzeigen
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
   */
  const handleStartRename = (store) => {
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
      showMessage('error', 'Fehler beim Umbenennen');
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
   */
  const handleDelete = async (storeId) => {
    // Letzten Laden schützen
    if (storeLayouts.length === 1) {
      alert('Du kannst den letzten Laden nicht löschen!');
      return;
    }

    if (!window.confirm('Laden wirklich löschen?')) return;

    try {
      await deleteStore(storeId);
      showMessage('success', 'Laden gelöscht!');
    } catch (error) {
      showMessage('error', 'Fehler beim Löschen');
    }
  };

  /**
   * Öffnet Layout-Editor für Laden
   */
  const handleEditLayout = (storeId) => {
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
    <div className="min-h-screen bg-gray-50 pb-8">
      
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
            onBack={() => navigate('/shopping-list')}
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