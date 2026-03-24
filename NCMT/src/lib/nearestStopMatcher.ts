import type { StopDoc } from '@/types/transit';

export interface StopMatchResult {
  stop: StopDoc;
  score: number;
}

export interface CoordinatePoint {
  latitude: number;
  longitude: number;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i]);

  for (let j = 1; j <= a.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function nameSimilarityScore(inputName: string, stopName: string): number {
  const input = normalizeText(inputName);
  const stop = normalizeText(stopName);

  if (!input || !stop) {
    return 0;
  }

  if (input === stop) {
    return 1;
  }

  if (stop.startsWith(input) || input.startsWith(stop)) {
    return 0.92;
  }

  if (stop.includes(input) || input.includes(stop)) {
    return 0.82;
  }

  const distance = levenshteinDistance(input, stop);
  const maxLength = Math.max(input.length, stop.length);

  return Math.max(0, 1 - distance / maxLength);
}

function haversineDistanceKm(a: CoordinatePoint, b: CoordinatePoint): number {
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const haversine =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

export function matchNearestStopByName(
  inputName: string,
  stops: StopDoc[]
): StopMatchResult | null {
  if (!stops.length || !normalizeText(inputName)) {
    return null;
  }

  const matches = stops
    .map((stop) => ({
      stop,
      score: nameSimilarityScore(inputName, stop.name),
    }))
    .sort((a, b) => b.score - a.score);

  const best = matches[0];

  if (!best || best.score < 0.45) {
    return null;
  }

  return best;
}

export function matchNearestStopByCoordinates(
  point: CoordinatePoint,
  stops: StopDoc[]
): StopMatchResult | null {
  if (!stops.length) {
    return null;
  }

  const withDistance = stops
    .map((stop) => {
      const km = haversineDistanceKm(point, {
        latitude: stop.latitude,
        longitude: stop.longitude,
      });

      return {
        stop,
        score: 1 / (1 + km),
      };
    })
    .sort((a, b) => b.score - a.score);

  return withDistance[0] ?? null;
}

export function matchBoardingAndDestinationStops(
  fromInput: string,
  toInput: string,
  stops: StopDoc[]
): { boardingStop: StopDoc; destinationStop: StopDoc } | null {
  const fromMatch = matchNearestStopByName(fromInput, stops);
  const toMatch = matchNearestStopByName(toInput, stops);

  if (!fromMatch || !toMatch) {
    return null;
  }

  return {
    boardingStop: fromMatch.stop,
    destinationStop: toMatch.stop,
  };
}
