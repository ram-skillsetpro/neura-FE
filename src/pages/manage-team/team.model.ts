export interface ApiResponse {
  message: string;
  response: string;
  status: number;
}

export interface FetchTeamListPayloadType {
  page?: number;
  mergeResponse?: boolean;
}

export interface TeamListType {
  companyId: number;
  createdBy: number;
  createdOn: number;
  firstName: string;
  id: number;
  status: number;
  teamName: string;
  isAdmin: number;
}

export interface TeamListApiResponseType {
  companyTeamList: Array<TeamListType>;
  totRows: number;
}

export interface CreateTeamPayloadType {
  teamName: string;
  teamDescription?: string;
}

export interface EditTeamPayloadType {
  teamId: number;
  teamName: string;
  teamDescription?: string;
}

export interface CreateTeamType {
  teamName: string;
  teamDescription: string;
}

export interface TeamUserListPayloadType {
  teamId: number;
}

export interface TeamProfileType {
  isTeamAdmin: number;
  profileId: number;
}

export interface UpdateTeamUserPayloadType {
  teamId: number;
  teamProfiles: Array<TeamProfileType>;
}

export interface DeleteTeamPayloadType {
  teamId: number;
}
