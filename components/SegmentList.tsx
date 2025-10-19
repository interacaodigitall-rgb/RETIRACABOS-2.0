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
    <div className="bg-gray-800 rounded-lg shadow-md p-4 transition-all hover:bg-gray-700 hover:shadow-lg">
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-white">{t('segmentLabel')} {segmentNumber}</h3>
            <p className="text-2xl font-semibold text-blue-400 my-1">{segment.distance.toFixed(2)} {t('meters')}</p>
            <p className="text-sm text-gray-300">{t('cable')}: <span className="font-medium">{getCableTypeName(segment.cableType)}</span> (x{segment.quantity})</p>
            {segment.notes && <p className="text-sm text-gray-400 mt-2 italic">"{segment.notes}"</p>}
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
