import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { setUserProfileLogo } from "pages/auth/auth.redux";
import { ToastContent } from "react-toastify";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { updateLocalStorageUserProfile } from "src/core/utils";
import {
  AddEditRolesResponse,
  ApiResponseResetPassword,
  SecretCode,
  Status,
  actvityDropdownList,
  actvityListPayLoad,
  actvityListResp,
  actvityListRespRoot,
  adminResp,
} from "src/pages/admin-setting/setting.modal";
import { AppDispatch } from "src/redux/create-store";
import { ApiResponse, GeneratedQRCodeType } from "../auth/auth.model";

export interface adminSettingState {
  errorMessage: string;
  adminSettingList: adminResp;
  isLoading: boolean;
  successMsgOfUpdateSetting: boolean;
  userLogo: string;
  actvityDropdownLists: Array<actvityDropdownList>;
  actvityList: Array<actvityListResp>;
  acivityListDataNotAvailable: Array<actvityListRespRoot>;
  getAddEditRolesList: Array<AddEditRolesResponse>;
  mfa: GeneratedQRCodeType;
  isQRCodeLoading: boolean;
}

const initialState: adminSettingState = {
  errorMessage: "",
  adminSettingList: {
    userProfileResponse: {},
    companyTeamDetails: [],
    passwordOldDays: "",
    profileSettings: {},
    assignedAuthority: [],
  },
  actvityDropdownLists: [],
  actvityList: [],
  isLoading: false,
  acivityListDataNotAvailable: [],
  successMsgOfUpdateSetting: true,
  userLogo: "",
  getAddEditRolesList: [],
  mfa: {
    qrCode: "",
    mfaCode: "",
  },
  isQRCodeLoading: false,
};

export const adminProfileList = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get(`/v1/settings/profile-settings`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        // console.log("apiResponse", apiResponse, apiResponse.data);
        dispatch(adminSettingContractSuccesss(apiResponse.data));
      } else {
        dispatch(adminSettingContractError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateSelfSetting = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post("/v1/settings/update-self-setting", payload);
      // console.log("called...", apiResponse);

      if (apiResponse.isSuccess) {
        // console.log("called");
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] || "Updated Successfully",
        });
        dispatch(adminSettingContractSuccess(apiResponse.isSuccess || true));
      } else {
        dispatch(adminSettingContractError(apiResponse.message[0]));
        dispatch(adminSettingContractSuccess(apiResponse.isSuccess));
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
      dispatch(adminSettingContractSuccess(false));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchPreSignedUrl = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post("/v1/settings/upload-user-logo?extension=jpeg", {});
      if (apiResponse.status === 200) {
        return apiResponse.data as any;
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const uploadUserProfile = (payload: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { url, file, userLogo } = payload;
      fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })
        .then((response) => {
          if (response.ok) {
            updateLocalStorageUserProfile(userLogo);
            dispatch(setUserProfileLogo(userLogo));
            CommonService.toast({
              type: "success",
              message: "Profile picture uploaded successfully.",
            });
          } else {
            CommonService.toast({
              type: "success",
              message: "File upload failed.",
            });
            dispatch(setErrorMessage("File upload failed."));
          }
        })
        .catch(() => {
          CommonService.toast({
            type: "success",
            message: "Error uploading file. Check the browser console for details.",
          });
          dispatch(setErrorMessage("Error uploading file. Check the browser console for details."));
        });
    } catch (error: any) {
      dispatch(setErrorMessage((error as Error).message));
    }
  };
};

export const resetPassword = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Array<ApiResponseResetPassword>>(
      `/v1/profile/reset-password`,
    );
    console.log("apiResponse.data",apiResponse.data)
    if (apiResponse?.isSuccess && apiResponse?.data && apiResponse.status === 200) {
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.data || "Something went wrong!") as ToastContent,
      });
    }
  };
};

export const userProfileList = (profileId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get(`/v1/settings/profile-details?profileId=${profileId}`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(adminSettingContractSuccesss(apiResponse.data));
      } else {
        dispatch(adminSettingContractError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const activityReportActionDropdown = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get(`/v1/report/action-list`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        // console.log("apiResponse?.data", apiResponse?.data);
        dispatch(activityReportActionDropdownSuccess(apiResponse.data));
      } else {
        dispatch(activityReportActionDropdownError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(activityReportActionDropdownError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const activityReportList = (payload: actvityListPayLoad) => {
  const {
    profileId,
    pgn = 1,
    selectedOption = [],
    mergeResponse = false,
    startDate,
    endDate,
    userId,
  } = payload;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      // const apiEndpoint = `/v1/report/activity-report?profileId=${profileId}&pgn=${pgn}`;
      let selectedOptionEndPoint = "";
      let dateSelected = "";
      if (selectedOption && selectedOption.length > 0) {
        selectedOptionEndPoint += `&action=${selectedOption}`;
      }
      if (startDate && endDate) {
        dateSelected += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const userID =
        userId && userId?.length > 0 ? `&profileId=${userId}` : `&profileId=${profileId}`;
      const apiResponse = await api.get(
        `/v1/report/activity-report?pgn=${
          pgn || 1
        }${selectedOptionEndPoint}${dateSelected}${userID}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        const prevTeams =
          selectedOption.length < 1 ? _getState().adminSettingContract.actvityList : [];
        let activityList: any = [];
        if (!prevTeams.length && selectedOption.length > 0 && !mergeResponse) {
          activityList = [
            ..._getState().adminSettingContract.actvityList,
            ...((apiResponse?.data as any[]) || []),
          ];
        } else {
          activityList = [...prevTeams, ...((apiResponse?.data as any[]) || [])];
        }
        dispatch(setActivityListSuccess(activityList));

        // dispatch(setActivityListSuccess(apiResponse.data?.companyTeamList || []));
        // dispatch(totalTeamCount(apiResponse.data?.totRows));
        // acivityListDataNotAvailable
        dispatch(setLoading(false));
        if (apiResponse) {
          dispatch(setBlankActivityData(apiResponse.data));
        }
      } else {
        dispatch(setErrorMessage(apiResponse.message || ""));
        dispatch(setLoading(false));
      }
      // }
    } catch (error) {
      dispatch(setErrorMessage((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const activityReportListWithAction = (payload: actvityListPayLoad) => {
  const { profileId, pgn, selectedOption } = payload;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      let apiEndpoint = `/v1/report/activity-report?profileId=${profileId}&pgn=${pgn}`;
      if (selectedOption) {
        apiEndpoint += `&action=${selectedOption}`;
      }
      const apiResponse = await api.get(apiEndpoint);

      if (apiResponse?.isSuccess && apiResponse?.data) {
        // console.log("apiResponse?.data", apiResponse?.data);
        dispatch(setActivityListSuccess(apiResponse.data));
      } else {
        dispatch(setErrorMessage(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setErrorMessage((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const addEditRoles = (profileId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get(`/v1/cms/get-module-authority-group-name/6`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(setAddEditRoles(apiResponse.data));
      } else {
        dispatch(adminSettingContractError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateAuthorityRoles = (payload: any, profileId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    console.log("payload", payload);
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post("/v1/settings/set-authority", payload);
      // console.log("called...", apiResponse);

      if (apiResponse.isSuccess) {
        // console.log("called");
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] || "Updated Successfully",
        });
        await dispatch(userProfileList(profileId));
        dispatch(adminSettingContractSuccess(apiResponse.isSuccess || true));
      } else {
        dispatch(adminSettingContractError(apiResponse.message[0]));
        dispatch(adminSettingContractSuccess(apiResponse.isSuccess));
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
      dispatch(adminSettingContractSuccess(false));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const generateMFACodes = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<GeneratedQRCodeType>(`/v1/mfa/generate/qr-code`, {});
      if (apiResponse?.isSuccess && apiResponse.data) {
        return apiResponse;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};
export const regenerateMFACodes = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<GeneratedQRCodeType>(`/v1/mfa/re-generate/qr-code`, {});
      if (apiResponse?.isSuccess && apiResponse.data) {
        return apiResponse;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
    } catch (error) {
      dispatch(adminSettingContractError((error as Error).message));
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};
export const verifyTOTP = (payload: { totp: string }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/mfa/verify/otp/${payload.totp}`, {});
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return true;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
        return false;
      }
    } catch (error) {
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};
export const generateQRForUser = (payload: { id: string }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/mfa/generate/qr-code/team-user/${payload.id}`,
        {},
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return apiResponse;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
    } catch (error) {
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};

export const updateMFASetting = (payload: { value: Status }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<{ response: SecretCode }>(
        `/v1/settings/update-mfa-setting?value=${payload.value}`,
      );
      if (apiResponse?.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return apiResponse;
      }
    } catch (error) {
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};
export const resetMFASetting = (payload: { profileId: number }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      const apiResponse = await api.get<ApiResponse>(
        `https://alpha-api.simpleo.ai/v1/mfa/reset-mfa?teamUserId=${payload.profileId}`,
      );
      if (apiResponse?.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return apiResponse;
      }
    } catch (error) {
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };
};

const adminSettingSlice = createSlice({
  name: "adminSettingContract",
  initialState,
  reducers: {
    adminSettingContractSuccesss: (state, action) => {
      state.adminSettingList = action.payload;
    },
    adminSettingContractError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    adminSettingContractSuccess: (state, action) => {
      state.successMsgOfUpdateSetting = action.payload;
    },
    setErrorMessage: (state, action) => {
      state.errorMessage = action.payload;
    },
    activityReportActionDropdownSuccess: (state, action) => {
      state.actvityDropdownLists = action.payload;
    },
    setActivityListSuccess: (state, action) => {
      state.actvityList = action.payload;
    },
    clearActvityList: (state) => {
      state.actvityList = [];
      state.errorMessage = "";
    },
    clearAdminSettingList: (state) => {
      state.adminSettingList = {};
      state.errorMessage = "";
    },
    setBlankActivityData: (state, action) => {
      state.acivityListDataNotAvailable = action.payload;
    },
    activityReportActionDropdownError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setAddEditRoles: (state, action) => {
      state.getAddEditRolesList = action.payload;
    },
    qrCodeLoading: (state, action: PayloadAction<boolean>) => {
      state.isQRCodeLoading = action.payload;
    },
  },
});

export const {
  adminSettingContractSuccesss,
  adminSettingContractError,
  setLoading,
  adminSettingContractSuccess,
  setErrorMessage,
  activityReportActionDropdownSuccess,
  activityReportActionDropdownError,
  setActivityListSuccess,
  clearActvityList,
  setBlankActivityData,
  setAddEditRoles,
  clearAdminSettingList,
  qrCodeLoading,
} = adminSettingSlice.actions;
export const adminSettingReducer = adminSettingSlice.reducer;
