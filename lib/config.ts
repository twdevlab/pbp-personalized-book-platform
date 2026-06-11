export function isMockMode(): boolean {
  const value = process.env.MOCK_MODE?.trim().toLowerCase();
  return value === "true" || value === "1";
}

export function hasValue(value: string | undefined): value is string {
  return Boolean(value && value.trim().length > 0);
}

export function getEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
