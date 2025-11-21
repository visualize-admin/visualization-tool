const RGB_MAX = 255;
const SV_MAX = 100;

export interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const rgbaToHsva = (rgba: RgbaColor): HsvaColor => {
  const { r, g, b, a } = rgba;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);

  const hh = delta
    ? max === r
      ? (g - b) / delta
      : max === g
        ? 2 + (b - r) / delta
        : 4 + (r - g) / delta
    : 0;

  return {
    h: 60 * (hh < 0 ? hh + 6 : hh),
    s: max ? (delta / max) * SV_MAX : 0,
    v: (max / RGB_MAX) * SV_MAX,
    a: a,
  };
};

export const hexToRgba = (hex: string): RgbaColor => {
  let htemp = hex.replace("#", "");
  if (/^#?/.test(hex) && htemp.length === 3) {
    hex =
      "#" +
      htemp.charAt(0) +
      htemp.charAt(0) +
      htemp.charAt(1) +
      htemp.charAt(1) +
      htemp.charAt(2) +
      htemp.charAt(2);
  }
  const reg = new RegExp("[A-Za-z0-9]{2}", "g");
  const matches = hex.match(reg);
  if (!matches) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const [r, g, b = 0, a] = matches.map((v) => parseInt(v, 16));
  return {
    r: r,
    g: g,
    b: b,
    a: (a !== null && a !== undefined ? a : 255) / RGB_MAX,
  };
};

const hsvaToRgba = (hsva: HsvaColor): RgbaColor => {
  const { h, s, v, a } = hsva;
  const _h = h / 60;
  const _s = s / SV_MAX;
  const _v = v / SV_MAX;
  const hi = Math.floor(_h) % 6;

  const f = _h - Math.floor(_h);
  const _p = RGB_MAX * _v * (1 - _s);
  const _q = RGB_MAX * _v * (1 - _s * f);
  const _t = RGB_MAX * _v * (1 - _s * (1 - f));
  const _vRgb = _v * RGB_MAX;

  const rgba = {} as RgbaColor;
  switch (hi) {
    case 0:
      rgba.r = _vRgb;
      rgba.g = _t;
      rgba.b = _p;
      break;
    case 1:
      rgba.r = _q;
      rgba.g = _vRgb;
      rgba.b = _p;
      break;
    case 2:
      rgba.r = _p;
      rgba.g = _vRgb;
      rgba.b = _t;
      break;
    case 3:
      rgba.r = _p;
      rgba.g = _q;
      rgba.b = _vRgb;
      break;
    case 4:
      rgba.r = _t;
      rgba.g = _p;
      rgba.b = _vRgb;
      break;
    case 5:
      rgba.r = _vRgb;
      rgba.g = _p;
      rgba.b = _q;
      break;
  }
  rgba.r = Math.round(rgba.r);
  rgba.g = Math.round(rgba.g);
  rgba.b = Math.round(rgba.b);

  return { ...rgba, a: a };
};

const rgbaToHex = (rgba: RgbaColor): string => {
  const { r, g, b } = rgba;
  const bin = (r << 16) | (g << 8) | b;
  const h = bin.toString(16);
  return "#" + new Array(7 - h.length).join("0") + h;
};

export const hexToHsva = (hex: string): HsvaColor => {
  return rgbaToHsva(hexToRgba(hex));
};

export const hsvaToHex = (hsva: HsvaColor): string => {
  return rgbaToHex(hsvaToRgba(hsva));
};

export const getContrastingColor = (color: string): string => {
  if (!color) {
    return "#ffffff";
  }

  const hex = color.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance >= 0.5 ? "#000000" : "#ffffff";
};
