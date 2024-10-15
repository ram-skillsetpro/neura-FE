import { createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { AppDispatch } from "src/redux/create-store";
import {
  ApiAnnotationCommentResponse,
  ApiResponse,
  CommentListApiResponse,
  CommentListPayloadType,
  CommentListResponseType,
  CreateAnnotationCommentPayloadType,
  CreateCommentPayloadType,
  CreateCommentResponseType,
  DeleteAnnotationCommentPayloadType,
  DeleteCommentPayloadType,
  DeleteCommentResponseType,
  FetchAnnotationCommentPayloadType,
  IChatPagination,
  PromptChatListApiResponse,
  PromptChatReplyApiResponse,
  ReplyListResponseType,
  ReplyOnCommentPayloadType,
} from "./comment-box.model";

export interface CommentBoxStateType
  extends CommentListResponseType,
    CreateCommentResponseType,
    DeleteCommentResponseType,
    ReplyListResponseType {
  errorMessage: string;
  annotationComments: Array<any>;
  promptChats: Array<any>;
  recentPromptChats: Array<any>;
  promptChatSentResponse: any;
  promptReply: Array<any>;
  commentPagination: IChatPagination;
  promptChatPagination: IChatPagination;
  contentHash: string;
  prePromptQuestions: Array<string>;
  prePromptQuestionTimer: any;
  promptError: string | null;
}

const initialState: CommentBoxStateType = {
  errorMessage: "",
  comments: [],
  replies: [],
  createCommentResponse: 0,
  deleteCommentResponse: 0,
  annotationComments: [],
  promptChats: [],
  recentPromptChats: [],
  promptChatSentResponse: null,
  promptReply: [],
  commentPagination: {
    minId: 0,
    maxId: 0,
  },
  promptChatPagination: {
    minId: 0,
    maxId: 0,
  },
  contentHash: "",
  prePromptQuestions: [],
  prePromptQuestionTimer: null,
  promptError: null,
};

export const fetchCommentList = (payload: CommentListPayloadType) => {
  const { fileId, sorting, minId, maxId, mergeResponse = false } = payload;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<CommentListApiResponse>(
        `${process.env.COMMENT_API_BASE_URL}/v1/comments/get-by-fileid?fileId=${fileId}&sorting=${
          sorting || 1
        }${mergeResponse ? `&topId=${maxId}` : ``}${mergeResponse ? `&bottomId=${minId}` : ``}`,
      );
      if (apiResponse.isSuccess) {
        const comments = apiResponse.data?.comment.filter((item) => item.level_no === 1) || [];
        const replies = apiResponse.data?.comment.filter((item) => item.level_no === 2) || [];
        if (mergeResponse) {
          const prevComments = _getState().commentBox.comments;
          const prevReplies = _getState().commentBox.replies;
          dispatch(saveCommentList([...prevComments, ...comments]));
          dispatch(saveReplyList([...prevReplies, ...replies]));
        } else {
          dispatch(saveCommentList(comments));
          dispatch(saveReplyList(replies));
        }

        dispatch(
          setCommentPagination({
            minId: apiResponse.data?.minCommentId,
            maxId: apiResponse.data?.maxCommentId,
          }),
        );
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const createComment = (payload: CreateCommentPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, msgText, msgType } = payload;
      const body = {
        file_id: fileId,
        level_no: 1,
        msg_text: msgText,
        parent_msg_id: 0,
        msg_type: msgType,
      };
      const apiResponse = await api.post<ApiResponse>(
        `${process.env.COMMENT_API_BASE_URL}/v1/comments/create`,
        body,
      );

      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(saveCreateCommentResponse(apiResponse.status));
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const replyOnComment = (payload: ReplyOnCommentPayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, msgText, parentMsgId } = payload;
      const body = {
        file_id: fileId,
        level_no: 2,
        msg_text: msgText,
        parent_msg_id: parentMsgId,
      };
      const apiResponse = await api.post<ApiResponse>(
        `${process.env.COMMENT_API_BASE_URL}/v1/comments/create`,
        body,
      );
      if (apiResponse.isSuccess) {
        //
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const deleteComment = (payload: DeleteCommentPayloadType) => {
  const { commentId } = payload;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `${process.env.COMMENT_API_BASE_URL}/v1/comments/delete?commentId=${commentId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(saveDeleteCommentResponse(apiResponse.status));
      } else {
        dispatch(setError(apiResponse.message || ""));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const createAnnotationComment = (payload: CreateAnnotationCommentPayloadType) => {
  const { fileId, messageText } = payload;

  const data = {
    file_id: fileId,
    level_no: 1,
    msg_text: messageText,
    parent_msg_id: 0,
  };
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<ApiResponse>(
      `${process.env.COMMENT_API_BASE_URL}/v1/annotated-comments/create`,
      data,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(fetchAnnotationComment({ fileId }));
    } else {
      dispatch(setError(apiResponse.message));
    }
  };
};

export const fetchAnnotationComment = (payload: FetchAnnotationCommentPayloadType) => {
  const { fileId } = payload;
  const queryParams = `fileId=${fileId}&sorting=1`;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<ApiAnnotationCommentResponse>(
      `${process.env.COMMENT_API_BASE_URL}/v1/annotated-comments/get-by-fileid?${queryParams}`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      const comments = apiResponse.data.comment.map((data) => {
        return { ...JSON.parse(data.msg_text), commentId: data.id, userId: data.user_id };
      });
      dispatch(saveAnnotationCommentList(comments));
    } else {
      dispatch(setError(apiResponse.message));
    }
  };
};

export const deleteAnnotationComment = (payload: DeleteAnnotationCommentPayloadType) => {
  const { commentId, fileId } = payload;
  const queryParams = `commentId=${commentId}`;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<ApiResponse>(
      `${process.env.COMMENT_API_BASE_URL}/v1/annotated-comments/delete?${queryParams}`,
    );
    if (apiResponse.isSuccess && apiResponse?.status === 200) {
      dispatch(fetchAnnotationComment({ fileId }));
    } else {
      dispatch(setError(apiResponse.message));
    }
  };
};

export const fetchAllPromptChats = (payload: any) => {
  const { fileId, minId, maxId, mergeResponse = false } = payload;
  const queryParams = `fileId=${fileId}&sorting=1`;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<PromptChatListApiResponse>(
      `/v1/prompt-chat/get-by-pageid?${queryParams}${mergeResponse ? `&topId=${maxId}` : ``}${
        mergeResponse ? `&bottomId=${minId}` : ``
      }`,
    );
    if (apiResponse.isSuccess && apiResponse?.status === 200) {
      if (mergeResponse) {
        const chats = apiResponse.data?.promptChats || [];
        const prevChats = _getState().commentBox.promptChats;
        dispatch(setPromptChats([...prevChats, ...chats]));
      } else {
        dispatch(setPromptChats(apiResponse.data?.promptChats || []));
      }

      dispatch(
        setPromptChatPagination({
          minId: apiResponse.data?.minCommentId,
          maxId: apiResponse.data?.maxCommentId,
        }),
      );
    } else {
      dispatch(setError(apiResponse.message));
    }
  };
};

export const postPromptChat = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, msgText } = payload;

      const body = {
        file_id: fileId,
        level_no: 1,
        msg_text: msgText,
        parent_msg_id: 0,
      };
      const apiResponse = await api.post<ApiResponse>(`/v1/prompt-chat/question-post`, body);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setPromptChatSentResponse(apiResponse.data));
        dispatch(setPromptError(null));
        return true;
      } else {
        dispatch(setPromptError(apiResponse.message[0] || ""));
        setTimeout(() => {
          dispatch(setPromptError(null));
        }, 5000);
        return false;
      }
    } catch (error: any) {
      dispatch(setPromptError((error as Error).message));
      setTimeout(() => {
        dispatch(setPromptError(null));
      }, 5000);
      return false;
    }
  };
};

export const fetchPromptReply = (payload: any) => {
  const { fileId, questionId } = payload;
  const queryParams = `fileId=${fileId}&quesId=${questionId}&sorting=1`;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<PromptChatReplyApiResponse>(
      `/v1/prompt-chat/question-reply?${queryParams}`,
    );
    if (apiResponse.isSuccess && apiResponse?.status === 200) {
      if ((apiResponse.data?.promptChats || []).length > 0) {
        dispatch(setPromptReply(apiResponse.data?.promptChats || []));
      }
    } else {
      dispatch(setError(apiResponse.message));
    }
  };
};

export const fetchPrePromptQuestions = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileId } = payload;
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/prompt-chat/list-questions?fileId=${fileId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setPrePromptQuestions(apiResponse.data));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return false;
    }
  };
};

const commentBoxSlice = createSlice({
  name: "commentBox",
  initialState,
  reducers: {
    saveCommentList: (state, action) => {
      state.comments = action.payload;
      state.errorMessage = "";
    },
    saveAnnotationCommentList: (state, action) => {
      state.annotationComments = action.payload;
      state.errorMessage = "";
    },
    clearAnnotationCommentList: (state) => {
      state.annotationComments = [];
      state.errorMessage = "";
    },
    saveReplyList: (state, action) => {
      state.replies = action.payload;
      state.errorMessage = "";
    },
    clearReplyList: (state) => {
      state.replies = [];
      state.errorMessage = "";
    },
    clearCommentList: (state) => {
      state.comments = [];
      state.errorMessage = "";
      state.promptChatPagination = {
        minId: 0,
        maxId: 0,
      };
    },
    saveCreateCommentResponse: (state, action) => {
      state.createCommentResponse = action.payload;
      state.errorMessage = "";
    },
    clearCreateCommentResponse: (state) => {
      state.createCommentResponse = 0;
      state.errorMessage = "";
    },
    saveDeleteCommentResponse: (state, action) => {
      state.deleteCommentResponse = action.payload;
      state.errorMessage = "";
    },
    clearDeleteCommentResponse: (state) => {
      state.deleteCommentResponse = 0;
      state.errorMessage = "";
    },
    setError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setPromptChats: (state, action) => {
      state.promptChats = action.payload;
    },
    setRecentPromptChatResponse: (state, action) => {
      state.recentPromptChats = action.payload;
    },
    setPromptChatSentResponse: (state, action) => {
      state.promptChatSentResponse = action.payload;
    },
    setPromptReply: (state, action) => {
      state.promptReply = action.payload;
    },
    setCommentPagination: (state, action) => {
      state.commentPagination = {
        minId: action.payload.minId,
        maxId: action.payload.maxId,
      };
    },
    setPromptChatPagination: (state, action) => {
      state.promptChatPagination = {
        minId: action.payload.minId,
        maxId: action.payload.maxId,
      };
    },
    setContentHash: (state, action) => {
      state.contentHash = action.payload;
    },
    setPrePromptQuestions: (state, action) => {
      state.prePromptQuestions = action.payload;
    },
    setPrePromptQuestionsTimer: (state, action) => {
      state.prePromptQuestionTimer = action.payload;
    },
    resetPrePromptQuestionsTimer: (state) => {
      clearTimeout(state.prePromptQuestionTimer);
      state.prePromptQuestionTimer = null;
    },
    setPromptError: (state, action) => {
      state.promptError = action.payload;
    },
  },
});

export const {
  saveCommentList,
  setError,
  saveCreateCommentResponse,
  clearCreateCommentResponse,
  saveDeleteCommentResponse,
  clearDeleteCommentResponse,
  clearCommentList,
  saveReplyList,
  clearReplyList,
  saveAnnotationCommentList,
  clearAnnotationCommentList,
  setPromptChats,
  setRecentPromptChatResponse,
  setPromptChatSentResponse,
  setPromptReply,
  setCommentPagination,
  setPromptChatPagination,
  setContentHash,
  setPrePromptQuestions,
  setPrePromptQuestionsTimer,
  resetPrePromptQuestionsTimer,
  setPromptError,
} = commentBoxSlice.actions;
export const commentBoxReducer = commentBoxSlice.reducer;
