import React from 'react';
import { Segment, Coordinates } from '../types';
import { useTranslations } from '../contexts/TranslationsContext';
import { encode } from '../utils/polyline';


interface MapDisplayProps {
  segments: Segment[];
  lastPole: Coordinates | null;
}

const API_KEY = process.env.API_KEY;

export const MapDisplay: React.FC<MapDisplayProps> = ({ segments, lastPole }) => {
  const { t } = useTranslations();
  const poles: Coordinates[] = [];
  if (segments.length > 0) {
    poles.push(segments[0].start);
    segments.forEach(seg => poles.push(seg.end));
  } else if (lastPole) {
    poles.push(lastPole);
  }

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
  const pathString = segments.length > 0 ? `&path=color:0x00aaff|weight:4|enc:${encodedPolyline}` : '';
  
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=satellite${pathString}${markers}&key=${API_KEY}`;
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl space-y-4">
      <h3 className="text-xl font-bold text-white text-center">{t('jobRoute')}</h3>
      <div className="bg-gray-900 rounded-md overflow-hidden flex justify-center">
        <img src={mapUrl} alt="Map of the job route" className="max-w-full" />
      </div>
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
