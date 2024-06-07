import { random, capitalize } from "lodash-es";

import { PORT_COUNT } from "./constants";
import { useLogStore } from "../stores/LogStore";
import { useAlertStore } from "../stores/AlertStore";
import ByteArray from "./structures/ByteArray";

/********* Helper functions **********/

export function getRandomBytes(count) {
  return Array.from({ length: count }, () => random(0, 255));
}

/**
 * Converts a string of keys separated by space or underscore to CapitalCase
 * @param {String} str A string of key separated
 * by space or underscore
 * @returns a string converted to CapitalCase
 */
export function toCapitalCase(str) {
  const split = str.split(/[\s:]+/).map((s) => capitalize(s));
  return split.join("");
}

/***** Byte array manipulation ******/
// Byte a is represented as little-endian

/**
 * Converts a ByteArray into a single decimal number
 * @param {ByteArray} byteArray
 * @returns A decimal number converted from a ByteArray
 */
export function byteArrayToDecimal(byteArray) {
  let num = 0;
  const bitWidth = byteArray.byteLength * 8;

  for (let i = 0; i < bitWidth; i++) {
    num += byteArray.getBit(i) << i;
  }
  return num;
}

/**
 * Counts a number of consecutive one of a byteArray
 * @param {*} byteArray
 * @returns a number of consecutive one of a byteArray
 */
export function countLeadingOnes(byteArray) {
  let count;

  for (const byte of byteArray) {
    for (let i = 7; i >= 0; i--) {
      const mask = 1 << i;
      if (byte & mask) {
        count++;
      } else {
        return count;
      }
    }
  }

  return count;
}

/**
 * Checks if num is in range of byte
 * while being unsigned.
 * @param {Number} num
 * @returns
 */
export function isByte(num) {
  return typeof num === "number" && num >= 0 && num <= 255;
}

/**
 * Checks if sequence of numbers are byte values
 * @param {Number[]} bytes Number sequence/iterable
 * @returns If all number in the iterable are bytes
 */
export function areBytes(bytes) {
  try {
    return bytes.every((value) => isByte(value));
  } catch {
    throw new EvalError("An argument must be an iterable of numbers!");
  }
}

/**
 * Sets bits in a bitmap represented by a number
 * @param {Number} bitmap
 * @param  {...Number} flags
 * @returns
 */
export function setFlags(bitmap, ...flags) {
  flags.forEach((flag) => {
    bitmap |= flag;
  });
  return bitmap;
}
/**
 * Unsets a certain bits within a bitmap
 * @param {Number} bitmap
 * @param  {...Number} flags
 * @returns
 */
export function unsetFlags(bitmap, ...flags) {
  flags.forEach((flag) => {
    bitmap &= ~flag;
  });
  return bitmap;
}

/**
 * Converts invidivudial flags represented by an index in the
 * bitmap to a bitmap.
 * @param  {...any} flags
 * @returns
 */
export function flagBitmap(...flags) {
  let mask = 0;
  flags.forEach((f) => (mask |= f));
  return mask;
}

/**
 * Returns if all passed flags are set
 * @param {Number} A bimap representing individual flags
 * @param {*} strict If the set flags must match strictly, else whether the bitmap contains all the given flags
 * @param {*} flags Flags to be checked
 */
export function hasFlags(bitmap, ...flags) {
  const mask = flagBitmap(...flags);

  return (mask & bitmap) == mask;
}

// Port utilities
export function isPortValid(port) {
  if (port === "*") {
    return true;
  } else if (!port || port < 0 || port > PORT_COUNT) {
    return false;
  }

  return true;
}

export function parsePort(port) {
  if (port instanceof ByteArray) {
    port = port.decimal;
  }

  if (port === "*") return port;

  try {
    port = parseInt(port);
    if (port < 0 || port > PORT_COUNT) throw new Error();

    return port;
  } catch (e) {
    throw Error("Invalid port number!");
  }
}

export function comparePorts(port1, port2) {
  port1 = parsePort(port1);
  port2 = parsePort(port2);
  return port1 === "*" || port2 === "*" || port1 == port2;
}

// Logging
export function addLog(str, duration) {
  useLogStore().addLog(str, duration);
}

export function addAlert(title = "Title", details = "", timeout = 0) {
  useAlertStore().addAlert(title, details, timeout);
}

export function addSuccess(title = "Title", details = "", timeout = 0) {
  useAlertStore().addSuccess(title, details, timeout);
}

export function addWarning(title = "Title", details = "", timeout = 0) {
  useAlertStore().addWarning(title, details, timeout);
}

export function reprIp(ipAddress) {
  return ipAddress.join(".");
}
