import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, Shield, Mail, Trash2, Crown } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import MessageBanner from '../components/global/MessageBanner';

/**
 * UserManagement - Nutzerverwaltung für Admins
 * 
 * Funktionen:
 * - E-Mail-Adressen zur Whitelist hinzufügen
 * - Als Admin markieren
 * - Liste aller berechtigten Nutzer
 * - Nutzer entfernen
 */
const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, allowedEmails, addAllowedEmail, removeAllowedEmail } = useAdmin();
  
  const [email, setEmail] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Zeigt temporäre Erfolgsmeldung
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Fügt neue E-Mail hinzu
   */
  const handleAddEmail = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showMessage('error', 'Bitte E-Mail-Adresse eingeben');
      return;
    }

    // E-Mail Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('error', 'Ungültige E-Mail-Adresse');
      return;
    }

    // Check ob bereits vorhanden
    if (allowedEmails.some(e => e.email === email.toLowerCase().trim())) {
      showMessage('error', 'E-Mail ist bereits berechtigt');
      return;
    }

    try {
      await addAllowedEmail(email, makeAdmin);
      showMessage('success', `${email} wurde hinzugefügt!`);
      setEmail('');
      setMakeAdmin(false);
    } catch (error) {
      showMessage('error', 'Fehler beim Hinzufügen');
    }
  };

  /**
   * Entfernt E-Mail aus Whitelist
   */
  const handleRemoveEmail = async (emailHash, emailAddress) => {
    // Verhindere dass User sich selbst entfernt
    if (emailAddress === user.email) {
      showMessage('error', 'Du kannst dich nicht selbst entfernen!');
      return;
    }

    if (window.confirm(`${emailAddress} wirklich entfernen?`)) {
      try {
        await removeAllowedEmail(emailHash);
        showMessage('success', 'Nutzer entfernt');
      } catch (error) {
        showMessage('error', 'Fehler beim Entfernen');
      }
    }
  };

  // Redirect wenn kein Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Zugriff verweigert</h2>
          <p className="text-gray-600 mb-4">
            Nur Administratoren können auf diese Seite zugreifen.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Zurück zu Einstellungen"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Nutzerverwaltung</h1>
              <p className="text-sm text-gray-600">{allowedEmails.length} berechtigte Nutzer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {message.text && (
        <MessageBanner type={message.type} text={message.text} />
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* Formular zum Hinzufügen */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            Neuen Nutzer hinzufügen
          </h2>
          
          <form onSubmit={handleAddEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="makeAdmin"
                checked={makeAdmin}
                onChange={(e) => setMakeAdmin(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="makeAdmin" className="text-sm text-gray-700 flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                Als Administrator hinzufügen
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Nutzer hinzufügen
            </button>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Hinweis:</strong> Der Nutzer kann sich nach dem Hinzufügen mit seiner 
              Google-E-Mail-Adresse anmelden. Admin-Rechte erlauben Zugriff auf diese Seite.
            </p>
          </div>
        </div>

        {/* Liste der berechtigten Nutzer */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Berechtigte Nutzer ({allowedEmails.length})
          </h2>

          <div className="space-y-3">
            {allowedEmails.map((emailData) => (
              <div
                key={emailData.hash}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3"
              >
                <div className="flex-1 min-w-0">
                  {/* E-Mail + Badges - Stack auf Mobile, Inline auf Desktop */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-gray-800 truncate">
                        {emailData.email}
                      </span>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {/* Admin Badge */}
                      {emailData.isAdmin && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      )}

                      {/* Du Badge */}
                      {emailData.email === user.email && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Du
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Datum */}
                  <div className="text-xs text-gray-500">
                    Hinzugefügt am {new Date(emailData.addedAt).toLocaleDateString('de-DE')}
                  </div>
                </div>

                {/* Entfernen Button */}
                {emailData.email !== user.email && (
                  <button
                    onClick={() => handleRemoveEmail(emailData.hash, emailData.email)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Nutzer entfernen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            {allowedEmails.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Noch keine Nutzer hinzugefügt</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;