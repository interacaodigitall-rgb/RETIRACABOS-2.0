import { Coordinates } from '../types';

// Implementation based on Google's documentation
// https://developers.google.com/maps/documentation/utilities/polylinealgorithm

export function encode(points: Coordinates[]): string {
  let plat = 0;
  let plng = 0;
  let encoded = '';

  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lon * 1e5);

    const dlat = lat - plat;
    const dlng = lng - plng;

    plat = lat;
    plng = lng;

    encoded += encodeSignedNumber(dlat) + encodeSignedNumber(dlng);
  }

  return encoded;
}

function encodeSignedNumber(num: number): string {
  let sgn_num = num << 1;
  if (num < 0) {
    sgn_num = ~sgn_num;
  }
  return encodeNumber(sgn_num);
}

function encodeNumber(num: number): string {
  let encode_string = '';
  while (num >= 0x20) {
    encode_string += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }
  encode_string += String.fromCharCode(num + 63);
  return encode_string;
}
