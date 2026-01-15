import React, { useState, useEffect } from 'react';
import { X, Share2, UserPlus, Trash2, Check, AlertCircle } from 'lucide-react';
import { database } from '../firebaseConfig';
import { ref, get, update, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const ShareListModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSharedUsers();
    }
  }, [isOpen, user]);

  const loadSharedUsers = async () => {
    setLoadingUsers(true);
    try {
      const sharedWithRef = ref(database, `shoppingLists/${user.uid}/sharedWith`);
      const snapshot = await get(sharedWithRef);
      
      if (snapshot.exists()) {
        const sharedData = snapshot.val();
        const userPromises = Object.keys(sharedData).map(async (uid) => {
          const userRef = ref(database, `users/${uid}`);
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            return {
              uid,
              ...userSnapshot.val()
            };
          }
          return { uid, email: 'Unbekannt' };
        });
        
        const users = await Promise.all(userPromises);
        setSharedUsers(users);
      } else {
        setSharedUsers([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der geteilten Nutzer:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Bitte gib eine E-Mail-Adresse ein' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Suche User anhand der E-Mail
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      let targetUserId = null;
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        // Durchsuche alle User nach der E-Mail
        for (const [uid, userData] of Object.entries(users)) {
          if (userData.email === email.trim()) {
            targetUserId = uid;
            break;
          }
        }
      }

      if (!targetUserId) {
        setMessage({ 
          type: 'error', 
          text: 'Nutzer nicht gefunden. Stelle sicher, dass die Person sich mindestens einmal angemeldet hat.' 
        });
        setLoading(false);
        return;
      }

      if (targetUserId === user.uid) {
        setMessage({ type: 'error', text: 'Du kannst die Liste nicht mit dir selbst teilen.' });
        setLoading(false);
        return;
      }

      // Füge User zu sharedWith hinzu
      const updates = {};
      updates[`shoppingLists/${user.uid}/sharedWith/${targetUserId}`] = true;
      
      await update(ref(database), updates);

      setMessage({ type: 'success', text: 'Liste erfolgreich geteilt!' });
      setEmail('');
      
      // Lade Liste neu
      await loadSharedUsers();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      setMessage({ type: 'error', text: 'Fehler beim Teilen. Versuche es erneut.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (uid) => {
    if (!window.confirm('Möchtest du den Zugriff wirklich entfernen?')) {
      return;
    }

    try {
      const sharedRef = ref(database, `shoppingLists/${user.uid}/sharedWith/${uid}`);
      await remove(sharedRef);
      
      setMessage({ type: 'success', text: 'Zugriff erfolgreich entfernt' });
      await loadSharedUsers();
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Entfernen:', error);
      setMessage({ type: 'error', text: 'Fehler beim Entfernen' });
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.uid);
    setMessage({ type: 'success', text: 'User-ID kopiert!' });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Liste teilen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Message */}
          {message.text && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Share Form */}
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse des Nutzers
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-600 mt-2">
                Der Nutzer muss sich bereits einmal angemeldet haben.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Zugriff gewähren
                </>
              )}
            </button>
          </form>

          {/* Shared Users List */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Geteilt mit ({sharedUsers.length})
            </h3>
            
            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
              </div>
            ) : sharedUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Noch mit niemandem geteilt
              </p>
            ) : (
              <div className="space-y-2">
                {sharedUsers.map((sharedUser) => (
                  <div
                    key={sharedUser.uid}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {sharedUser.photoURL && (
                        <img
                          src={sharedUser.photoURL}
                          alt={sharedUser.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {sharedUser.displayName || 'Unbekannt'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {sharedUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(sharedUser.uid)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
            <p className="font-medium text-gray-800">Deine Infos:</p>
            <div className="space-y-1">
              <p><strong>E-Mail:</strong> {user?.email}</p>
              <div className="flex items-center justify-between">
                <p><strong>User-ID:</strong> {user?.uid?.substring(0, 20)}...</p>
                <button
                  onClick={copyUserId}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Kopieren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareListModal;