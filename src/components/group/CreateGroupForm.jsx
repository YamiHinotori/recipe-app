import React, { useState } from 'react';
import { Users } from 'lucide-react';

/**
 * CreateGroupForm - Formular zum Erstellen einer neuen Gruppe
 * 
 * Props:
 * @param {function} onSubmit - Callback mit Gruppennamen
 */
const CreateGroupForm = ({ onSubmit }) => {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSubmit(groupName.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* Icon und Überschrift */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Gruppe erstellen
        </h2>
        <p className="text-gray-600">
          Erstelle eine Gruppe um Rezepte, Einkaufslisten und mehr mit anderen zu teilen
        </p>
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gruppenname
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="z.B. Familie Müller"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Gruppe erstellen
        </button>
      </form>

      {/* Info-Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ Was kann ich mit einer Gruppe?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Rezepte gemeinsam verwalten</li>
          <li>• Einkaufslisten teilen</li>
          <li>• Wochenplaner synchronisieren</li>
          <li>• Produkte und Laden-Layouts gemeinsam nutzen</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateGroupForm;