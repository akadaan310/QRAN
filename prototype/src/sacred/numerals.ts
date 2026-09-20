/**
 * Eastern Arabic numerals.
 *
 * §9 permits digits in exactly two places: inside the traditional ayah
 * end-marker (۝) and in the compass. Nowhere else, and never as a labelled
 * count. Everything that wants to show a number goes through here so that
 * rule is enforceable by reading one file.
 */

const EASTERN = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function eastern(value: number): string {
  return String(Math.trunc(Math.abs(value)))
    .split("")
    .map((digit) => EASTERN[Number(digit)])
    .join("");
}

/** The traditional end-of-ayah rosette carrying the ayah's number. */
export function endMarker(ayah: number): string {
  return `۝${eastern(ayah)}`;
}
