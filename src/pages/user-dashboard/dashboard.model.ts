export interface AddFolderPayload {
  folderName: string;
  parentFolderId?: number;
}

export interface FilesFoldersResponse {
  status: number;
  message: string;
  response: string;
}

export interface FilesFoldersResponseType {
  fileList: Array<FileType>;
  fileCount: number;
  folderCount: number;
  perpg: number;
  pgn: number;
  folderList: Array<FolderType>;
}

export interface FilesResponseType {
  perpg: number;
  pgn: number;
  totct: number;
  result: Array<FileType>;
}

export interface foldersResponseType {
  perpg: number;
  pgn: number;
  totct: number;
  result: Array<FolderType>;
}

export interface FileType {
  fileId: number;
  isNew?: boolean;
  contractCode: string;
  createdBy: number;
  createdOn: number;
  updatedOn: number;
  fileName: string;
  firstName: string;
  folderId?: number;
  id: number;
  lastName?: string;
  processStatus: number;
  status: number;
  teamId: number;
  fileSize: number;
  pageCount: number;
  sharedWith: Array<{ id: number; userName: string; logoUrl: string }>;
  filename: string;
  mimeType: string;
}

export interface FolderType {
  createdBy: number;
  createdOn: number;
  firstName: string;
  folderName: string;
  id: number;
  lastName?: string;
  parentFolderId: number | null;
  status: number;
  teamId: number;
  updatedOn: number;
}

export interface FileUploadType {
  file: File;
  folder?: FolderType;
  parseFlag?: number;
  teamId?: number | null;
  grcParseFlag?: number;
}

export interface SearchResponseResp {
  folderName?: string;
  teamName?: any;
  ccd: string;
  fileId: number;
  filename: string;
  folderId: any;
  fsz: any;
  teamId: number;
  cmid: number;
  createdById: number;
  ctbynm: string;
  updatedDate: number;
  txt: string;
  tags: any;
  tl: string;
  fldt: any;
  prts: any;
  jurs: string;
  cnt: string;
  comp: string;
  cntp: string;
  st: number;
  firstParty: string;
  secondParty: string;
  terminationDate: string;
  effectiveDate: string;
  jurisdiction: string;
  sharedWith: Array<any>;
  executionDate: string;
  mimeType: string;
}
export interface SearchResponsePayLoad {
  keyword: string;
  pgn?: number;
  mergeResponse?: boolean;
  sIndexHash?: string | null;
}

export interface FileStatusCheckPayload {
  fileIdList: number[];
  folderId: number | null;
  status: number;
  teamId: number | null;
}

export interface UploadFolderPayload {
  s: number;
  fnm: string;
  fid?: number | null;
  pfg?: number;
  teamId?: number | null;
}

export interface CommonItemType {
  createdBy: number;
  createdOn: number;
  firstName: string;
  id: number;
  lastName: string;
  status: number;
  teamId: number;
}

export interface FileSharedTypeResponse {
  internalShare: FileSharedType[];
  externalShare: [];
}

export interface FileSharedType {
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
  isExternal?: boolean;
}

export interface FileSharedSenderType {
  id: number;
  email_id: string;
  user_name: string;
  user_last_name: any;
  phone: string;
  company_name: string;
  company_id: number;
  status: number;
  role_id: number;
  mbl_verification_status: boolean;
  email_verification_status: boolean;
  companyName: string;
  emailId: string;
}
export interface ShareToExternalUserPayload {
  emailcsv: string;
  fileId: number;
  folderId: number;
  teamId: number;
  timePeriod: number;
}
export interface ShareFilePayload {
  fileId: number;
  profileId: number[];
  status: number;
}
export interface LogoutResponse {
  status: number;
  message: string;
  response: string;
}

export interface ApiResponseSharedWithMe {
  result: FileSharedWithMe[];
  perpg: number;
  pgn: number;
  totct: number;
}

export interface FileSharedWithMe {
  id: number;
  contractCode: string;
  createdBy: number;
  fileId: number;
  fileName: string;
  fileSize: number;
  firstName: string;
  lastName: string;
  teamId: number;
  folderId: number;
  processStatus: number;
  pageCount?: number;
  sharedWithProfileId: number;
  sharedWithProfileName: string;
  sharedByProfileId: number;
  sharedByProfileName: string;
  companyId: number;
  status: number;
  createdOn: number;
  sharedWith: Array<{ id: number; userName: string; logoUrl: string }>;
  updatedOn: number;
  mimeType?: string;
}
export interface ApiResponseResetPassword {
  status: number;
  message: string;
  response: string;
}

export interface UploadingFileType {
  id: string;
  fileName: string;
  progress: number;
  pfg: number;
}
export interface UserMeta {
  id: number;
  userName: string;
  logoUrl: string;
}

export interface MySharedFileWithName {
  rowid: number;
  contractCode: string;
  id: number;
  fileName: string;
  fileSize: number;
  teamId: number;
  folderId: number;
  sharedWithProfileId: number;
  sharedWithProfileName: string;
  sharedByProfileId: number;
  sharedByProfileName: string;
  companyId: number;
  processStatus: number;
  status: number;
  createdOn: number;
  updatedOn: number;
  createdBy: number;
  mimeType?: string;
}

export interface UserData {
  userMeta: UserMeta;
  mySharedFilesWithNames: MySharedFileWithName[];
}

export interface ApiResponseTopSharedUsers {
  status: number;
  message: string;
  response: UserData[];
}

export interface SummaryAlert {
  text: string;
  title: string;
  status: number;
}

export interface ContractType {
  id: number;
  name: string;
  desc: string;
  is_active: number;
}

export interface SearchResultResponse {
  result: Array<any>;
  totct: number;
  sIndexHash: string;
}
export interface PaginatedApiResponse<T> {
  result: T[];
  perpg: number;
  pgn: number;
  totct: number;
}
export interface FolderSearchResult {
  folderId: number;
  folderName: string;
  parentFolderId: number;
  parentFolderName: string;
  teamId: number;
  teamName: string;
  status: any;
  createdOn: number;
  createdBy: number;
}
