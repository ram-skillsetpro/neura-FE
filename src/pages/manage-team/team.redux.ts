import { createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";
import {
  ApiResponse,
  CreateTeamPayloadType,
  DeleteTeamPayloadType,
  EditTeamPayloadType,
  FetchTeamListPayloadType,
  TeamListApiResponseType,
  TeamListType,
  TeamUserListPayloadType,
  UpdateTeamUserPayloadType,
} from "./team.model";

export interface TeamStateType {
  errorMessage: string;
  teamList: Array<TeamListType>;
  teamListPageCount: number;
  createTeamResponseStatus: number;
  teamUserList: Array<any>;
  totalTeamCount: number;
  isLoading: boolean;
  allActiveUserList: Array<any>;
  teamUserResponse: number;
  editTeamResponseStatus: number;
  deleteTeamResponse: number;
  sharedTeamList: Array<TeamListType>;
  totalSharedTeamCount: number;
  sharedTeamListPageCount: number;
  deletedTeamList: Array<TeamListType>;
  deletedTeamCount: number;
  deletedTeamListPageCount: number;
  isTeamsLoading: boolean;
  isSharedTeamsLoading: boolean;
}

const initialState: TeamStateType = {
  errorMessage: "",
  teamList: [],
  teamListPageCount: 1,
  createTeamResponseStatus: 0,
  teamUserList: [],
  totalTeamCount: 0,
  isLoading: false,
  allActiveUserList: [],
  teamUserResponse: 0,
  editTeamResponseStatus: 0,
  deleteTeamResponse: 0,
  sharedTeamList: [],
  totalSharedTeamCount: 0,
  sharedTeamListPageCount: 0,
  deletedTeamList: [],
  deletedTeamCount: 0,
  deletedTeamListPageCount: 0,
  isTeamsLoading: false,
  isSharedTeamsLoading: false,
};

export const fetchTeamList = (payload?: FetchTeamListPayloadType) => {
  const { page, mergeResponse = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setTeamLoading(true));
      // const teamListPageCount = _getState().team.teamListPageCount || 1;
      // if (mergeResponse && teamListPageCount > 1) {
      //   let teamList: any = [];
      //   for (let i: number = 1; i <= teamListPageCount; i++) {
      //     const apiResponse = await api.get<TeamListApiResponseType>(`/v1/team/list-team?pgn=${i}`);
      //     if (apiResponse.isSuccess && apiResponse.status === 200) {
      //       teamList = [...teamList, ...(apiResponse.data?.companyTeamList || [])];
      //       dispatch(totalTeamCount(apiResponse.data?.totRows));
      //     }
      //   }
      //   dispatch(setTeamList(teamList));
      //   dispatch(setLoading(false));
      // } else {

      // }
      const apiResponse = await api.get<TeamListApiResponseType>(
        `/v1/team/list-team?pgn=${page || 1}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        // const prevTeams = teamListPageCount > 1 ? _getState().team.teamList : [];
        // const teamsData = [...prevTeams, ...(apiResponse.data?.companyTeamList || [])];
        dispatch(setTeamList(apiResponse.data?.companyTeamList));

        // dispatch(setTeamList(apiResponse.data?.companyTeamList || []));
        dispatch(totalTeamCount(apiResponse.data?.totRows));
        dispatch(setTeamLoading(false));
      } else {
        dispatch(setError(apiResponse.message || ""));
        dispatch(setTeamLoading(false));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
      dispatch(setTeamLoading(false));
    }
  };
};

export const fetchSharedTeamList = (payload?: FetchTeamListPayloadType) => {
  const { page, mergeResponse = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setSharedTeamLoading(true));
      // const teamListPageCount = _getState().team.sharedTeamListPageCount || 1;
      // if (mergeResponse && teamListPageCount > 1) {
      //   let teamList: any = [];
      //   for (let i: number = 1; i <= teamListPageCount; i++) {
      //     const apiResponse = await api.get<TeamListApiResponseType>(`/v1/team/list-team?pgn=${i}`);
      //     if (apiResponse.isSuccess && apiResponse.status === 200) {
      //       teamList = [...teamList, ...(apiResponse.data?.companyTeamList || [])];
      //       dispatch(totalSharedTeamCount(apiResponse.data?.totRows));
      //     }
      //   }
      //   dispatch(setSharedTeamList(teamList));
      //   dispatch(setSharedTeamLoading(false));
      // } else {
      const apiResponse = await api.get<TeamListApiResponseType>(
        `/v1/team/list-shared-team?pgn=${page || 1}`,
      );

      // }
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        // const prevTeams = teamListPageCount > 1 ? _getState().team.sharedTeamList : [];
        // const sharedTeamsData = [...prevTeams, ...(apiResponse.data?.companyTeamList || [])];
        dispatch(setSharedTeamList(apiResponse.data?.companyTeamList));
        dispatch(totalSharedTeamCount(apiResponse.data?.totRows));
        dispatch(setSharedTeamLoading(false));
      } else {
        dispatch(setError(apiResponse.message || ""));
        dispatch(setSharedTeamLoading(false));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
      dispatch(setSharedTeamLoading(false));
    }
  };
};

export const createTeam = (payload: CreateTeamPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { teamName, teamDescription } = payload;
      const body = {
        teamName,
        teamDescription,
      };
      const apiResponse = await api.post<ApiResponse>(`/v1/team/create-team`, body);

      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setCreateTeamResponse(apiResponse.status));
        dispatch(fetchTeamList({ page: _getState().team.teamListPageCount }));
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const editTeam = (payload: EditTeamPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { teamName, teamDescription, teamId } = payload;
      const body = {
        teamName,
        teamDescription,
        teamId,
      };
      const apiResponse = await api.post<ApiResponse>(`/v1/team/edit-team`, body);

      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setEditTeamResponse(apiResponse.status));
        dispatch(fetchTeamList({ mergeResponse: true }));
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchTeamUserList = (payload: TeamUserListPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { teamId } = payload;
      const apiResponse = await api.get<TeamListApiResponseType>(
        `/v1/team/user-list?teamId=${teamId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setTeamUserList(apiResponse.data || []));
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchAllUserList = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      const apiResponse = await api.get<TeamListApiResponseType>(`/v1/team/list-users/1`);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setAllUserList(apiResponse.data || []));
        dispatch(setLoading(false));
      } else {
        dispatch(setError(apiResponse.message || ""));
        dispatch(setLoading(false));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
      dispatch(setLoading(false));
    }
  };
};

export const updateTeamUser = (payload: UpdateTeamUserPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<TeamListApiResponseType>(`/v1/team/add-user`, payload);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(updateTeamUserResponse(apiResponse.status));
        dispatch(fetchTeamList({ mergeResponse: true }));
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const deleteTeam = (payload: DeleteTeamPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setError(""));
      const { teamId } = payload;
      const data = { status: 0, teamId };
      const apiResponse = await api.post<TeamListApiResponseType>(`/v1/team/action-on-team`, data);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(deleteTeamResponse(apiResponse.status));
        dispatch(fetchTeamList({ mergeResponse: true }));
      } else {
        if (apiResponse.status === 1000) {
          console.log(apiResponse);
          dispatch(
            setError(
              typeof apiResponse.message === "string"
                ? apiResponse.message
                : apiResponse.message[0]
                  ? apiResponse.message[0]
                  : "Something went wrong!",
            ),
          );
        }
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchDeletedTeamList = (payload?: any) => {
  const { page, mergeResponse = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      const teamListPageCount = _getState().team.deletedTeamListPageCount || 1;
      if (mergeResponse && teamListPageCount > 1) {
        let teamList: any = [];
        for (let i: number = 1; i <= teamListPageCount; i++) {
          const apiResponse = await api.get<TeamListApiResponseType>(`/v1/trash/my-teams?pgn=${i}`);
          if (apiResponse.isSuccess && apiResponse.status === 200) {
            teamList = [...teamList, ...(apiResponse.data?.companyTeamList || [])];
            dispatch(totalDeletedTeamCount(apiResponse.data?.totRows));
          }
        }
        dispatch(setDeletedTeamList(teamList));
        dispatch(setLoading(false));
      } else {
        const apiResponse = await api.get<TeamListApiResponseType>(
          `/v1/trash/my-teams?pgn=${page || 1}`,
        );
        if (apiResponse.isSuccess && apiResponse.status === 200) {
          const prevTeams = teamListPageCount > 1 ? _getState().team.deletedTeamList : [];
          const teamsData = [...prevTeams, ...(apiResponse.data?.companyTeamList || [])];
          dispatch(setDeletedTeamList(teamsData));

          // dispatch(setTeamList(apiResponse.data?.companyTeamList || []));
          dispatch(totalDeletedTeamCount(apiResponse.data?.totRows));
          dispatch(setLoading(false));
        } else {
          dispatch(setError(apiResponse.message || ""));
          dispatch(setLoading(false));
        }
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
      dispatch(setLoading(false));
    }
  };
};

export const restoreTeamUser = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { teamId } = payload;
      const apiResponse = await api.get<TeamListApiResponseType>(
        `/v1/trash/restore-team?teamId=${teamId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(
          fetchDeletedTeamList({
            page: _getState().team.deletedTeamListPageCount,
            mergeResponse: true,
          }),
        );
         CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setTeamList: (state, action) => {
      state.teamList = action.payload;
      state.errorMessage = "";
    },
    setSharedTeamList: (state, action) => {
      state.sharedTeamList = action.payload;
      state.errorMessage = "";
    },
    setTeamListPageCount: (state, action) => {
      state.teamListPageCount = action.payload;
      state.errorMessage = "";
    },
    setSharedTeamListPageCount: (state, action) => {
      state.sharedTeamListPageCount = action.payload;
      state.errorMessage = "";
    },
    setDeletedTeamListPageCount: (state, action) => {
      state.deletedTeamListPageCount = action.payload;
      state.errorMessage = "";
    },
    setCreateTeamResponse: (state, action) => {
      state.createTeamResponseStatus = action.payload;
      state.errorMessage = "";
    },
    setEditTeamResponse: (state, action) => {
      state.editTeamResponseStatus = action.payload;
      state.errorMessage = "";
    },
    clearEditTeamResponse: (state) => {
      state.editTeamResponseStatus = 0;
      state.errorMessage = "";
    },
    clearCreateTeamResponse: (state) => {
      state.createTeamResponseStatus = 0;
      state.errorMessage = "";
    },
    clearTeamList: (state) => {
      state.teamList = [];
      state.errorMessage = "";
    },
    setTeamUserList: (state, action) => {
      state.teamUserList = action.payload;
      state.errorMessage = "";
    },
    clearTeamUserList: (state) => {
      state.teamUserList = [];
      state.errorMessage = "";
    },
    deleteTeamResponse: (state, action) => {
      state.deleteTeamResponse = action.payload;
      state.errorMessage = "";
    },
    clearDeleteTeamResponse: (state) => {
      state.deleteTeamResponse = 0;
      state.errorMessage = "";
    },
    setAllUserList: (state, action) => {
      state.allActiveUserList = action.payload;
      state.errorMessage = "";
    },
    setError: (state, action) => {
      state.errorMessage = action.payload;
    },
    totalTeamCount: (state, action) => {
      state.totalTeamCount = action.payload;
    },
    totalSharedTeamCount: (state, action) => {
      state.totalSharedTeamCount = action.payload;
    },
    updateTeamUserResponse: (state, action) => {
      state.teamUserResponse = action.payload;
    },
    clearUpdateTeamUserResponse: (state) => {
      state.teamUserResponse = 0;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTeamLoading: (state, action) => {
      state.isTeamsLoading = action.payload;
    },
    setSharedTeamLoading: (state, action) => {
      state.isSharedTeamsLoading = action.payload;
    },
    clearSharedTeamList: (state) => {
      state.sharedTeamList = [];
    },
    setDeletedTeamList: (state, action) => {
      state.deletedTeamList = action.payload;
    },
    totalDeletedTeamCount: (state, action) => {
      state.deletedTeamCount = action.payload;
    },
    clearDeletedTeamList: (state) => {
      state.deletedTeamList = [];
    },
  },
});

export const {
  setTeamList,
  setError,
  setTeamListPageCount,
  setCreateTeamResponse,
  clearTeamList,
  setTeamUserList,
  clearTeamUserList,
  totalTeamCount,
  setLoading,
  clearCreateTeamResponse,
  setAllUserList,
  updateTeamUserResponse,
  clearUpdateTeamUserResponse,
  setEditTeamResponse,
  clearEditTeamResponse,
  deleteTeamResponse,
  clearDeleteTeamResponse,
  setSharedTeamList,
  totalSharedTeamCount,
  clearSharedTeamList,
  setSharedTeamListPageCount,
  setDeletedTeamList,
  totalDeletedTeamCount,
  setDeletedTeamListPageCount,
  clearDeletedTeamList,
  setTeamLoading,
  setSharedTeamLoading,
} = teamSlice.actions;
export const teamReducer = teamSlice.reducer;
