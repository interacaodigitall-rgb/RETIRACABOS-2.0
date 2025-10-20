// FIX: Removed the self-import of 'Coordinates' which was causing a declaration conflict.
export interface Coordinates {
  lat: number;
  lon: number;
}

export enum CableType {
  Simple = 'Simple',
  Double = 'Double',
  Other = 'Other',
}

export interface Segment {
  id: string;
  start: Coordinates;
  end: Coordinates;
  distance: number; // in meters
  cableType: CableType;
  quantity: number;
  notes: string;
  endPoleNotes: string;
  requiresReturn: boolean;
  timestamp: string;
}

export interface Job {
  id: string;
  nome: string;
  totalMetros: number;
  dataInicio: any; // Firestore Timestamp
  status: 'ativo' | 'concluido' | 'pausado';
  usuarioId: string;
  initialPole?: {
    coordinates: Coordinates;
    notes: string;
  };
}
