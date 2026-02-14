import React from 'react';

/**
 * InfoBanner - Informations-Banner mit Tipps
 * 
 * Zeigt Hinweis zur Verwendung der Laden-Verwaltung
 */
const InfoBanner = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        💡 <strong>Tipp:</strong> Erstelle für jeden Supermarkt einen eigenen Laden und passe die Kategorien-Reihenfolge an. 
        Beim Sortieren der Einkaufsliste kannst du dann den passenden Laden auswählen!
      </p>
    </div>
  );
};

export default InfoBanner;