export interface ApiResponse {
  message: string;
  response: string;
  status: number;
}

export interface ExceptionApiResponse {
  message: string;
  result: string;
  status: number;
}

export interface OriginalFilePayloadType {
  fileId: number;
  folderId?: number;
  teamId: number;
  previewFileFlag?: boolean;
  controller?: AbortController | null;
}

export interface OriginalFileResponseType {
  file: string;
}

export interface ExtractedClausePayloadType {
  fileId: number;
  folderId?: number;
  teamId: number;
}

export interface ExtractedClauseType {
  header: string;
  content: string;
}

export interface ExtractedClauseResponseType {
  extractedClause: Array<ExtractedClauseType>;
}

export interface ExceptionsPayloadType {
  fileId: number;
}

export interface ExceptionsType {
  atx: string;
  atl: string;
  asd: number;
}

export interface ExceptionsResponseType {
  exceptions: Array<ExceptionsType>;
}

export interface TableDataPayloadType {
  fileId: number;
  folderId?: number;
  teamId: number;
}

export interface TableDataType {
  header: string;
  value: string;
}

export interface TableDataResponseType {
  tableData: Array<TableDataType>;
}

export interface ApiResponseSideBar {
  status: number;
  message: string;
  response: ResponseData;
  data: any;
}

export interface ResponseData {
  data: Section[];
}

export interface Section {
  key: string;
  value: Item[];
}

export interface Item {
  key: string;
  value: ItemValue[] | string;
}

export interface ItemValue {
  key: string;
  value: string;
}

export interface RightsSummaryPayloadType {
  fileId: number;
  teamId: number;
  folderId?: number;
}

export interface RightsSummaryDownloadPayloadType {
  fileId: number;
  teamId: number;
  folderId?: number;
}

export interface ExtracetedDocumentPayloadType {
  fileId: number;
  teamId: number;
  folderId?: number;
}

export interface sharedFileUser {
  id: number;
  userName: string;
  logoUrl: string;
}

export interface sharedUserPayloadType {
  status: number;
  message: string;
  response: sharedFileUser[];
}
export interface RightsCalendarPayloadType {
  fileId: number;
  teamId: number;
  folderId?: number;
}

export interface SmartViewPayloadTypes {
  pno?: number;
  loadFilter?: boolean;
  contractType?: Array<string>;
  creditDuration?: Array<string>;
  effectiveMonth?: Array<string>;
  effectiveYear?: Array<string>;
  firstParty?: Array<string>;
  jurisdiction?: Array<string>;
  liability?: Array<string>;
  secondParty?: Array<string>;
  terminationMonth?: Array<string>;
  terminationYear?: Array<string>;
  mergeResponse?: boolean;
}

export interface SmartViewResponse {
  status: number;
  message: string;
  response: any;
  aggr: any;
  result: Array<any>;
  totalCnt: number;
}

export interface SimilarFileUploadType {
  file: File;
  folderId?: number;
  parseFlag?: number;
  teamId?: number | null;
  fileId: number;
}

export interface UploadAndSignResponseType {
  status: number;
  message: string;
  response: string;
  id: number;
  pdfContent: string;
  contractName: string;
  createdBy: number;
  state: number;
  postContractId: number;
}
export interface FileMetaType {
  id: number;
  fileName: string;
  fileSize: number;
  parseFlag: number;
  pageCount: number;
  mimeType: string;
  processStatus: number;
  processSubStatus: number;
  status: number;
  createdOn: number;
  contractTypeId: number;
  contractTypeName: string;
}

export interface GetFileMetaPayloadTypes {
  fileId: number;
  folderId?: number;
  teamId: number;
}

export interface ComputeObligationPayloadTypes {
  fileId: number | string;
  folderId?: number;
  teamId?: number | null;
  notificationType?: "inline" | "toast";
}

export interface FileMetaResponse {
  id: number;
  fileName: string;
  fileSize: number;
  parseFlag: number;
  pageCount: number;
  mimeType: string;
  processStatus: number;
  processSubStatus: number;
  showPlaybook: boolean;
  status: number;
  createdOn: number;
  contractTypeId: number;
  contractTypeName: string;
  processDataStatus: boolean;
  obligationComputed: boolean;
  grcProcessStatus: number;
  createdBy: number;
  isExtractionAvailable: boolean;
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
  reviewId: number;
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

export interface SnippetListResponse {
  message: string;
  response: string;
  status: number;
  result: Array<any>;
  totct: number;
  pgn: number;
  perpg: number;
}
export interface ExtractedSummary {
  extractedJson: string;
  fileId: number;
  teamId: number;
  folderId: number;
}

export interface SummaryEdit {
  summary: string;
  data: any[];
}

export interface FileNavigationPayload {
  contractTypeId?: string | null;
  fileId: number;
  folderId?: number | null;
  pgn?: number | null;
  sIndexHash?: string | null;
  source?: string | null;
  teamId: number;
  teamUserId?: string | null;
  keyword?: string | null;
  notContractIds?: string | null;
  fromDate?: number | null;
  toDate?: number | null;
}

export interface FileNavigationState {
  request: FileNavigationPayload;
  prev: {
    id: number;
    fileName: string;
    teamId: number;
    folderId: number;
  } | null;
  next: {
    id: number;
    fileName: string;
    teamId: number;
    folderId: number;
  } | null;
}

export interface FileNavigationApiResponse extends FileNavigationState {}
