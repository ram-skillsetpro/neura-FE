export interface ContractType {
  id: number;
  contractFileId: number;
  fileName: string;
  contractCode: string;
  companyId: number;
  firstParty: string;
  secondParty: string;
  contractType: string;
  maximumLiability: string;
  effectiveDate: string;
  contractDuration: number;
  terminationDate: string;
  governingLaw: string;
  jurisdiction: string;
  createdOn: number;
  createdBy: string;
}

export interface ExtractedContractReportType {
  perpg: number;
  pgn: number;
  result: Array<ContractType>;
  totct: number | string;
  headerList: Array<any>;
  dataList: Array<any>;
}

export interface RequestedDownloadPayloadTypes {
  pageNo?: number;
}

export interface DownloadFilePayloadType {
  reportId: number;
}
