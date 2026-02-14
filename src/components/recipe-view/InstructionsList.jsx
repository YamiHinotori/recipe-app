import React from 'react';

/**
 * InstructionsList - Liste der Zubereitungsschritte
 * 
 * Zeigt nummerierte Schritte
 * 
 * Props:
 * @param {array} instructions - Array von Anweisungs-Strings
 */
const InstructionsList = ({ instructions }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Zubereitung
      </h2>
      
      <ol className="space-y-4">
        {instructions.map((step, index) => (
          <li key={index} className="flex gap-4">
            {/* Schritt-Nummer */}
            <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </span>
            
            {/* Schritt-Text */}
            <p className="text-gray-700 pt-1 flex-1">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default InstructionsList;