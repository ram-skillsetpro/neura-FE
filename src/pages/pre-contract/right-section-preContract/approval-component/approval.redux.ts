import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";
import { setTab } from "../../pre-contract.redux";
import { ApprovalApiResponse, UserWorkStatus } from "./approval.modal";

export interface contractApprovalStateType {
  ApprovalList: Array<UserWorkStatus>;
  ApprovalAllData: any;
  isLoading: boolean;
  errorMessage: string;
}

const initialState: contractApprovalStateType = {
  ApprovalList: [],
  isLoading: false,
  errorMessage: "",
  ApprovalAllData: {},
};

export const fetchApprovalsData = (contractId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<ApprovalApiResponse>(
        `/v1/presigned/collaborator/contract-state-user-status?contractId=${contractId}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const { status } = apiResponse.data || {};
        // dispatch(autoSearchTemplateSuccesss(apiResponse.data));
        dispatch(
          approvalDataFetched(
            apiResponse.data?.response !== "" ? apiResponse.data?.userWorkStatus : [],
          ),
        );
        dispatch(setAllApprovalData(apiResponse?.data))
        dispatch(setTab(status));
      } else {
        dispatch(approvalError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(approvalError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchUserStatusUploadAndSign = (contractId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<ApprovalApiResponse>(
        `/v1/upload-sign/collaborator/contract-state-user-status?contractId=${contractId}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(
          approvalDataFetched(
            apiResponse.data?.response !== "" ? apiResponse.data?.userWorkStatus : [],
          ),
        );
      } else {
        dispatch(approvalError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(approvalError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const markWorkComplete = (contractId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<any>(
        `/v1/presigned/collaborator/mark-work-complete?contractId=${contractId}`,
      );
      if (apiResponse?.isSuccess) {
        CommonService.toast({
          type: "success",
          message:
            apiResponse.message || apiResponse.message[0] || "Work status changed successfully.",
        });
        // Dispatch additional actions or handle success accordingly
        dispatch(fetchApprovalsData(contractId));
      } else {
        dispatch(approvalError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(approvalError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

const contractApprovalSlice = createSlice({
  name: "contractApprovals",
  initialState,
  reducers: {
    approvalError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    approvalDataFetched: (state, action) => {
      state.ApprovalList = action.payload;
    },
     setAllApprovalData: (state, action) => {
      state.ApprovalAllData = action.payload;
    },
    clearApprovalListData: (state) => {
      state.ApprovalList = [];
    },
  },
});

export const { approvalError, setLoading, approvalDataFetched, clearApprovalListData, setAllApprovalData } =
  contractApprovalSlice.actions;
export const contractApprovalReducer = contractApprovalSlice.reducer;
