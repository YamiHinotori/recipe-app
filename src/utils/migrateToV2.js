/**
 * migrateToV2.js - Einmaliges Migrations-Script
 * 
 * ACHTUNG: Nur einmal ausführen!
 * Kopiert V1-Daten nach V2-Struktur
 */

import { database } from '../firebaseConfig';
import { ref, get, set } from 'firebase/database';

/**
 * Migriert alle Daten für einen User von V1 zu V2
 * 
 * @param {string} userId - User-ID
 * @returns {Promise<object>} Migration-Ergebnis
 */
export async function migrateUserToV2(userId) {
  console.log(`🔄 Starte Migration für User ${userId}...`);
  
  const results = {
    recipes: false,
    shoppingList: false,
    mealPlanner: false,
    productDatabase: false,
    storeLayouts: false
  };
  
  try {
    // ========================================================================
    // 1. REZEPTE migrieren
    // ========================================================================
    console.log('📚 Migriere Rezepte...');
    
    const recipesSnapshot = await get(ref(database, 'recipes'));
    if (recipesSnapshot.exists()) {
      const recipes = recipesSnapshot.val();
      
      // Kopiere nach recipesV2/private/{userId}/
      await set(ref(database, `recipesV2/private/${userId}`), recipes);
      
      console.log(`✅ ${Object.keys(recipes).length} Rezepte migriert`);
      results.recipes = true;
    } else {
      console.log('ℹ️ Keine Rezepte zum Migrieren');
      results.recipes = true;
    }
    
    // ========================================================================
    // 2. EINKAUFSLISTE migrieren
    // ========================================================================
    console.log('🛒 Migriere Einkaufsliste...');
    
    // Personal List
    const personalSnapshot = await get(
      ref(database, `shoppingLists/personal/${userId}/items`)
    );
    
    if (personalSnapshot.exists()) {
      const items = personalSnapshot.val();
      
      // Kopiere nach shoppingListsV2/private/{userId}/items
      await set(
        ref(database, `shoppingListsV2/private/${userId}/items`),
        items
      );
      
      console.log(`✅ ${Object.keys(items).length} Items migriert`);
      results.shoppingList = true;
    } else {
      console.log('ℹ️ Keine Einkaufsliste zum Migrieren');
      results.shoppingList = true;
    }
    
    // ========================================================================
    // 3. WOCHENPLANER migrieren
    // ========================================================================
    console.log('📅 Migriere Wochenplaner...');
    
    const plannerSnapshot = await get(
      ref(database, `mealPlanner/${userId}/currentWeek`)
    );
    
    if (plannerSnapshot.exists()) {
      const week = plannerSnapshot.val();
      
      // Kopiere nach mealPlannerV2/private/{userId}/currentWeek
      await set(
        ref(database, `mealPlannerV2/private/${userId}/currentWeek`),
        week
      );
      
      console.log('✅ Wochenplaner migriert');
      results.mealPlanner = true;
    } else {
      console.log('ℹ️ Kein Wochenplaner zum Migrieren');
      results.mealPlanner = true;
    }
    
    // ========================================================================
    // 4. PRODUKTDATENBANK migrieren
    // ========================================================================
    console.log('📦 Migriere Produktdatenbank...');
    
    const productsSnapshot = await get(ref(database, 'productDatabase'));
    
    if (productsSnapshot.exists()) {
      const products = productsSnapshot.val();
      
      // Kopiere nach productDatabaseV2/private/{userId}
      await set(
        ref(database, `productDatabaseV2/private/${userId}`),
        products
      );
      
      console.log(`✅ ${products.length} Produkte migriert`);
      results.productDatabase = true;
    } else {
      console.log('ℹ️ Keine Produktdatenbank zum Migrieren');
      results.productDatabase = true;
    }
    
    // ========================================================================
    // 5. STORE LAYOUTS migrieren
    // ========================================================================
    console.log('🏪 Migriere Store Layouts...');
    
    const layoutsSnapshot = await get(ref(database, 'storeLayouts'));
    
    if (layoutsSnapshot.exists()) {
      const layouts = layoutsSnapshot.val();
      
      // Kopiere nach storeLayoutsV2/private/{userId}
      await set(
        ref(database, `storeLayoutsV2/private/${userId}`),
        layouts
      );
      
      console.log(`✅ ${Object.keys(layouts).length} Layouts migriert`);
      results.storeLayouts = true;
    } else {
      console.log('ℹ️ Keine Layouts zum Migrieren');
      results.storeLayouts = true;
    }
    
    // ========================================================================
    // FERTIG!
    // ========================================================================
    
    console.log('✅ Migration erfolgreich abgeschlossen!');
    console.log('Ergebnisse:', results);
    
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error('❌ Migration fehlgeschlagen:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}