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
