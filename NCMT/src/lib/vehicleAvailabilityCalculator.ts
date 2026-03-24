import type { VehicleDoc } from '@/types/transit';

export type VehicleAvailabilityLevel = 'available' | 'limited' | 'not-available';

export interface VehicleAvailabilityResult {
  activeCount: number;
  level: VehicleAvailabilityLevel;
  label: 'Available' | 'Limited' | 'Not available';
}

export function getVehicleAvailabilityByCount(
  activeCount: number
): VehicleAvailabilityResult {
  if (activeCount >= 3) {
    return {
      activeCount,
      level: 'available',
      label: 'Available',
    };
  }

  if (activeCount >= 1) {
    return {
      activeCount,
      level: 'limited',
      label: 'Limited',
    };
  }

  return {
    activeCount,
    level: 'not-available',
    label: 'Not available',
  };
}

export function getVehicleAvailabilityFromVehicles(
  vehicles: VehicleDoc[]
): VehicleAvailabilityResult {
  const activeCount = vehicles.filter((vehicle) => vehicle.status === 'active').length;
  return getVehicleAvailabilityByCount(activeCount);
}
