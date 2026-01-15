import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, remove, push } from 'firebase/database';

const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime Listener für Rezepte
    const recipesRef = ref(database, 'recipes');
    
    const unsubscribe = onValue(recipesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Konvertiere Object zu Array
        const recipesArray = Object.entries(data).map(([id, recipe]) => ({
          id,
          ...recipe
        }));
        setRecipes(recipesArray);
      } else {
        setRecipes([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addRecipe = async (recipeData) => {
    try {
      const recipesRef = ref(database, 'recipes');
      const newRecipeRef = push(recipesRef);
      await set(newRecipeRef, recipeData);
      return newRecipeRef.key;
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      throw error;
    }
  };

  const updateRecipe = async (id, recipeData) => {
    try {
      const recipeRef = ref(database, `recipes/${id}`);
      await set(recipeRef, recipeData);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id) => {
    try {
      const recipeRef = ref(database, `recipes/${id}`);
      await remove(recipeRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  const value = {
    recipes,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};