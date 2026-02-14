import React from 'react';

/**
 * RecipeHeader - Hero-Header mit Bild und Titel
 * 
 * Zeigt großes Rezeptbild mit Gradient-Overlay und Titel
 * 
 * Props:
 * @param {string} image - URL des Rezeptbildes
 * @param {string} title - Rezept-Titel
 * @param {string} description - Rezept-Beschreibung
 */
const RecipeHeader = ({ image, title, description }) => {
  return (
    <div className="relative h-64 md:h-80 w-full overflow-hidden">
      {/* Hintergrundbild */}
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {/* Gradient-Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      {/* Text-Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {title}
        </h1>
        <p className="text-gray-200 text-sm md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
};

export default RecipeHeader;