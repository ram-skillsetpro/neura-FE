import { MembersType } from "pages/manage-members/manage-members.model";
import React from "react";
import ReactDOM from "react-dom";
import "./member-details-modal.style.scss";

interface ModalProps {
  show: boolean;
  onCloseButtonClick: () => void;
  member: MembersType;
}

const Modal: React.FC<ModalProps> = ({ show, onCloseButtonClick, member }) => {
  if (!show) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="popup-containers" id="share-popup">
      <div className="popups">
        <div className="close-popups" onClick={onCloseButtonClick}></div>
        <div className="files-container-list">
          <div className="wrapper nobg">
            <p>Member Details</p>
            <hr />
          </div>
          <div className="wrapper member-details no-box-shadow">
            <div className="member-details-header">
              <div>
                <p>Name:</p>
              </div>
              <div>
                <p>Email:</p>
              </div>
              <div>
                <p>Phone:</p>
              </div>
              <div>
                <p>Company:</p>
              </div>
              <div>
                <p>Account Status:</p>
              </div>
            </div>
            <div className="member-details-data">
              <div>
                <p>{member.userName}</p>
              </div>
              <div>
                <p>{member.emailId}</p>
              </div>
              <div>
                <p>{member.phone}</p>
              </div>
              <div>
                <p>{member.companyName}</p>
              </div>
              <div>
                <p>{member.status ? "Active" : "InActive"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
