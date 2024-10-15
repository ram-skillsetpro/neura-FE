/**
 * Checks if the given input string contains any of the specific strings.
 *
 * @param {string} inputString - The input string to search within.
 * @param {string[]} specificStrings - An array of specific strings to search for.
 * @returns {boolean} Returns `true` if any of the specific strings are found in the input string,
 *   otherwise `false`.
 */
export function hasSpecificString(inputString: string, specificStrings: Array<string>): boolean {
  const regexPattern = new RegExp(`\\b(${specificStrings.join("|")})\\b`, "i");
  return regexPattern.test(inputString);
}
