export interface FileUploadType {
  file: File;
  contractTypeId?: number;
  contractFlag: number;
}

export interface ApiResponse {
  id: number;
  message: string;
  response: string;
  status: number;
}

export interface ApiResponseAutoSugggestTemplate {
  privateSuggestions: any;
  simpleoSuggestions: any;
  status: number;
  message: string;
  response: {
    simpleoSuggestions: SimpleoSuggestion[];
    privateSuggestions: PrivateSuggestion[];
  };
}

export interface SimpleoSuggestion {
  id: number;
  templateName: string;
}

export interface PrivateSuggestion {
  id: number;
  templateName: string;
}

export interface AgreementResponse {
  templateId: number;
  tempateName: string;
  contractTypeId: number;
  templateMarker: any;
  status: number;
  message: string;
  template: any;
  templateText: any;
  templateName: string;
  markerValueJson: string;
  createdBy: string;
  contractId: number;
  contractName: string;
  templatePublishStatus: number;
  response: {
    template: {
      templateId: number;
      templateName: string;
      templateUploadId: number;
      companyId: number;
      contractTypeId: number;
      templateText: string;
      status: number;
      isActive: number;
    };
    templateMarker: {
      id: number;
      templateId: number;
      markerJson: string;
      isActive: number;
    };
  };
}

export interface QuestionaireItem {
  question: string;
  variable_name: string;
  ans_type: string;
  value: string;
}

export interface SaveContractResponse {
  contractId: number;
  state: number;
}
export interface DraftFirstSaveContractData {
  contractTypeId: number;
  contractName: string;
  folderId: number;
  markerJson: string;
  templateId: number;
  text: string;
}
export interface ApiResponseFetchUser {
  authority: any;
  status: number;
  message: string;
  response: User[];
}

export interface User {
  id: number;
  userName: string;
  logoUrl: string;
  authority: Authority[];
  isExternal: boolean;
}

export interface Authority {
  id: number;
  name: string;
  description: string;
  status: number;
  authorityType: number;
  displayName: string;
}

export interface FileSharedPrecontractType {
  companyId: number;
  companyName: string;
  countryCode: string;
  createdOn: number;
  emailId: string;
  emailVerificationStatus: boolean;
  id: number;
  mblVerificationStatus: boolean;
  modifiedOn: boolean;
  phone: string;
  roleId: number;
  status: number;
  userLogoUrl: string;
  userName: string;
}
export interface AuthorityRoles {
  id: number;
  authorityGroupName: string;
  isActive: boolean;
  authorityId: number;
  authorityName: string;
  displayName: string;
}

export interface ApiResponseAuthorityList {
  status: number;
  message: string;
  response: AuthorityRoles[];
}

export interface PayloadAttachRoles {
  contractId: number;
  roleIds: number[];
  userId: number;
}

export interface ChangeStateResponse {
  contractId: number;
  state: number;
}

export interface UserMeta {
  id: number;
  userName: string;
  logoUrl: string;
  authority: Authority[];
}

export interface ContractResponse {
  contractId: number;
  contractName: string;
  finalContractText: string;
  markerValueJson: string;
  contractTypeId: number;
  templateId: number;
  folderId: number;
  state: number;
  companyId: number;
  isActive: number;
  userMetas: UserMeta[];
}

export interface ApiResponseForContractId {
  status: number;
  message: string;
  response: ContractResponse;
  finalContractText: string;
  state: number;
  contractName: string;
  contractId: number;
  markerValueJson: string;
  createdby: number;
  contractTypeId: number;
  pdfContent: string;
}

export interface AddExternalUserPayload {
  email: string;
  phoneNo: string;
  userName: string;
  countryCode: string;
  contractId: number;
}

export interface ApiResponseAddExternalUser {
  uid: any;
  unm: any;
  ueid: any;
  ulogo: any;
  status: number;
  message: string;
  response: {
    uid: number;
    unm: string;
    ueid: string;
    ulogo: string | null;
    st: boolean;
    isext: boolean;
  };
}
export interface Template {
  id: number;
  templateName: string;
  templateUploadId: number;
  companyId: number;
  contractTypeId: number;
  status: number;
  isActive: number;
  updatedBy: number;
  updatedOn: number;
  updatedByName: string;
  uploadFileType: string;
}

export interface ApiResponseFetchLatestTemaplate {
  status: number;
  message: string;
  response: Template[];
}

export interface IContractReviewExtracts {
  key: string;
  value: Array<{
    question: string;
    review: string;
    status: string;
  }>;
}
export interface PaginatedApiResponse<T> {
  result: T[];
  perpg: number;
  pgn: number;
  totct: number;
}

export interface PlaybookList {
  id: number;
  refId: number;
  playbookName: string;
  isReRun: number;
  reviewId: number
  processStatus: number;
  contractTypeId: number;
  isUniversal: number;
  isPublished: number;
  companyId: number;
  updatedOn: number;
  updatedBy: number;
}

export interface PlaybookResponseType {
  perpg: number;
  pgn: number;
  totct: number;
  result: Array<PlaybookList>;
}
