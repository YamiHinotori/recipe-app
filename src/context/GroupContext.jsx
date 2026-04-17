/**
 * GroupContext - Mit Email-basiertem Einladungs-System
 * 
 * NEUE STRUKTUR:
 * invitations/{emailHash}/ {groupId, groupName, invitedBy, invitedAt}
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, set, update, remove, push, get } from 'firebase/database';
import { useAuth } from './AuthContext.jsx';

const GroupContext = createContext();

// Helper für Email Hash (gleiche Funktion wie in AuthContext)
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroup(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const groupId = user.groupId || null;
    
    if (!groupId) {
      setGroup(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    
    const groupRef = ref(database, `groups/${groupId}`);
    
    const unsubscribeGroup = onValue(groupRef, async (groupSnapshot) => {
      const groupData = groupSnapshot.val();
      
      if (groupData) {
        // Gruppe existiert!
        setGroup({
          id: groupId,
          ...groupData
        });
        
        // Lade Mitglieder
        const memberIds = Object.keys(groupData.members || {});
        const memberPromises = memberIds.map(async (memberId) => {
          const profileRef = ref(database, `userProfiles/${memberId}`);
          const profileSnap = await get(profileRef);
          return {
            uid: memberId,
            ...profileSnap.val()
          };
        });
        
        const membersData = await Promise.all(memberPromises);
        setMembers(membersData);
        
      } else {
        // Gruppe existiert NICHT mehr!
        console.log('⚠️ Gruppe existiert nicht - entferne groupId aus userProfile');
        setGroup(null);
        setMembers([]);
        
        // Entferne groupId aus userProfile
        try {
          await update(ref(database, `userProfiles/${user.uid}`), {
            groupId: null
          });
          console.log('✅ groupId entfernt - Seite wird neu geladen');
          setTimeout(() => window.location.reload(), 500);
        } catch (error) {
          console.error('Fehler beim Entfernen der groupId:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribeGroup();
  }, [user]);

  const createGroup = async (name) => {
    if (!user) throw new Error('User not logged in');
    
    if (user.groupId) {
      throw new Error('Du bist bereits Mitglied einer Gruppe');
    }
    
    try {
      const groupsRef = ref(database, 'groups');
      const newGroupRef = push(groupsRef);
      const groupId = newGroupRef.key;
      
      await set(newGroupRef, {
        name,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        members: {
          [user.uid]: true
        },
        memberCount: 1
      });
      
      // Setze groupId in eigenem userProfile
      await update(ref(database, `userProfiles/${user.uid}`), {
        groupId,
        lastLogin: new Date().toISOString()
      });
      
      console.log('✅ Gruppe erstellt:', groupId);
      
      window.location.reload();
      
      return groupId;
      
    } catch (error) {
      console.error('Fehler beim Erstellen der Gruppe:', error);
      throw error;
    }
  };

  const inviteMember = async (email) => {
    if (!user || !group) throw new Error('User or group not found');
    
    try {
      // Erstelle Email Hash
      const emailHash = await sha256(email.toLowerCase().trim());
      
      // Speichere Einladung unter invitations/{emailHash}/
      const invitationRef = ref(database, `invitations/${emailHash}`);
      
      await set(invitationRef, {
        email: email,
        groupId: group.id,
        groupName: group.name,
        invitedBy: user.uid,
        invitedAt: new Date().toISOString()
      });
      
      console.log('✅ Einladung gespeichert für:', email);
      console.log('   Email Hash:', emailHash);
      
    } catch (error) {
      console.error('Fehler beim Einladen:', error);
      throw error;
    }
  };

  const removeMember = async (memberId) => {
    if (!user || !group) throw new Error('User or group not found');
    
    if (group.createdBy !== user.uid && memberId !== user.uid) {
      throw new Error('Keine Berechtigung');
    }
    
    try {
      const updates = {};
      updates[`groups/${group.id}/members/${memberId}`] = null;
      updates[`groups/${group.id}/memberCount`] = (group.memberCount || 2) - 1;
      updates[`userProfiles/${memberId}/groupId`] = null;
      
      await update(ref(database), updates);
      
      if (group.memberCount <= 1) {
        await remove(ref(database, `groups/${group.id}`));
      }
      
      console.log('✅ Mitglied entfernt:', memberId);
      
      if (memberId === user.uid) {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Fehler beim Entfernen:', error);
      throw error;
    }
  };

  const leaveGroup = async () => {
    if (!user || !group) throw new Error('User or group not found');
    return removeMember(user.uid);
  };

  const renameGroup = async (newName) => {
    if (!user || !group) throw new Error('User or group not found');
    
    try {
      await update(ref(database, `groups/${group.id}`), {
        name: newName
      });
      
      console.log('✅ Gruppe umbenannt:', newName);
      
    } catch (error) {
      console.error('Fehler beim Umbenennen:', error);
      throw error;
    }
  };

  const value = {
    group,
    members,
    loading,
    hasGroup: !!group,
    createGroup,
    inviteMember,
    removeMember,
    leaveGroup,
    renameGroup
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};