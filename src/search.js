/** Strip accents while preserving Norwegian æ, ø and å. */
export function normalise(value) {
  return value.normalize("NFD")
    .replace(/a\u030a/g, "å")
    .replace(/A\u030a/g, "Å")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Build the normalised index once, not on every keystroke. */
export function createSearch(entries) {
  const index = entries.map((entry) => normalise(entry)
    .toLowerCase().replace(/^\(+/, ""));

  return function search(query) {
    // Keep trailing spaces: "a " is the documented one-letter search.
    const prefix = normalise(query.trimStart()).toLowerCase();
    if (prefix.trim() === "" || prefix.length < 2) {
      return { count: 0, matches: [] };
    }
    const matches = entries.filter((entry, i) => {
      const candidate = index[i];
      if (candidate.startsWith(prefix)) return true;
      // Headwords are often followed by a comma, not a space (e.g. "a, ...").
      return prefix.length === 2 && prefix.endsWith(" ")
        && candidate.startsWith(`${prefix[0]},`);
    });
    return { count: matches.length, matches };
  };
}
