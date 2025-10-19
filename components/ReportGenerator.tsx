import React, { useState } from 'react';
import { Segment, Job, Coordinates } from '../types';
import { useTranslations } from '../contexts/TranslationsContext';
import { encode } from '../utils/polyline';

interface ReportGeneratorProps {
  segments: Segment[];
  job: Job;
  technicianName: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ segments, job, technicianName }) => {
  const { t } = useTranslations();
  const [error, setError] = useState('');

  const handleDownloadCSV = () => {
    if (segments.length === 0 && !job.initialPole) {
        setError(t('noDataToExport'));
        setTimeout(() => setError(''), 3000);
        return;
    }

    const headers = [
      'id_trabalho', 'tecnico', 'segmento_id', 'lat_origem', 'lng_origem',
      'lat_destino', 'lng_destino', 'distancia_m', 'tipo_cabo',
      'quantidade', 'obs_segmento', 'obs_poste_final', 'timestamp'
    ];
    const rows = segments.map(s => [
      job.id, technicianName, s.id, s.start.lat, s.start.lon,
      s.end.lat, s.end.lon, s.distance.toFixed(2), s.cableType,
      s.quantity, `"${s.notes.replace(/"/g, '""')}"`, `"${s.endPoleNotes.replace(/"/g, '""')}"`, s.timestamp
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${job.nome.replace(/\s/g,"_")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePdf = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert("Não foi possível abrir a janela de impressão. Verifique se o seu navegador está bloqueando pop-ups.");
        return;
    }

    // Generate Map URL
    const API_KEY = process.env.API_KEY;
    const poles: Coordinates[] = [];
    if (job.initialPole) {
      poles.push(job.initialPole.coordinates);
    }
    segments.forEach(seg => poles.push(seg.end));
    
    let mapUrl = '';
    if (poles.length > 0 && API_KEY) {
        const markers = poles.map((pole, index) => `&markers=color:red%7Clabel:${index + 1}%7C${pole.lat},${pole.lon}`).join('');
        const encodedPolyline = encode(poles);
        const pathString = poles.length > 1 ? `&path=color:0x00aaff|weight:4|enc:${encodedPolyline}` : '';
        mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=satellite${pathString}${markers}&key=${API_KEY}`;
    }

    let segmentsHtml = '';
    if (job.initialPole) {
        segmentsHtml += `
            <div class="item">
                <h3>Poste 1 (Inicial)</h3>
                <p><strong>Coordenadas:</strong> ${job.initialPole.coordinates.lat.toFixed(6)}, ${job.initialPole.coordinates.lon.toFixed(6)}</p>
                ${job.initialPole.notes ? `<p><strong>Observações do Poste:</strong> <em>${job.initialPole.notes}</em></p>` : ''}
            </div>
        `;
    }

    segments.forEach((seg, index) => {
        const poleNumber = job.initialPole ? index + 2 : index + 1;
        segmentsHtml += `
            <div class="segment">
                --- Trecho do Poste ${poleNumber - 1} ao ${poleNumber} ---
            </div>
             <div class="item">
                <p><strong>Distância do Trecho:</strong> ${seg.distance.toFixed(2)}m</p>
                <p><strong>Tipo de Cabo:</strong> ${seg.cableType}</p>
                <p><strong>Quantidade de Cabos:</strong> ${seg.quantity}</p>
                <p><strong>Total de Cabo Removido no Trecho:</strong> ${(seg.distance * seg.quantity).toFixed(2)}m</p>
                ${seg.notes ? `<p><strong>Observações do Trecho:</strong> <em>${seg.notes}</em></p>` : ''}
                <h3>Poste ${poleNumber}</h3>
                <p><strong>Coordenadas:</strong> ${seg.end.lat.toFixed(6)}, ${seg.end.lon.toFixed(6)}</p>
                ${seg.endPoleNotes ? `<p><strong>Observações do Poste:</strong> <em>${seg.endPoleNotes}</em></p>` : ''}
            </div>
        `;
    });


    reportWindow.document.write(`
        <html>
            <head>
                <title>${t('pdfReportTitle')} - ${job.nome}</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; color: #333; }
                    h1, h2, h3 { color: #111; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    .header, .summary { margin-bottom: 20px; padding: 10px; background-color: #f4f4f4; border-radius: 5px; }
                    .item { border: 1px solid #ddd; padding: 10px; margin-top: 15px; border-radius: 5px; page-break-inside: avoid; }
                    .segment { text-align: center; font-weight: bold; color: #555; margin-top: 15px; }
                    p { line-height: 1.6; }
                    strong { color: #000; }
                    em { color: #444; }
                    img.map { width: 100%; max-width: 700px; margin: 20px auto; display: block; border: 1px solid #ccc; border-radius: 5px; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${t('pdfReportTitle')}</h1>
                    <p><strong>${t('jobName')}:</strong> ${job.nome}</p>
                    <p><strong>${t('technicianOnDuty')}:</strong> ${technicianName}</p>
                    <p><strong>Data de Início:</strong> ${job.dataInicio ? new Date(job.dataInicio.toDate()).toLocaleString() : 'N/A'}</p>
                </div>

                <div class="summary">
                    <h2>Resumo</h2>
                    <p><strong>${t('totalRemoved')}:</strong> ${job.totalMetros.toFixed(2)}m</p>
                </div>

                ${mapUrl ? `<h2>Mapa do Trajeto</h2><img src="${mapUrl}" alt="Mapa do Trajeto" class="map" />` : ''}

                <h2>Detalhes dos Segmentos</h2>
                ${segmentsHtml || '<p>Nenhum poste ou segmento registrado.</p>'}
            </body>
        </html>
    `);

    reportWindow.document.close();
    reportWindow.print();
  }
  
  const hasData = segments.length > 0 || !!job.initialPole;

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">{t('reportAndExport')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDownloadCSV}
          disabled={!hasData}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex-1 transition-colors"
        >
          {t('downloadCsv')}
        </button>
        <button
          onClick={handleGeneratePdf}
          disabled={!hasData}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex-1 transition-colors"
        >
          {t('generatePdf')}
        </button>
      </div>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default ReportGenerator;