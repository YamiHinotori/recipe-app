import React from 'react';
import { GripVertical } from 'lucide-react';

/**
 * DragDropHint - Hinweis-Banner für Drag & Drop Funktionalität
 * 
 * Erklärt dem Benutzer die Sortier-Möglichkeiten
 */
const DragDropHint = () => {
  return (
    <div className="hidden md:flex bg-blue-50 border border-blue-200 rounded-lg p-3 items-start gap-3">
      <GripVertical className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-blue-800 font-medium">
          Sortier-Tipp
        </p>
        <p className="text-xs text-blue-700">
          Ziehe Artikel mit dem Griff-Symbol um die Reihenfolge zu ändern, 
          oder nutze den Button oben für automatisches Sortieren nach Laden-Layout.
        </p>
      </div>
    </div>
  );
};

export default DragDropHint;