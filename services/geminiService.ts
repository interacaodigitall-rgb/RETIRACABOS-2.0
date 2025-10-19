import { GoogleGenAI } from "@google/genai";
import { Segment, Coordinates } from '../types';

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

const getRouteAnalysisPrompt = (language: 'pt' | 'es', poles: Coordinates[], totalDistance: string) => {
    const formattedPoles = poles.map((p, i) => `Polo ${i + 1}: lat=${p.lat}, lon=${p.lon}`).join('\n');
    const prompts = {
        pt: `
            Você é um especialista em logística e otimização de rotas para operações de campo de telecomunicações.
            **Tarefa**: Analise a seguinte sequência de coordenadas GPS, que representa o caminho que um técnico percorreu para atender postes. Seu objetivo é determinar se a rota foi eficiente e sugerir um caminho otimizado.

            **Dados da Rota Original**:
            - **Distância Total Percorrida**: ${totalDistance} metros
            - **Sequência de Postes Visitados**:
            ${formattedPoles}

            **Instruções**:
            1.  **Análise da Rota Original**: Avalie a eficiência do caminho percorrido. Identifique áreas específicas de ineficiência, como ziguezagues, cruzamentos desnecessários ou retrocessos. Seja específico (ex: "A viagem do Polo 3 para o Polo 4 parece ser um retrocesso, pois o Polo 5 estava mais próximo do Polo 3.").
            2.  **Cálculo da Rota Otimizada**: Determine a ordem mais eficiente para visitar todos os postes, começando no Polo 1 e terminando no último poste mais distante. Isso é semelhante ao Problema do Caixeiro Viajante.
            3.  **Apresentação da Rota Otimizada**: Mostre a nova sequência de postes (ex: 1 -> 3 -> 2 -> 4 -> ...).
            4.  **Cálculo de Economia**: Calcule a distância total da sua rota otimizada e a economia potencial (em metros e em porcentagem) em comparação com a rota original.
            5.  **Conclusão**: Forneça um resumo conciso com suas recomendações.

            **Formato da Resposta**: Use Markdown para uma apresentação clara e organizada, com títulos e negrito.
        `,
        es: `
            Eres un experto en logística y optimización de rutas para operaciones de campo de telecomunicaciones.
            **Tarea**: Analiza la siguiente secuencia de coordenadas GPS, que representa el camino que un técnico recorrió para dar servicio a postes. Tu objetivo es determinar si la ruta fue eficiente y sugerir un camino optimizado.

            **Datos de la Ruta Original**:
            - **Distancia Total Recorrida**: ${totalDistance} metros
            - **Secuencia de Postes Visitados**:
            ${formattedPoles}

            **Instrucciones**:
            1.  **Análisis de la Ruta Original**: Evalúa la eficiencia del camino recorrido. Identifica áreas específicas de ineficiencia, como zigzags, cruces innecesarios o retrocesos. Sé específico (ej: "El viaje del Poste 3 al Poste 4 parece ser un retroceso, ya que el Poste 5 estaba más cerca del Poste 3.").
            2.  **Cálculo de la Ruta Optimizada**: Determina el orden más eficiente para visitar todos los postes, comenzando en el Poste 1 y terminando en el último poste más lejano. Esto es similar al Problema del Vendedor Viajero.
            3.  **Presentación de la Ruta Optimizada**: Muestra la nueva secuencia de postes (ej: 1 -> 3 -> 2 -> 4 -> ...).
            4.  **Cálculo de Ahorro**: Calcula la distancia total de tu ruta optimizada y el ahorro potencial (en metros y en porcentaje) en comparación con la ruta original.
            5.  **Conclusión**: Proporciona un resumen conciso con tus recomendaciones.

            **Formato de Respuesta**: Usa Markdown para una presentación clara y organizada, con títulos y negrita.
        `
    }
    return prompts[language];
}

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


export const generateRouteAnalysis = async (segments: Segment[], language: 'pt' | 'es'): Promise<string> => {
    if (!API_KEY) {
        return "Error: Gemini API key not configured.";
    }

    const poles: Coordinates[] = [];
    if (segments.length > 0) {
        poles.push(segments[0].start);
        segments.forEach(seg => poles.push(seg.end));
    }
    
    if (poles.length < 3) {
        return "Not enough data for analysis.";
    }

    const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0).toFixed(2);

    const prompt = getRouteAnalysisPrompt(language, poles, totalDistance);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating route analysis with Gemini:", error);
        const errorMessage = language === 'pt' ? "Falha ao analisar a rota. Verifique a conexão e a chave da API." : "No se pudo analizar la ruta. Verifique la conexión y la clave de la API.";
        return errorMessage;
    }
};
