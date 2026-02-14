import React from 'react';

/**
 * LoadingSpinner - Wiederverwendbarer Lade-Indikator
 * 
 * Zeigt animierten Spinner mit optionalem Text
 * 
 * Props:
 * @param {string} text - Optionaler Ladetext (default: "Lädt...")
 * @param {string} size - Größe des Spinners: 'sm', 'md', 'lg' (default: 'md')
 */
const LoadingSpinner = ({ text = 'Lädt...', size = 'md' }) => {
  // Größen-Mapping
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="text-center py-12" role="status" aria-live="polite">
      {/* Animierter Spinner */}
      <div 
        className={`${spinnerClass} border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4`}
        aria-hidden="true"
      />
      
      {/* Ladetext */}
      <p className="text-gray-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;