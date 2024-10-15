import { CountryCodeType } from "pages/manage-members/manage-members.model";

export interface AuthResponse {
  profileId: number;
  token: string;
  username: string;
  userauthority: UserAuthority[];
  userLogo: string;
  roleName: string;
  ev: boolean;
  companyId: number;
  companyName: string;
  emailId: string;
  ef: boolean;
  dfp: string;
  myteamId: number;
  isExternal: boolean;
}

export interface UserAuthority {
  id: number;
  name: string;
}
export interface SignUpPayload {
  companyName: string;
  password: string;
  emailId: string;
  phone: string;
  userName: string;
  countryCode: string;
  terms: boolean;
}
export interface LoginPayload {
  emailId: string;
  password?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user?: AuthResponse;
  errorMessage: string;
  isEmailVerified?: boolean;
  mfaCase?: ContentCase;
  mfaData?: MfaLogin;
  companyExists?: {
    companyId: number;
    companyName: string;
    website: string;
  };
  countryCodeList: CountryCodeType[];
}

export interface TokenData extends JwtToken {
  sub: string;
}
export interface JwtToken {
  iat?: number;
  exp?: number;
}

export interface ApiResponse {
  message: string;
  response: string;
  status: number;
}

export interface ForgetPayload {
  password: string;
  cpassword: string;
}

export interface ApiResponseResetPassword {
  status: number;
  message: string;
  response: string;
}

export interface ResetPasswordPayload {
  password: string;
  cpassword: string;
  token: string;
}

export interface EmailVerifyPayload {
  token: string;
}

export interface GeneratedQRCodeType {
  qrCode: string;
  mfaCode: string;
}

export enum ContentCase {
  ScanQRCode,
  EnterSetupKey,
  VerifyCode,
}

export interface MfaLogin {
  token: string;
  isMfaEnable: boolean;
  qrGenerated: boolean;
  mfaTokenData: GeneratedQRCodeType;
}

export interface RegisterUserFormType {
  countryCode: string;
  emailId: string;
  companyId: number;
  userName: string;
  phone: string;
  website: string;
}

export interface RegisterCompanyLogo {
  extension?: string;
  file: string;
  companyId?: null;
  companyName: string;
}

export interface RegisterCompanyFormType {
  companyId?: number;
  companyName: string;
  countryCode: string;
  currency: string;
  dateFormat: string;
  description: string;
  domain: string;
  emailId: string;
  logo: string;
  packageId?: number;
  phone: string;
  region: string;
  simpleoSubDomain: string;
  terms: boolean;
  userName: string;
  website: string;
  gtk?: string;
}

export interface RegisterUserResponse extends ApiResponse {}
export interface RegisterCompanyLogoResponse extends ApiResponse {}
export interface RegisterCompanyResponse extends ApiResponse {}
