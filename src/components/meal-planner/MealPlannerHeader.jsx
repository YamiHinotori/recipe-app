import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { useMealPlanner } from '../../context/MealPlannerContext';

/**
 * MealPlannerHeader - Header mit Zurück-Button und Statistik
 * 
 * Zeigt:
 * - Zurück-Button zum Dashboard
 * - Titel
 * - Anzahl geplanter Tage
 * - Woche löschen Button
 */
const MealPlannerHeader = () => {
  const navigate = useNavigate();
  const { getPlannedDaysCount, clearWeek } = useMealPlanner();
  
  const plannedCount = getPlannedDaysCount();

  /**
   * Löscht komplette Woche nach Bestätigung
   */
  const handleClearWeek = async () => {
    if (!window.confirm('Möchtest du die komplette Woche löschen?')) {
      return;
    }

    try {
      await clearWeek();
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  };

  return (
    <div className="flex items-center justify-between">

      {/* Links: Zurück + Titel */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
          aria-label="Zurück zum Dashboard"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Wochenplaner
          </h1>
          <p className="text-sm text-gray-600">
            {plannedCount} von 7 Tagen geplant
          </p>
        </div>
      </div>

      {/* Rechts: Woche löschen (nur wenn Tage geplant) */}
      {plannedCount > 0 && (
        <button
          onClick={handleClearWeek}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Woche löschen"
          aria-label="Komplette Woche löschen"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MealPlannerHeader;