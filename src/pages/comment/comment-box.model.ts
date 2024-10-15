export interface ApiResponse {
  message: string;
  response: string;
  status: number;
}

export interface CreateCommentResponseType {
  createCommentResponse: number;
}

export interface DeleteCommentResponseType {
  deleteCommentResponse: number;
}

export interface CommentListApiResponse {
  comment: Array<CommentType>;
  maxCommentId: number;
  minCommentId: number;
}

export interface CommentType {
  msgType: string;
  msg_type: string;
  id: number;
  file_id: number;
  msg_text: string;
  level_no: number;
  parent_msg_id: number;
  create_epoch: number;
  user_id: number;
  user_name: string;
  edit_epoch: number;
  reply_count: number;
}

export interface ReplyType {
  id?: number;
  file_id?: number;
  msg_text?: string;
  level_no?: number;
  parent_msg_id?: number;
  create_epoch?: number;
  user_id?: number;
  user_name?: string;
  edit_epoch?: number;
  reply_count?: number;
}

export interface ConvertedReplyType {
  id?: number;
  fileId?: number;
  msgText?: string;
  levelNo?: number;
  parentMsgId?: number;
  createEpoch?: number;
  userId?: number;
  userName?: string;
  editEpoch?: number;
  replyCount?: number;
}

export interface CommentListPayloadType {
  fileId: number;
  sorting?: number;
  minId?: number;
  maxId?: number;
  mergeResponse?: boolean;
}

export interface CommentListResponseType {
  comments: Array<CommentType>;
}

export interface ReplyListResponseType {
  replies: Array<CommentType>;
}

export interface CreateCommentPayloadType {
  fileId: number;
  msgText: string;
  msgType: string;
}

export interface DeleteCommentPayloadType {
  commentId: number;
}

export interface ReplyOnCommentPayloadType {
  fileId: number;
  msgText: string;
  parentMsgId?: number;
}

export interface CreateAnnotationCommentPayloadType {
  fileId: number;
  messageText: string;
}

export interface FetchAnnotationCommentPayloadType {
  fileId: number;
}

export interface ApiAnnotationCommentResponse {
  comment: Array<any>;
}

export interface DeleteAnnotationCommentPayloadType {
  commentId: number;
  fileId: number;
}

export interface PromptChatType {
  id: number;
  file_id: number;
  msg_text: string;
  level_no: number;
  parent_msg_id: number;
  create_epoch: number;
  user_id: number;
  user_name: string;
  edit_epoch: number;
  reply_count: number;
}

export interface PromptChatListApiResponse {
  promptChats: Array<PromptChatType>;
  maxCommentId: number;
  minCommentId: number;
}

export interface PromptChatReplyApiResponse {
  promptChats: Array<PromptChatType>;
}

export interface IChatPagination {
  minId: number;
  maxId: number;
}
