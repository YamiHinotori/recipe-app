import React from 'react';

/**
 * EmptyState - Wiederverwendbarer Empty-State
 * 
 * Zeigt Nachricht wenn keine Daten vorhanden sind
 * 
 * Props:
 * @param {string} title - Haupttitel
 * @param {string} description - Optionale Beschreibung
 * @param {node} icon - Optionales Icon-Element
 * @param {node} action - Optionale Aktions-Komponente (z.B. Button)
 */
const EmptyState = ({ title, description, icon, action }) => {
  return (
    <div className="text-center py-12 px-4">
      
      {/* Icon (falls vorhanden) */}
      {icon && (
        <div className="mb-4 flex justify-center text-gray-400">
          {icon}
        </div>
      )}

      {/* Titel */}
      <p className="text-gray-500 text-lg font-medium mb-2">
        {title}
      </p>

      {/* Beschreibung (optional) */}
      {description && (
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* Aktion (optional, z.B. "Rezept erstellen" Button) */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;