import { MentionCustomForm } from "core/components/mentions/mentions-custom-form";
import { useAppDispatch, useAppSelector } from "core/hook";
import { Toaster } from "core/models/toaster.model";
import { AnimatePresence, motion } from "framer-motion";
import AnnotatedMessage from "pages/comment/components/annotated-message";
import { userSearchListPrecontract } from "pages/pre-contract/pre-contract.redux";
import {
  clearCommentList,
  clearCreateCommentResponse,
  clearDeleteCommentResponse,
  createComment,
  fetchCommentList,
} from "pages/pre-contract/right-section-preContract/collaboration-component/collaboration.redux";
import PreCommentItem from "pages/pre-contract/right-section-preContract/collaboration-component/pre-comment-item.component";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MESSAGE_TYPE, TOAST } from "src/const";
import "./collaboration.styles.scss";

interface CollaborationType {}

const Collaboration: React.FC<CollaborationType> = () => {
  const dispatch = useAppDispatch();
  const stage = useAppSelector((state) => state.preContract.activeStagePreContract);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const commentListRef = useRef<HTMLDivElement | null>(null);

  const [message, setMessage] = useState<string>("");
  const [top, setTop] = useState<boolean>(false);

  const fileId = useAppSelector((state) => state.preContract.contractId);
  const {
    comments,
    errorMessage,
    createCommentResponse,
    deleteCommentResponse,
    replies,
    commentPagination,
  } = useAppSelector((state) => state.collaboration);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (commentListRef.current) {
        commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
      }
    }, 500);
  };

  const handleSubmit = (e: any) => {
    if (e.keyCode === 13) {
      postComment(e);
    }
  };

  const postComment = (e: any) => {
    e && e.preventDefault();
    if (message.trim()) {
      dispatch(createComment({ fileId, msgText: message, msgType: MESSAGE_TYPE.COMMENT }));
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const fetchMoreComment = useCallback(
    (minId: number, maxId: number) => {
      dispatch(fetchCommentList({ fileId, minId, maxId, mergeResponse: true }));
    },
    [top],
  );

  const handleScroll = () => {
    const scrollTop = commentListRef.current?.scrollTop;
    if (
      Math.abs(Math.ceil(scrollTop || 0)) >
      Math.abs(
        (commentListRef.current?.scrollHeight || 0) -
          (commentListRef.current?.clientHeight || 0) -
          10,
      )
    ) {
      setTop(true);
    } else {
      setTop(false);
    }
  };

  const handleOnChange = (value: string) => {
    setMessage(value);
  };

  const getUsers = async (query: string, callback: any) => {
    const users = (await dispatch(userSearchListPrecontract(query))) ?? [];
    const transformedUsers = users.map((user) => ({
      ...user,
      display: user.userName,
    }));
    callback(transformedUsers);
  };

  useEffect(() => {
    fileId && dispatch(fetchCommentList({ fileId }));
    return () => {
      dispatch(clearCommentList());
    };
  }, [fileId]);

  useEffect(() => {
    if (errorMessage) {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: errorMessage,
          },
        }),
      );
    }
  }, [errorMessage]);

  useEffect(() => {
    if (createCommentResponse === 200) {
      dispatch(fetchCommentList({ fileId }));
      scrollToBottom();
    }

    setMessage("");
    dispatch(clearCreateCommentResponse());

    return () => {
      dispatch(clearCreateCommentResponse());
    };
  }, [createCommentResponse]);

  useEffect(() => {
    if (deleteCommentResponse === 200) {
      dispatch(fetchCommentList({ fileId }));
      scrollToBottom();
    }
    dispatch(clearDeleteCommentResponse());

    return () => {
      dispatch(clearDeleteCommentResponse());
    };
  }, [deleteCommentResponse]);

  useEffect(() => {
    if (top) {
      const { minId, maxId } = commentPagination;
      fetchMoreComment(minId, maxId);
    }
  }, [top]);

  useEffect(() => {
    if (commentListRef.current) {
      const el = commentListRef.current;
      el.addEventListener("scroll", handleScroll);

      return () => {
        el.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <>
      {comments.length ? (
        <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
          Comments
        </h4>
      ) : null}

      <div
        className="right-tab-content tab-comment tab-collaboration"
        ref={commentListRef}
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        <div className="right-tab-content-inner">
          {comments.length ? (
            <AnimatePresence mode="wait">
              <motion.div
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`${stage === 6 ? "comment-sec comment-sec-6" : "comment-sec"}`}
                  style={{ display: "flex", flexDirection: "column-reverse" }}
                >
                  {Array.isArray(comments) &&
                    comments.map((comment, index) =>
                      comment.msg_type === MESSAGE_TYPE.ANNOTATED_COMMENT ? (
                        <AnnotatedMessage
                          key={index}
                          comment={comment}
                          fileId={fileId}
                          scrollToBottom={scrollToBottom}
                          index={index}
                          replies={replies}
                        />
                      ) : (
                        <PreCommentItem
                          key={index}
                          comment={comment}
                          fileId={fileId}
                          scrollToBottom={scrollToBottom}
                          index={index}
                          replies={replies}
                          disabled={stage === 6}
                        />
                      ),
                    )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            ""
          )}
          {stage > 1 && stage < 6 && (
            <AnimatePresence mode="wait">
              <motion.div
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div
                  className={`${
                    comments.length ? "comment-form-sec fixed-comment" : "comment-form-sec"
                  }`}
                >
                  {comments.length ? (
                    ""
                  ) : (
                    <motion.h4
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="fs10 uppercase text-defaul-color tracking-wider font-normal cml pb-1"
                    >
                      Comments
                    </motion.h4>
                  )}
                  <form>
                    <div className="mb-2">
                      <MentionCustomForm
                        value={message}
                        placeholder={"Add a comment"}
                        data={getUsers}
                        onChange={handleOnChange}
                        mentionClassName={""}
                        mentionInputClassName={""}
                        onKeyDown={handleSubmit}
                        disabled={stage === 6}
                      />
                    </div>
                    <div className="ml-2">
                      <button
                        type="button"
                        onClick={postComment}
                        className="button-red rounded-12 sm-button tracking-wider font-bold uppercase"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
};

export default Collaboration;
