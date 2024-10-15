export interface adminResponse {
  status: number;
  message: string;
  response: adminResp;
}

export interface adminResp {
  userProfileResponse?: Partial<UserProfileResponse>;
  companyTeamDetails?: CompanyTeamDetail[];
  passwordOldDays?: string;
  profileSettings?: Partial<ProfileSettings>;
  assignedAuthority?: AssignedAuthorityResp[];
}

export interface AssignedAuthorityResp {
  authorityId: number;
  displayName: string;
}

export interface UserProfileResponse {
  id: number;
  emailId: string;
  userName: string;
  countryCode: string;
  phone: string;
  companyName: string;
  companyId: number;
  status: number;
  roleId: number;
  userLogoUrl: any;
  createdOn: number;
  modifiedOn: number;
  mblVerificationStatus: boolean;
  emailVerificationStatus: boolean;
}

export interface CompanyTeamDetail {
  id: number;
  teamName: string;
  teamDescription?: string;
  companyId: number;
  status: number;
  createdOn: number;
  createdBy: number;
  firstName: string;
  totalUser: number;
  isAdmin: number;
}

export interface ProfileSettings {
  id: number;
  profileId: number;
  inappNotification: boolean;
  emailNotification: boolean;
  defaultPage: number;
  showSuggestion: boolean;
  commentNotification: boolean;
  fileEditNotification: boolean;
  newMenberAlert: number;
  newFileAlert: number;
  createdOn: number;
  modifiedOn: number;
  companyId: number;
  isActive: boolean;
  alertEmailId?: string;
  secretCode: SecretCode;
  isMfaEnable: Status;
}

export enum SecretCode {
  Inactive = "0",
  Active = "1",
}
export enum Status {
  Inactive,
  Active,
}

export interface updateSelfSettingPayload {
  inappNotification: boolean;
  emailNotification: boolean;
  default_page: boolean;
  show_suggestion: boolean;
  comment_notification: boolean;
  file_edit_notification: boolean;
  new_menber_alert: number;
  new_file_alert: number;
}

export interface ApiResponseResetPassword {
  status: number;
  message: string;
  response: string;
}

export interface actvityDropdownList {
  key: string;
  value: string;
}

export interface actvityListPayLoad {
  pgn?: number;
  profileId?: number;
  selectedOption?: string[];
  mergeResponse?: boolean;
  startDate?: number | undefined;
  endDate?: number | undefined;
  userId?: Array<number>;
}

export interface actvityListResp {
  eventlog: string;
  eventDate: string;
  ip: string;
}

export interface actvityListRespRoot {
  status?: number;
  data?: actvityListResp[];
  message?: string[];
  errorCode?: number;
  isSuccess?: boolean;
}

export interface AddEditRolesResponse {
  authorityId: number;
  displayName: string;
}
