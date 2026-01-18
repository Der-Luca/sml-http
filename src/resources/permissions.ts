export function canRead(
  visibility: string,
  ownerEmail: string,
  requesterEmail: string | null
): boolean {
  const isPublic = visibility === "public-read" || visibility === "public-write";

  if (isPublic) {
    return true;
  }

  const isOwner = !!requesterEmail && requesterEmail === ownerEmail;
  const allowed = isOwner;

  

  return allowed;
}

export function canWrite(
  visibility: string,
  ownerEmail: string | null,
  requesterEmail: string | null
): boolean {
  if (visibility === "public-write") {
    return true;
  }

  const allowed = !!ownerEmail && !!requesterEmail && ownerEmail === requesterEmail;

  return allowed;
}
