import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { Segment, Coordinates, CableType, Job } from './types';
import { calculateDistance } from './utils/geolocation';
import { JobDashboard } from './components/JobDashboard';
import { TranslationsProvider, useTranslations } from './contexts/TranslationsContext';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, onSnapshot, writeBatch, orderBy } from 'firebase/firestore';

const ReportGenerator = lazy(() => import('./components/ReportGenerator'));
const SegmentFormModal = lazy(() => import('./components/SegmentFormModal'));
const StartJobModal = lazy(() => import('./components/StartJobModal'));

const Header: React.FC<{ user: User | null; onLogout: () => void; onBack: () => void; showBackButton: boolean }> = ({ user, onLogout, onBack, showBackButton }) => {
  const { t } = useTranslations();
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-20 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button onClick={onBack} className="text-white hover:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 20.5c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-3.5c0-.8-.7-1.5-1.5-1.5-.8 0-1.5.7-1.5 1.5v3.5z" />
            <path d="M4 12.5c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5-.8 0-1.5.7-1.5 1.5v3z" />
            <path d="M17 14.5c0 .8.7 1.5 1.5 1.5.8 0 1.5-.7 1.5-1.5v-9c0-.8-.7-1.5-1.5-1.5-.8 0-1.5.7-1.5 1.5v9z" />
            <path d="M12 4V2" /><path d="M12 15v-2" /><path d="M5.5 8V2" /><path d="M5.5 14v-1.5" /><path d="M18.5 22v-4.5" /><path d="M18.5 5.5V2" />
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-wider">{t('appName')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user && <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm">Sair</button>}
        </div>
      </div>
    </header>
  );
};

const AuthComponent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white">{isLogin ? "Login" : "Registrar"}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Senha</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                        {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-400 hover:underline">
                        {isLogin ? "Não tem uma conta? Registre-se" : "Já tem uma conta? Faça login"}
                    </button>
                </p>
            </div>
        </div>
    )
}

const JobListComponent: React.FC<{ jobs: Job[], onSelect: (job: Job) => void, onNew: () => void }> = ({ jobs, onSelect, onNew }) => {
    const { t } = useTranslations();
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Meus Trabalhos</h2>
                <button onClick={onNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105">
                    {t('startNewJob')}
                </button>
            </div>
            {jobs.length > 0 ? (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} onClick={() => onSelect(job)} className="bg-gray-800 p-5 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition-colors">
                            <h3 className="text-xl font-bold text-white truncate">{job.nome}</h3>
                            <p className="text-gray-400">Total: {job.totalMetros.toFixed(2)}m</p>
                            <p className="text-sm text-gray-500">Iniciado em: {job.dataInicio ? new Date(job.dataInicio.toDate()).toLocaleDateString() : 'Pendente'}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-400">Nenhum trabalho encontrado.</h3>
                    <p className="text-gray-500 mt-2">Clique em "Iniciar Novo Trabalho" para começar.</p>
                </div>
            )}
        </div>
    )
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  
  const [lastPole, setLastPole] = useState<Coordinates | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isStartJobModalVisible, setIsStartJobModalVisible] = useState(false);
  const [newSegmentData, setNewSegmentData] = useState<Omit<Segment, 'id' | 'cableType' | 'quantity' | 'notes'> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setJobs([]);
        setActiveJob(null);
        setSegments([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'trabalhos'), where('usuarioId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      jobsData.sort((a, b) => {
        if (!a.dataInicio || !b.dataInicio) return 0; 
        return b.dataInicio.toDate().getTime() - a.dataInicio.toDate().getTime();
      });
      setJobs(jobsData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!activeJob) {
      setSegments([]);
      setLastPole(null);
      return;
    };
    const segmentsQuery = query(collection(db, 'trabalhos', activeJob.id, 'segmentos'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(segmentsQuery, (snapshot) => {
      const segmentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          start: { lat: data.lat_origem, lon: data.lng_origem },
          end: { lat: data.lat_destino, lon: data.lng_destino },
          distance: data.distancia_m,
          cableType: data.tipo_cabo,
          quantity: data.quantidade,
          notes: data.observacoes,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        } as Segment
      });
      setSegments(segmentsData);
      if (segmentsData.length > 0) {
        setLastPole(segmentsData[segmentsData.length - 1].end);
      } else {
        setLastPole(null);
      }
    });
    return () => unsubscribe();
  }, [activeJob]);
  
  const handleStartJob = useCallback(async (data: { jobName: string }) => {
    if (!user) return;
    const newJobData = {
        usuarioId: user.uid,
        nome: data.jobName,
        dataInicio: serverTimestamp(),
        totalMetros: 0,
        status: 'ativo' as const,
    };
    const docRef = await addDoc(collection(db, 'trabalhos'), newJobData);
    
    const tempActiveJob: Job = {
        id: docRef.id,
        ...newJobData,
        dataInicio: { toDate: () => new Date() } 
    };

    setActiveJob(tempActiveJob);
    setIsStartJobModalVisible(false);
  }, [user]);

  const handleMarkPole = useCallback((coords: Coordinates) => {
    if (lastPole) {
      const distance = calculateDistance(lastPole.lat, lastPole.lon, coords.lat, coords.lon);
      const newSegData: Omit<Segment, 'id' | 'cableType' | 'quantity' | 'notes'> = {
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

  const handleSaveSegment = useCallback(async (formData: { cableType: CableType; quantity: number; notes: string; }) => {
    if (newSegmentData && activeJob) {
      const segmentToSave = {
        lat_origem: newSegmentData.start.lat,
        lng_origem: newSegmentData.start.lon,
        lat_destino: newSegmentData.end.lat,
        lng_destino: newSegmentData.end.lon,
        distancia_m: newSegmentData.distance,
        tipo_cabo: formData.cableType,
        quantidade: formData.quantity,
        observacoes: formData.notes,
        timestamp: serverTimestamp(),
      };
      
      const jobRef = doc(db, 'trabalhos', activeJob.id);
      const segmentsRef = collection(db, 'trabalhos', activeJob.id, 'segmentos');

      const batch = writeBatch(db);
      batch.set(doc(segmentsRef), segmentToSave);
      const newTotal = activeJob.totalMetros + newSegmentData.distance;
      batch.update(jobRef, { totalMetros: newTotal });

      await batch.commit();

      setActiveJob(prev => prev ? { ...prev, totalMetros: newTotal } : null);
      
      setIsFormVisible(false);
      setNewSegmentData(null);
    }
  }, [newSegmentData, activeJob]);

  const handleCancelForm = useCallback(() => {
    if (segments.length > 0) {
      setLastPole(segments[segments.length - 1].end);
    } else {
      setLastPole(null);
    }
    setIsFormVisible(false);
    setNewSegmentData(null);
  }, [segments]);

  const handleBackToList = () => {
    setActiveJob(null);
  }

  if (authLoading) {
      return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header user={user} onLogout={() => auth.signOut()} onBack={handleBackToList} showBackButton={!!activeJob} />
      <main className="container mx-auto p-4 md:p-6">
        {!user ? (
            <AuthComponent />
        ) : !activeJob ? (
            <JobListComponent jobs={jobs} onSelect={setActiveJob} onNew={() => setIsStartJobModalVisible(true)} />
        ) : (
          <>
            <JobDashboard 
              jobName={activeJob.nome}
              technicianName={user.displayName || user.email || 'Técnico'}
              onMarkPole={handleMarkPole}
              segments={segments}
              totalDistance={activeJob.totalMetros}
              lastPole={lastPole}
            />
            <Suspense fallback={<div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl mt-8">Carregando relatório...</div>}>
              <ReportGenerator segments={segments} jobName={activeJob.nome} technicianName={user.displayName || user.email || 'Técnico'} />
            </Suspense>
          </>
        )}
      </main>
      <Suspense fallback={null}>
        {isStartJobModalVisible && (
          <StartJobModal onStart={handleStartJob} onCancel={() => setIsStartJobModalVisible(false)} />
        )}
        {isFormVisible && newSegmentData && (
          <SegmentFormModal
            segmentData={newSegmentData}
            onSave={handleSaveSegment}
            onCancel={handleCancelForm}
          />
        )}
      </Suspense>
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