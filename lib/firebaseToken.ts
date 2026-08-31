import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export type AuthSession = {
  uid: string;
  email: string;
  name: string;
  picture: string;
};

export async function sessionFromBearer(header: string | null): Promise<AuthSession | null> {
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!token || !projectId) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    const uid = typeof payload.sub === "string" ? payload.sub : "";
    if (!uid) return null;
    return {
      uid,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
      picture: typeof payload.picture === "string" ? payload.picture : "",
    };
  } catch {
    return null;
  }
}

export async function uidFromBearer(header: string | null) {
  return (await sessionFromBearer(header))?.uid ?? null;
}
