import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Store, Edit2, Trash2, Save, X, Settings as SettingsIcon } from 'lucide-react';
import { useStoreLayouts } from '../context/StoreLayoutsContext';
import StoreLayoutEditor from './StoreLayoutEditor';

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [editingLayoutStoreId, setEditingLayoutStoreId] = useState(null);

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    try {
      await createStore(newStoreName.trim());
      setMessage({ type: 'success', text: 'Laden erstellt!' });
      setNewStoreName('');
      setShowAddForm(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Erstellen' });
    }
  };

  const handleStartRename = (store) => {
    setEditingId(store.id);
    setEditName(store.name);
  };

  const handleSaveRename = async () => {
    if (!editName.trim()) return;

    try {
      await renameStore(editingId, editName.trim());
      setMessage({ type: 'success', text: 'Laden umbenannt!' });
      setEditingId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Umbenennen' });
    }
  };

  const handleDelete = async (storeId) => {
    if (storeLayouts.length === 1) {
      alert('Du kannst den letzten Laden nicht löschen!');
      return;
    }

    if (!window.confirm('Laden wirklich löschen?')) return;

    try {
      await deleteStore(storeId);
      setMessage({ type: 'success', text: 'Laden gelöscht!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Löschen' });
    }
  };

  const handleEditLayout = (storeId) => {
    setEditingLayoutStoreId(storeId);
    setSelectedStoreId(storeId);
    setShowLayoutEditor(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Layout Editor Modal */}
      <StoreLayoutEditor
        isOpen={showLayoutEditor}
        onClose={() => {
          setShowLayoutEditor(false);
          setEditingLayoutStoreId(null);
        }}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/shopping-list')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Läden verwalten</h1>
                <p className="text-sm text-gray-600">{storeLayouts.length} {storeLayouts.length === 1 ? 'Laden' : 'Läden'}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              title="Neuer Laden"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Neuer Laden</span>
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

      {/* Add Store Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Neuen Laden anlegen</h2>
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laden-Name *
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="z.B. REWE, EDEKA, Aldi"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Der Laden wird mit Standard-Kategorien erstellt, die du anpassen kannst
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Erstellen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStoreName('');
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

      {/* Info Box */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tipp:</strong> Erstelle für jeden Supermarkt einen eigenen Laden und passe die Kategorien-Reihenfolge an. 
            Beim Sortieren der Einkaufsliste kannst du dann den passenden Laden auswählen!
          </p>
        </div>
      </div>

      {/* Stores List */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {storeLayouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">Noch keine Läden angelegt</p>
            <p className="text-gray-400 text-sm">Erstelle deinen ersten Laden!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeLayouts.map((store) => (
              <div
                key={store.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all ${
                  selectedStoreId === store.id ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                {editingId === store.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveRename}
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
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedStoreId === store.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Store className={`w-6 h-6 ${
                            selectedStoreId === store.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{store.name}</h3>
                          <p className="text-sm text-gray-500">
                            {store.categories?.length || 0} Kategorien
                          </p>
                        </div>
                      </div>
                      {selectedStoreId === store.id && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                          Aktiv
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedStoreId(store.id)}
                        className={`flex-1 py-2 rounded-lg transition-colors font-medium ${
                          selectedStoreId === store.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Als aktiv setzen
                      </button>
                      <button
                        onClick={() => handleEditLayout(store.id)}
                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        title="Layout bearbeiten"
                      >
                        <SettingsIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStartRename(store)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Umbenennen"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Löschen"
                        disabled={storeLayouts.length === 1}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresManager;