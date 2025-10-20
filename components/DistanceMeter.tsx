import React, { useState } from 'react';
import { Coordinates } from '../types';
import { calculateDistance } from '../utils/geolocation';
import { useTranslations } from '../contexts/TranslationsContext';

interface Point {
  coords: Coordinates;
  time: Date;
}

export const DistanceMeter: React.FC = () => {
    const { t } = useTranslations();
    const [pointA, setPointA] = useState<Point | null>(null);
    const [pointB, setPointB] = useState<Point | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMarkPoint = (pointSetter: React.Dispatch<React.SetStateAction<Point | null>>) => {
        setIsLoading(true);
        setError('');
        // Limpa o ponto B se o ponto A for marcado novamente
        if (pointSetter === (setPointA as any)) {
            setPointB(null);
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                pointSetter({
                    coords: {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    },
                    time: new Date(),
                });
                setIsLoading(false);
            },
            (err) => {
                setError(t('gpsUnavailable'));
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleReset = () => {
        setPointA(null);
        setPointB(null);
        setError('');
    };

    const distance = pointA && pointB ? calculateDistance(pointA.coords.lat, pointA.coords.lon, pointB.coords.lat, pointB.coords.lon) : null;
    const timeDiff = pointA && pointB ? (pointB.time.getTime() - pointA.time.getTime()) / 1000 : null;
    
    const renderPointInfo = (point: Point | null, pointName: string) => (
        <div className="flex-1 p-3 bg-gray-900 rounded-md">
            <h4 className="font-bold text-white">{pointName}</h4>
            {point ? (
                 <div>
                    <p className="text-sm text-green-400">{t('pointMarkedAt', { time: point.time.toLocaleTimeString() })}</p>
                    <p className="text-xs text-gray-400">Lat: {point.coords.lat.toFixed(6)}, Lon: {point.coords.lon.toFixed(6)}</p>
                 </div>
            ) : (
                <p className="text-sm text-gray-500 italic">{pointName === t('pointA') ? 'Aguardando marcação...' : 'Aguardando Ponto A...'}</p>
            )}
        </div>
    );


    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">{t('distanceMeterTitle')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <button
                    onClick={() => handleMarkPoint(setPointA)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500"
                >
                    {isLoading ? t('gettingLocation') : t('markPointA')}
                </button>
                 <button
                    onClick={() => handleMarkPoint(setPointB)}
                    disabled={isLoading || !pointA}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-gray-500"
                >
                    {isLoading ? t('gettingLocation') : t('markPointB')}
                </button>
                <button
                    onClick={handleReset}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                    {t('resetMeasurement')}
                </button>
            </div>
             {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {renderPointInfo(pointA, t('pointA'))}
                {renderPointInfo(pointB, t('pointB'))}
            </div>

            {distance !== null && timeDiff !== null && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-white mb-2">{t('measurementResult')}</h3>
                    <div className="flex flex-col sm:flex-row justify-around text-center gap-4">
                        <div>
                            <p className="text-sm uppercase text-gray-400">{t('distanceResultLabel')}</p>
                            <p className="text-3xl font-bold text-blue-400">{distance.toFixed(2)} <span className="text-lg">{t('meters')}</span></p>
                        </div>
                        <div>
                            <p className="text-sm uppercase text-gray-400">{t('elapsedTime')}</p>
                            <p className="text-3xl font-bold text-gray-300">{timeDiff.toFixed(1)} <span className="text-lg">{t('seconds')}</span></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistanceMeter;
