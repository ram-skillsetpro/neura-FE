import React from "react";
import Modal from "react-modal";
import { AppModalType } from "./app-modal.model";
import "./app-modal.scss";

Modal.setAppElement("#root");

const AppModal: React.FC<AppModalType> = ({
  isOpen,
  onClose,
  onAfterOpen,
  children,
  className = "modal-container",
  overlayClassName = "modal-overlay",
  shouldCloseOnOverlayClick = false,
  onAfterClose = () => {},
}) => {
  return (
    <Modal
      onAfterClose={onAfterClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      isOpen={isOpen}
      onAfterOpen={onAfterOpen}
      onRequestClose={onClose}
      className={className}
      overlayClassName={overlayClassName}
    >
      {children}
    </Modal>
  );
};

export default AppModal;
