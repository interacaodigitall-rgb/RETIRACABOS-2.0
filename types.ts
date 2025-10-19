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
  photo?: File | null;
  photoUrl?: string;
  notes: string;
  timestamp: string;
}
