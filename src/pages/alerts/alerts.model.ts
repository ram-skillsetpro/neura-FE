export interface AlertsType {
  id: number;
  alertTitle: string; // alert title
  alertText: string; // alert text
  alertStartDate: number; // alert start date
  alertEndtDate: number; // alert end date
  alertCommMedium: number; // alert communication medium
  alertCommMediumName: string;
  alertFrequency: number; // alert frequency
  alertFrequencyName: string;
  alertOnFileId: number;
  alertPriorityLevel: number;
  alertPriorityLevelName: string;
  createdOn: number;
  ctdid?: number;
  ctdfnm?: string;
  ctdlnm?: string;
  alertReadDate?: number;
  ack?: number; // acknowledged
  ackon: number; // acknowledged on
  targetUserId?: Array<TargetUserType>; // target user
}

export interface TargetUserType {
  userId: number;
  userName: string;
  userLastName: string | null;
  ack: number;
  ackon: number;
}

export interface CreateAlertType {
  alertTitle: string;
  alertText: string;
  alertStartDate: string;
  alertEndDate: string;
  alertCommMedium: number;
  alertFrequency: number;
  alertPriorityLevel: 0 | 1 | 2 | 3;
  teamUserIds: Array<number>;
}

export interface UnreadAlertCountType {
  status: number;
  message: string;
  response: number;
}

export interface AlertsResponseType<T> {
  result: Array<T>;
  perpg: number;
  pgn: number;
  totct: number;
  unrdct?: number;
}
