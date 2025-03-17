export function formatDate(date: string | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString();
}
