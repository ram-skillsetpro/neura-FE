import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";

export interface DocusignStateType {
  preSignedUrl: string;
  integKey: string;
  errorMessage: string;
  isLoading: boolean;
  isSignLater: boolean;
}

const initialState: DocusignStateType = {
  preSignedUrl: "",
  integKey: "",
  errorMessage: "",
  isLoading: false,
  isSignLater: false,
};

let isToastDisplayed = false;

export const requestSignDocUrl = (contractId: number, uploadAndSign: boolean = false) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(docusignLoadingState(true));
      const queryParams = new URLSearchParams();
      queryParams.set("contractId", contractId.toString());
      queryParams.set("uploadAndSign", uploadAndSign.toString());

      const apiResponse = await api.get(`/v1/request-sign-document-url`, {
        params: queryParams,
      });
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(docusignKeys(apiResponse.data));
        // if (!isToastDisplayed) {
        //   isToastDisplayed = true;
        //   CommonService.toast({
        //     type: "success",
        //     message: apiResponse.message[0] ?? "Fetched Successfully",
        //   });
        // }
        dispatch(setSignLater(false));
      }
    } catch (error) {
      dispatch(docusignError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(docusignLoadingState(false));
    }
  };
};

export const signLater = (contractId: number, isUploadSign: boolean = false) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(docusignLoadingState(true));
      const queryParams = new URLSearchParams();
      queryParams.set("contractId", contractId.toString());
      queryParams.set("isUploadSign", isUploadSign.toString());
      const apiResponse = await api.get(`/v1/document/sign-later`, { params: queryParams });
      if (apiResponse?.isSuccess && apiResponse?.data) {
        if (!isToastDisplayed) {
          isToastDisplayed = true;
          CommonService.toast({
            type: "success",
            message: apiResponse.message[0] ?? "Sign later Successfully",
          });
        }
        // dispatch(fetchApprovalsData(contractId));
        dispatch(clearDocusign());
        dispatch(setSignLater(true));
      }
    } catch (error) {
      dispatch(docusignError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(docusignLoadingState(false));
    }
  };
};

const docusignSlice = createSlice({
  name: "docusign",
  initialState,
  reducers: {
    docusignKeys: (state, action) => {
      state.integKey = action.payload.integKey;
      state.preSignedUrl = action.payload.url;
    },
    clearDocusign: (state) => {
      state.integKey = "";
      state.preSignedUrl = "";
    },
    docusignError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    docusignLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSignLater: (state, action) => {
      state.isSignLater = action.payload;
    },
  },
});

export const { docusignKeys, docusignError, clearDocusign, docusignLoadingState, setSignLater } =
  docusignSlice.actions;
export const docusignReducer = docusignSlice.reducer;
