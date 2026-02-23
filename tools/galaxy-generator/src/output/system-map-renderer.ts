/**
 * System map renderer for galaxy pixelmap PNG generation.
 *
 * Pure rendering logic (no I/O) for generating an RGBA color pixelmap
 * of the galaxy, where each star system is rendered as a 2×2 colored dot.
 *
 * @module output/system-map-renderer
 */

import { encode } from 'fast-png';

import { Classification } from '../../../../src/domain/galaxy/types';

/** RGBA color tuple [r, g, b, a]. */
export type RgbaColor = readonly [number, number, number, number];

/** Background color: dark blue-black (#0A0A1A). */
const BACKGROUND: RgbaColor = [10, 10, 26, 255];

/**
 * Classification to RGBA color mapping.
 *
 * Colors:
 * - uninhabited: steel blue (#4A4A6A)
 * - lost_colony: amber (#CC7722)
 * - hidden_enclave: teal (#20B2AA)
 * - oikumene: gold (#FFD700)
 */
export const CLASSIFICATION_COLORS: Record<Classification, RgbaColor> = {
  [Classification.UNINHABITED]: [74, 74, 106, 255],
  [Classification.LOST_COLONY]: [204, 119, 34, 255],
  [Classification.HIDDEN_ENCLAVE]: [32, 178, 170, 255],
  [Classification.OIKUMENE]: [255, 215, 0, 255],
};

/** Paint order: uninhabited first, oikumene last (highest priority). */
const PAINT_ORDER: readonly Classification[] = [
  Classification.UNINHABITED,
  Classification.LOST_COLONY,
  Classification.HIDDEN_ENCLAVE,
  Classification.OIKUMENE,
];

/** Minimal interface for a renderable system. */
interface RenderableSystem {
  readonly x: number;
  readonly y: number;
  readonly classification: Classification;
}

/**
 * Paints a 2×2 dot at (px, py) in the RGBA buffer, clamped to image bounds.
 *
 * @param buffer - RGBA pixel buffer (width * height * 4 bytes)
 * @param px - left pixel column of the dot
 * @param py - top pixel row of the dot
 * @param width - image width in pixels
 * @param height - image height in pixels
 * @param color - RGBA color tuple
 */
export function paintDot(
  buffer: Uint8Array,
  px: number,
  py: number,
  width: number,
  height: number,
  color: RgbaColor
): void {
  for (let dy = 0; dy < 2; dy++) {
    for (let dx = 0; dx < 2; dx++) {
      const x = px + dx;
      const y = py + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const offset = (y * width + x) * 4;
        buffer[offset] = color[0];
        buffer[offset + 1] = color[1];
        buffer[offset + 2] = color[2];
        buffer[offset + 3] = color[3];
      }
    }
  }
}

/**
 * Renders star systems as a color pixelmap RGBA buffer.
 *
 * Each system is painted as a 2×2 dot colored by classification.
 * Paint order ensures oikumene (gold) is always on top.
 * Background is dark blue-black (#0A0A1A).
 *
 * @param systems - star systems to render
 * @param width - image width in pixels (matches costmap width)
 * @param height - image height in pixels (matches costmap height)
 * @param gridOriginX - X world coordinate corresponding to pixel column 0
 * @param gridOriginY - Y world coordinate corresponding to pixel row 0
 * @returns RGBA pixel buffer (width * height * 4 bytes)
 */
export function renderSystemsMap(
  systems: readonly RenderableSystem[],
  width: number,
  height: number,
  gridOriginX: number,
  gridOriginY: number
): Uint8Array {
  const buffer = new Uint8Array(width * height * 4);

  // Fill background
  const pixelCount = width * height;
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    buffer[offset] = BACKGROUND[0];
    buffer[offset + 1] = BACKGROUND[1];
    buffer[offset + 2] = BACKGROUND[2];
    buffer[offset + 3] = BACKGROUND[3];
  }

  // Paint in order: uninhabited → lost_colony → hidden_enclave → oikumene
  for (const cls of PAINT_ORDER) {
    const color = CLASSIFICATION_COLORS[cls];
    for (const system of systems) {
      if (system.classification === cls) {
        const px = system.x - gridOriginX;
        const py = system.y - gridOriginY;
        paintDot(buffer, px, py, width, height, color);
      }
    }
  }

  return buffer;
}

/**
 * Encodes an RGBA pixel buffer as an 8-bit RGBA PNG.
 *
 * @param data - RGBA pixel buffer (width * height * 4 bytes)
 * @param width - image width in pixels
 * @param height - image height in pixels
 * @returns PNG-encoded buffer
 */
export function encodeRgbaPng(data: Uint8Array, width: number, height: number): Uint8Array {
  return encode({
    width,
    height,
    data,
    depth: 8,
    channels: 4,
  });
}
