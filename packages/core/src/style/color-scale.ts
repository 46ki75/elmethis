export type ColorStep = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type ColorScale = Readonly<Record<ColorStep, string>>;

type ColorChannels = readonly [number, number, number];

const parseHex = (hex: string): ColorChannels => {
  if (!/^#[\da-f]{6}$/i.test(hex)) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  return [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ];
};

const srgbToLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (channel: number): number =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

const hexToOklab = (hex: string): ColorChannels => {
  const [encodedRed, encodedGreen, encodedBlue] = parseHex(hex);
  const red = srgbToLinear(encodedRed);
  const green = srgbToLinear(encodedGreen);
  const blue = srgbToLinear(encodedBlue);
  const lightness = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const medium = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const short = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );

  return [
    0.2104542553 * lightness + 0.793617785 * medium - 0.0040720468 * short,
    1.9779984951 * lightness - 2.428592205 * medium + 0.4505937099 * short,
    0.0259040371 * lightness + 0.7827717662 * medium - 0.808675766 * short,
  ];
};

const oklabToHex = ([lightness, a, b]: ColorChannels): string => {
  const light = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [
    4.0767416621 * light - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * light + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * light - 0.7034186147 * medium + 1.707614701 * short,
  ];

  return `#${channels
    .map(linearToSrgb)
    .map((channel) => Math.min(1, Math.max(0, channel)))
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

const interpolateOklab = (
  start: ColorChannels,
  end: ColorChannels,
  amount: number,
): string =>
  oklabToHex([
    start[0] + (end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
    start[2] + (end[2] - start[2]) * amount,
  ]);

/**
 * Expands the authored 100/500/900 anchors into a perceptually even ramp.
 * OKLab avoids the muddy midpoints produced by interpolating encoded sRGB.
 */
export const createColorScale = (
  light: string,
  middle: string,
  dark: string,
): ColorScale => {
  const lightOklab = hexToOklab(light);
  const middleOklab = hexToOklab(middle);
  const darkOklab = hexToOklab(dark);

  return {
    100: light.toLowerCase(),
    200: interpolateOklab(lightOklab, middleOklab, 0.25),
    300: interpolateOklab(lightOklab, middleOklab, 0.5),
    400: interpolateOklab(lightOklab, middleOklab, 0.75),
    500: middle.toLowerCase(),
    600: interpolateOklab(middleOklab, darkOklab, 0.25),
    700: interpolateOklab(middleOklab, darkOklab, 0.5),
    800: interpolateOklab(middleOklab, darkOklab, 0.75),
    900: dark.toLowerCase(),
  };
};
