import React from 'react';

/**
 * ListTypeToggle - Toggle zwischen gemeinsamer und persönlicher Liste
 * 
 * Ermöglicht Umschalten zwischen verschiedenen Listentypen
 * 
 * Props:
 * @param {string} currentListType - Aktueller Listen-Typ ('group' oder 'private')
 * @param {function} onToggle - Callback beim Umschalten (neuer Typ als Parameter)
 */
const ListTypeToggle = ({ currentListType, onToggle }) => {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
      
      {/* Gemeinsame Liste */}
      <button
        onClick={() => onToggle('group')}
        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
          currentListType === 'group'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-pressed={currentListType === 'group'}
      >
        👥 Gemeinsam
      </button>

      {/* Persönliche Liste */}
      <button
        onClick={() => onToggle('private')}
        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
          currentListType === 'private'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-pressed={currentListType === 'private'}
      >
        👤 Persönlich
      </button>
    </div>
  );
};

export default ListTypeToggle;