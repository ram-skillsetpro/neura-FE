export interface ApprovalApiResponse {
  message: string;
  response: ApprovalResponseData | string;
  userWorkStatus: UserWorkStatus[];
  status: number;
}

export interface ApprovalResponseData {
  userWorkStatus: UserWorkStatus[];
  status: number;
}

export interface UserWorkStatus {
  id: number;
  contractId: number;
  userId: number;
  roleId: number;
  isWorkDone: number;
  isActive: number;
  updatedOn: number;
  userName: string;
}
