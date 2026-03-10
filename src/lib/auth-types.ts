export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",
  REFRESH: "/auth/refresh",
  VERIFY_EMAIL: "/auth/verify-email",
  LOGOUT: "/auth/logout",
} as const;

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  password_confirmation?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  display_name?: string;
  gender?: string;
  language_preference?: string;
  national_id?: string;
  date_of_birth?: string;
  accept_terms: boolean;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface VerifyEmailDto {
  code: string;
  user_id: string;
}

// Added to match standard JWT/Login responses despite unstructured spec
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: any;
}
