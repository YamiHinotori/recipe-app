import React from 'react';
import { X } from 'lucide-react';

/**
 * ModalHeader - Wiederverwendbarer Modal-Header
 * 
 * Standardisierter Header für alle Modals mit Icon, Titel und Schließen-Button
 * 
 * Props:
 * @param {node} icon - Icon-Element (z.B. <Store className="w-5 h-5" />)
 * @param {string} title - Titel des Modals
 * @param {function} onClose - Callback beim Schließen
 * @param {string} iconBgColor - Hintergrundfarbe des Icon-Containers (default: 'bg-blue-100')
 */
const ModalHeader = ({ 
  icon, 
  title, 
  onClose, 
  iconBgColor = 'bg-blue-100' 
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      
      {/* Icon und Titel */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`${iconBgColor} p-2 rounded-full`}>
            {icon}
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>
      </div>
      
      {/* Schließen-Button */}
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Modal schließen"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default ModalHeader;