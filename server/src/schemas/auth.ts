import { z } from "zod";

// Auth-specific error schema with message field
const AuthErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Export auth error schemas for different status codes
export const AuthError400Schema = AuthErrorSchema;
export const AuthError401Schema = AuthErrorSchema;
export const AuthError500Schema = AuthErrorSchema;

// SignIn endpoint schemas
export const SignInBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const SignInData = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
  }),
  profile: z.any(),
  permissions: z.object({
    canAccessMainApp: z.boolean(),
    features: z.array(z.string()),
    maxCompanies: z.number(),
  }),
  companies: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["owner", "admin", "viewer", "interviewee"]),
    })
  ),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }),
});

export const SignInResponseSchema = z.object({
  success: z.boolean(),
  data: SignInData.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// SignOut endpoint schemas
export const SignOutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// Refresh endpoint schemas
export const RefreshBodySchema = z.object({
  refresh_token: z.string(),
});

const RefreshData = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});

export const RefreshResponseSchema = z.object({
  success: z.boolean(),
  data: RefreshData.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Session endpoint schemas
const SessionData = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
  }),
  profile: z.any(),
  permissions: z.object({
    canAccessMainApp: z.boolean(),
    features: z.array(z.string()),
    maxCompanies: z.number(),
  }),
  companies: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["owner", "admin", "viewer", "interviewee"]),
    })
  ),
});

export const SessionResponseSchema = z.object({
  success: z.boolean(),
  data: SessionData.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Interview token endpoint schemas
export const InterviewTokenBodySchema = z.object({
  interviewId: z.number(),
  email: z.string(),
  accessCode: z.string(),
});

export const InterviewTokenResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
  }),
});

// Export all schemas as a collection
export const AuthSchemas = {
  // Error schemas
  AuthError400Schema,
  AuthError401Schema,
  AuthError500Schema,

  // SignIn
  SignInBodySchema,
  SignInResponseSchema,

  // SignOut
  SignOutResponseSchema,

  // Refresh
  RefreshBodySchema,
  RefreshResponseSchema,

  // Session
  SessionResponseSchema,

  // Interview token
  InterviewTokenBodySchema,
  InterviewTokenResponseSchema,
};
