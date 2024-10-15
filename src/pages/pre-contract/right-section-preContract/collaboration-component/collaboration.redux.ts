import { createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import {
  ApiResponse,
  CommentListApiResponse,
  CommentListPayloadType,
  CommentListResponseType,
  CreateCommentPayloadType,
  CreateCommentResponseType,
  DeleteCommentPayloadType,
  DeleteCommentResponseType,
  IChatPagination,
  ReplyListResponseType,
  ReplyOnCommentPayloadType,
} from "pages/comment/comment-box.model";
import { AppDispatch } from "src/redux/create-store";

export interface CollaborationStateType
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
}

const initialState: CollaborationStateType = {
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
};

export const fetchCommentList = (payload: CommentListPayloadType) => {
  const { fileId, sorting, minId, maxId, mergeResponse = false } = payload;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<CommentListApiResponse>(
        `${
          process.env.COMMENT_API_BASE_URL
        }/v1/presigned/comments/get-by-fileid?fileId=${fileId}&sorting=${sorting || 1}${
          mergeResponse ? `&topId=${maxId}` : ``
        }${mergeResponse ? `&bottomId=${minId}` : ``}`,
      );
      if (apiResponse.isSuccess) {
        const comments = apiResponse.data?.comment.filter((item) => item.level_no === 1) || [];
        const replies = apiResponse.data?.comment.filter((item) => item.level_no === 2) || [];
        if (mergeResponse) {
          const prevComments = _getState().collaboration.comments;
          const prevReplies = _getState().collaboration.replies;
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
        `${process.env.COMMENT_API_BASE_URL}/v1/presigned/comments/create`,
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
        `${process.env.COMMENT_API_BASE_URL}/v1/presigned/comments/create`,
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
        `${process.env.COMMENT_API_BASE_URL}/v1/presigned/comments/delete?commentId=${commentId}`,
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

const collaborationSlice = createSlice({
  name: "collaboration",
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
      state.commentPagination = {
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
} = collaborationSlice.actions;
export const collaborationReducer = collaborationSlice.reducer;
