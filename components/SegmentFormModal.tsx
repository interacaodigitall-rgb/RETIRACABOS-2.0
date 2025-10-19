import React, { useState, useRef } from 'react';
import { Segment, CableType } from '../types';
import { useTranslations } from '../contexts/TranslationsContext';

interface SegmentFormModalProps {
  segmentData: Omit<Segment, 'id' | 'cableType' | 'quantity' | 'notes'>;
  onSave: (data: { cableType: CableType; quantity: number; notes: string; }) => void;
  onCancel: () => void;
}

export const SegmentFormModal: React.FC<SegmentFormModalProps> = ({ segmentData, onSave, onCancel }) => {
  const { t } = useTranslations();
  const [cableType, setCableType] = useState<CableType>(CableType.Simple);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const cableTypeOptions = [
    { value: CableType.Simple, label: t('cableTypeSimple') },
    { value: CableType.Double, label: t('cableTypeDouble') },
    { value: CableType.Other, label: t('cableTypeOther') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ cableType, quantity, notes });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-4">{t('segmentDetails')}</h2>
        <p className="text-lg text-blue-300 mb-6">{t('distance')}: <span className="font-semibold">{segmentData.distance.toFixed(2)} {t('meters')}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cableType" className="block text-sm font-medium text-gray-300 mb-1">{t('cableType')}</label>
            <select
              id="cableType"
              value={cableType}
              onChange={(e) => setCableType(e.target.value as CableType)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {cableTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">{t('quantity')}</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">{t('notes')}</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('notesPlaceholder')}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">{t('cancel')}</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors">{t('save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out forwards;
}
`;
document.head.appendChild(style);
