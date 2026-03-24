import type { VehicleAvailabilityResult } from '@/lib/vehicleAvailabilityCalculator';

interface AvailabilityChipProps {
  availability: VehicleAvailabilityResult;
}

const availabilityClassMap = {
  available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  limited: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'not-available': 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function AvailabilityChip({ availability }: AvailabilityChipProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${availabilityClassMap[availability.level]}`}
    >
      {availability.label} ({availability.activeCount} active)
    </span>
  );
}
