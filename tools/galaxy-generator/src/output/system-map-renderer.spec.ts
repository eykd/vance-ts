/**
 * Tests for system-map-renderer.
 *
 * Note: fast-png is NOT mocked here — encodeRgbaPng tests use real PNG encoding.
 */
import { Classification } from '../../../../src/domain/galaxy/types';

import {
  CLASSIFICATION_COLORS,
  encodeRgbaPng,
  paintDot,
  renderSystemsMap,
} from './system-map-renderer';

/**
 * Counts pixels in an RGBA buffer matching the given red channel value.
 *
 * @param buffer - RGBA pixel buffer
 * @param redValue - expected red channel value to match
 * @returns number of pixels with that red value
 */
function countPaintedPixels(buffer: Uint8Array, redValue: number): number {
  let count = 0;
  for (let i = 0; i < buffer.length; i += 4) {
    if (buffer[i] === redValue) {
      count++;
    }
  }
  return count;
}

describe('CLASSIFICATION_COLORS', () => {
  it('has an entry for every classification', () => {
    expect(CLASSIFICATION_COLORS[Classification.UNINHABITED]).toBeDefined();
    expect(CLASSIFICATION_COLORS[Classification.LOST_COLONY]).toBeDefined();
    expect(CLASSIFICATION_COLORS[Classification.HIDDEN_ENCLAVE]).toBeDefined();
    expect(CLASSIFICATION_COLORS[Classification.OIKUMENE]).toBeDefined();
  });

  it('maps oikumene to gold (#FFD700)', () => {
    const color = CLASSIFICATION_COLORS[Classification.OIKUMENE];
    expect(color[0]).toBe(255);
    expect(color[1]).toBe(215);
    expect(color[2]).toBe(0);
    expect(color[3]).toBe(255);
  });

  it('maps uninhabited to steel blue (#4A4A6A)', () => {
    const color = CLASSIFICATION_COLORS[Classification.UNINHABITED];
    expect(color[0]).toBe(74);
    expect(color[1]).toBe(74);
    expect(color[2]).toBe(106);
    expect(color[3]).toBe(255);
  });

  it('maps lost_colony to amber (#CC7722)', () => {
    const color = CLASSIFICATION_COLORS[Classification.LOST_COLONY];
    expect(color[0]).toBe(204);
    expect(color[1]).toBe(119);
    expect(color[2]).toBe(34);
    expect(color[3]).toBe(255);
  });

  it('maps hidden_enclave to teal (#20B2AA)', () => {
    const color = CLASSIFICATION_COLORS[Classification.HIDDEN_ENCLAVE];
    expect(color[0]).toBe(32);
    expect(color[1]).toBe(178);
    expect(color[2]).toBe(170);
    expect(color[3]).toBe(255);
  });
});

describe('paintDot', () => {
  it('paints 4 pixels for a dot within a larger image', () => {
    const w = 10;
    const h = 10;
    const buffer = new Uint8Array(w * h * 4);
    const color: readonly [number, number, number, number] = [255, 128, 64, 255];

    paintDot(buffer, 2, 3, w, h, color);

    // (2,3): offset = (3*10+2)*4 = 128
    expect(buffer[128]).toBe(255);
    expect(buffer[129]).toBe(128);
    expect(buffer[130]).toBe(64);
    expect(buffer[131]).toBe(255);
    // (3,3): offset = (3*10+3)*4 = 132
    expect(buffer[132]).toBe(255);
    // (2,4): offset = (4*10+2)*4 = 168
    expect(buffer[168]).toBe(255);
    // (3,4): offset = (4*10+3)*4 = 172
    expect(buffer[172]).toBe(255);

    expect(countPaintedPixels(buffer, 255)).toBe(4);
  });

  it('only paints in-bounds pixels when at right edge (px = width - 1)', () => {
    const w = 5;
    const h = 5;
    const buffer = new Uint8Array(w * h * 4);
    const color: readonly [number, number, number, number] = [100, 200, 50, 255];

    // px = 4 (right edge), py = 2 — px+1=5 is out of bounds
    paintDot(buffer, 4, 2, w, h, color);

    // (4,2): offset = (2*5+4)*4 = 56
    expect(buffer[56]).toBe(100);
    // (4,3): offset = (3*5+4)*4 = 76
    expect(buffer[76]).toBe(100);
    // Only 2 pixels painted (right column clipped)
    expect(countPaintedPixels(buffer, 100)).toBe(2);
  });

  it('only paints in-bounds pixels when at bottom edge (py = height - 1)', () => {
    const w = 5;
    const h = 5;
    const buffer = new Uint8Array(w * h * 4);
    const color: readonly [number, number, number, number] = [77, 88, 99, 255];

    // px = 1, py = 4 (bottom edge) — py+1=5 is out of bounds
    paintDot(buffer, 1, 4, w, h, color);

    // (1,4): offset = (4*5+1)*4 = 84
    expect(buffer[84]).toBe(77);
    // (2,4): offset = (4*5+2)*4 = 88
    expect(buffer[88]).toBe(77);
    // Only 2 pixels painted (bottom row clipped)
    expect(countPaintedPixels(buffer, 77)).toBe(2);
  });

  it('paints nothing for fully out-of-bounds coordinates', () => {
    const w = 4;
    const h = 4;
    const buffer = new Uint8Array(w * h * 4);
    const color: readonly [number, number, number, number] = [255, 0, 0, 255];

    paintDot(buffer, -2, -2, w, h, color);

    expect(buffer.every((v) => v === 0)).toBe(true);
  });

  it('paints a full 2x2 dot at the top-left corner (0, 0)', () => {
    const w = 4;
    const h = 4;
    const buffer = new Uint8Array(w * h * 4);
    const color: readonly [number, number, number, number] = [1, 2, 3, 255];

    paintDot(buffer, 0, 0, w, h, color);

    // (0,0): offset=0
    expect(buffer[0]).toBe(1);
    // (1,0): offset=4
    expect(buffer[4]).toBe(1);
    // (0,1): offset=16
    expect(buffer[16]).toBe(1);
    // (1,1): offset=20
    expect(buffer[20]).toBe(1);

    expect(countPaintedPixels(buffer, 1)).toBe(4);
  });
});

describe('renderSystemsMap', () => {
  it('fills entire buffer with background color when no systems', () => {
    const buffer = renderSystemsMap([], 3, 3, 0, 0);

    for (let i = 0; i < 3 * 3; i++) {
      const offset = i * 4;
      expect(buffer[offset]).toBe(10);
      expect(buffer[offset + 1]).toBe(10);
      expect(buffer[offset + 2]).toBe(26);
      expect(buffer[offset + 3]).toBe(255);
    }
  });

  it('returns buffer of correct size (width * height * 4)', () => {
    const buffer = renderSystemsMap([], 7, 5, 0, 0);

    expect(buffer.length).toBe(7 * 5 * 4);
  });

  it('paints an uninhabited system at the correct pixel position', () => {
    const systems = [{ x: 1, y: 2, classification: Classification.UNINHABITED }];
    const buffer = renderSystemsMap(systems, 10, 10, 0, 0);

    // px=1, py=2: offset = (2*10+1)*4 = 84
    const color = CLASSIFICATION_COLORS[Classification.UNINHABITED];
    expect(buffer[84]).toBe(color[0]);
    expect(buffer[85]).toBe(color[1]);
    expect(buffer[86]).toBe(color[2]);
    expect(buffer[87]).toBe(color[3]);
  });

  it('applies grid origin offset to position mapping', () => {
    const gridOriginX = 5;
    const gridOriginY = 10;
    const systems = [{ x: 6, y: 11, classification: Classification.OIKUMENE }];
    const buffer = renderSystemsMap(systems, 10, 10, gridOriginX, gridOriginY);

    // px = 6-5 = 1, py = 11-10 = 1: offset = (1*10+1)*4 = 44
    const color = CLASSIFICATION_COLORS[Classification.OIKUMENE];
    expect(buffer[44]).toBe(color[0]);
    expect(buffer[45]).toBe(color[1]);
    expect(buffer[46]).toBe(color[2]);
  });

  it('paints each classification with its correct color at distinct positions', () => {
    const w = 20;
    const h = 5;
    const systems = [
      { x: 0, y: 0, classification: Classification.UNINHABITED },
      { x: 4, y: 0, classification: Classification.LOST_COLONY },
      { x: 8, y: 0, classification: Classification.HIDDEN_ENCLAVE },
      { x: 12, y: 0, classification: Classification.OIKUMENE },
    ];
    const buffer = renderSystemsMap(systems, w, h, 0, 0);

    // (0,0) → offset 0
    expect(buffer[0]).toBe(CLASSIFICATION_COLORS[Classification.UNINHABITED][0]);
    // (4,0) → offset 16
    expect(buffer[16]).toBe(CLASSIFICATION_COLORS[Classification.LOST_COLONY][0]);
    // (8,0) → offset 32
    expect(buffer[32]).toBe(CLASSIFICATION_COLORS[Classification.HIDDEN_ENCLAVE][0]);
    // (12,0) → offset 48
    expect(buffer[48]).toBe(CLASSIFICATION_COLORS[Classification.OIKUMENE][0]);
  });

  it('paints oikumene over uninhabited at same position (paint order)', () => {
    const systems = [
      { x: 2, y: 2, classification: Classification.UNINHABITED },
      { x: 2, y: 2, classification: Classification.OIKUMENE },
    ];
    const buffer = renderSystemsMap(systems, 10, 10, 0, 0);

    // px=2, py=2: offset = (2*10+2)*4 = 88
    const oikumeneColor = CLASSIFICATION_COLORS[Classification.OIKUMENE];
    expect(buffer[88]).toBe(oikumeneColor[0]);
    expect(buffer[89]).toBe(oikumeneColor[1]);
    expect(buffer[90]).toBe(oikumeneColor[2]);
  });

  it('paints lost_colony over uninhabited at same position', () => {
    const systems = [
      { x: 1, y: 1, classification: Classification.UNINHABITED },
      { x: 1, y: 1, classification: Classification.LOST_COLONY },
    ];
    const buffer = renderSystemsMap(systems, 10, 10, 0, 0);

    // (1,1) → offset = (1*10+1)*4 = 44
    const lostColonyColor = CLASSIFICATION_COLORS[Classification.LOST_COLONY];
    expect(buffer[44]).toBe(lostColonyColor[0]);
  });
});

describe('encodeRgbaPng', () => {
  it('output starts with PNG magic bytes [137, 80, 78, 71]', () => {
    const data = new Uint8Array(4 * 4 * 4);

    const result = encodeRgbaPng(data, 4, 4);

    expect(result[0]).toBe(137);
    expect(result[1]).toBe(80);
    expect(result[2]).toBe(78);
    expect(result[3]).toBe(71);
  });

  it('produces output larger than the raw input (PNG headers add overhead)', () => {
    const data = new Uint8Array(2 * 2 * 4);

    const result = encodeRgbaPng(data, 2, 2);

    expect(result.length).toBeGreaterThan(data.length);
  });
});
