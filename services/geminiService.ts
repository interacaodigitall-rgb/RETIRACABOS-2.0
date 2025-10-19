
import { GoogleGenAI } from "@google/genai";
import { Segment } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getPrompt = (language: 'pt' | 'es', jobName: string, technicianName: string, totalDistance: string, segments: Segment[], formattedSegments: string) => {
    const prompts = {
        pt: `
            Você é um assistente de relatórios para técnicos de telecomunicações.
            Gere um relatório profissional e conciso para o trabalho "${jobName}".

            O relatório deve ter o seguinte formato:
            1.  **Resumo do Trabalho**: Um parágrafo resumindo os resultados chave (distância total, número de segmentos, técnico responsável).
            2.  **Análise Detalhada**: Uma análise sobre os tipos de cabos removidos e a quantidade.
            3.  **Observações Gerais**: Com base nos dados, aponte qualquer observação relevante ou padrão que possa ser útil.
            4.  **Lista de Segmentos**: Liste todos os segmentos registrados.

            Use Markdown para formatação (negrito, listas). Seja claro e direto.

            Aqui estão os dados do trabalho:
            ---
            Nome do Trabalho: ${jobName}
            Técnico Responsável: ${technicianName}
            Distância Total Removida: ${totalDistance} metros
            Número de Segmentos: ${segments.length}

            Dados dos Segmentos:
            ${formattedSegments}
            ---
        `,
        es: `
            Eres un asistente de informes para técnicos de telecomunicaciones.
            Genera un informe profesional y conciso para el trabajo "${jobName}".

            El informe debe tener el siguiente formato:
            1.  **Resumen del Trabajo**: Un párrafo que resuma los resultados clave (distancia total, número de segmentos, técnico responsable).
            2.  **Análisis Detallado**: Un análisis de los tipos de cables retirados y la cantidad.
            3.  **Observaciones Generales**: Basado en los datos, señala cualquier observación relevante o patrón que pueda ser útil.
            4.  **Lista de Segmentos**: Enumera todos los segmentos registrados.

            Usa Markdown para el formato (negrita, listas). Sé claro y directo.

            Aquí están los datos del trabajo:
            ---
            Nombre del Trabajo: ${jobName}
            Técnico Responsable: ${technicianName}
            Distancia Total Retirada: ${totalDistance} metros
            Número de Segmentos: ${segments.length}

            Datos de los Segmentos:
            ${formattedSegments}
            ---
        `
    };
    return prompts[language];
};

export const generateJobReport = async (segments: Segment[], jobName: string, technicianName: string, language: 'pt' | 'es'): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key not configured.";
  }

  const formattedSegments = segments.map((seg, index) =>
    language === 'pt' ?
    `Segmento ${index + 1}:
- Distância: ${seg.distance.toFixed(2)} metros
- Tipo de Cabo: ${seg.cableType}
- Quantidade: ${seg.quantity}
- Observações: ${seg.notes || 'N/A'}
- Timestamp: ${new Date(seg.timestamp).toLocaleString()}` :
    `Segmento ${index + 1}:
- Distancia: ${seg.distance.toFixed(2)} metros
- Tipo de Cable: ${seg.cableType}
- Cantidad: ${seg.quantity}
- Observaciones: ${seg.notes || 'N/A'}
- Timestamp: ${new Date(seg.timestamp).toLocaleString()}`
  ).join('\n\n');

  const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0).toFixed(2);

  const prompt = getPrompt(language, jobName, technicianName, totalDistance, segments, formattedSegments);

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    const errorMessage = language === 'pt' ? "Falha ao gerar o relatório. Verifique a conexão e a chave da API." : "No se pudo generar el informe. Verifique la conexión y la clave de la API.";
    return errorMessage;
  }
};