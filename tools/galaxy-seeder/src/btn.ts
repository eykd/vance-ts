/**
 * BTN (Bilateral Trade Number) computation per GURPS Far Trader formula.
 *
 * @module btn
 */

/**
 * Returns the distance modifier for a given number of hops.
 *
 * @param hops - Number of hops between two systems
 * @returns The distance modifier value
 */
export function distanceModifier(hops: number): number {
  if (hops <= 1) {
    return 0;
  }
  if (hops <= 2) {
    return 0.5;
  }
  return 1.0;
}

/**
 * Computes the Bilateral Trade Number for a system pair using the GURPS Far Trader formula.
 *
 * BTN = clamp(wtnA + wtnB - distanceModifier(hops), 0, min(wtnA, wtnB) + 5)
 *
 * @param wtnA - World Trade Number of the first system
 * @param wtnB - World Trade Number of the second system
 * @param hops - Number of hops between the two systems
 * @returns The computed BTN value
 * @throws {Error} If either WTN value is not a finite number
 */
export function computeBtn(wtnA: number, wtnB: number, hops: number): number {
  if (!Number.isFinite(wtnA)) {
    throw new Error('wtnA must be a finite number');
  }
  if (!Number.isFinite(wtnB)) {
    throw new Error('wtnB must be a finite number');
  }

  const raw = wtnA + wtnB - distanceModifier(hops);
  const cap = Math.min(wtnA, wtnB) + 5;
  return Math.max(0, Math.min(raw, cap));
}
