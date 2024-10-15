export interface ContractType {
  id: number;
  name: string;
  desc: string;
  is_active: number;
}
export interface ApiResponse {
  message: string;
  response: string;
  status: number;
}
export interface SearchResult {
  result: Array<any>;
  totct: number;
}

export interface PayloadSearchPlaybook {
  notContractIds: number[]
  contractTypeIds: number[];
  keyword: string;
}

export interface PayloadGenertePlaybook {
  contractIds: string;
  contractTypeId: number;
  playbookName: string;
}

export interface PlaybookResponseType {
  perpg: number;
  pgn: number;
  totct: number;
  result: Array<PlaybookTypeList>;
}

export interface PaginatedApiResponse<T> {
  result: T[];
  perpg: number;
  pgn: number;
  totct: number;
}

export interface PlaybookTypeList {
  id: number;
  playbookName: string;
  createdBy: number,
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

export interface PlaybookResponse {
  id: number;
  playbookName: string;
  generatedJsonS3path: string;
  publishedJsonS3path: string;
  jsonContent: {
    version: string;
    created_date: string;
    playbook_rules: {
      key: string;
      ques: string[];
    }[];
  };
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

export interface SavePlaybookPayload {
  contractTypeId: number | undefined;
  id: number | undefined;
  playbookName: string | undefined; 
  publishStatus: number | undefined;
  publishedJson: string;
}
export interface copyPlaybookPayload {
  id: number | undefined;
  playbookName: string | undefined; 
}