export interface FileStatType {
  uuid?: string;
  id: string;
  cid: string;
  monthYear: string;
  tfc: number | null;
  spc: number | null;
  fpc: number | null;
}
export interface DashboardStatsBarGraphType {
  month: string;
  year: number;
  value: number;
  tfc: number | null;
  spc: number | null;
  fpc: number | null;
}

// uid - User Id
// cid - Company Id
// tfc → Total Uploaded Files Count
// spc → Count for Successfully Processed Files
// fpc → Count for Failed Processed Files

export interface ContractStats {
  nopg: number; // pages processed
  flsz: number; // data processed size (flsz/1024) GB
  spc: number;
  fpc: number;
  stronly: number;
  tfc: number; // total file uploaded
  id: {
    cid: number;
  };
}

export interface ContractTypeCount {
  name: string;
  count: number;
}

export interface ContractExpiring {
  fileName: string;
  terminationDate: string;
  userName: string;
  fid: number;
  cid: number;
  mimeType: string;
  teamId: number;
  folderId?: number;
}

export interface TopUser {
  name: string;
  count: number;
  logoUrl: string;
}

export interface ApiResponse {
  companyStatsList: ContractStats[];
  userStats: null;
  contractTypeCounts: {
    cid: number;
    uid: null;
    counts: ContractTypeCount[];
  };
  contractsExpiring: {
    cid: number;
    uid: null;
    contractsExpiring: ContractExpiring[];
  };
  topUser: TopUser;
}

export interface MonthlyResponseData {
  nopg: number | null;
  flsz: number | null;
  spc: number;
  fpc: number;
  stronly: number;
  tfc: number;
  id: { cid: number } | null;
}
