import type { ReactNode } from 'react';
import { Car, Bike, Send } from 'lucide-react';

export interface VehicleType {
  id: string;
  label: string;
  seats: string;
  range: string;
  icon: ReactNode;
  maxSeats: number;
}

export const VEHICLE_TYPES: VehicleType[] = [
  { id: 'EV Car', label: 'EV Car', seats: '1-4 seats', range: 'BDT 40-80', icon: <Car className="w-6 h-6" fill="currentColor" />, maxSeats: 4 },
  { id: 'eBike', label: 'eBike', seats: '1-2 seats', range: 'BDT 20-40', icon: <Bike className="w-6 h-6" fill="currentColor" />, maxSeats: 1 },
  { id: 'CNG', label: 'CNG Auto', seats: '1-3 seats', range: 'BDT 30-60', icon: <Send className="w-6 h-6 rotate-[-15deg]" fill="currentColor" />, maxSeats: 3 },
];

export const getVehicleType = (id: string | undefined): VehicleType | undefined =>
  VEHICLE_TYPES.find(v => v.id === id);
