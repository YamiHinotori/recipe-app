import React from 'react';
import { Crown, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * MemberCard - Karte für ein Gruppenmitglied
 * 
 * Props:
 * @param {object} member - Mitglieds-Daten
 * @param {boolean} isCreator - Ist dieser User der Gruppen-Creator?
 * @param {function} onRemove - Callback zum Entfernen
 */
const MemberCard = ({ member, isCreator, onRemove }) => {
  const { user } = useAuth();
  const isCurrentUser = user.uid === member.uid;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        
        {/* Profilbild */}
        {member.photoURL ? (
          <img
            src={member.photoURL}
            alt={member.displayName}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-bold text-lg">
              {member.displayName?.[0] || member.email[0].toUpperCase()}
            </span>
          </div>
        )}

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 truncate">
              {member.displayName || 'Unbekannt'}
            </h3>
            {isCreator && (
              <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" title="Gruppen-Ersteller" />
            )}
            {isCurrentUser && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                Du
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 truncate mt-0.5">
            {member.email}
          </p>

          {member.lastLogin && (
            <p className="text-xs text-gray-500 mt-1">
              Letzter Login: {new Date(member.lastLogin).toLocaleDateString('de-DE')}
            </p>
          )}
        </div>

        {/* Entfernen-Button (nur für andere, nicht für sich selbst) */}
        {!isCurrentUser && (
          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Aus Gruppe entfernen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberCard;