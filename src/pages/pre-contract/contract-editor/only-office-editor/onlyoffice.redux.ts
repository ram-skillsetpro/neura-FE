import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import {
  setTemplateId,
  setTemplateName,
  setTemplateQuestionaireArray,
  setTemplateTypeError,
} from "src/pages/pre-dashboard/templates/templates.redux";
import { AppDispatch } from "src/redux/create-store";
import { AgreementResponse } from "../../pre-contract.model";
import {
  setContractId,
  setContractName,
  setContractTypeError,
  setContractTypeId,
  setCreatedById,
  setPostContractId,
  setPreContractPdf,
  setTab,
} from "../../pre-contract.redux";
import { Config, OnlyOfficeConfigReps } from "./onlyoffice.model";

export interface EditorConfigType {
  apiUrl: string;
  config: Config | null;
  history: any;
  templatePublishStatus: number;
  createdBy: number;
}

export interface OnlyOfficeStateType {
  getEditorConfigReps: EditorConfigType | null;
  isLoading: boolean;
  errorMessage: string;
  isNameFieldEnabled: boolean;
  reviews: any;
  templatePublishStatus: number;
}

const initialState: OnlyOfficeStateType = {
  getEditorConfigReps: null,
  isLoading: false,
  errorMessage: "",
  isNameFieldEnabled: false,
  reviews: null,
  templatePublishStatus: 0,
};

export const fetchBlankGetEditorConfig = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<OnlyOfficeConfigReps>(`/v1/presigned/fetch-editor`);

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const { contractId, createdBy, contractName, contractTypeId, state } =
          apiResponse.data || {};
        dispatch(setContractId(contractId));
        dispatch(setEditorConfig(apiResponse.data));
        dispatch(setCreatedById(createdBy));
        dispatch(setContractName(contractName));
        if (contractTypeId !== 0) {
          dispatch(setContractTypeId(contractTypeId));
        } else {
          dispatch(setContractTypeError("Please Select Contract Type"));
        }
        setNameFieldEnabled(true);
        dispatch(setTab(state));
      } else {
        dispatch(setEditorConfigError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setEditorConfigError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchUploadFileEditorConfig = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const { file } = payload;
    const formData = new FormData();

    // eslint-disable-next-line max-len
    formData.append("file", file);
    try {
      const apiResponse = await api.post<OnlyOfficeConfigReps>(
        `/v1/presigned/fetch-editor`,
        formData,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(setEditorConfig(apiResponse.data));
        setNameFieldEnabled(true);
      } else {
        dispatch(setEditorConfigError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setEditorConfigError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchTemplateEditorConfig = (id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<OnlyOfficeConfigReps>(
        `/v1/presigned/fetch-editor?templateId=${id}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(setEditorConfig(apiResponse.data));
      } else {
        dispatch(setEditorConfigError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setEditorConfigError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchNewTemplateEditorConfig = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const contractTypeId = _getState().preContract?.contractTypeId;
    try {
      const apiResponse = await api.get<OnlyOfficeConfigReps>(
        `/v1/presigned/template/fetch-blank-editor?contractTypeId=${contractTypeId}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const { templateId, templateName, contractTypeId } = apiResponse.data || {};

        dispatch(setEditorConfig(apiResponse.data));
        templateId && dispatch(setTemplateId(templateId));
        if (contractTypeId !== 0) {
          dispatch(setContractTypeId(contractTypeId));
        } else {
          dispatch(setTemplateTypeError("Please Select Contract Type"));
        }
        dispatch(setTemplateName(templateName));
        setNameFieldEnabled(true);
      } else {
        dispatch(setEditorConfigError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setEditorConfigError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchConfigByContractId = (id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<OnlyOfficeConfigReps>(
        `/v1/presigned/fetch-contract-editor?contractId=${id}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const {
          contractId,
          createdBy,
          contractName,
          state,
          contractTypeId,
          pdfContent,
          markerValueJson,
          postContractId,
        } = apiResponse.data || {};
        dispatch(setContractId(contractId));
        if (createdBy) dispatch(setCreatedById(createdBy));
        dispatch(setEditorConfig(apiResponse.data));
        dispatch(setContractName(contractName));
        dispatch(setTab(state));
        if (postContractId > 0) dispatch(setPostContractId(postContractId));
        if (contractTypeId !== 0) {
          dispatch(setContractTypeId(contractTypeId));
        } else {
          dispatch(setContractTypeError("Please Select Contract Type"));
        }

        if (pdfContent && pdfContent !== "") {
          dispatch(setPreContractPdf(pdfContent));
        }
        const markerJson = JSON.parse(markerValueJson);
        if (markerJson && markerJson.questionaire && Array.isArray(markerJson.questionaire)) {
          dispatch(setTemplateQuestionaireArray(markerJson.questionaire));
        }

        return apiResponse.data;
      } else {
        dispatch(setEditorConfigError(apiResponse.message[0]));
      }
      return false;
    } catch (error) {
      dispatch(setEditorConfigError((error as Error).message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchConfigByTemplateId = (id: number,isGlobalTemplate: String) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
   
   let baseUrl = isGlobalTemplate === "YES" ? `/v1/presigned/template/global/fetch-editor-config` 
      : `/v1/presigned/template/fetch-editor-config`;
      let url = `${baseUrl}?templateId=${id}`;
    
    try {
      const apiResponse = await api.get<AgreementResponse>(url);

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const {
          templateId,
          templateName,
          contractTypeId,
          markerValueJson,
          createdBy,
          templatePublishStatus,
        } = apiResponse?.data || {};
        // dispatch(contentCkEditorSuccess(apiResponse?.data));
        dispatch(setTemplateName(templateName));
        if (contractTypeId !== 0) {
          dispatch(setContractTypeId(contractTypeId));
        } else {
          dispatch(setTemplateTypeError("Please Select Contract Type"));
        }
        templateId && dispatch(setTemplateId(templateId));
        dispatch(setEditorConfig(apiResponse.data));
        createdBy && dispatch(setCreatedById(createdBy));
        const markerJsonObj = JSON.parse(markerValueJson || "{}");
        dispatch(setDraftPublishStatus(templatePublishStatus));

        if (Array.from(markerJsonObj.questionaire || []).length) {
          dispatch(setTemplateQuestionaireArray(markerJsonObj.questionaire));
        }
      } else {
        dispatch(setEditorConfigError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setEditorConfigError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

const onlyOfficeEditorSlice = createSlice({
  name: "onlyOfficeEditor",
  initialState,
  reducers: {
    setEditorConfigError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setEditorConfig: (state, action) => {
      state.getEditorConfigReps = action.payload;
    },
    clearEditorConfig: (state) => {
      state.getEditorConfigReps = null;
    },
    setNameFieldEnabled: (state, action) => {
      state.isNameFieldEnabled = action.payload;
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setDraftPublishStatus: (state, action) => {
      state.templatePublishStatus = action.payload;
    },
  },
});

export const {
  setEditorConfigError,
  setLoading,
  setEditorConfig,
  clearEditorConfig,
  setNameFieldEnabled,
  setReviews,
  setDraftPublishStatus,
} = onlyOfficeEditorSlice.actions;
export const onlyOfficeEditorReducer = onlyOfficeEditorSlice.reducer;
