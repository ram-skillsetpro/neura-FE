import { useAppSelector } from "core/hook";
import { AnimatePresence, motion } from "framer-motion";
import CalenderComponent from "pages/contract/components/contract-calender";
import RightSideBar from "pages/contract/right-section/right-sidebar";
import React from "react";
import { useSearchParams } from "react-router-dom";
import NotificationStack from "src/core/components/notification/notification-stack";
import PromptChat from "src/core/components/prompt-chat/prompt-chat";
import { decodeFileKey } from "src/core/utils";
import CommentBox from "src/pages/comment/comment-box";
import ContractExcerptsContainer from "./contract-excerpts-container/contract-excerpts-container";
import Playbook from "./playbook/playbook";

const RightSection: React.FC = () => {
  const tabName = useAppSelector((state) => state.headerSearchContract.activeContractTab);
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const { fileId, folderId, teamId, fileName } = decodeFileKey(key || "");

  const renderTabContent = () => {
    switch (tabName) {
      // Add cases for tabs here
      case "summary":
        return <RightSideBar />;
      case "comments":
        return <CommentBox />;
      case "calendar":
        return <CalenderComponent fileId={fileId} folderId={folderId} teamId={teamId} />;
      case "playbook":
        return <Playbook fileId={fileId} folderId={folderId} teamId={teamId} />;
      case "prompt":
        return <PromptChat />;
      case "snippets":
      case "redact":
        return (
          <ContractExcerptsContainer
            fileId={fileId}
            folderId={folderId}
            teamId={teamId}
            fileName={fileName}
          />
        );
      default:
        return <RightSideBar />;
    }
  };
  return (
    <div className="right-section">
      <NotificationStack />
      {/* <div className="right-section-inner"> */}
      <AnimatePresence mode="wait">
        <motion.div
          className={`right-section-inner ${tabName === "prompt" ? "scroll-custom" : ""}`}
          key={tabName}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
    // </div>
  );
};

export default RightSection;
