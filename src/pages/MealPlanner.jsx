/**
 * MealPlanner - Wochenplaner Hauptseite
 * 
 * Zeigt Essensplanung für die aktuelle Woche (Mo-So).
 * User kann für jeden Tag eine Mahlzeit planen.
 */

import React, { useState } from 'react';
import { useMealPlanner } from '../context/MealPlannerContext';
import { useRecipes } from '../context/RecipeContext';
import MealPlannerHeader from '../components/meal-planner/MealPlannerHeader';
import WeekView from '../components/meal-planner/WeekView';
import MealModal from '../components/meal-planner/MealModal';
import LoadingSpinner from '../components/global/LoadingSpinner';

const MealPlanner = () => {
  const { loading } = useMealPlanner();
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
      <MealPlannerHeader />

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