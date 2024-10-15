import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { ApiResponse } from "pages/auth/auth.model";
import {
  ActivateMemberPayload,
  CountryCodeType,
  CreateNewMemberPayload,
  MembersType,
  PaginatedReponse,
} from "pages/manage-members/manage-members.model";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";
import { setCountryCodeList } from "../auth/auth.redux";

export interface ManageMembersState {
  teamMembers: Array<MembersType>;
  members: Array<MembersType>;
  inActiveMembers: Array<MembersType>;
  activeMembers: Array<MembersType>;
  isLoading: boolean;
  errorMessage: string;
  membersData: PaginatedReponse<MembersType>;
}

const initialState: ManageMembersState = {
  teamMembers: [],
  members: [],
  inActiveMembers: [],
  activeMembers: [],
  isLoading: false,
  errorMessage: "",
  membersData: {
    perpg: 10,
    totct: 0,
    pgn: 1,
    result: [],
  },
};

export const getTeamMembers = (teamId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<MembersType>>(
        `/v1/team/user-list${teamId ? `?teamId=${teamId}` : ""}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(teamMembersFetchedSuccess(apiResponse.data));
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const getAllMembers = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<MembersType>>(`/v1/team/list-users/all`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(membersFetchedSuccess(apiResponse.data));
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const getAllMembersPerpage = (currentPage: number = 1) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<PaginatedReponse<MembersType>>(
        `/v1/team/list-users-paging?verifiedStatus=all&pgn=${currentPage}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        const filesData = [
          ..._getState().manageMembers.members,
          ...(apiResponse.data?.result || []),
        ];
        dispatch(membersFetchedPerPage(apiResponse.data));
        dispatch(membersFetchedSuccess(filesData));
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const getCountryCodeList = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<CountryCodeType>>(`/v1/country-list`, {
        isAuth: false,
      });
      if (apiResponse.data) {
        dispatch(setCountryCodeList(apiResponse.data));
      }
      return apiResponse.data;
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getActiveMembers = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<MembersType>>(`/v1/team/list-users/1`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(activeMembersFetchedSuccess(apiResponse.data));
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const getInactiveMembers = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<MembersType>>(`/v1/team/list-users/0`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(inActiveMembersFetchedSuccess(apiResponse.data));
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const createNewMember = (payload: CreateNewMemberPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/team/create-user`, payload);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Created Successfully",
        });
        dispatch(membersFetchedSuccess([]));
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const activateMember = (payload: ActivateMemberPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/team/userprofile-action`, payload);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] ?? "Updated Successfully",
        });
      } else {
        dispatch(membersError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(membersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

const manageMembers = createSlice({
  name: "manageMembers",
  initialState,
  reducers: {
    membersFetchedSuccess: (state, action: PayloadAction<Array<MembersType>>) => {
      state.members = action.payload;
      state.errorMessage = "";
    },
    membersFetchedPerPage: (state, action: PayloadAction<PaginatedReponse<MembersType>>) => {
      state.membersData = action.payload;
      state.errorMessage = "";
    },
    teamMembersFetchedSuccess: (state, action: PayloadAction<Array<MembersType>>) => {
      state.teamMembers = action.payload;
      state.errorMessage = "";
    },
    inActiveMembersFetchedSuccess: (state, action: PayloadAction<Array<MembersType>>) => {
      state.inActiveMembers = action.payload;
      state.errorMessage = "";
    },
    activeMembersFetchedSuccess: (state, action: PayloadAction<Array<MembersType>>) => {
      state.activeMembers = action.payload;
      state.errorMessage = "";
    },
    membersError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearMembersData: (state) => {
      state.members = [];
      state.membersData = initialState.membersData;
    },
  },
});

export const {
  membersFetchedPerPage,
  membersFetchedSuccess,
  teamMembersFetchedSuccess,
  activeMembersFetchedSuccess,
  inActiveMembersFetchedSuccess,
  membersError,
  setLoading,
  clearMembersData,
} = manageMembers.actions;
export const manageMembersReducer = manageMembers.reducer;
