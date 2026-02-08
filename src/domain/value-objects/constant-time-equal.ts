/**
 * Compares two strings in constant time to prevent timing attacks.
 *
 * Uses byte-level XOR comparison after encoding to UTF-8. Returns false
 * immediately if lengths differ (length is not considered secret).
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if the strings are equal, false otherwise
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufferA = encoder.encode(a);
  const bufferB = encoder.encode(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufferA.length; i++) {
    // Non-null: loop bound guarantees valid indices after length equality check
    result |= bufferA[i]! ^ bufferB[i]!;
  }

  return result === 0;
}
