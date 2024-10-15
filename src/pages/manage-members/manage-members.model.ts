export interface MembersType {
  id: number;
  userName: string;
  emailId: string;
  phone: string;
  companyName?: string;
  companyId?: number;
  status?: number;
  roleId?: number;
  profileId?: number;
  mblVerificationStatus?: boolean;
  emailVerificationStatus?: boolean;
  profileAdminStatus?: number;
  isActive?: number;
  countryCode: string;
  userLogoUrl?: string;
}

export interface CreateNewMemberPayload {
  emailId: string;
  phone: string;
  userName: string;
  countryCode: string;
}
export interface ActivateMemberPayload {
  profileId: number;
  status: number;
}

export interface CountryCodeType {
  country_name: string;
  country_code: string;
}

export interface PaginatedReponse<T> {
  totct: number;
  pgn: number;
  perpg: number;
  result: Array<T>;
}
