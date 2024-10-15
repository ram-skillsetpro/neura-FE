export interface AlertsType {
  id: number;
  userName: string;
  emailId: string;
  phone: string;
  companyName?: string;
  companyId?: number;
  status?: number;
  roleId?: number;
  profileId?: number;
  mblVerificationStatus?: boolean;
  emailVerificationStatus?: boolean;
  profileAdminStatus?: number;
  isActive?: number;
}

export interface CreateNewAlertPayload {
  alertTitle: string;
  alertCommMedium: string;
  alertFrequency: string;
  alertStartDate: string;
  alertPriority: string;
  alertEndDate: string;
  alertTargetUsers: string;
  alertText: string;
}
export interface ActivateAlertPayload {
  profileId: number;
  status: number;
}
