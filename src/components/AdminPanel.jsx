import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [message, setMessage] = useState({ type: '', text: '' });

  function getEmptyForm() {
    return {
      title: '',
      description: '',
      image: '',
      prepTime: 0,
      cookTime: 0,
      servings: 4,
      difficulty: 'mittel',
      category: 'Hauptgericht',
      tags: '',
      ingredients: [{ item: '', amount: '', unit: '' }],
      instructions: [''],
      notes: ''
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const recipeData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        ingredients: formData.ingredients.filter(i => i.item.trim()),
        instructions: formData.instructions.filter(i => i.trim()),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 4
      };

      if (editingId) {
        await updateRecipe(editingId, recipeData);
        setMessage({ type: 'success', text: 'Rezept aktualisiert!' });
      } else {
        await addRecipe(recipeData);
        setMessage({ type: 'success', text: 'Rezept hinzugefügt!' });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(getEmptyForm());
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler beim Speichern' });
    }
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setFormData({
      ...recipe,
      tags: recipe.tags.join(', ')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Rezept wirklich löschen?')) {
      try {
        await deleteRecipe(id);
        setMessage({ type: 'success', text: 'Rezept gelöscht!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Fehler beim Löschen' });
      }
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { item: '', amount: '', unit: '' }]
    });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const removeInstruction = (index) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-sm text-gray-600">{recipes.length} Rezepte</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                title="Produkte verwalten"
              >
                <Package className="w-5 h-5" />
                <span className="hidden md:inline">Produkte verwalten</span>
              </button>
              
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData(getEmptyForm());
                }}
                className="bg-orange-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                title="Neues Rezept"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Neues Rezept</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`max-w-7xl mx-auto px-4 mt-4`}>
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Recipe Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-20 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-lg max-w-3xl w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Rezept bearbeiten' : 'Neues Rezept'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(getEmptyForm());
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Grundinformationen</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Titel *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Beschreibung</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bild URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Vorbereitung (Min)</label>
                      <input
                        type="number"
                        value={formData.prepTime}
                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kochen (Min)</label>
                      <input
                        type="number"
                        value={formData.cookTime}
                        onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Portionen</label>
                      <input
                        type="number"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Schwierigkeit</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="einfach">Einfach</option>
                        <option value="mittel">Mittel</option>
                        <option value="schwer">Schwer</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kategorie</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tags (kommagetrennt)</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="pasta, schnell, vegan"
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Zutaten</h3>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Zutat hinzufügen
                    </button>
                  </div>
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient.item}
                        onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                        placeholder="Zutat"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                        placeholder="Menge"
                        className="w-20 px-3 py-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        placeholder="Einheit"
                        className="w-20 px-3 py-2 border rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Zubereitung</h3>
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Schritt hinzufügen
                    </button>
                  </div>
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Schritt ${index + 1}`}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded h-fit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">Notizen / Tipps</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData(getEmptyForm());
                    }}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recipes List */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {recipe.image && (
                <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;