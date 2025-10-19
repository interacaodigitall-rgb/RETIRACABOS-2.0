import React, { useState } from 'react';
import { Segment, Coordinates } from '../types';
import { SegmentList } from './SegmentList';
import { MapDisplay } from './MapDisplay';
import { useTranslations } from '../contexts/TranslationsContext';

interface JobDashboardProps {
  jobName: string;
  technicianName: string;
  onAddPole: () => void;
  segments: Segment[];
  totalDistance: number;
  lastPole: Coordinates | null;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({ jobName, technicianName, onAddPole, segments, totalDistance, lastPole }) => {
  const { t } = useTranslations();
  const [feedback, setFeedback] = useState('');
 
  const handleAddPoleClick = () => {
    onAddPole();
  };
  
  const poleCount = segments.length + (lastPole ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
            <div>
                <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">{t('jobInfo')}</h3>
                <p className="text-2xl font-bold text-white truncate" title={jobName}>{jobName}</p>
            </div>
            <div>
                <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">{t('technicianOnDuty')}</h3>
                <p className="text-2xl font-bold text-white truncate" title={technicianName}>{technicianName}</p>
            </div>
        </div>
        <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-lg text-gray-300">
            <span>{t('totalRemoved')}: <span className="font-bold text-blue-400 text-xl">{totalDistance.toFixed(2)} {t('meters')}</span></span>
             <span className="font-bold text-gray-300 text-lg">{poleCount} {poleCount === 1 ? t('pole') : t('poles')}</span>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
        <h3 className="text-xl font-bold text-white mb-4">{t('routePlanning')}</h3>
        <button
          onClick={handleAddPoleClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {poleCount > 0 ? t('addNextPole') : t('addInitialPole')}
        </button>
        {feedback && <p className="mt-4 text-lg text-green-300 transition-opacity duration-300">{feedback}</p>}
      </div>
      
      <MapDisplay segments={segments} lastPole={lastPole} />

      <SegmentList segments={segments} />
    </div>
  );
};
