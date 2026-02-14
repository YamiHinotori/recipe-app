import React from 'react';
import { X } from 'lucide-react';

/**
 * InstructionList - Verwaltung der Zubereitungsschritte im Rezeptformular
 * 
 * Ermöglicht dynamisches Hinzufügen, Bearbeiten und Entfernen von Schritten
 * Schritte werden automatisch nummeriert
 * 
 * Props:
 * @param {array} instructions - Array von Anweisungs-Strings
 * @param {function} onAdd - Callback zum Hinzufügen eines neuen Schritts
 * @param {function} onUpdate - Callback zum Aktualisieren (index, value)
 * @param {function} onRemove - Callback zum Entfernen (index)
 */
const InstructionList = ({ instructions, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="space-y-3">
      
      {/* Header mit Hinzufügen-Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Zubereitung</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Schritt hinzufügen
        </button>
      </div>

      {/* Liste aller Zubereitungsschritte */}
      {instructions.map((instruction, index) => (
        <div key={index} className="flex gap-2">
          
          {/* Schritt-Nummer (visuell, nicht editierbar) */}
          <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
            {index + 1}
          </span>

          {/* Anweisungstext */}
          <textarea
            value={instruction}
            onChange={(e) => onUpdate(index, e.target.value)}
            placeholder={`Schritt ${index + 1}: Beschreibe was zu tun ist...`}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows={2}
          />

          {/* Entfernen-Button */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded h-fit transition-colors"
            aria-label={`Schritt ${index + 1} entfernen`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Hinweis wenn keine Schritte vorhanden */}
      {instructions.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Noch keine Zubereitungsschritte hinzugefügt. Klicke auf "+ Schritt hinzufügen".
        </p>
      )}
    </div>
  );
};

export default InstructionList;