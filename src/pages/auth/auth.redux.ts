import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { ApiResponse } from "core/services/http-client";
import {
  ApiResponseResetPassword,
  AuthResponse,
  AuthState,
  ContentCase,
  EmailVerifyPayload,
  LoginPayload,
  MfaLogin,
  RegisterCompanyFormType,
  RegisterCompanyLogo,
  RegisterCompanyLogoResponse,
  RegisterCompanyResponse,
  RegisterUserFormType,
  RegisterUserResponse,
  ResetPasswordPayload,
} from "pages/auth/auth.model";
import { CountryCodeType } from "pages/manage-members/manage-members.model";
import { ToastContent } from "react-toastify";
import { ACCESS_TOKEN } from "src/const";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";

/**
 * Set access token and refresh token in local storage
 *
 * @param accessToken Access Token
 * @param refreshToken Refresh Token
 */
export function setAccessAndRefreshToken(apiResponse: ApiResponse<AuthResponse>) {
  localStorage.setItem("auth", JSON.stringify(apiResponse.data));
  localStorage.setItem(ACCESS_TOKEN, apiResponse.data.token);
}

const initialState: AuthState = {
  isLoggedIn: false,
  errorMessage: "",
  isEmailVerified: false,
  mfaCase: undefined,
  mfaData: undefined,
  countryCodeList: [],
  companyExists: undefined,
};

export const login = (payload: LoginPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<AuthResponse | MfaLogin>("/v1/login", payload, {
        isAuth: false,
      });
      if (apiResponse.data && "mfaEnabled" in apiResponse.data && !!apiResponse.data.mfaEnabled) {
        localStorage.setItem("token", apiResponse.data.token);
        dispatch(setMfaData(apiResponse.data as MfaLogin));
        if ("qrGenerated" in apiResponse.data && !!apiResponse.data.qrGenerated) {
          dispatch(setMfaCase(ContentCase.VerifyCode));
        } else if ("qrGenerated" in apiResponse.data && !apiResponse.data.qrGenerated) {
          dispatch(setMfaCase(ContentCase.ScanQRCode));
        }
        return;
      }
      if (apiResponse.isSuccess && apiResponse.data) {
        setAccessAndRefreshToken(apiResponse as ApiResponse<AuthResponse>);
        dispatch(
          loginSuccess({
            isLoggedIn: true,
            user: apiResponse.data as AuthResponse,
          }),
        );
      } else {
        // CommonService.popupToast({
        //   type: "error",
        //   message: apiResponse.message[0] || ("Something went wrong!" as ToastContent),
        // });
      }
    } catch (error) {
      loginError((error as Error).message);
      CommonService.popupToast({
        type: "error",
        message: "Something went wrong!" as ToastContent,
      });
    }
  };
};

export const userData = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<AuthResponse>(`/v1/user-profile`);
    if (apiResponse.isSuccess && apiResponse.data) {
      setAccessAndRefreshToken(apiResponse as ApiResponse<AuthResponse>);
      dispatch(
        loginSuccess({
          isLoggedIn: true,
          user: apiResponse.data,
        }),
      );
      return apiResponse;
    }
  };
};

// export const signUp = (payload: Omit<SignUpPayload, "password">) => {
//   return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
//     try {
//       const apiResponse = await api.post<ApiResponseResetPassword>("/v1/create-user", payload, {
//         isAuth: false,
//       });
//       if (apiResponse.data) {
//         CommonService.popupToast({
//           type: "success",
//           message: apiResponse.message[0] || "Created Successfully",
//         });
//         return apiResponse;
//       } else {
//         CommonService.popupToast({
//           type: "error",
//           message: apiResponse.message[0] || "Something went wrong",
//         });
//         dispatch(signUpError(apiResponse.message[0]));
//       }
//     } catch (error) {
//       CommonService.popupToast({
//         type: "error",
//         message: "Something went wrong!" as ToastContent,
//       });
//     }
//   };
// };

export const resetPassword = (payload: ResetPasswordPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<ApiResponseResetPassword>(
      "/v1/profile/submit-reset-password",
      payload,
      {
        isAuth: false,
      },
    );
    if (apiResponse.status === 200 && apiResponse.isSuccess) {
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.message[0] || "Password updated successfully!") as ToastContent,
      });
    }
    return apiResponse;
  };
};

export const forgetPassword = (payload: LoginPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get(`/v1/profile/forgot-password?emailId=${payload.emailId}`, {
      isAuth: false,
    });
    if (apiResponse?.isSuccess && apiResponse?.status === 200) {
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.message[0] || "Something went wrong!") as ToastContent,
      });
    }
  };
};

export const emailVerification = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post("/v1/send-emailverify-link", "", {
      isAuth: true,
    });
    if (apiResponse.isSuccess && apiResponse.status === 200) {
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.message[0] || "Something went wrong!") as ToastContent,
      });
    } else {
      CommonService.popupToast({
        type: "error",
        message: (apiResponse.message[0] || "Something went wrong!") as ToastContent,
      });
    }
  };
};

export const verifyEmailLink = (payload: EmailVerifyPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<ApiResponseResetPassword>("/v1/emailverify-link", payload, {
      isAuth: false,
    });
    if (apiResponse.isSuccess && apiResponse.status === 200) {
      dispatch(emailVerify());
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.message[0] || "Something went wrong!") as ToastContent,
      });
    } else {
      CommonService.popupToast({
        type: "error",
        message: (apiResponse.message[0] || "Something went wrong!") as ToastContent,
      });
    }
  };
};

export const validateUserToken = (token: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<AuthResponse>(`/v1/profile/validate-token?token=${token}`, {
      isAuth: false,
    });

    if (apiResponse?.isSuccess && apiResponse?.data) {
      setAccessAndRefreshToken(apiResponse as ApiResponse<AuthResponse>);
      return true;
    } else {
      CommonService.toast({
        type: "error",
        message: (apiResponse.data || "The reset password link expired.") as ToastContent,
      });
      setTimeout(() => {
        window.location.assign("/");
      }, 2000);
      return false;
    }
  };
};

export const eulaVerify = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post(`/v1/settings/update-eula?flagstatus=1`, {
      isAuth: true,
    });

    if (apiResponse?.isSuccess) {
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.message[0] || "Updated successfully") as ToastContent,
      });
      return apiResponse;
    }
  };
};

export const googleAuth = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<AuthResponse | MfaLogin>(
      `/v1/sign-in/external`,
      `credential=${payload.credential}`,
      {
        headers: {
          ContentType: "application/x-www-form-urlencoded",
        },
        isAuth: false,
      },
    );
    if (apiResponse.data && "mfaEnabled" in apiResponse.data && !!apiResponse.data.mfaEnabled) {
      localStorage.setItem("token", apiResponse.data.token);
      dispatch(setMfaData(apiResponse.data as MfaLogin));
      if ("qrGenerated" in apiResponse.data && !!apiResponse.data.qrGenerated) {
        dispatch(setMfaCase(ContentCase.VerifyCode));
      } else if ("qrGenerated" in apiResponse.data && !apiResponse.data.qrGenerated) {
        dispatch(setMfaCase(ContentCase.ScanQRCode));
      }
      return;
    }
    if (apiResponse?.isSuccess && apiResponse.data) {
      setAccessAndRefreshToken(apiResponse as ApiResponse<AuthResponse>);
      dispatch(
        loginSuccess({
          isLoggedIn: true,
          user: apiResponse.data,
        }),
      );
      return true;
    } else {
      // CommonService.popupToast({
      //   type: "error",
      //   message: apiResponse.message[0],
      // });
    }
  };
};

export const googleSignupAuth = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<AuthResponse | string>(
      `/v1/sign-up/external`,
      `credential=${payload.credential}`,
      {
        headers: {
          ContentType: "application/x-www-form-urlencoded",
        },
        isAuth: false,
      },
    );

    if (apiResponse?.isSuccess && apiResponse.data !== "" && apiResponse.status === 200) {
      return apiResponse.data;
    } else {
      // CommonService.popupToast({
      //   type: "error",
      //   message: apiResponse.message[0],
      // });
      return false;
    }
  };
};

export const verifyLoginTOTP = (payload: { totp: string; token: string }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<AuthResponse>(`/v1/login/mfa/verify/otp`, payload, {
        isAuth: false,
      });
      if (apiResponse?.isSuccess && apiResponse.data && apiResponse.data.token) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        localStorage.removeItem("token");
        setTimeout(() => {
          setAccessAndRefreshToken(apiResponse as ApiResponse<AuthResponse>);
          dispatch(
            loginSuccess({
              isLoggedIn: true,
              user: apiResponse.data as AuthResponse,
            }),
          );
        }, 2000);
        setTimeout(() => {
          dispatch(setMfaData(undefined));
          dispatch(setMfaCase(undefined));
        }, 4000);
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
      return apiResponse;
    } catch (error) {
      CommonService.popupToast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};

export const signUp = (payload: Partial<RegisterUserFormType>) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<RegisterUserResponse>("/v1/register-user", payload, {
        isAuth: false,
      });
      if (apiResponse.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] || "Created Successfully",
        });
        return apiResponse;
      } else {
        // CommonService.popupToast({
        //   type: "error",
        //   message: apiResponse.message[0] || "Something went wrong",
        // });
        dispatch(signUpError(apiResponse.message[0]));
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
};

export const registerCompanyLogo = (payload: Omit<RegisterCompanyLogo, "file">) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<RegisterCompanyLogoResponse>(
        "/v1/cms/create-company-logo",
        {
          companyId: payload.companyId ?? null,
          companyName: payload.companyName,
        },
        {
          isAuth: false,
          params: {
            extension: payload.extension,
          },
        },
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        return apiResponse.data;
      } else {
        dispatch(signUpError(apiResponse.message[0]));
      }
    } catch (error) {
      console.error(error);
    }
  };
};
export const uploadCompanyLogo = (payload: { url: string; file: File }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const formData = new FormData();
      formData.append("file", payload.file);
      await api.put<RegisterCompanyLogoResponse>(payload.url, formData, {
        isAuth: false,
      });
    } catch (error) {
      console.error(error);
    }
  };
};

export const registerCompany = (payload: RegisterCompanyFormType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<RegisterCompanyResponse>("/v1/register-company", payload, {
        isAuth: false,
      });
      if (apiResponse.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] || "Created Successfully",
        });
        return apiResponse;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0] || "Something went wrong",
        });
        dispatch(signUpError(apiResponse.message[0]));
      }
    } catch (error) {
      CommonService.popupToast({
        type: "error",
        message: "Something went wrong!" as ToastContent,
      });
    }
  };
};

export const verifyCompany = (
  payload: Pick<RegisterCompanyFormType, "companyName" | "website">,
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<{
        companyId: number;
        companyName: string;
        website: string;
      }>(`/v1/cms/verify-company`, payload, {
        isAuth: false,
      });
      if (apiResponse.isSuccess && apiResponse.data) {
        dispatch(verifyCompanySuccess(apiResponse.data));
        return apiResponse.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
};

export const verifySignupUser = (
  payload: Pick<RegisterCompanyFormType, "userName" | "emailId">,
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<{
        userName: string;
        emailId: string;
      }>(`/v1/verify-user`, payload, {
        isAuth: false,
      });
      if (apiResponse.isSuccess && apiResponse.data) {
        return apiResponse.data;
      }
    } catch (error) {
      console.error(error);
    }
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ isLoggedIn: boolean; user?: AuthResponse }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.user = action.payload.user;
    },
    loginError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = undefined;
    },
    signUpSuccess: (state) => {
      state.errorMessage = "";
    },
    signUpError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    emailVerify: (state) => {
      state.isEmailVerified = true;
    },
    setUserProfileLogo: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.userLogo = action.payload;
      }
    },
    setMfaCase: (state, action: PayloadAction<ContentCase | undefined>) => {
      state.mfaCase = action.payload;
    },
    setMfaData: (state, action: PayloadAction<MfaLogin | undefined>) => {
      state.mfaData = action.payload;
    },
    setCountryCodeList: (state, action: PayloadAction<CountryCodeType[]>) => {
      state.countryCodeList = action.payload;
    },
    verifyCompanySuccess: (
      state,
      action: PayloadAction<{
        companyId: number;
        companyName: string;
        website: string;
      }>,
    ) => {
      state.companyExists = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logout,
  loginError,
  signUpSuccess,
  signUpError,
  emailVerify,
  setUserProfileLogo,
  setMfaCase,
  setMfaData,
  setCountryCodeList,
  verifyCompanySuccess,
} = authSlice.actions;
export const AuthReducer = authSlice.reducer;
