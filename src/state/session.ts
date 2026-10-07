export type SessionProfile = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export const session = {
  profile: undefined as SessionProfile | undefined,
};

export function setSessionProfile(profile: SessionProfile | undefined): void {
  session.profile = profile;
  globalThis.dispatchEvent(new Event('app:profile'));
}
