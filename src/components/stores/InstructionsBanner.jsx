import React from 'react';

/**
 * InstructionsBanner - Hinweis-Banner für Layout-Editor
 * 
 * Erklärt dem Benutzer wie der Layout-Editor funktioniert
 * und welchen Nutzen die Sortierung hat
 */
const InstructionsBanner = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        💡 <strong>Tipp:</strong> Ziehe die Kategorien in die Reihenfolge, wie sie in deinem Supermarkt angeordnet sind. 
        So kannst du deine Einkaufsliste automatisch nach dem Laden-Layout sortieren und sparst Zeit beim Einkaufen!
      </p>
    </div>
  );
};

export default InstructionsBanner;