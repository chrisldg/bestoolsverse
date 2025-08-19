import React from 'react';
import { Clock, DollarSign, CheckCircle, Heart } from 'lucide-react';

const DailyPlan = ({ day, plan, onToggleComplete, onToggleFavorite }) => {
  return (
    <div className="space-y-4">
      {['matin', 'apresMidi', 'soir'].map(period => {
        const activity = plan[period];
        return (
          <div key={period} className={`bg-white bg-opacity-10 rounded-lg p-4 ${
            activity.completed ? 'opacity-60' : ''
          }`}>
            {/* Contenu de l'activité */}
          </div>
        );
      })}
    </div>
  );
};

export default DailyPlan;