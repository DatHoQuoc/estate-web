export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",
  REFRESH: "/auth/refresh",
  VERIFY_EMAIL: "/auth/verify-email",
  LOGOUT: "/auth/logout",
  UPDATE_PROFILE: "/users/profile",
  USERS: "/users",
  USERS_STATS: "/users/stats",
  ROLES: "/roles",
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

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: UserResponseDto;
}

export interface RoleResponseDto {
  role_id: string;
  name: string;
  description: string | null;
}

export interface UserResponseDto {
  user_id: string;
  email: string;
  email_verified: boolean;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  user_status: "active" | "inactive" | "suspended";
  role: RoleResponseDto | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface UserStatsResponseDto {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

export interface UserListQueryDto {
  page?: number;
  limit?: number;
}

export interface PaginatedMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsersResponseDto {
  items: UserResponseDto[];
  meta: PaginatedMetaDto;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  gender?: string;
  language_preference?: string;
  national_id?: string;
  date_of_birth?: string;
}

export interface AdminCreateUserDto {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
}

export interface AdminUpdateUserDto extends UpdateUserDto {
  user_status?: "active" | "inactive" | "suspended";
  role_id?: string;
}

export interface MessageResponseDto {
  message: string;
}

