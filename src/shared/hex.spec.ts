import { toHex } from './hex';

describe('toHex', () => {
  it('converts a Uint8Array to a lowercase hex string', () => {
    const bytes = new Uint8Array([0x00, 0x0f, 0x10, 0xff, 0xab]);
    expect(toHex(bytes)).toBe('000f10ffab');
  });

  it('converts an ArrayBuffer to a lowercase hex string', () => {
    const buf = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer;
    expect(toHex(buf)).toBe('deadbeef');
  });

  it('returns an empty string for an empty Uint8Array', () => {
    expect(toHex(new Uint8Array(0))).toBe('');
  });

  it('returns an empty string for an empty ArrayBuffer', () => {
    expect(toHex(new ArrayBuffer(0))).toBe('');
  });

  it('zero-pads single-digit hex values', () => {
    const bytes = new Uint8Array([0x01, 0x02, 0x03]);
    expect(toHex(bytes)).toBe('010203');
  });
});
