import React from 'react';

/**
 * ListTypeToggle - Toggle zwischen gemeinsamer und persönlicher Liste
 * 
 * Ermöglicht Umschalten zwischen verschiedenen Listentypen
 * 
 * Props:
 * @param {string} currentListType - Aktueller Listen-Typ ('shared' oder 'personal')
 * @param {function} onToggle - Callback beim Umschalten (neuer Typ als Parameter)
 */
const ListTypeToggle = ({ currentListType, onToggle }) => {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
      
      {/* Gemeinsame Liste */}
      <button
        onClick={() => onToggle('shared')}
        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
          currentListType === 'shared'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-pressed={currentListType === 'shared'}
      >
        👥 Gemeinsam
      </button>

      {/* Persönliche Liste */}
      <button
        onClick={() => onToggle('personal')}
        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
          currentListType === 'personal'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-pressed={currentListType === 'personal'}
      >
        👤 Persönlich
      </button>
    </div>
  );
};

export default ListTypeToggle;