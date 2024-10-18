export function numberArrayToBase64(rawId: number[]): string {
  const buffer = Buffer.from(rawId);
  return buffer.toString('base64');
}

export function base64ToNumberArray(base64: string): number[] {
  const buffer = Buffer.from(base64, 'base64');
  return Array.from(buffer);
}
