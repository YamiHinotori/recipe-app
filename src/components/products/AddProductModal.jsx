import React from 'react';
import { Package } from 'lucide-react';
import ModalHeader from '../global/ModalHeader';

/**
 * AddProductModal - Modal zum Hinzufügen eines neuen Produkts
 * 
 * Formular mit Name, Kategorie und üblicher Einheit
 * 
 * Props:
 * @param {object} product - Produkt-Objekt {name, category, commonUnit}
 * @param {array} categories - Verfügbare Kategorien
 * @param {function} onProductChange - Callback bei Änderung
 * @param {function} onSubmit - Callback beim Absenden
 * @param {function} onClose - Callback beim Schließen
 */
const AddProductModal = ({ 
  product, 
  categories, 
  onProductChange, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        
        {/* Modal-Header */}
        <ModalHeader
          icon={<Package className="w-5 h-5 text-green-600" />}
          title="Neues Produkt hinzufügen"
          onClose={onClose}
          iconBgColor="bg-green-100"
        />
        
        {/* Formular */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          
          {/* Produktname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produktname *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => onProductChange({ ...product, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="z.B. Avocado"
              autoFocus
              required
            />
          </div>
          
          {/* Kategorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategorie *
            </label>
            <select
              value={product.category}
              onChange={(e) => onProductChange({ ...product, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Übliche Einheit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Übliche Einheit
            </label>
            <input
              type="text"
              value={product.commonUnit}
              onChange={(e) => onProductChange({ ...product, commonUnit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="z.B. Stück, kg, g, ml"
            />
          </div>
          
          {/* Aktions-Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Hinzufügen
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;