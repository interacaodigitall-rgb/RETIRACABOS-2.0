

import { getDistance } from 'geolib';

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  try {
    // getDistance da biblioteca geolib retorna a distância em metros e é mais preciso que a fórmula de Haversine para distâncias curtas.
    const distance = getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    );
    return distance;
  } catch(error) {
    console.error("Erro ao calcular distância com geolib:", error);
    // Retorna 0 como fallback para evitar que a aplicação quebre
    return 0;
  }
}