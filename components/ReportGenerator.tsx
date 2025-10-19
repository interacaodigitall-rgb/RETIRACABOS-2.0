import React, { useState } from 'react';
import { Segment } from '../types';
import { generateJobReport, generateRouteAnalysis } from '../services/geminiService';
import { useTranslations } from '../contexts/TranslationsContext';

interface ReportGeneratorProps {
  segments: Segment[];
  jobName: string;
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


export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ segments, jobName, technicianName }) => {
  const { t, language } = useTranslations();
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
      const result = await generateJobReport(segments, jobName, technicianName, language);
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
      const result = await generateRouteAnalysis(segments, language);
      setRouteAnalysis(result);
    } catch (err) {
      setAnalysisError(t('routeAnalysisError'));
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleDownloadCSV = () => {
    if (segments.length === 0) {
        setReportError(t('noDataToExport'));
        setTimeout(() => setReportError(''), 3000);
        return;
    }

    const headers = [
      'trabalho_id', 'tecnico', 'segmento_id', 'lat_origem', 'lng_origem',
      'lat_destino', 'lng_destino', 'distancia_m', 'tipo_cabo',
      'quantidade', 'observacoes', 'timestamp'
    ];
    const rows = segments.map(s => [
      jobName, technicianName, s.id, s.start.lat, s.start.lon,
      s.end.lat, s.end.lon, s.distance.toFixed(2), s.cableType,
      s.quantity, `"${s.notes.replace(/"/g, '""')}"`, s.timestamp
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${jobName.replace(/ /g,"_")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const hasData = segments.length > 0;

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">{t('reportAndExport')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleGenerateReport}
          disabled={isLoadingReport || !hasData}
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
