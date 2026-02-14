import React from 'react';

/**
 * MessageBanner - Feedback-Banner für Erfolgs- und Fehlermeldungen
 * 
 * Zeigt temporäre Benachrichtigungen für Benutzeraktionen
 * 
 * Props:
 * @param {string} type - Art der Nachricht ('success' oder 'error')
 * @param {string} text - Anzuzeigender Text
 */
const MessageBanner = ({ type, text }) => {
  // Styling basierend auf Nachrichtentyp
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div 
        className={`p-4 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}
        role="alert"
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBanner;