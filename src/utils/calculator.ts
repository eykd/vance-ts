/**
 * Utility class for basic mathematical operations
 */
export class Calculator {
  /**
   * Adds two numbers together
   *
   * @param a - The first number to add
   * @param b - The second number to add
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Divides one number by another
   *
   * @param a - The dividend (number to be divided)
   * @param b - The divisor (number to divide by)
   * @returns The quotient of a divided by b
   * @throws {Error} When attempting to divide by zero
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }
}
