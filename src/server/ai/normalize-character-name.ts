export function normalizeCharacterName(
  name: string,
) {
  return name
    .toLowerCase()

    // remove punctuation
    .replace(/[.,]/g, "")

    // remove common honorifics
    .replace(/^mr\s+/i, "")
    .replace(/^mrs\s+/i, "")
    .replace(/^miss\s+/i, "")
    .replace(/^ms\s+/i, "")
    .replace(/^dr\s+/i, "")
    .replace(/^sir\s+/i, "")

    // normalize whitespace
    .replace(/\s+/g, " ")

    .trim();
}