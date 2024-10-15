import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { HttpClientOptions } from "src/core/services/http-client";
import { getAuth } from "src/core/utils";
import { AppDispatch } from "src/redux/create-store";

import {
  ApiResponseSideBar,
  OriginalFilePayloadType,
  Section,
  UploadAndSignResponseType,
} from "../contract/contract.model";
import { setTemplateQuestionaireArray } from "../pre-dashboard/templates/templates.redux";
import {
  fetchConfigByContractId,
  fetchConfigByTemplateId,
  setEditorConfig,
} from "./contract-editor/only-office-editor/onlyoffice.redux";
import {
  AddExternalUserPayload,
  AgreementResponse,
  ApiResponse,
  ApiResponseAddExternalUser,
  ApiResponseAutoSugggestTemplate,
  ApiResponseFetchUser,
  AuthorityRoles,
  ChangeStateResponse,
  FileSharedPrecontractType,
  FileUploadType,
  IContractReviewExtracts,
  PaginatedApiResponse,
  PayloadAttachRoles,
  PlaybookList,
  PlaybookResponseType,
  QuestionaireItem,
  SaveContractResponse,
  SimpleoSuggestion,
  Template,
  User,
} from "./pre-contract.model";

export interface PreContractStateType {
  isLoading: boolean;
  isFileUplaodLoading: boolean;
  errorMessage: string;
  AutoSearchTemplate: Array<SimpleoSuggestion>;
  latestTemplate: Array<Template>;
  intervalId: NodeJS.Timeout | null;
  activeStagePreContract: number;
  dataCkEditor: object;
  questionaireArray: QuestionaireItem[];
  questionAnswerSet: any;
  templateData: any;
  contractName: string;
  contractId: number;
  contractTextObj: string;
  markerJson: string;
  shareUser: Array<User>;
  shareUserInternal: Array<User>;
  shareUserExternal: Array<User>;
  userSearchData: Array<FileSharedPrecontractType>;
  fileName: string;
  errorMsg: string;
  fileId: number;
  authorityList: AuthorityRoles[];
  authorityListUploadAndSign: AuthorityRoles[];
  editorContent: any;
  originalEditorContent: any;
  createdby: number;
  contractTypeId: number;
  playbookList: IContractReviewExtracts[];
  playbookList_missing: IContractReviewExtracts[];
  playbookList_gap: IContractReviewExtracts[];
  playbookList_ok: IContractReviewExtracts[];
  sideBarData: Array<Section>;
  sideBarSummary: string;
  contractTypeError: any;
  preContractPdf: any;
  fileUploadState: boolean;
  questionAnswerError: any;
  oldPrecontractJsonData: any;
  fileUploadId: number;
  contractLastUpdate: any;
  savePreContractError: string | null;
  postContractId: number;
  summaryProcessStatus: {
    processStatus: number;
    message: string | null;
  };
  expandEditor: boolean;
  playbookResult: Array<PlaybookList>;
  globalPlaybookResult: Array<PlaybookList>;
  globalPBReviewResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
  PBFilesReviewResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
}

const initialState: PreContractStateType = {
  isLoading: false,
  isFileUplaodLoading: false,
  errorMessage: "",
  AutoSearchTemplate: [],
  latestTemplate: [],
  intervalId: null,
  activeStagePreContract: 1,
  dataCkEditor: {},
  questionaireArray: [],
  questionAnswerSet: {},
  templateData: {},
  contractName: "",
  contractId: 0,
  contractTextObj: "",
  markerJson: "{}",
  shareUser: [],
  shareUserInternal: [],
  shareUserExternal: [],
  fileName: "",
  errorMsg: "",
  fileId: 0,
  userSearchData: [],
  authorityList: [],
  authorityListUploadAndSign: [],
  editorContent: undefined,
  originalEditorContent: null,
  createdby: 0,
  contractTypeId: 0,
  sideBarData: [],
  sideBarSummary: "",
  playbookList: [],
  playbookList_missing: [],
  playbookList_gap: [],
  playbookList_ok: [],
  contractTypeError: null,
  preContractPdf: null,
  fileUploadState: false,
  questionAnswerError: {},
  oldPrecontractJsonData: {},
  fileUploadId: 0,
  contractLastUpdate: null,
  savePreContractError: null,
  postContractId: 0,
  summaryProcessStatus: {
    processStatus: 0,
    message: null,
  },
  expandEditor: false,
  playbookResult: [],
  globalPlaybookResult: [],
  globalPBReviewResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  PBFilesReviewResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
};

export const fileUploadPreContract = (payload: FileUploadType, options?: HttpClientOptions) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setFileUplaodLoading(true));
    const { file, contractTypeId, contractFlag = 0 } = payload;
    const queryParams = new URLSearchParams();
    queryParams.set("contractFlag", String(contractFlag));
    queryParams.set("contractTypeId", String(contractTypeId));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/presigned/template-upload/upload-file`,
        formData,
        { ...options, params: queryParams },
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        dispatch(setFileUploadId(apiResponse.data.id));
        if (contractFlag === 1) {
          if (apiResponse.data.id) dispatch(fetchConfigByContractId(apiResponse.data.id));
        }
        if (contractFlag === 0) {
          if (apiResponse.data.id) dispatch(fetchConfigByTemplateId(apiResponse.data.id));
        }
        CommonService.toast({
          type: "success",
          message: apiResponse.data?.response ?? "File uploaded successfully",
        });
        return apiResponse;
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      CommonService.toast({
        type: "success",
        message: (error as Error).message,
      });
    } finally {
      dispatch(setFileUplaodLoading(false));
    }
  };
};

export const searchContractTemplate = (keyword: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<ApiResponseAutoSugggestTemplate>(
        `/v1/presigned/template/autosuggest?input=${keyword}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(autoSearchTemplateSuccesss(apiResponse.data));
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getContentCkEditor = (id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<AgreementResponse>(
        `/v1/presigned/fetch-editor-by-template?templateId=${id}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const { contractId, contractName, markerValueJson, contractTypeId, createdBy } =
          apiResponse?.data || {};
        // dispatch(contentCkEditorSuccess(apiResponse?.data));
        dispatch(setEditorConfig(apiResponse?.data));
        dispatch(stopAutoRefresh());
        dispatch(setContractId(contractId));
        dispatch(setContractName(contractName));
        dispatch(setContractTypeId(contractTypeId));
        dispatch(setCreatedById(createdBy));

        const markerJson = JSON.parse(markerValueJson || "{}");
        if (markerJson && markerJson.questionaire && Array.isArray(markerJson.questionaire)) {
          dispatch(setTemplateQuestionaireArray(markerJson.questionaire));
        }

        return contractId;
        // dispatch(setTab(2)); //change the step according to wizard step
        // dispatch(setTab("quesAns"));
        // dispatch(setFileId(id));
      } else {
        dispatch(handleError(apiResponse.message[0]));
        return 0;
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
      return 0;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// export const getContentCkEditorForContractId = (id: number) => {
//   return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
//     dispatch(setLoading(true));
//     try {
//       const apiResponse = await api.get<ApiResponseForContractId>(
//         `/v1/presigned/contract/fetch?contractId=${id}`,
//       );

//       if (apiResponse?.isSuccess && apiResponse?.data) {
//         const {
//           finalContractText,
//           state,
//           contractName,
//           contractId,
//           markerValueJson,
//           createdby,
//           contractTypeId,
//           pdfContent,
//         } = apiResponse?.data || {};
//         // dispatch(setOriginalContent(JSON.parse(finalContractText || "{}")));

//         // dispatch(setEditorContent(JSON.parse(finalContractText || "{}").initialData || undefined));
//         dispatch(setContractName(contractName));
//         dispatch(setTab(state));
//         dispatch(setContractId(contractId));
//         dispatch(setCreatedById(createdby));
//         dispatch(setContractTypeId(contractTypeId));

//         if (pdfContent && pdfContent !== "") {
//           dispatch(setPreContractPdf(pdfContent));
//         }
//         const markerJson = JSON.parse(markerValueJson);
//         if (markerJson && markerJson.questionaire && Array.isArray(markerJson.questionaire)) {
//           dispatch(setTemplateQuestionaireArray(markerJson.questionaire));
//         }

//         // dispatch(contentCkEditorSuccess(apiResponse?.data));
//       } else {
//         dispatch(handleError(apiResponse.message[0]));
//       }
//     } catch (error) {
//       dispatch(handleError((error as Error).message));
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };
// };

export const getUsersPreContract = (Id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<ApiResponseFetchUser>(
      `/v1/presigned/contract/fetch-user?contractId=${Id}`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(UsersPreContractFetched(apiResponse.data));
    } else {
      dispatch(handleError(apiResponse.message[0]));
    }
  };
};

export const getUsersSignAndUpload = (Id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<ApiResponseFetchUser>(
      `/v1/presigned/upload-sign/fetch-user?contractId=${Id}`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(UsersPreContractFetched(apiResponse.data));
    } else {
      dispatch(handleError(apiResponse.message[0]));
    }
  };
};

export const fetchRoles = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<AuthorityRoles[]>(
      `/v1/cms/get-module-authority-group-name/3`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(preContractAuthorityFetched(apiResponse.data));
    } else {
      dispatch(handleError(apiResponse.message[0]));
    }
  };
};

export const fetchRolesForUploadAndSign = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<AuthorityRoles[]>(
      `/v1/cms/get-module-authority-group-name/7`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(preContractUploadAndSignAuthorityFetched(apiResponse.data));
    } else {
      dispatch(handleError(apiResponse.message[0]));
    }
  };
};

export const userSearchListPrecontract = (keyword: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<FileSharedPrecontractType[]>(
        `/v1/team/suggest-users?terms=${keyword}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(userSearchListSuccesss(apiResponse.data));
        return apiResponse.data;
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const saveContractData = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));

    const {
      contractTypeId,
      contractName,
      folderId,
      markerJson,
      templateId,
      text,
      contractId = 0,
    } = payload;

    let data;

    if (contractId) {
      data = {
        contractTypeId,
        contractName,
        folderId,
        markerJson,
        templateId,
        text,
        contractId,
      };
    } else {
      data = {
        contractTypeId,
        contractName,
        folderId,
        markerJson,
        templateId,
        text,
      };
    }

    try {
      if (
        JSON.stringify(payload) !== JSON.stringify(_getState().preContract.oldPrecontractJsonData)
      ) {
        const apiResponse = await api.post<SaveContractResponse>(
          `/v1/presigned/contract/save`,
          data,
        );

        if (apiResponse?.isSuccess && apiResponse?.data) {
          const { contractId, state } = apiResponse.data;
          dispatch(setContractId(contractId));
          dispatch(setTab(state));
          dispatch(setOldPreContractJsonData(payload));
          // CommonService.toast({ type: "success", message: "Document saved successfully" });
          dispatch(setContractLastUpdate(new Date().getTime()));
          return contractId;
        } else {
          dispatch(setOldPreContractJsonData(payload));
          CommonService.toast({ type: "error", message: apiResponse.message[0] });
          dispatch(handleSaveError(apiResponse.message[0]));
          return 0;
        }
      }
    } catch (error) {
      dispatch(setOldPreContractJsonData(payload));
      CommonService.toast({ type: "error", message: (error as Error).message });
      dispatch(handleSaveError((error as Error).message));
      return 0;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const AddRolesForUser = (payload: PayloadAttachRoles) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>(
        "/v1/presigned/collaborator/save-assign-authority",
        payload,
      );
      if (apiResponse.isSuccess) {
        dispatch(getUsersPreContract(payload.contractId));
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const AddRolesUploadAndSign = (payload: PayloadAttachRoles) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>(
        "/v1/upload-sign/collaborator/save-assign-authority",
        payload,
      );
      if (apiResponse.isSuccess) {
        dispatch(getUsersSignAndUpload(payload.contractId));
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const removeSharedUser = (contractId: number, userId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<FileSharedPrecontractType[]>(
        `/v1/presigned/collaborator/toggle?activeStatus=0&contractId=${contractId}&userId=${userId}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(getUsersPreContract(contractId));
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const removeSharedUserUploadAndSign = (contractId: number, userId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<FileSharedPrecontractType[]>(
        `/v1/upload-sign/collaborator/toggle?activeStatus=0&contractId=${contractId}&userId=${userId}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(getUsersSignAndUpload(contractId));
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const changeContractState = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const { contractId, backToEdit = false } = payload;
      const backToEditParam = backToEdit ? `&backToEdit=${backToEdit}` : "";
      const apiResponse = await api.post<ChangeStateResponse>(
        `/v1/presigned/contract/change-status?contractId=${contractId}${backToEditParam}`,
        {},
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const { state } = apiResponse?.data || {};
        dispatch(setTab(state));
        return true;
        // dispatch(setTab(2)); //change the step according to wizard step
      } else {
        return false;
        // dispatch(fileUploadError(apiResponse.message[0]));
      }
    } catch (error) {
      return false;
      // dispatch(fileUploadError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const changeContractStateOnUploadAndSign = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const { contractId, backToEdit = false } = payload;
      const backToEditParam = backToEdit ? `&backToEdit=${backToEdit}` : "";
      const apiResponse = await api.post<ChangeStateResponse>(
        `/v1/presigned/upload-sign/change-status?contractId=${contractId}${backToEditParam}`,
        {},
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        const { state } = apiResponse?.data || {};
        dispatch(setTab(state));
        return true;
        // dispatch(setTab(2)); //change the step according to wizard step
      } else {
        return false;
        // dispatch(fileUploadError(apiResponse.message[0]));
      }
    } catch (error) {
      return false;
      // dispatch(fileUploadError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const AddExternalUser = (payload: AddExternalUserPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponseAddExternalUser>(
        "/v1/presigned/collaborator/assign-to-external-authority",
        payload,
      );
      if (apiResponse.isSuccess) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] || "External user added",
        });
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchLatestTemplate = (
  payload?: Partial<{ size: number; contractTypeId: number }>,
) => {
  const { size = 3, contractTypeId = 0 } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const queryParams = new URLSearchParams();
    if (contractTypeId) queryParams.set("contractTypeId", contractTypeId.toString());
    queryParams.set("size", size.toString());
    try {
      const apiResponse = await api.get<Template[]>(`/v1/presigned/template/fetch-latest`, {
        params: queryParams,
      });

      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(fetchLatestTemplateSuccesss(apiResponse.data));
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const fetchPreContractReviewExtracts = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileId, playbookId, reviewId } = payload;
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/playbook/presigned/view-review?contractId=${fileId}&playbookId=${playbookId}&reviewId=${reviewId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setContractReviewExtracts(apiResponse.data || []));
        return true;
      } else {
        dispatch(setContractReviewExtracts([]));
        return false;
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
      return false;
    }
  };
};

export const readPreContractSummaryContent = (payload: OriginalFilePayloadType) => {
  const { fileId, teamId, folderId } = payload;
  const queryParams = `${
    folderId && folderId > 0
      ? `fileId=${fileId}&folderId=${folderId}&teamId=${teamId}`
      : `fileId=${fileId}&teamId=${teamId}`
  }`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const apiResponse = await api.get<ApiResponseSideBar>(
      `/v1/presigned/team/read-processed-extracts?${queryParams}`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(sideBarContentFetched(apiResponse.data));
    } else {
      dispatch(sideBarContentError(apiResponse.message));
    }
    dispatch(setLoading(false));
  };
};

export const readUploadAndSignSummaryContent = (payload: { fileId: number }) => {
  const { fileId } = payload;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const apiResponse = await api.get<ApiResponseSideBar>(
      `/v1/presigned/upload-sign/review-extracts?fileId=${fileId}`,
    );

    if (apiResponse.isSuccess && apiResponse?.data) {
      if (!apiResponse.data?.data) {
        dispatch(setSummaryProcessStatus(apiResponse.data));
      } else {
        dispatch(sideBarContentFetched(apiResponse.data));
        dispatch(resetSummaryProcessStatus());
      }
    } else {
      dispatch(sideBarContentError(apiResponse.message));
    }
    dispatch(setLoading(false));
  };
};

export const uploadFileAndSign = (payload: any, options?: HttpClientOptions) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const { file } = payload;
    const formData = new FormData();

    // eslint-disable-next-line max-len
    const queryParams = ``;
    formData.append("file", file);
    try {
      dispatch(setFileUploadLoading(true));
      const apiResponse = await api.post<UploadAndSignResponseType>(
        `/v1/presigned/upload-sign/upload-file${queryParams}`,
        formData,
        options,
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        const { id, createdBy } = apiResponse.data || {};
        dispatch(setTab(1));
        dispatch(setFileUploadLoading(false));
        dispatch(setCreatedById(createdBy));
        CommonService.toast({
          type: "success",
          message: apiResponse.data?.response ?? "File uploaded successfully",
        });
        return id;
      } else {
        CommonService.toast({
          type: "error",
          message: apiResponse.message[0],
        });
        dispatch(setFileUploadLoading(false));
        return false;
        // dispatch(fileUploadError(apiResponse.message[0]));
      }
    } catch (error) {
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
      dispatch(setFileUploadLoading(false));
      return false;
    } finally {
      dispatch(setFileUploadLoading(false));
    }
  };
};

export const fetchUploadFileAndSignDocument = (contractId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));

    // eslint-disable-next-line max-len

    try {
      const queryParams = `?contractId=${contractId}`;

      const apiResponse = await api.get<UploadAndSignResponseType>(
        `/v1/presigned/upload-sign/fetch${queryParams}`,
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        const { id, pdfContent, contractName, createdBy, state, postContractId } =
          apiResponse.data || {};
        dispatch(setPreContractPdf(pdfContent));
        dispatch(setContractId(id));
        dispatch(setContractName(contractName));
        dispatch(setTab(state));
        dispatch(setCreatedById(createdBy));
        dispatch(setPostContractId(postContractId));
      } else {
        CommonService.toast({
          type: "error",
          message: apiResponse.message[0],
        });
        // dispatch(fileUploadError(apiResponse.message[0]));
      }
    } catch (error) {
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    }
  };
};

const filterPlaybookListByStatus = (playbookList: any[], status: string) => {
  return playbookList
    .map((category) => ({
      key: category.key,
      value: category.value.filter((item: { status: string }) => item.status === status),
    }))
    .filter((category) => category.value.length > 0);
};

export const fetchPlaybookListPreContractView = (
  contractId: number,
  isUniversal: number,
  pgn: number,
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<PaginatedApiResponse<PlaybookList>>(
        `/v1/playbook/presigned/fetch-by-contract?contractId=${contractId}&isUniversal=${isUniversal}&pgn=${pgn}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        if (isUniversal === 0) {
          dispatch(playbookResult(apiResponse.data?.result ?? []));
          dispatch(PBPerPageFetched(apiResponse.data));
        } else {
          dispatch(globalPlaybookResult(apiResponse.data?.result ?? []));
          dispatch(globalPBPerPageFetched(apiResponse?.data));
        }
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const runPreContractPlaybook = (contractId: number, playbookId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/playbook/presigned/run-review?contractId=${contractId}&playbookId=${playbookId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({ type: "success", message: apiResponse.message[0] });
      } else {
        CommonService.popupToast({ type: "error", message: apiResponse.message[0] });
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    }
  };
};

const preContractSlice = createSlice({
  name: "preContract",
  initialState,
  reducers: {
    handleError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    contentCkEditorSuccess: (state, action: PayloadAction<AgreementResponse>) => {
      const templateMarker = action.payload?.templateMarker;
      state.templateData = action.payload;
      try {
        state.editorContent =
          JSON.parse(action.payload?.template?.templateText).initialData || undefined;
      } catch (error) {
        state.editorContent = action.payload?.template?.templateText || undefined;
      }

      if (templateMarker) {
        const markerJson = JSON.parse(templateMarker.markerJson);
        if (markerJson && markerJson.questionaire && Array.isArray(markerJson.questionaire)) {
          state.questionaireArray = markerJson.questionaire;
        }
      }
    },
    contentCkEditorOffline: (state, action: PayloadAction<string>) => {
      // const templateMarker = action.payload?.templateMarker;
      // state.templateData = action.payload;
      state.editorContent = action.payload || undefined;
      // if (templateMarker) {
      //   const markerJson = JSON.parse(templateMarker.markerJson);
      //   if (markerJson && markerJson.questionaire && Array.isArray(markerJson.questionaire)) {
      //     state.questionaireArray = markerJson.questionaire;
      //   }
      // }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setFileUplaodLoading: (state, action) => {
      state.isFileUplaodLoading = action.payload;
    },
    autoSearchTemplateSuccesss: (state, action: PayloadAction<ApiResponseAutoSugggestTemplate>) => {
      const suggestions = [
        ...action.payload.simpleoSuggestions,
        ...action.payload.privateSuggestions,
      ];
      state.AutoSearchTemplate = suggestions;
    },
    clearDataSearchTemplate: (state) => {
      state.AutoSearchTemplate = [];
    },
    setIntervalId: (state, action: PayloadAction<NodeJS.Timeout | null>) => {
      state.intervalId = action.payload;
    },
    stopAutoRefresh: (state) => {
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    },
    setTab: (state, action: PayloadAction<number>) => {
      state.activeStagePreContract = action.payload;
    },
    setQASet: (state, action) => {
      const { key, value } = action.payload || {};
      state.questionAnswerSet[key] = { key, value };
    },
    setEditorFormTagError: (state, action) => {
      const { key, error } = action.payload || {};
      state.questionAnswerError[key] = { error };
    },
    setContractName: (state, action) => {
      state.contractName = action.payload;
    },
    setContractId: (state, action) => {
      state.contractId = action.payload;
    },
    setCreatedById: (state, action) => {
      state.createdby = action.payload;
    },
    setContractText: (state, action) => {
      state.contractTextObj = action.payload;
    },
    clearPreContractData: (state) => {
      state.questionAnswerSet = {};
      state.templateData = {};
      state.contractName = "";
      state.contractId = 0;
      state.contractTextObj = "";
      state.markerJson = "{}";
      state.editorContent = undefined;
      state.activeStagePreContract = 1;
      state.originalEditorContent = null;
      state.contractTypeId = 0;
      state.questionaireArray = [];
      state.createdby = 0;
      state.contractLastUpdate = null;
      state.savePreContractError = null;
      state.preContractPdf = null;
      state.postContractId = initialState.postContractId;
    },
    UsersPreContractFetched: (state, action) => {
      state.shareUser = action.payload;
      state.errorMsg = "";
      state.fileName = action.payload.fileName;
      state.shareUserExternal = action.payload.filter(
        (user: { isExternal: any }) => user.isExternal,
      );
      state.shareUserInternal = action.payload.filter(
        (user: { isExternal: any }) => !user.isExternal,
      );
    },
    setFileId: (state, action) => {
      state.fileId = action.payload;
    },
    userSearchListSuccesss: (state, action: PayloadAction<Array<FileSharedPrecontractType>>) => {
      const filteredUserSearchData = action.payload.filter(
        (item) => item.id !== getAuth().profileId,
      );
      state.userSearchData = filteredUserSearchData;
    },
    clearUserSearchData: (state) => {
      state.userSearchData = [];
    },
    preContractAuthorityFetched: (state, action: PayloadAction<Array<AuthorityRoles>>) => {
      state.authorityList = action.payload;
    },
    preContractUploadAndSignAuthorityFetched: (
      state,
      action: PayloadAction<Array<AuthorityRoles>>,
    ) => {
      state.authorityListUploadAndSign = action.payload;
    },
    setEditorContent: (state, action) => {
      state.editorContent = action.payload;
    },
    setQuestionaireArray: (state, action) => {
      state.questionaireArray = action.payload;
    },
    setOriginalContent: (state, action) => {
      state.originalEditorContent = action.payload;
    },
    setContractTypeId: (state, action) => {
      state.contractTypeId = action.payload;
    },
    fetchLatestTemplateSuccesss: (state, action: PayloadAction<Template[]>) => {
      state.latestTemplate = action.payload;
    },
    setContractReviewExtracts: (state, action) => {
      state.playbookList = action.payload;
      state.playbookList_ok = filterPlaybookListByStatus(action.payload, "OK");
      state.playbookList_missing = filterPlaybookListByStatus(action.payload, "MISSING");
      state.playbookList_gap = filterPlaybookListByStatus(action.payload, "GAP");
    },
    sideBarContentFetched: (state, action) => {
      state.sideBarData = action.payload.data;
      state.errorMsg = "";
      state.sideBarSummary = action.payload.SUMMARY;
    },
    clearSideBarContent: (state) => {
      state.sideBarData = [];
      state.errorMsg = "";
      state.sideBarSummary = "";
    },
    sideBarContentError: (state, action) => {
      state.errorMsg = action.payload;
    },
    setContractTypeError: (state, action) => {
      state.contractTypeError = action.payload;
    },
    setPreContractPdf: (state, action) => {
      state.preContractPdf = action.payload;
    },
    setFileUploadLoading: (state, action) => {
      state.fileUploadState = action.payload;
    },
    setOldPreContractJsonData: (state, action) => {
      state.oldPrecontractJsonData = action.payload;
    },
    setFileUploadId: (state, action) => {
      state.fileUploadId = action.payload;
    },
    setContractLastUpdate: (state, action) => {
      state.contractLastUpdate = action.payload;
    },
    handleSaveError: (state, action) => {
      state.savePreContractError = action.payload;
    },
    setPostContractId: (state, action: PayloadAction<number>) => {
      state.postContractId = action.payload;
    },
    setSummaryProcessStatus: (state, action) => {
      state.summaryProcessStatus = action.payload;
    },
    resetSummaryProcessStatus: (state) => {
      state.summaryProcessStatus = { processStatus: 0, message: "" };
    },
    setExpandEditorState: (state, action) => {
      state.expandEditor = action.payload;
    },
    playbookResult: (state, action: PayloadAction<PlaybookList[]>) => {
      state.playbookResult = action.payload;
    },
    globalPlaybookResult: (state, action: PayloadAction<PlaybookList[]>) => {
      state.globalPlaybookResult = action.payload;
    },
    clearPlaybookReviewData: (state) => {
      state.playbookResult = [];
      state.globalPlaybookResult = [];
      state.globalPBReviewResponse = initialState.globalPBReviewResponse;
      state.PBFilesReviewResponse = initialState.PBFilesReviewResponse;
    },
    globalPBPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<PlaybookList>>) => {
      state.globalPBReviewResponse = action.payload;
      state.errorMessage = "";
    },
    PBPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<PlaybookList>>) => {
      state.PBFilesReviewResponse = action.payload;
      state.errorMessage = "";
    },
  },
});

export const {
  handleError,
  setLoading,
  autoSearchTemplateSuccesss,
  clearDataSearchTemplate,
  setIntervalId,
  stopAutoRefresh,
  contentCkEditorSuccess,
  setTab,
  setQASet,
  setContractName,
  setContractId,
  setCreatedById,
  setContractText,
  clearPreContractData,
  userSearchListSuccesss,
  preContractAuthorityFetched,
  preContractUploadAndSignAuthorityFetched,
  clearUserSearchData,
  setFileId,
  UsersPreContractFetched,
  setEditorContent,
  setQuestionaireArray,
  setFileUplaodLoading,
  setOriginalContent,
  setContractTypeId,
  fetchLatestTemplateSuccesss,
  setContractReviewExtracts,
  clearSideBarContent,
  sideBarContentError,
  sideBarContentFetched,
  setContractTypeError,
  contentCkEditorOffline,
  setPreContractPdf,
  setFileUploadLoading,
  setEditorFormTagError,
  setOldPreContractJsonData,
  setFileUploadId,
  setContractLastUpdate,
  handleSaveError,
  setPostContractId,
  setSummaryProcessStatus,
  resetSummaryProcessStatus,
  setExpandEditorState,
  playbookResult,
  globalPlaybookResult,
  clearPlaybookReviewData,
  globalPBPerPageFetched,
  PBPerPageFetched,
} = preContractSlice.actions;

export const preContractReducer = preContractSlice.reducer;
