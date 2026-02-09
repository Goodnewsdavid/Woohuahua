/**
 * Display species for UI: when species is "other", show speciesOther; otherwise capitalize species.
 */
export function getDisplaySpecies(species: string, speciesOther?: string | null): string {
  if (species === "other" && speciesOther?.trim()) return speciesOther.trim();
  if (!species) return "";
  return species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();
}
