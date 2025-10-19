
import React, { useState, useCallback, useMemo } from 'react';
import { Segment, Coordinates, CableType } from './types';
import { calculateDistance } from './utils/geolocation';
import { JobDashboard } from './components/JobDashboard';
import { SegmentFormModal } from './components/SegmentFormModal';
import { ReportGenerator } from './components/ReportGenerator';
import { TranslationsProvider, useTranslations } from './contexts/TranslationsContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { StartJobModal } from './components/StartJobModal';


const Header: React.FC = () => {
  const { t } = useTranslations();
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-20 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 20.5c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-3.5c0-.8-.7-1.5-1.5-1.5-.8 0-1.5.7-1.5 1.5v3.5z"/>
                <path d="M4 12.5c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5-.8 0-1.5.7-1.5 1.5v3z"/>
                <path d="M17 14.5c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-9c0-.8-.7-1.5-1.5-1.5-.8 0-1.5.7-1.5 1.5v9z"/>
                <path d="M12 4V2"/>
                <path d="M12 15v-2"/>
                <path d="M5.5 8V2"/>
                <path d="M5.5 14v-1.5"/>
                <path d="M18.5 22v-4.5"/>
                <path d="M18.5 5.5V2"/>
            </svg>
          <h1 className="text-2xl font-bold text-white tracking-wider">{t('appName')}</h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

function AppContent() {
  const { t } = useTranslations();
  const [jobName, setJobName] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>('');
  const [isStartJobModalVisible, setIsStartJobModalVisible] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [lastPole, setLastPole] = useState<Coordinates | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newSegmentData, setNewSegmentData] = useState<Omit<Segment, 'id' | 'cableType' | 'quantity' | 'photo' | 'notes'> | null>(null);

  const handleOpenStartJobModal = useCallback(() => {
    setIsStartJobModalVisible(true);
  }, []);
  
  const handleCancelStartJob = useCallback(() => {
    setIsStartJobModalVisible(false);
  }, []);

  const handleStartJob = useCallback((data: { jobName: string; technicianName: string }) => {
    setJobName(data.jobName);
    setTechnicianName(data.technicianName);
    setSegments([]);
    setLastPole(null);
    setIsFormVisible(false);
    setIsStartJobModalVisible(false);
  }, []);

  const handleMarkPole = useCallback((coords: Coordinates) => {
    if (lastPole) {
      const distance = calculateDistance(lastPole.lat, lastPole.lon, coords.lat, coords.lon);
      const newSegData: Omit<Segment, 'id' | 'cableType' | 'quantity' | 'photo' | 'notes'> = {
        start: lastPole,
        end: coords,
        distance: distance,
        timestamp: new Date().toISOString(),
      };
      setNewSegmentData(newSegData);
      setIsFormVisible(true);
    }
    setLastPole(coords);
  }, [lastPole]);

  const handleSaveSegment = useCallback((formData: { cableType: CableType; quantity: number; photo: File | null; notes: string; }) => {
    if (newSegmentData) {
      const photoUrl = formData.photo ? URL.createObjectURL(formData.photo) : undefined;
      const finalSegment: Segment = {
        ...newSegmentData,
        id: `seg_${Date.now()}`,
        cableType: formData.cableType,
        quantity: formData.quantity,
        photo: formData.photo,
        photoUrl: photoUrl,
        notes: formData.notes,
      };
      setSegments(prev => [...prev, finalSegment]);
      setIsFormVisible(false);
      setNewSegmentData(null);
    }
  }, [newSegmentData]);

  const handleCancelForm = useCallback(() => {
    setIsFormVisible(false);
    setNewSegmentData(null);
  }, []);
  
  const totalDistance = useMemo(() => {
    return segments.reduce((total, seg) => total + seg.distance, 0);
  }, [segments]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {!jobName ? (
           <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">{t('welcomeTitle')}</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">{t('welcomeDescription')}</p>
            <button
              onClick={handleOpenStartJobModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-transform transform hover:scale-105"
            >
              {t('startNewJob')}
            </button>
          </div>
        ) : (
          <>
            <JobDashboard 
              jobName={jobName}
              technicianName={technicianName}
              onMarkPole={handleMarkPole}
              segments={segments}
              totalDistance={totalDistance}
              lastPole={lastPole}
            />
             <ReportGenerator segments={segments} jobName={jobName} technicianName={technicianName} />
          </>
        )}
      </main>
      {isStartJobModalVisible && (
        <StartJobModal onStart={handleStartJob} onCancel={handleCancelStartJob} />
      )}
      {isFormVisible && newSegmentData && (
        <SegmentFormModal
          segmentData={newSegmentData}
          onSave={handleSaveSegment}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <TranslationsProvider>
      <AppContent />
    </TranslationsProvider>
  );
}

export default App;