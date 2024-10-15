import { User } from "pages/pre-contract/pre-contract.model";
import { UserList } from "pages/pre-contract/right-section-preContract/share-modal-precontract";

export interface DraftType {
  contractId: number;
  preContractName: string;
  contractName: string;
  finalContractText: string;
  markerValueJson: string;
  contractTypeId: number;
  templateId: number;
  folderId?: number;
  state: number;
  companyId: number;
  isActive: number;
  createdby?: number;
  createdBy?: number;
  createdOn: number;
  userMetas?: UserMeta[];
  owner?: UserMeta;

  isNew?: boolean;
  contractCode?: string;
  updatedOn?: number;
  fileName?: string;
  firstName?: string;
  id: number;
  lastName?: string;
  processStatus?: number;
  status?: number;
  teamId?: number;
  fileSize?: number;
  pageCount?: number;
  sharedWith?: UserMeta[];
}

export interface UserMeta {
  id: number;
  userName: string;
  logoUrl: string;
}

export interface DraftPayload {
  currentPage?: number;
  contractTypeId?: number;
  folder?: FolderType;
  state?: number;
  dataReset?: boolean;
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

export interface UploadedSignedContractType {
  id: number;
  contractName: string;
  folderId: number;
  state: number;
  companyId: number;
  filePathBeforeSign: string;
  filePathAfterSign: string;
  isActive: number;
  createdBy: number;
  createdOn: number;
  userMetas: UserList[];
  pdfContent: string;
  owner: Omit<User, "authority">;
}
