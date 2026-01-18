export function canRead(
  visibility: Visibility,
  ownerEmail: string,
  requesterEmail: string | null
): boolean {
  const isPublic = visibility === Visibility.Read || visibility === Visibility.Write;
  if (isPublic) {
    return true;
  }

  const isOwner = !!requesterEmail && requesterEmail === ownerEmail;
  return isOwner;
}

export function canWrite(
  visibility: Visibility,
  ownerEmail: string | null,
  requesterEmail: string | null
): boolean {
  if (visibility === Visibility.Write) {
    return true;
  }

  const isOwner = !!requesterEmail && requesterEmail === ownerEmail;
  return isOwner;
}

export enum Visibility {
  Write = "public-write",
  Read = "public-read",
  None = "public-none",
}
