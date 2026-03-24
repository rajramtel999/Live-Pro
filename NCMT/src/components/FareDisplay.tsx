interface FareDisplayProps {
  amount: number;
}

export default function FareDisplay({ amount }: FareDisplayProps) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
      <p className="text-xs text-gray-500">Estimated Fare</p>
      <p className="text-lg font-semibold text-emerald-800">NPR {amount}</p>
    </div>
  );
}
