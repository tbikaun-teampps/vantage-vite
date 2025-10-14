import jwt from "jsonwebtoken";

interface PublicInterviewAccessClaims {
  anonymousRole: "public_interviewee"; // Fixed role for public interview access
  interviewId: number;
  email: string;
  contactId: number;
  companyId: string;
  questionnaireId: number;
  assessmentId: number;
}

/**
 * Create a custom JWT for Supabase with specific claims for public interview access
 * @param customClaims - Custom claims to include in the JWT
 * @param jwtSigningKey - The secret key to sign the JWT
 * @returns Signed JWT as a string
 */
export function createCustomSupabaseJWT(
  userId: string,
  customClaims: PublicInterviewAccessClaims,
  jwtSigningKey: string
) {
  const payload = {
    role: "authenticated", // Custom server role, not standard supabase role
    // public_interviewee

    // Standard claims
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    iat: Math.floor(Date.now() / 1000),
    iss: "supabase",

    // Your custom claims
    ...customClaims,

    sub: userId,
  };

  return jwt.sign(payload, jwtSigningKey, {
    algorithm: "HS256",
  });
}
