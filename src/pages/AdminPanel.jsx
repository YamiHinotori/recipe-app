import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import RecipeForm from '../components/admin/RecipeForm';
import RecipeCard from '../components/admin/RecipeCard';
import MessageBanner from '../components/global/MessageBanner';

/**
 * AdminPanel - Hauptkomponente für die Rezeptverwaltung
 * 
 * Funktionen:
 * - Anzeige aller Rezepte in einer Grid-Ansicht
 * - Öffnen des Formulars zum Erstellen/Bearbeiten
 * - Löschen von Rezepten
 * - Navigation zu Produktverwaltung, Gruppenverwaltung
 * - Navigation zu Nutzerverwaltung (nur für Admins)
 */
const AdminPanel = () => {
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  
  // UI-Zustand für Formular-Modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Feedback-Nachrichten für Benutzer
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Zeigt temporäre Erfolgsmeldung für 3 Sekunden
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Öffnet Formular im Erstell-Modus
   */
  const handleCreate = () => {
    setShowForm(true);
    setEditingId(null);
  };

  /**
   * Öffnet Formular im Bearbeitungs-Modus
   */
  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setShowForm(true);
  };

  /**
   * Speichert neues oder bearbeitetes Rezept
   */
  const handleSave = async (recipeData) => {
    try {
      if (editingId) {
        await updateRecipe(editingId, recipeData);
        showMessage('success', 'Rezept aktualisiert!');
      } else {
        await addRecipe(recipeData);
        showMessage('success', 'Rezept hinzugefügt!');
      }
      
      // Formular schließen und zurücksetzen
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      showMessage('error', 'Fehler beim Speichern');
    }
  };

  /**
   * Löscht Rezept nach Bestätigung
   */
  const handleDelete = async (id) => {
    if (window.confirm('Rezept wirklich löschen?')) {
      try {
        await deleteRecipe(id);
        showMessage('success', 'Rezept gelöscht!');
      } catch (error) {
        showMessage('error', 'Fehler beim Löschen');
      }
    }
  };

  /**
   * Schließt Formular ohne zu speichern
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">

      {/* Sticky Header – nur Titel und primäre Aktion */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            {/* Zurück-Button und Titel */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Zurück zur Startseite"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Rezepte verwalten</h1>
                <p className="text-sm text-gray-600">{recipes.length} Rezepte</p>
              </div>
            </div>

            {/* Primäre Aktion: Neues Rezept */}
            <button
              onClick={handleCreate}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Neues Rezept</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback-Banner für Erfolgs-/Fehlermeldungen */}
      {message.text && (
        <MessageBanner type={message.type} text={message.text} />
      )}

      {/* Formular-Modal zum Erstellen/Bearbeiten */}
      {showForm && (
        <RecipeForm
          editingId={editingId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Grid mit allen Rezepten */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => handleEdit(recipe)}
              onDelete={() => handleDelete(recipe.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;