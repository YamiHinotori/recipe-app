/**
 * RecipeContext - Vereinfachte Version
 * 
 * KONZEPT:
 * - Jeder User erstellt Rezepte in recipes/private/{uid}/
 * - Wenn User in Gruppe ist: Sieht alle Rezepte aller Gruppenmitglieder
 * - KEINE separaten Gruppen-Rezepte mehr!
 * 
 * FIREBASE STRUKTUR:
 * ```
 * recipes/
 *   private/
 *     {userId}/
 *       {recipeId}/
 *         title, ingredients, ...
 * ```
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';
import { useGroup } from './GroupContext.jsx';

const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const { user } = useAuth();
  const { group, hasGroup, members } = useGroup();
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================================
  // FIREBASE SYNC - LÄDT REZEPTE VON ALLEN GRUPPENMITGLIEDERN
  // ==========================================================================
  
  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    // Liste der User-IDs deren Rezepte geladen werden sollen
    const userIdsToLoad = hasGroup && members.length > 0
      ? members.map(m => m.uid)  // Alle Gruppenmitglieder
      : [user.uid];               // Nur ich

    const unsubscribers = [];
    const allRecipes = {};

    // Für jeden User: Lade seine Rezepte
    userIdsToLoad.forEach(userId => {
      const userRecipesRef = ref(database, `recipesV2/private/${userId}`);
      
      const unsubscribe = onValue(userRecipesRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          // Speichere Rezepte mit User-ID als Prefix
          Object.entries(data).forEach(([recipeId, recipeData]) => {
            allRecipes[`${userId}_${recipeId}`] = {
              id: recipeId,
              ...recipeData,
              _ownerId: userId,
              _isOwn: userId === user.uid
            };
          });
        } else {
          // Entferne Rezepte dieses Users
          Object.keys(allRecipes).forEach(key => {
            if (key.startsWith(`${userId}_`)) {
              delete allRecipes[key];
            }
          });
        }
        
        // Finde Creator-Namen
        const recipesWithCreator = Object.values(allRecipes).map(recipe => {
          let creatorName = 'Unbekannt';
          
          if (recipe._ownerId === user.uid) {
            creatorName = 'Du';
          } else {
            const creator = members.find(m => m.uid === recipe._ownerId);
            if (creator) {
              creatorName = creator.displayName || creator.email.split('@')[0];
            }
          }
          
          return {
            ...recipe,
            _creatorName: creatorName
          };
        });
        
        setRecipes(recipesWithCreator);
        setLoading(false);
      });
      
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, hasGroup, members]);

  // ==========================================================================
  // CRUD FUNKTIONEN - Immer in eigenem private/{uid}/
  // ==========================================================================

  const addRecipe = async (recipeData) => {
    if (!user) return;

    try {
      const recipesRef = ref(database, `recipesV2/private/${user.uid}`);
      const newRecipeRef = push(recipesRef);
      
      await set(newRecipeRef, recipeData);
      return newRecipeRef.key;
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      throw error;
    }
  };

  const updateRecipe = async (id, recipeData) => {
    if (!user) return;

    try {
      const recipeRef = ref(database, `recipesV2/private/${user.uid}/${id}`);
      await set(recipeRef, recipeData);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id) => {
    if (!user) return;

    try {
      const recipeRef = ref(database, `recipesV2/private/${user.uid}/${id}`);
      await remove(recipeRef);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      throw error;
    }
  };

  const value = {
    recipes,
    loading,
    hasGroup,
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