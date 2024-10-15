import dotLoader from "assets/images/dot-loader.gif";
import RightArrow from "assets/images/icon-right-arrow.svg";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { convertKeysToCamel } from "src/core/utils";
import {
  fetchAllPromptChats,
  fetchPrePromptQuestions,
  fetchPromptReply,
  postPromptChat,
  resetPrePromptQuestionsTimer,
  setPrePromptQuestions,
  setPrePromptQuestionsTimer,
  setPromptChatSentResponse,
  setPromptChats,
  setPromptReply,
} from "src/pages/comment/comment-box.redux";
import PromptMessageItem from "./prompt-message-item";

const PromptChat: React.FC = () => {
  /* Hooks */
  const dispatch = useAppDispatch();

  /* Redux State */
  const { fileId } = useAppSelector((state) => state.contract);
  const {
    promptChats,
    promptChatSentResponse,
    promptReply,
    promptChatPagination,
    prePromptQuestions,
    promptError,
  } = useAppSelector((state) => state.commentBox);

  /* Refs */
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const commentListRef = useRef<HTMLDivElement | null>(null);

  /* Local State */
  const [message, setMessage] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);
  const [top, setTop] = useState<boolean>(false);
  const [togglePromptQuestionState, setTogglePromptQuestionState] = useState<boolean>(false);
  const [timerRef, setTimerRef] = useState(null);

  /* Functions */
  const scrollToBottom = () => {
    setTimeout(() => {
      if (commentListRef.current) {
        commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
      }
    }, 500);
  };

  const postComment = async (e: any, msg: string = "") => {
    e.preventDefault();

    const pMsg = msg && msg !== "" ? msg : message;

    if (pMsg.trim()) {
      const status = await dispatch(postPromptChat({ fileId, msgText: pMsg }));
      if (status) {
        setTyping(true);
      }
      if (inputRef.current) {
        inputRef.current.focus();
        setMessage("");
        scrollToBottom();
      }
    }
  };

  const polling = (callback: (clearInterval: any) => void, timeInterval: number) => {
    const interval = setInterval(() => {
      callback(interval);
    }, timeInterval);
  };

  const handleSubmit = (e: any) => {
    if (e.keyCode === 13) {
      postComment(e);
    }
  };

  const fetchMoreComment = useCallback(
    (minId: number, maxId: number) => {
      dispatch(fetchAllPromptChats({ fileId, minId, maxId, mergeResponse: true }));
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

  const getPrePromptQuestions = (delay: number = 0) => {
    dispatch(resetPrePromptQuestionsTimer());
    scrollToBottom();
    const timer1 = setTimeout(async () => {
      setTyping(true);
      await dispatch(fetchPrePromptQuestions({ fileId }));
      setTyping(false);
      scrollToBottom();
    }, delay);

    dispatch(setPrePromptQuestionsTimer(timer1));
  };

  const togglePromptQuestions = () => {
    setTogglePromptQuestionState(!togglePromptQuestionState);
  };

  const clearPrePromptQuestion = () => {
    setTogglePromptQuestionState(false);
    dispatch(resetPrePromptQuestionsTimer());
    dispatch(setPrePromptQuestions([]));
  };

  /* Effects */
  useEffect(() => {
    fileId && dispatch(fetchAllPromptChats({ fileId }));
    return () => {
      dispatch(setPromptChats([]));
      dispatch(setPromptReply([]));
      dispatch(setPromptChatSentResponse(null));
      timerRef && clearInterval(timerRef);
    };
  }, [fileId]);

  useEffect(() => {
    if (promptChatSentResponse) {
      dispatch(setPromptChats([promptChatSentResponse, ...promptChats]));

      polling((interval) => {
        setTimerRef(interval);
        const { id, fileId } = convertKeysToCamel(promptChatSentResponse) || {};
        dispatch(fetchPromptReply({ questionId: id, fileId }));
      }, 2000);
    }
  }, [promptChatSentResponse]);

  useEffect(() => {
    if (promptReply.length) {
      dispatch(setPromptChatSentResponse(null));
      dispatch(setPromptChats([...promptReply, ...promptChats]));
      dispatch(setPromptReply([]));
      scrollToBottom();
    }
  }, [promptReply]);

  useEffect(() => {
    if (timerRef && promptReply.length) {
      clearInterval(timerRef);
      setTyping(false);
    }
  }, [timerRef, promptReply]);

  useEffect(() => {
    if (top) {
      const { minId, maxId } = promptChatPagination;
      fetchMoreComment(minId, maxId);
    }
  }, [top]);

  useEffect(() => {
    if (togglePromptQuestionState) {
      getPrePromptQuestions();
    } else {
      clearPrePromptQuestion();
    }
  }, [togglePromptQuestionState]);

  useEffect(() => {
    if (commentListRef.current) {
      const el = commentListRef.current;
      el.addEventListener("scroll", handleScroll);

      getPrePromptQuestions(5000);

      return () => {
        el.removeEventListener("scroll", handleScroll);
        clearPrePromptQuestion();
      };
    }
  }, []);

  useEffect(() => {
    if (message.length > 0) {
      clearPrePromptQuestion();
    }
  }, [message]);

  return (
    <div
      className="right-section-inner scroll-custom"
      style={{ display: "flex", flexDirection: "column-reverse" }}
      ref={commentListRef}
    >
      <div className="prompt-right-wrap">
        <div className="prompt-right-sec">
          <AnimatePresence mode="wait">
            <motion.div
              className="comment-sec prompt-comment-sec"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ display: "flex", flexDirection: "column-reverse" }}
            >
              {typing ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    className="received-message"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div
                      className="received-card"
                      style={{ width: "fit-content", padding: "0px 8px", paddingTop: "3px" }}
                    >
                      <img style={{ width: "50px" }} src={dotLoader} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                ""
              )}
              <div className="pre-ques-sec">
                <div className="prompt-pre-question rounded-6">
                  {Array.from(prePromptQuestions || []).length ? (
                    <AnimatePresence mode="wait">
                      <motion.ul
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      >
                        {prePromptQuestions.map((question: string, index: number) => (
                          <li
                            key={index}
                            onClick={(e) => {
                              postComment(e, question);
                              clearPrePromptQuestion();
                            }}
                          >
                            <a className="flex">
                              {question}
                              <span className="grow"></span>
                              <button className="forward-btn">
                                <img src={RightArrow} />
                              </button>
                            </a>
                          </li>
                        ))}
                      </motion.ul>
                    </AnimatePresence>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              {Array.isArray(promptChats) &&
                promptChats.map((chat) => <PromptMessageItem key={chat.id} chat={chat} />)}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="comment-form-sec fixed-comment">
                {promptError && (
                  <motion.div
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div style={{ padding: "4px 10px", fontSize: "14px", color: "#ff6968" }}>
                      {promptError}
                    </div>
                  </motion.div>
                )}
                <form onSubmit={postComment}>
                  <div className="mb-2 relative">
                    <div className="pre-ques-btn" onClick={togglePromptQuestions}></div>

                    <textarea
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a question"
                      className="text-area rounded-6"
                      onKeyDown={handleSubmit}
                      style={{ paddingRight: "28px" }}
                      onFocus={() => dispatch(resetPrePromptQuestionsTimer())}
                    />
                  </div>
                  <div className="ml-2">
                    <button
                      type="submit"
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
        </div>
      </div>
    </div>
  );
};

export default PromptChat;
