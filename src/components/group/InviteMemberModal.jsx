import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import ModalHeader from '../global/ModalHeader';

/**
 * InviteMemberModal - Modal zum Einladen von Mitgliedern
 * 
 * Props:
 * @param {function} onInvite - Callback mit E-Mail-Adresse
 * @param {function} onClose - Callback zum Schließen
 */
const InviteMemberModal = ({ onInvite, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onInvite(email.trim());
      setEmail('');
    } catch (error) {
      // Error wird in Parent-Komponente behandelt
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        
        {/* Modal Header */}
        <ModalHeader
          icon={<Mail className="w-5 h-5 text-green-600" />}
          title="Mitglied einladen"
          onClose={onClose}
          iconBgColor="bg-green-100"
        />

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <p className="text-sm text-gray-600">
            Gib die E-Mail-Adresse der Person ein, die du einladen möchtest. 
            Sie muss bereits einen Account haben.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beispiel@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Die Person muss bereits registriert sein. Falls nicht, bitte einen Admin kontaktieren.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Lädt...' : 'Einladen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;