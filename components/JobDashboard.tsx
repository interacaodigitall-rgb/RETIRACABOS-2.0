import React, { useState } from 'react';
import { Segment, Coordinates, Job, CableType } from '../types';
import { SegmentList } from './SegmentList';
import { MapDisplay } from './MapDisplay';
import { useTranslations } from '../contexts/TranslationsContext';
import { calculateDistance } from '../utils/geolocation';

interface JobDashboardProps {
  job: Job;
  technicianName: string;
  onEndJob: () => void;
  onTogglePause: () => void;
  segments: Segment[];
  lastPole: Coordinates | null;
  onSaveSegment: (start: Coordinates, end: Coordinates, distance: number, data: { cableType: CableType, quantity: number, notes: string, endPoleNotes: string, requiresReturn: boolean }) => void;
  onSaveInitialPole: (coords: Coordinates, notes: string) => void;
}

const MeasurementPanel: React.FC<{
  lastPole: Coordinates | null,
  onSaveSegment: JobDashboardProps['onSaveSegment'],
  onSaveInitialPole: JobDashboardProps['onSaveInitialPole']
}> = ({ lastPole, onSaveSegment, onSaveInitialPole }) => {
  const { t } = useTranslations();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for measurement result
  const [nextPoleCoords, setNextPoleCoords] = useState<Coordinates | null>(null);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // State for the form
  const [cableType, setCableType] = useState<CableType>(CableType.Simple);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [endPoleNotes, setEndPoleNotes] = useState('');
  const [requiresReturn, setRequiresReturn] = useState(false);

  const cableTypeOptions = [
    { value: CableType.Simple, label: t('cableTypeSimple') },
    { value: CableType.Double, label: t('cableTypeDouble') },
    { value: CableType.Other, label: t('cableTypeOther') },
  ];

  const handleMeasure = () => {
    setIsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setNextPoleCoords(newCoords);
        if (lastPole) {
          const distance = calculateDistance(lastPole.lat, lastPole.lon, newCoords.lat, newCoords.lon);
          setMeasuredDistance(distance);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(t('gpsUnavailable'));
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };
  
  const handleCancel = () => {
    setNextPoleCoords(null);
    setMeasuredDistance(null);
    setError('');
    // Reset form
    setCableType(CableType.Simple);
    setQuantity(1);
    setNotes('');
    setEndPoleNotes('');
    setRequiresReturn(false);
  };

  const handleSave = () => {
    if (!lastPole && nextPoleCoords) { // This is the initial pole
        onSaveInitialPole(nextPoleCoords, endPoleNotes);
    } else if (lastPole && nextPoleCoords && measuredDistance !== null) { // This is a new segment
        let finalQuantity = 1;
        if (cableType === CableType.Double) finalQuantity = 2;
        else if (cableType === CableType.Other) finalQuantity = quantity;
        
        onSaveSegment(lastPole, nextPoleCoords, measuredDistance, {
            cableType,
            quantity: finalQuantity,
            notes,
            endPoleNotes,
            requiresReturn
        });
    }
    handleCancel(); // Reset the form after saving
  };

  if (!nextPoleCoords) { // Initial state: Button to measure
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-4">{lastPole ? t('routePlanning') : t('addInitialPoleTitle')}</h3>
        {lastPole && (
             <div className="text-sm text-gray-400 mb-4">
                <p>{t('lastPoleLocation')}:</p>
                <p className="font-mono">Lat: {lastPole.lat.toFixed(6)}, Lon: {lastPole.lon.toFixed(6)}</p>
            </div>
        )}
        <button onClick={handleMeasure} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 w-full sm:w-auto">
            {isLoading ? t('measuring') : (lastPole ? t('measureToNextPole') : t('markInitialPole'))}
        </button>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    );
  }

  // Second state: Show result and form
  return (
    <div className="space-y-4">
        {measuredDistance !== null && (
             <div className="text-center p-3 bg-gray-900 rounded-lg">
                <h4 className="text-sm uppercase text-gray-400">{t('measuredDistance')}</h4>
                <p className="text-3xl font-bold text-blue-400">{measuredDistance.toFixed(2)} <span className="text-lg">{t('meters')}</span></p>
            </div>
        )}

        <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-white">{lastPole ? t('segmentDetails') : t('initialPoleDetails')}</h3>
            {lastPole && (
                 <div>
                    <label htmlFor="cableType" className="block text-sm font-medium text-gray-300 mb-1">{t('cableType')}</label>
                    <select id="cableType" value={cableType} onChange={(e) => setCableType(e.target.value as CableType)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white">
                    {cableTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            )}
            {lastPole && cableType === CableType.Other && (
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">{t('quantity')}</label>
                    <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" />
                </div>
            )}
             {lastPole && (
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">{t('notes')}</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" placeholder={t('notesPlaceholder')}></textarea>
                </div>
             )}
             <div>
                <label htmlFor="endPoleNotes" className="block text-sm font-medium text-gray-300 mb-1">{t('poleNotes')}</label>
                <textarea id="endPoleNotes" value={endPoleNotes} onChange={(e) => setEndPoleNotes(e.target.value)} rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" placeholder={t('poleNotesPlaceholder')}></textarea>
            </div>
             <div className="pt-2">
                <div className="flex items-center p-3 rounded-md bg-red-900/30 border border-red-800/50">
                    <input
                        id="requiresReturn"
                        type="checkbox"
                        checked={requiresReturn}
                        onChange={(e) => setRequiresReturn(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-red-500 focus:ring-red-600"
                    />
                    <label htmlFor="requiresReturn" className="ml-3 block text-sm text-red-300 font-bold">
                        {t('requiresReturn')}
                    </label>
                </div>
            </div>
        </div>

        <div className="flex justify-end space-x-4">
            <button type="button" onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md">{t('cancel')}</button>
            <button type="button" onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">{t('save')}</button>
        </div>
    </div>
  )
}

const PausedPanel: React.FC<{ onResume: () => void }> = ({ onResume }) => {
    const { t } = useTranslations();
    return (
        <div className="text-center p-4 bg-amber-900/50 border border-amber-700 rounded-lg">
            <h3 className="text-2xl font-bold text-amber-300">{t('jobPaused')}</h3>
            <p className="text-amber-200 my-4">{t('jobPausedMessage')}</p>
            <button
                onClick={onResume}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
                {t('resumeJob')}
            </button>
        </div>
    );
};

const ReturnVisitList: React.FC<{ segments: Segment[], hasInitialPole: boolean }> = ({ segments, hasInitialPole }) => {
    const { t } = useTranslations();
    const returnSegments = segments.filter(s => s.requiresReturn);

    if (returnSegments.length === 0) {
        return null;
    }

    return (
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-red-200">{t('returnVisitTitle')}</h3>
            <div className="space-y-3">
                {returnSegments.map((segment, index) => {
                    const poleNumber = segments.indexOf(segment) + (hasInitialPole ? 2 : 1);
                    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${segment.end.lat},${segment.end.lon}`;
                    return (
                        <div key={segment.id} className="bg-gray-800 p-3 rounded-md">
                            <h4 className="font-bold text-white">{t('pole')} {poleNumber}</h4>
                            <p className="text-sm text-gray-300 my-1"><span className="font-semibold">{t('returnVisitReason')}:</span> {segment.endPoleNotes || t('noNotes')}</p>
                            <p className="text-xs text-gray-400 font-mono">{t('returnVisitLocation')}: {segment.end.lat.toFixed(5)}, {segment.end.lon.toFixed(5)}</p>
                             <a 
                                href={mapUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md text-sm"
                            >
                                {t('goToMap')}
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const JobDashboard: React.FC<JobDashboardProps> = ({ job, technicianName, onEndJob, onTogglePause, segments, lastPole, onSaveSegment, onSaveInitialPole }) => {
  const { t } = useTranslations();
 
  const poleCount = segments.length + (job.initialPole ? 1 : 0);
  const totalDistance = job.totalMetros;
  
  const renderContentPanel = () => {
    switch(job.status) {
        case 'ativo':
            return <MeasurementPanel lastPole={lastPole} onSaveInitialPole={onSaveInitialPole} onSaveSegment={onSaveSegment} />;
        case 'pausado':
            return <PausedPanel onResume={onTogglePause} />;
        case 'concluido':
            return (
                <div className="text-center p-4 bg-green-900/50 border border-green-700 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-300">Trabalho Concluído</h3>
                </div>
            );
    }
  }

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

      <ReturnVisitList segments={segments} hasInitialPole={!!job.initialPole} />

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        {renderContentPanel()}
      </div>

       {job.status === 'ativo' && (
         <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
                onClick={onTogglePause}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg text-lg shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
            >
                {t('pauseJob')}
            </button>
             <button
                onClick={onEndJob}
                disabled={poleCount === 0}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg text-lg shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                {t('endJob')}
            </button>
         </div>
       )}
      
      <MapDisplay segments={segments} initialPole={job.initialPole?.coordinates} />

      <SegmentList segments={segments} />
    </div>
  );
};