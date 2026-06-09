/** Small id helper (works in node + browser without extra deps). */
export function createId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}
