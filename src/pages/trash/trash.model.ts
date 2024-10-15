export interface FilesResponseType {
  perpg: number;
  pgn: number;
  totct: number;
  result: Array<FileType>;
}

export interface FileType {
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
  mimeType?: string;
}

export interface ReportFileType {
  fileName: string;
  id: number;
}
export interface PlaybookResponseType {
  perpg: number;
  pgn: number;
  totct: number;
  result: Array<PlaybookTrashList>;
}
export interface PaginatedApiResponse<T> {
  result: T[];
  perpg: number;
  pgn: number;
  totct: number;
}

export interface PlaybookTrashList {
  id: number;
  playbookName: string;
  generatedJsonS3path: string;
  publishedJsonS3path: string;
  jsonContent: string;
  contractTypeId: number;
  isUniversal: number;
  isPublished: number;
  companyId: number;
  processStatus: number;
  errorCode: number;
  userName: string;
  userLogoUrl: string;
  isActive: number;
  updatedOn: number;
  updatedBy: number;
}
export interface ApiResponse {
  message: string;
  response: string;
  status: number;
}
