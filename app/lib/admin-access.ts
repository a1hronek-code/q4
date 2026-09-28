export function isAdminEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;

  return allowedAdminEmails().includes(email.trim().toLowerCase());
}

export function hasAdminEmailAllowlist(): boolean {
  return allowedAdminEmails().length > 0;
}

export function isAdminAuthConfigured(): boolean {
  return hasAdminEmailAllowlist() && configuredOAuthProviders().length > 0;
}

function allowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function configuredOAuthProviders() {
  if (!process.env.AUTH_SECRET) return [];

  return [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [{ id: "google", label: "Pokračovať s Google" }]
      : []),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [{ id: "github", label: "Pokračovať s GitHub" }]
      : []),
  ];
}
