import React from 'react';

/**
 * FeaturesList - Liste der App-Features
 * 
 * Zeigt Vorteile des Logins mit Check-Icons
 */
const FeaturesList = () => {
  const features = [
    {
      title: 'Geräte-Synchronisation',
      description: 'Greife von überall auf deine Rezepte zu'
    },
    {
      title: 'Geteilte Einkaufsliste',
      description: 'Arbeitet zusammen in Echtzeit'
    },
    {
      title: 'Automatische Backups',
      description: 'Nie wieder Daten verlieren'
    }
  ];

  return (
    <div className="mt-6 space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* Check-Icon */}
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg 
              className="w-3 h-3 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          {/* Feature-Text */}
          <div>
            <p className="text-sm font-medium text-gray-800">
              {feature.title}
            </p>
            <p className="text-xs text-gray-600">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturesList;