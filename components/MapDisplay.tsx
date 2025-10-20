import React from 'react';
import { Segment, Coordinates } from '../types';
import { useTranslations } from '../contexts/TranslationsContext';
import { encode } from '../utils/polyline';


interface MapDisplayProps {
  segments: Segment[];
  initialPole: Coordinates | null | undefined;
}

const API_KEY = process.env.API_KEY;

export const MapDisplay: React.FC<MapDisplayProps> = ({ segments, initialPole }) => {
  const { t } = useTranslations();
  const poles: Coordinates[] = [];
  if (initialPole) {
    poles.push(initialPole);
  }
  segments.forEach(seg => {
    if (poles.length === 0) { // Should not happen if initialPole logic is right, but as a fallback
        poles.push(seg.start);
    }
    poles.push(seg.end)
  });


  if (poles.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">{t('jobRoute')}</h3>
        <p className="text-gray-400">{t('noMapData')}</p>
      </div>
    );
  }

  const markers = poles.map((pole, index) => `&markers=color:red%7Clabel:${index + 1}%7C${pole.lat},${pole.lon}`).join('');
  
  const encodedPolyline = encode(poles);
  const pathString = poles.length > 1 ? `&path=color:0x00aaff|weight:4|enc:${encodedPolyline}` : '';
  
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=satellite${pathString}${markers}&key=${API_KEY}`;

  let googleMapsUrl = '';
  if (poles.length > 0) {
      if (poles.length === 1) {
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${poles[0].lat},${poles[0].lon}`;
      } else {
          const origin = `${poles[0].lat},${poles[0].lon}`;
          const destination = `${poles[poles.length - 1].lat},${poles[poles.length - 1].lon}`;
          const waypoints = poles.slice(1, -1).map(p => `${p.lat},${p.lon}`).join('|');
          googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
      }
  }
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl space-y-4">
      <h3 className="text-xl font-bold text-white text-center">{t('jobRoute')}</h3>
      <div className="bg-gray-900 rounded-md overflow-hidden flex justify-center">
        <img src={mapUrl} alt="Map of the job route" className="max-w-full" />
      </div>
       {googleMapsUrl && (
          <div className="text-center pt-2">
              <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                  aria-label={t('openInteractiveMap')}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  {t('openInteractiveMap')}
              </a>
          </div>
      )}
      {segments.length > 0 && (
         <div>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
                {segments.map((seg, index) => (
                    <li key={seg.id} className="bg-gray-700 p-2 rounded-md">
                        <span className="font-semibold text-gray-300">{t('segmentDistance', {start: index + 1, end: index + 2})}: </span>
                        <span className="font-bold text-blue-400">{seg.distance.toFixed(1)}m</span>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};