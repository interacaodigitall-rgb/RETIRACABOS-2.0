import React, { useState } from 'react';
import { Segment, Job } from '../types';
import { generateJobReport, generateRouteAnalysis } from '../services/geminiService';
import { useTranslations } from '../contexts/TranslationsContext';

interface ReportGeneratorProps {
  segments: Segment[];
  job: Job;
  technicianName: string;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // A simple markdown to HTML converter
    const formatText = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>') // Handle ordered lists
            .replace(/<\/li><li>/g, '</li>\n<li>') // Add newline between list items for regex
            .replace(/(\n\s*){2,}/g, '<br /><br />') // paragraphs
            .replace(/\n/g, '<br />');

        // Wrap lists
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>').replace(/<\/ul>\s*<ul>/g, '');
        
        return { __html: html };
    };

  return <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={formatText(content)} />;
};


const ReportGenerator: React.FC<ReportGeneratorProps> = ({ segments, job, technicianName }) => {
  const { t } = useTranslations();
  const [report, setReport] = useState('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const [routeAnalysis, setRouteAnalysis] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');


  const handleGenerateReport = async () => {
    if (segments.length === 0) {
        setReportError(t('noDataToReport'));
        setTimeout(() => setReportError(''), 3000);
        return;
    }
    setIsLoadingReport(true);
    setReportError('');
    setReport('');
    try {
      const result = await generateJobReport(segments, job.nome, technicianName);
      setReport(result);
    } catch (err) {
      setReportError(t('aiError'));
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleAnalyzeRoute = async () => {
    if (segments.length < 2) { // Need at least 3 poles (2 segments) for a meaningful analysis
        setAnalysisError(t('notEnoughDataForAnalysis'));
        setTimeout(() => setAnalysisError(''), 4000);
        return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisError('');
    setRouteAnalysis('');
    try {
      const result = await generateRouteAnalysis(segments);
      setRouteAnalysis(result);
    } catch (err) {
      setAnalysisError(t('routeAnalysisError'));
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleDownloadCSV = () => {
    if (segments.length === 0 && !job.initialPole) {
        setReportError(t('noDataToExport'));
        setTimeout(() => setReportError(''), 3000);
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
    const totalDistance = job.totalMetros;
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
        alert("Não foi possível abrir a janela de impressão. Verifique se o seu navegador está bloqueando pop-ups.");
        return;
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
        segmentsHtml += `
            <div class="segment">
                --- Segmento ${index + 1} &rarr; ${index + 2} ---
            </div>
             <div class="item">
                <p><strong>Distância:</strong> ${seg.distance.toFixed(2)}m</p>
                <p><strong>Cabo:</strong> ${seg.cableType} (x${seg.quantity})</p>
                ${seg.notes ? `<p><strong>Observações do trecho:</strong> <em>${seg.notes}</em></p>` : ''}
                <h3>Poste ${index + 2}</h3>
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
                    .item { border: 1px solid #ddd; padding: 10px; margin-top: 15px; border-radius: 5px; }
                    .segment { text-align: center; font-weight: bold; color: #555; margin-top: 15px; }
                    p { line-height: 1.6; }
                    strong { color: #000; }
                    em { color: #444; }
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
                    <p><strong>${t('totalRemoved')}:</strong> ${totalDistance.toFixed(2)}m ${totalDistance > 1000 ? `(${(totalDistance/1000).toFixed(2)}km)` : ''}</p>
                </div>

                <h2>Detalhes</h2>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleGenerateReport}
          disabled={isLoadingReport || segments.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex-1 transition-colors"
        >
          {isLoadingReport ? t('generatingReport') : t('generateAiReport')}
        </button>
        <button
          onClick={handleAnalyzeRoute}
          disabled={isLoadingAnalysis || segments.length < 2}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex-1 transition-colors"
        >
          {isLoadingAnalysis ? t('analyzingRoute') : t('analyzeRoute')}
        </button>
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
      {(reportError || analysisError) && <p className="text-red-400 mt-4">{reportError || analysisError}</p>}
      
      {report && (
        <div className="mt-6 p-4 bg-gray-900 rounded-md border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2">{t('aiReportTitle')}</h3>
          <MarkdownRenderer content={report} />
        </div>
      )}

      {routeAnalysis && (
        <div className="mt-6 p-4 bg-gray-900 rounded-md border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2">{t('routeAnalysisTitle')}</h3>
          <MarkdownRenderer content={routeAnalysis} />
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
