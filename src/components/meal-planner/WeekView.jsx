import React from 'react';
import { useMealPlanner } from '../../context/MealPlannerContext';
import DayCard from './DayCard';

/**
 * WeekView - Zeigt alle 7 Tage der Woche
 * 
 * Responsive Grid:
 * - Mobile: 1 Spalte
 * - Tablet: 2 Spalten
 * - Desktop: 3-4 Spalten
 */
const WeekView = ({ onDayClick }) => {
  const { WEEK_DAYS, getDayMeal } = useMealPlanner();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {WEEK_DAYS.map((day) => {
        const meal = getDayMeal(day.key);
        
        return (
          <DayCard
            key={day.key}
            dayKey={day.key}
            dayLabel={day.label}
            meal={meal}
            onClick={() => onDayClick(day.key)}
          />
        );
      })}
    </div>
  );
};

export default WeekView;