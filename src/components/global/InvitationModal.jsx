import React from 'react';
import { Users, X } from 'lucide-react';

/**
 * InvitationModal - Modal für Gruppen-Einladung
 * 
 * Zeigt Einladung an und erlaubt Beitreten/Ablehnen
 * 
 * Props:
 * @param {object} invitation - Einladungs-Objekt {groupId, groupName, invitedBy}
 * @param {function} onAccept - Callback beim Beitreten
 * @param {function} onDecline - Callback beim Ablehnen
 */
const InvitationModal = ({ invitation, onAccept, onDecline }) => {
  if (!invitation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Gruppen-Einladung
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Du wurdest zur Gruppe eingeladen:
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-lg font-semibold text-blue-900">
              {invitation.groupName}
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Möchtest du dieser Gruppe beitreten? Du kannst dann gemeinsam Rezepte planen, 
            Einkaufslisten teilen und Wochenpläne erstellen.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Jetzt beitreten
            </button>
            
            <button
              onClick={onDecline}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Ablehnen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;