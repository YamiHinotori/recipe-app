/**
 * MealPlanner - Wochenplaner Hauptseite
 * 
 * Zeigt Essensplanung für die aktuelle Woche (Mo-So).
 * User kann für jeden Tag eine Mahlzeit planen.
 * 
 * ZWEI MODI:
 * - Gemeinsam: Gemeinsamer Wochenplan (Standard)
 * - Persönlich: Persönlicher Wochenplan
 */

import React, { useState } from 'react';
import { useMealPlanner } from '../context/MealPlannerContext';
import { useRecipes } from '../context/RecipeContext';
import MealPlannerHeader from '../components/meal-planner/MealPlannerHeader';
import ListTypeToggle from '../components/shopping-list/ListTypeToggle';
import WeekView from '../components/meal-planner/WeekView';
import MealModal from '../components/meal-planner/MealModal';
import LoadingSpinner from '../components/global/LoadingSpinner';

const MealPlanner = () => {
  const { loading, scope, setScope, hasGroup } = useMealPlanner();
  const { recipes } = useRecipes();
  
  // Modal-State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  /**
   * Öffnet Modal für einen Tag
   */
  const handleOpenModal = (dayKey) => {
    setSelectedDay(dayKey);
    setIsModalOpen(true);
  };

  /**
   * Schließt Modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  // Loading-State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <MealPlannerHeader />
        </div>
        
        {/* Toggle zwischen gemeinsam und persönlich (nur wenn Gruppe) */}
        {hasGroup && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <ListTypeToggle
              currentListType={scope}
              onToggle={setScope}
            />
          </div>
        )}
      </div>

      {/* Wochen-Ansicht */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <WeekView onDayClick={handleOpenModal} />
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <MealModal
          dayKey={selectedDay}
          recipes={recipes}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MealPlanner;