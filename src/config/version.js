/**
 * version.js - Firebase Pfad-Helfer für V2
 * 
 * Zentrale Stelle für alle Firebase-Pfade.
 * Nutzt neue V2-Struktur mit private/groups.
 * 
 */

/**
 * getFirebasePath - Gibt korrekten Firebase-Pfad zurück
 * 
 * VERWENDUNG:
 * ```
 * const path = getFirebasePath.recipes('private', userId, groupId);
 * // → "recipes/private/{userId}"
 * 
 * const path = getFirebasePath.recipes('group', userId, groupId);
 * // → "recipes/groups/{groupId}"
 * ```
 */
export const getFirebasePath = {
  
    /**
     * Rezepte
     * @param {string} scope - 'private' oder 'group'
     * @param {string} userId - User-ID
     * @param {string} groupId - Gruppen-ID (optional)
     * @returns {string|null} Firebase-Pfad
     */
    recipes: (scope, userId, groupId) => {
      if (scope === 'private' && userId) {
        return `recipesV2/private/${userId}`;
      }
      if (scope === 'group' && groupId) {
        return `recipesV2/groups/${groupId}`;
      }
      return null;
    },
    
    /**
     * Shopping List
     * @param {string} scope - 'private' oder 'group'
     * @param {string} userId - User-ID
     * @param {string} groupId - Gruppen-ID (optional)
     * @returns {string|null} Firebase-Pfad
     */
    shoppingList: (scope, userId, groupId) => {
      if (scope === 'private' && userId) {
        return `shoppingLists/private/${userId}/items`;
      }
      if (scope === 'group' && groupId) {
        return `shoppingLists/groups/${groupId}/items`;
      }
      return null;
    },
    
    /**
     * Meal Planner
     * @param {string} scope - 'private' oder 'group'
     * @param {string} userId - User-ID
     * @param {string} groupId - Gruppen-ID (optional)
     * @returns {string|null} Firebase-Pfad
     */
    mealPlanner: (scope, userId, groupId) => {
      if (scope === 'private' && userId) {
        return `mealPlanner/private/${userId}/currentWeek`;
      }
      if (scope === 'group' && groupId) {
        return `mealPlanner/groups/${groupId}/currentWeek`;
      }
      return null;
    },
    
    /**
     * Product Database
     * @param {string} scope - 'private' oder 'group'
     * @param {string} userId - User-ID
     * @param {string} groupId - Gruppen-ID (optional)
     * @returns {string|null} Firebase-Pfad
     */
    productDatabase: (scope, userId, groupId) => {
      if (scope === 'private' && userId) {
        return `productDatabase/private/${userId}`;
      }
      if (scope === 'group' && groupId) {
        return `productDatabase/groups/${groupId}`;
      }
      return null;
    },
    
    /**
     * Store Layouts
     * @param {string} scope - 'private' oder 'group'
     * @param {string} userId - User-ID
     * @param {string} groupId - Gruppen-ID (optional)
     * @returns {string|null} Firebase-Pfad
     */
    storeLayouts: (scope, userId, groupId) => {
      if (scope === 'private' && userId) {
        return `storeLayouts/private/${userId}`;
      }
      if (scope === 'group' && groupId) {
        return `storeLayouts/groups/${groupId}`;
      }
      return null;
    }
  };