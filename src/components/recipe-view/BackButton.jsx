import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * BackButton - Floating Zurück-Button
 * 
 * Fixed positioniert oben links
 * 
 * Props:
 * @param {function} onClick - Callback beim Klick
 */
const BackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
      aria-label="Zurück zur Übersicht"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>
  );
};

export default BackButton;