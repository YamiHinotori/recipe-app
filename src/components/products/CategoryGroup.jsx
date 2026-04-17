import React from 'react';
import ProductItem from './ProductItem';

/**
 * CategoryGroup - ANGEPASST für editingProduct mit Ownership
 * 
 * Props:
 * @param {string} categoryId - ID der Kategorie
 * @param {string} categoryName - Name der Kategorie
 * @param {array} products - Produkte dieser Kategorie
 * @param {array} allProducts - Alle Produkte
 * @param {array} categories - Verfügbare Kategorien
 * @param {object} editingProduct - Bearbeitetes Produkt (mit _ownerId)
 * @param {object} editForm - Formular-Daten
 * @param {function} onStartEdit - Callback (bekommt product)
 * @param {function} onSaveEdit - Callback zum Speichern
 * @param {function} onCancelEdit - Callback zum Abbrechen
 * @param {function} onEditFormChange - Callback bei Änderung
 * @param {function} onDelete - Callback (bekommt product)
 */
const CategoryGroup = ({
  categoryId,
  categoryName,
  products,
  allProducts,
  categories,
  editingProduct,  // ← Geändert von editingId!
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete
}) => {
  return (
    <div>
      {/* Kategorie-Header */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
          {categoryName}
        </span>
        <span className="text-sm text-gray-500">
          ({products.length})
        </span>
      </h2>
      
      {/* Produkte dieser Kategorie */}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
        {products.map((product, idx) => {
          // Prüfe ob dieses Produkt aktuell bearbeitet wird
          const isEditing = editingProduct && 
                           editingProduct.name === product.name &&
                           editingProduct.category === product.category &&
                           editingProduct._ownerId === product._ownerId;
          
          return (
            <ProductItem
              key={`${product.name}-${product._ownerId || idx}`}
              product={product}
              categories={categories}
              isEditing={isEditing}
              editForm={editForm}
              onStartEdit={() => onStartEdit(product)}  // ← Übergibt Produkt!
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditFormChange={onEditFormChange}
              onDelete={() => onDelete(product)}  // ← Übergibt Produkt!
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGroup;