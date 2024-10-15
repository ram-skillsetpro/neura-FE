type RiskStatus = "High" | "Medium" | "Low";
export interface CountType {
  count: number;
}
export interface RiskStatusType extends CountType {
  impact: RiskStatus;
}

export interface DepartmentTeamType extends CountType {
  teamName: string;
}

export interface RiskComplianceType extends CountType {
  riskType: string;
}
export interface RiskAuditType extends CountType {
  escalationType: number;
}

export interface RiskDeadlineType {
  mappingId: number;
  riskId: number;
  riskTypeId: number;
  riskType: string;
  deadlineDate: number;
  contractId: number;
  contractName: string;
  riskName: string;
}
export interface EscalationFiltersType {
  ownerName: string[];
  ownerDept: string[];
  contractType: string[];
  riskType: string[];
  riskCategory: string[];
  obligationType: string[];
  secondParty: string[];
  department: string[];
}

export interface Obligations {
  category: string;
  deadlineDate: string;
  mappingId: number;
  name: string;
  riskId: number;
  spoc: string;
  status: string;
  team: string;
  type: string;
}

export interface PaginatedContractInfo {
  totct: number;
  pgn: number;
  perpg: number;
  result: EscalationInfoType[];
}

export interface EscalationInfoType {
  contractName: string;
  contractTeamId: string;
  contractFolderId: string;
  riskType: string;
  ownerName: string;
  ownerDept: string;
  riskStatus: string;
  riskLikelihood: string;
  riskCategory: string;
  daysElapsed: string;
  secondParty: string;
  obligationCount: number;
  riskCategories: { [key: string]: number };
  obligationTypes: { [key: string]: number };
  requireAttention: { [key: string]: number };
  obligations: [Obligations];
  department: string;
  contractId: number;
  contractDate: string;
  // isObligationClicked: boolean;
}
export interface ObligationDetailsType {
  priority: string;
  impact: string;
  likelihood: string;
  category: string;
  type: string;
  department: string;
  contractType: string;
  trackingMechanism: string;
}

export interface ObligationPeopleType {
  createdBy: string;
  ownerDesignation: string;
  reporter: string;
  watcher: number;
}

export interface ObligationDatesType {
  createdOn: string;
  updatedOn: string;
}

export interface ObligationType {
  name: string;
  identifier: string;
  type: string;
  ownerName: string;
  ownerDept: string;
  isActive: string;
  likelihood: string;
  category: string;
  deadlineDate: string;
  trackingFrequency: string;
  details: ObligationDetailsType;
  description: string;
  people: ObligationPeopleType;
  dates: ObligationDatesType;
  tags: string[];
  mappingId: number;
  riskId: number;
  attachments: GRCAttachmentsAudits[];
  audits: GRCAttachmentsAudits[];
}

export interface GRCAttachmentsAudits {
  attachment: string;
  createdBy: string;
  createdOn: string;
  status: string;
  trackingId: number;
  mimeType: string;
  isEvidence: number;
  action: string;
  actedBy: string;
}
export interface ContractObligationsType {
  contractName: string;
  contractId: string;
  contractFolderId: string;
  contractTeamId: string;
  obligations: ObligationType[];
}

export interface IEscalations {
  paginatedContracts: PaginatedContractInfo;
  escalatedFilters: EscalationFiltersType;
}

export enum OBLIGATION_STATUS {
  INACTIVE = "0",
  ACTIVE = "1",
  RESOLVED = "2",
  INCOMPLETE = "3",
}

export interface ComplianceDashboard {
  category: string | undefined,
  companyId: string | null,
  contractId: string | undefined,
  deadlineDate: number | undefined,
  desc: string | undefined,
  escalateAfterCount: number,
  impact: string | undefined,
  isActive: number | undefined,
  likelihood: string | undefined,
  mappingId: number | undefined,
  name: string | undefined,
  ownerId: string | undefined,
  prompt: string,
  riskId: number,
  riskTypeId: number,
  tags: string,
  trackingFrequency: string | undefined,
  trackingMechanism: number,
  teamId: string | undefined;
  notes: string;
  control: string;
}

export interface TrackingFrequencies {
  Daily: number,
  Monthly: number,
  Once: number,
  Weekly: number,
  Yearly: number,
  Quarterly: number
}

export interface Control {
  id: number,
  name: string,
  desc: string
}

export interface ControlMap {
  [key: string]: Control
}

export interface TeamOwners {
  [teamName: string]: {
    [id: string]: string;
  };
}

export interface ValueMapResponseData {
  trackingFrequencies: TrackingFrequencies;
  controlMap: ControlMap;
  teamOwners: TeamOwners;
}