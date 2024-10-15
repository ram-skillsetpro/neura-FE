import DOMPurify from "dompurify";
import React, { useEffect, useRef, useState } from "react";
// import { IHighlight } from "react-pdf-highlighter";
import { useNavigate } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { MentionCustomForm } from "src/core/components/mentions/mentions-custom-form";
import DeleteIcon from "src/core/components/svg/delete-icon";
import PlusIcon from "src/core/components/svg/plus-icon";
import { useAppDispatch } from "src/core/hook";
import { convertKeysToCamel, getAuth, getShortUsername, getUsernameColor } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { IHighlight } from "src/pages/contract/components/pdf/types";
import { userSearchListPrecontract } from "src/pages/pre-contract/pre-contract.redux";
import { ConvertedReplyType, ReplyType } from "../comment-box.model";
import {
  deleteComment,
  fetchCommentList,
  replyOnComment,
  setContentHash,
} from "../comment-box.redux";

interface AnnotatedMessageType {
  comment: any;
  fileId: number;
  scrollToBottom: () => void;
  index: number;
  replies: Array<ReplyType>;
}

const AnnotatedMessage: React.FC<AnnotatedMessageType> = ({
  comment,
  fileId,
  scrollToBottom,
  index,
  replies,
}) => {
  const dispatch = useAppDispatch();
  const navigateTo = useNavigate();

  const isAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

  const messageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [message, setMessage] = useState<string>("");
  const [replyClicked, setReplyClicked] = useState<number>(-1);
  const [replyList, setReplyList] = useState<Array<ConvertedReplyType>>([]);

  const { userName, msgText, id: commentId, userId } = convertKeysToCamel(comment) || {};

  const msgObjString = JSON.parse(msgText);

  const { comment: messageObj, content } = msgObjString || {};

  const auth = getAuth();

  const handleReply = () => {
    setReplyClicked(commentId);
    if (index === 0) {
      scrollToBottom();
    }
  };

  const handleCancel = () => {
    setReplyClicked(-1);
    if (index === 0) {
      scrollToBottom();
    }
  };

  const handleDelete = () => {
    if (messageRef.current) {
      messageRef.current.style.opacity = "0.5";
    }

    dispatch(deleteComment({ commentId }));
    setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.style.opacity = "1";
      }
    }, 500);
  };

  const handleReplyDelete = (e: any, messageId: number) => {
    const parent = e.target.parentElement.closest(".reply-box");
    if (parent) {
      parent.style.opacity = "0.5";
    }
    dispatch(deleteComment({ commentId: messageId }));
    setTimeout(() => {
      if (parent) {
        parent.style.opacity = "1";
      }
    }, 500);
  };

  const handleSubmit = (e: any) => {
    if (e.keyCode === 13) {
      postReply();
    }
  };

  const postReply = async () => {
    if (message.trim()) {
      await dispatch(replyOnComment({ fileId, msgText: message, parentMsgId: commentId }));
      dispatch(fetchCommentList({ fileId }));
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setMessage("");
    } else {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const updateHash = (highlight: IHighlight) => {
    dispatch(setContentHash(`${highlight.id}`));
  };

  useEffect(() => {
    if (inputRef.current && replyClicked) {
      inputRef.current.focus();
    }
  }, [message, replyClicked]);

  useEffect(() => {
    if (replies && Array.isArray(replies)) {
      const replyList = replies.filter((reply) => reply.parent_msg_id === commentId) || [];

      setReplyList(
        replyList
          .reduce((list: Array<ReplyType>, reply: ReplyType) => {
            return [...list, convertKeysToCamel(reply)];
          }, [])
          .reverse(),
      );
    }
    setReplyClicked(-1);
  }, [replies]);

  const renderMessage = (message: any) => {
    const regex = /@\[([^[]+)]\((\d+)\)/g;
    if (regex.test(message)) {
      return message.replace(
        regex,
        (_: any, name: string, id: string) =>
          `<span class="highlight-${id === auth.profileId.toString() ? "current" : "other"
          }-user cursor-pointer" data-profile-id="${id}">@${name}</span>`,
      );
    } else {
      return message;
    }
  };

  const handleClickMentionedUser = (event: React.MouseEvent<HTMLSpanElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "SPAN" && target.getAttribute("data-profile-id")) {
      const id = target.getAttribute("data-profile-id");
      if (id) {
        handleUserProfile(id);
      }
    }
  };

  const handleUserProfile = (profileId: string) => {
    let UserCheck, buttonAction;
    if (auth) {
      if (auth.profileId.toString() === profileId) {
        UserCheck = true;
        buttonAction = true;
        navigateTo("/admin/settings", {
          state: { showData: UserCheck, buttonAction },
        });
      } else {
        UserCheck = !!isAdmin;
        buttonAction = false;
        navigateTo("/admin/settings", {
          state: { showData: UserCheck, buttonAction, profileId },
        });
      }
    }
  };

  const getUsers = async (query: string, callback: any) => {
    const users = (await dispatch(userSearchListPrecontract(query))) ?? [];
    const transformedUsers = users.map((user) => ({
      ...user,
      display: user.userName,
    }));
    callback(transformedUsers);
  };

  return (
    <>
      {auth.profileId === userId ? (
        <div className="send-message" ref={messageRef}>
          <div className="send-card">
            <div className="comment-user mb-2">
              <div className="ic-member" style={{ background: getUsernameColor(userName) || "" }}>
                {getShortUsername(userName)}
              </div>
              <div className="c-user-name ml-3">{userName}</div>
              <div className="grow"></div>
              <button onClick={handleDelete} className="add-btn button-tool-tip">
                <DeleteIcon />
                <div className="button-info">Discard message</div>
              </button>
            </div>
            <div
              title="View annotation"
              className="annotated-text"
              onClick={() => {
                updateHash(msgObjString);
              }}
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderMessage(messageObj?.text)),
                }}
                onClick={handleClickMentionedUser}
              ></p>
              <div
                className="annotated-message"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(renderMessage(content?.text)),
                }}
              ></div>
            </div>

            {/* reply section */}

            {Array.isArray(replyList) &&
              replyList.map((reply) => (
                <div className="flex mt-3 items-center" key={reply.id}>
                  <div className="received-card reply-box">
                    <div className="reply-msg-box-header">
                      <div className="comment-user mb-2">
                        <div
                          className="ic-member"
                          style={{ background: getUsernameColor(reply.userName || "") || "" }}
                        >
                          {getShortUsername(reply.userName || "")}
                        </div>
                        <div className="c-user-name ml-3">{reply.userName}</div>
                      </div>
                      <button
                        onClick={(e) => handleReplyDelete(e, reply.id || 0)}
                        className="add-btn button-tool-tip"
                      >
                        <DeleteIcon />
                        <div className="button-info">Discard reply</div>
                      </button>
                    </div>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(renderMessage(reply.msgText)),
                      }}
                      onClick={handleClickMentionedUser}
                    ></p>
                  </div>
                </div>
              ))}
            <div className="flex mt-3 items-center">
              {replyClicked === commentId ? (
                <button onClick={handleCancel} className="add-btn">
                  Cancel
                </button>
              ) : (
                <>
                  <button onClick={handleReply} className="add-btn">
                    <i className="plus-ic flex">
                      <PlusIcon />
                    </i>
                    Add
                  </button>
                </>
              )}
              <span className="grow" />
            </div>
            {replyClicked === commentId && (
              <div className="reply-form-container">
                <MentionCustomForm
                  value={message}
                  placeholder={"Type your message"}
                  data={getUsers}
                  onChange={(value) => setMessage(value)}
                  mentionClassName={""}
                  mentionInputClassName={"reply-area"}
                  onKeyDown={handleSubmit}
                />

                <button
                  type="button"
                  onClick={postReply}
                  className="button-red mt-2 rounded-12 sm-button tracking-wider font-bold uppercase"
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="received-message" ref={messageRef}>
          <div className="received-card">
            <div className="comment-user mb-2">
              <div className="ic-member" style={{ background: getUsernameColor(userName) || "" }}>
                {getShortUsername(userName)}
              </div>
              <div className="c-user-name ml-3">{userName}</div>
            </div>
            <p
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(renderMessage(msgText)),
              }}
              onClick={handleClickMentionedUser}
            ></p>

            {/* reply section */}

            {Array.isArray(replyList) &&
              replyList.map((reply) => (
                <div className="flex mt-3 items-center" key={reply.id}>
                  <div className="received-card reply-box">
                    <div className="reply-msg-box-header">
                      <div className="comment-user mb-2">
                        <div
                          className="ic-member"
                          style={{ background: getUsernameColor(reply.userName || "") || "" }}
                        >
                          {getShortUsername(reply.userName || "")}
                        </div>
                        <div className="c-user-name ml-3">{reply.userName}</div>
                      </div>
                      <button
                        onClick={(e) => handleReplyDelete(e, reply.id || 0)}
                        className="add-btn button-tool-tip"
                      >
                        <DeleteIcon />
                        <div className="button-info">Discard message</div>
                      </button>
                    </div>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(renderMessage(reply.msgText)),
                      }}
                      onClick={handleClickMentionedUser}
                    ></p>
                  </div>
                </div>
              ))}

            <div className="flex mt-3 items-center">
              {replyClicked === commentId ? (
                <button onClick={handleCancel} className="add-btn">
                  Cancel
                </button>
              ) : (
                <>
                  <button onClick={handleReply} className="add-btn button-tool-tip">
                    <i className="plus-ic flex">
                      <PlusIcon />
                    </i>
                    Add
                  </button>
                </>
              )}

              <span className="grow" />
              {isAdmin && (
                <button onClick={handleDelete} className="add-btn button-tool-tip">
                  <DeleteIcon />
                  <div className="button-info">Discard message</div>
                </button>
              )}
            </div>
            {replyClicked === commentId && (
              <div className="reply-form-container">
                <MentionCustomForm
                  value={message}
                  placeholder={"Type your message"}
                  data={getUsers}
                  onChange={(value) => setMessage(value)}
                  mentionClassName={""}
                  mentionInputClassName={"reply-area"}
                  onKeyDown={handleSubmit}
                />

                <button
                  type="button"
                  onClick={postReply}
                  className="button-red mt-2 rounded-12 sm-button tracking-wider font-bold uppercase"
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AnnotatedMessage;
