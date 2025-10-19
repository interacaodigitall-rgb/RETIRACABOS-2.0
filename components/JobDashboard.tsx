
import React from 'react';
import { Segment, Coordinates, Job } from '../types';
import { SegmentList } from './SegmentList';
import { MapDisplay } from './MapDisplay';
import { useTranslations } from '../contexts/TranslationsContext';

interface JobDashboardProps {
  job: Job;
  technicianName: string;
  onAddPole: () => void;
  onEndJob: () => void;
  segments: Segment[];
  lastPole: Coordinates | null;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({ job, technicianName, onAddPole, onEndJob, segments, lastPole }) => {
  const { t } = useTranslations();
 
  const handleAddPoleClick = () => {
    onAddPole();
  };
  
  const poleCount = segments.length + (job.initialPole ? 1 : 0);
  const totalDistance = job.totalMetros;
  const isJobActive = job.status === 'ativo';

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
            <div>
                <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">{t('jobInfo')}</h3>
                <p className="text-2xl font-bold text-white truncate" title={job.nome}>{job.nome}</p>
            </div>
            <div>
                <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">{t('technicianOnDuty')}</h3>
                <p className="text-2xl font-bold text-white truncate" title={technicianName}>{technicianName}</p>
            </div>
        </div>
        <div className="border-t border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-lg text-gray-300 gap-2">
            <span>{t('totalRemoved')}: 
                <span className="font-bold text-blue-400 text-xl">
                    {totalDistance.toFixed(2)} {t('meters')}
                </span>
            </span>
             <span className="font-bold text-gray-300 text-lg">{poleCount} {poleCount === 1 ? t('pole') : t('poles')}</span>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
        {isJobActive ? (
          <>
            <h3 className="text-xl font-bold text-white mb-4">{t('routePlanning')}</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                onClick={handleAddPoleClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 w-full sm:w-auto"
                >
                {poleCount > 0 ? t('addNextPole') : t('addInitialPole')}
                </button>
                <button
                onClick={onEndJob}
                disabled={poleCount === 0}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:bg-gray-600 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                {t('endJob')}
                </button>
            </div>
          </>
        ) : (
            <div className="text-center p-4 bg-green-900/50 border border-green-700 rounded-lg">
                <h3 className="text-2xl font-bold text-green-300">Trabalho Concluído</h3>
            </div>
        )}
        
        {segments.length === 0 && job.initialPole?.notes && (
          <div className="mt-4 text-left p-3 bg-gray-900 rounded-md">
            <p className="text-sm font-bold text-gray-400">{t('initialPoleNotes')}:</p>
            <p className="text-gray-300 italic">"{job.initialPole.notes}"</p>
          </div>
        )}
      </div>
      
      <MapDisplay segments={segments} initialPole={job.initialPole?.coordinates} />

      <SegmentList segments={segments} />
    </div>
  );
};
