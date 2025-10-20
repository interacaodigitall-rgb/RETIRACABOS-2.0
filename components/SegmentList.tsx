import React from 'react';
import { Segment, CableType } from '../types';
import { useTranslations } from '../contexts/TranslationsContext';

interface SegmentListProps {
  segments: Segment[];
}

const SegmentCard: React.FC<{ segment: Segment, segmentNumber: number }> = ({ segment, segmentNumber }) => {
  const { t } = useTranslations();

  const getCableTypeName = (cableType: CableType) => {
    switch (cableType) {
      case CableType.Simple: return t('cableTypeSimple');
      case CableType.Double: return t('cableTypeDouble');
      case CableType.Other: return t('cableTypeOther');
      default: return cableType;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-md p-4 transition-all hover:bg-gray-700 hover:shadow-lg ${segment.requiresReturn ? 'border-2 border-red-500' : ''}`}>
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-white">{t('segmentLabel')} {segmentNumber}</h3>
            <p className="text-2xl font-semibold text-blue-400 my-1">{segment.distance.toFixed(2)} {t('meters')}</p>
            <p className="text-sm text-gray-300">{t('cable')}: <span className="font-medium">{getCableTypeName(segment.cableType)}</span> (x{segment.quantity})</p>
            {segment.notes && <p className="text-sm text-gray-400 mt-2 italic">"{segment.notes}"</p>}
            
            {segment.requiresReturn && (
              <div className="mt-3 flex items-center gap-2 bg-red-900/50 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-300 font-bold">{t('returnNeeded')}</span>
              </div>
            )}

            {segment.endPoleNotes && 
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-sm font-semibold text-gray-400">{t('poleNotes')}:</p>
                <p className="text-sm text-gray-300 italic">"{segment.endPoleNotes}"</p>
              </div>
            }
        </div>
    </div>
  );
};

export const SegmentList: React.FC<SegmentListProps> = ({ segments }) => {
  const { t } = useTranslations();
  if (segments.length === 0) {
    return (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-400">{t('noSegments')}</h3>
            <p className="text-gray-500 mt-2">{t('noSegmentsDescription')}</p>
        </div>
    );
  }

  const reversedSegments = [...segments].reverse();

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white border-b-2 border-gray-700 pb-2">{t('registeredSegments')}</h2>
        {reversedSegments.map((segment, index) => (
            <SegmentCard key={segment.id} segment={segment} segmentNumber={segments.length - index} />
        ))}
    </div>
  );
};