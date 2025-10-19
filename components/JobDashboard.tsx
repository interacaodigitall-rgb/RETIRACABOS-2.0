import React, { useState } from 'react';
import { Segment, Coordinates } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { SegmentList } from './SegmentList';
import { MapDisplay } from './MapDisplay';
import { useTranslations } from '../contexts/TranslationsContext';

const GpsLoadingScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
      <svg className="animate-spin h-12 w-12 text-blue-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-2xl font-bold text-white">Iniciando GPS, aguarde...</h2>
      <p className="text-gray-400 mt-2 max-w-sm">Pode ser necessário aceitar a permissão de localização no seu navegador para continuar.</p>
    </div>
);

interface GPSStatusProps {
    isLoading: boolean;
    error: string | null;
    location: Coordinates | null;
    accuracy: number | null;
}

const GPSStatus: React.FC<GPSStatusProps> = ({ isLoading, error, location, accuracy }) => {
    const { t } = useTranslations();
    
    if (isLoading) {
        return <div className="text-yellow-400 flex items-center"><svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="16 16"></circle></svg>{t('searchingGps')}</div>;
    }
    if (error) {
        return <div className="text-red-400 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>{error.includes("Permission denied") ? t('gpsPermissionDenied') : t('gpsUnavailable')}</div>;
    }
    if (location && accuracy !== null) {
        if (accuracy <= 10) {
            return <div className="text-green-400 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>{t('gpsGood')} ({t('accuracy')}: {accuracy.toFixed(1)}m)</div>;
        } else if (accuracy <= 20) {
            return <div className="text-yellow-400 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>{t('gpsFair')} ({t('accuracy')}: {accuracy.toFixed(1)}m)</div>;
        } else {
            return <div className="text-red-400 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>{t('gpsLow')} ({t('accuracy')}: {accuracy.toFixed(1)}m)</div>;
        }
    }
    return null;
};

interface JobDashboardProps {
  jobName: string;
  technicianName: string;
  onMarkPole: (coords: Coordinates) => void;
  segments: Segment[];
  totalDistance: number;
  lastPole: Coordinates | null;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({ jobName, technicianName, onMarkPole, segments, totalDistance, lastPole }) => {
  const { location, accuracy, error, isLoading } = useGeolocation();
  const [feedback, setFeedback] = useState('');
  const { t } = useTranslations();

  const LOW_ACCURACY_THRESHOLD = 20;
  const isAccuracyLow = accuracy !== null && accuracy > LOW_ACCURACY_THRESHOLD;

  const handlePress = () => {
    if (isAccuracyLow) {
      if (!window.confirm(t('gpsLowAccuracyConfirm'))) {
        return; 
      }
    }

    if (location) {
      onMarkPole(location);
      const message = lastPole ? t('segmentCreated') : t('initialPoleMarked');
      setFeedback(message);
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(t('waitingForGps'));
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  if (isLoading) {
    return <GpsLoadingScreen />;
  }

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
        <div className="border-t border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-lg text-gray-300 gap-2">
            <span>{t('totalRemoved')}: <span className="font-bold text-blue-400 text-xl">{totalDistance.toFixed(2)} {t('meters')}</span></span>
            <GPSStatus 
                isLoading={isLoading} 
                error={error} 
                location={location} 
                accuracy={accuracy} 
            />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handlePress}
          disabled={!!error}
          className={`text-white font-bold py-4 px-10 rounded-full text-2xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 disabled:bg-gray-500 disabled:cursor-not-allowed ${
            isAccuracyLow
              ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-400'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'
          }`}
        >
          {lastPole ? t('markNextPole') : t('markInitialPole')}
        </button>
        {feedback && <p className="mt-4 text-lg text-green-300 transition-opacity duration-300">{feedback}</p>}
        {isAccuracyLow && accuracy && (
            <p className="mt-4 text-lg text-yellow-400 max-w-lg mx-auto">{t('gpsAccuracyWarning', { accuracy: accuracy.toFixed(1) })}</p>
        )}
      </div>
      
      <MapDisplay segments={segments} lastPole={lastPole} />

      <SegmentList segments={segments} />
    </div>
  );
};