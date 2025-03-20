export default function capitalizeFirstLetter(
  input: string | null | undefined,
): string | null {
  if (!input || input.length === 0) {
    return input ?? null;
  }
  return input.charAt(0).toUpperCase() + input.slice(1);
}
