import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users, UserPlus, LogOut, Edit2 } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import CreateGroupForm from '../components/group/CreateGroupForm';
import InviteMemberModal from '../components/group/InviteMemberModal';
import MemberCard from '../components/group/MemberCard';
import MessageBanner from '../components/global/MessageBanner';

/**
 * GroupManager - Gruppenverwaltung
 * 
 * Zwei Ansichten:
 * 1. Keine Gruppe: Formular zum Erstellen
 * 2. In Gruppe: Mitglieder-Verwaltung
 */
const GroupManager = () => {
  const navigate = useNavigate();
  const { 
    group, 
    members, 
    loading, 
    hasGroup,
    createGroup,
    inviteMember,
    removeMember,
    leaveGroup,
    renameGroup
  } = useGroup();
  
  // UI-Zustand
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // Feedback-Nachrichten
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Zeigt temporäre Erfolgsmeldung
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /**
   * Erstellt neue Gruppe
   */
  const handleCreateGroup = async (groupName) => {
    try {
      await createGroup(groupName);
      showMessage('success', 'Gruppe erstellt!');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  /**
   * Lädt Mitglied per E-Mail ein
   */
  const handleInvite = async (email) => {
    try {
      await inviteMember(email);
      showMessage('success', `${email} wurde eingeladen!`);
      setShowInviteModal(false);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  /**
   * Entfernt Mitglied aus Gruppe
   */
  const handleRemoveMember = async (memberId, memberEmail) => {
    if (window.confirm(`${memberEmail} wirklich aus der Gruppe entfernen?`)) {
      try {
        await removeMember(memberId);
        showMessage('success', 'Mitglied entfernt');
      } catch (error) {
        showMessage('error', 'Fehler beim Entfernen');
      }
    }
  };

  /**
   * User verlässt Gruppe
   */
  const handleLeaveGroup = async () => {
    if (window.confirm('Gruppe wirklich verlassen?')) {
      try {
        await leaveGroup();
        showMessage('success', 'Du hast die Gruppe verlassen');
      } catch (error) {
        showMessage('error', 'Fehler beim Verlassen');
      }
    }
  };

  /**
   * Benennt Gruppe um
   */
  const handleRename = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      await renameGroup(newGroupName.trim());
      showMessage('success', 'Gruppe umbenannt!');
      setIsRenaming(false);
      setNewGroupName('');
    } catch (error) {
      showMessage('error', 'Fehler beim Umbenennen');
    }
  };

  /**
   * Startet Umbenennen-Modus
   */
  const startRenaming = () => {
    setNewGroupName(group.name);
    setIsRenaming(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Zurück-Button und Titel */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Zurück zu Einstellungen"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gruppenverwaltung</h1>
                <p className="text-sm text-gray-600">
                  {hasGroup ? `${members.length} Mitglied${members.length !== 1 ? 'er' : ''}` : 'Keine Gruppe'}
                </p>
              </div>
            </div>
            
            {/* Aktions-Buttons (nur wenn in Gruppe) */}
            {hasGroup && (
              <div className="flex items-center gap-2">
                {/* Mitglied einladen */}
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-green-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  title="Mitglied einladen"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden md:inline">Mitglied einladen</span>
                </button>
                
                {/* Gruppe verlassen */}
                <button
                  onClick={handleLeaveGroup}
                  className="bg-red-500 text-white p-2 md:px-4 md:py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  title="Gruppe verlassen"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Gruppe verlassen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback-Banner */}
      {message.text && (
        <MessageBanner type={message.type} text={message.text} />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onInvite={handleInvite}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Hauptinhalt */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* === KEINE GRUPPE === */}
        {!hasGroup && (
          <div className="max-w-2xl mx-auto">
            <CreateGroupForm onSubmit={handleCreateGroup} />
          </div>
        )}

        {/* === IN GRUPPE === */}
        {hasGroup && (
          <div className="space-y-6">
            
            {/* Gruppen-Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  {isRenaming ? (
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') {
                          setIsRenaming(false);
                          setNewGroupName('');
                        }
                      }}
                      className="text-2xl font-bold px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
                  )}
                </div>
                
                {isRenaming ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleRename}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => {
                        setIsRenaming(false);
                        setNewGroupName('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startRenaming}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Gruppe umbenennen"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Erstellt am: {new Date(group.createdAt).toLocaleDateString('de-DE')}</p>
                <p className="mt-1">{members.length} Mitglied{members.length !== 1 ? 'er' : ''}</p>
              </div>
            </div>

            {/* Mitglieder Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mitglieder</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <MemberCard
                    key={member.uid}
                    member={member}
                    isCreator={member.uid === group.createdBy}
                    onRemove={() => handleRemoveMember(member.uid, member.email)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManager;