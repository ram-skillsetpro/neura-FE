import { useAppDispatch } from "core/hook";
import { renderUploadContainer } from "pages/user-dashboard/dashboard.redux";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PRE_CONTRACT,
  PRE_TEMPLATE,
  ROUTE_ADMIN,
  ROUTE_PRE_DRAFTS,
  ROUTE_PRE_MY_TEMPLATE,
  ROUTE_TEAMS_DRIVE,
  ROUTE_TEAM_FILES,
  ROUTE_USER_DASHBOARD,
  UPLOAD_AND_SIGN_LIST,
  USER_AUTHORITY,
} from "src/const";
import CreateTeamModal from "src/core/components/modals/create-team-modal/create-team-modal";
import { HttpClientOptions } from "src/core/services/http-client";
import { encodeFilePreContractKey } from "src/core/utils";
import { LS_FILES_FOLDERS_ROUTE } from "src/core/utils/constant";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { uploadFileAndSign } from "src/pages/pre-contract/pre-contract.redux";
interface UploadDropdownList {
  teamCreated?: () => void | undefined;
}

// const options = [
//   {
//     label: "Create Team",
//     isVisible: true,
//     labelText: "addFolder",
//   },
//   {
//     label: "New Folder",
//     isVisible: true,
//     labelText: "addFolder",
//   },
//   {
//     label: "New Contract",
//     isVisible: true,
//     labelText: "newContract",
//   },
//   {
//     label: "Upload a File",
//     isVisible: true,
//     labelText: "uploadFile",
//   },
//   {
//     label: "Upload a Folder",
//     isVisible: true,
//     labelText: "uploadFolder",
//   },
//   {
//     label: "Add from Google Drive or DropBox",
//     isVisible: true,
//     labelText: "addDriveFolder",
//   },
// ];

const UploadDropdown: React.FC<UploadDropdownList> = ({ teamCreated }) => {
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);
  const isUploadSign = useAuthorityCheck([USER_AUTHORITY.UPLOAD_SIGN]);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [openTeamCreate, setOpenTeamCreate] = useState<boolean>(false);

  const createTeamAuthority = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleClick = (value: string) => {
    dispatch(renderUploadContainer(value));
    toggleDropdown();
  };

  const handleCreateTeam = () => {
    setOpenTeamCreate(true);
  };

  const handleFocus = () => {
    teamCreated?.();
  };

  const handleFileChange = async (e: any) => {
    const options: HttpClientOptions = {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        const { loaded, total } = progressEvent;
        const percent = Math.floor((loaded * 100) / total);
        console.log(`Uploaded ${percent}%`);
      },
    };

    const obj = {
      file: e.target.files[0],
    };
    setDropdownOpen(false);
    const cid = await dispatch(uploadFileAndSign(obj, options));
    if (cid) {
      const encodedString = encodeFilePreContractKey({ contractId: cid });
      navigate("/admin/upload-and-sign?key=" + encodedString, { replace: true });
    }
  };

  const routeDataString = localStorage.getItem(LS_FILES_FOLDERS_ROUTE);

  return (
    <>
      <div className="relative drop-down-modal" ref={dropdownRef}>
        <button
          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
          onClick={toggleDropdown}
        >
          Create New
        </button>
        {isDropdownOpen && (
          <div className={`menu-card rounded-6 ${isDropdownOpen ? "is-open" : ""}`}>
            <ul>
              {createTeamAuthority &&
                location.pathname.includes(ROUTE_TEAMS_DRIVE) &&
                !location.pathname.includes(ROUTE_TEAM_FILES) &&
                !routeDataString && (
                  <li className="create-icon cursor-pointer" onClick={handleCreateTeam}>
                    Create Team
                  </li>
                )}
              {!location.pathname.includes(ROUTE_TEAMS_DRIVE) && (
                <>
                  {!location.pathname.includes(ROUTE_PRE_DRAFTS) &&
                    !location.pathname.includes(UPLOAD_AND_SIGN_LIST) &&
                    !location.pathname.includes(ROUTE_PRE_MY_TEMPLATE) && (
                      <li
                        className="upload-icon cursor-pointer"
                        onClick={() => handleClick("uploadFile")}
                      >
                        Upload a File
                        {/* <div className="file-upload-link">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                />
              </div> */}
                      </li>
                    )}
                  {!location.pathname.includes(ROUTE_PRE_DRAFTS) &&
                    !location.pathname.includes(UPLOAD_AND_SIGN_LIST) &&
                    !location.pathname.includes(ROUTE_PRE_MY_TEMPLATE) && (
                      <li
                        className="upload-icon cursor-pointer"
                        onClick={() => handleClick("uploadFolder")}
                      >
                        Upload a Folder
                        {/* <div className="file-upload-link">
                <input type="file" />
              </div> */}
                      </li>
                    )}
                  {!location.pathname.includes(ROUTE_PRE_DRAFTS) &&
                    !location.pathname.includes(UPLOAD_AND_SIGN_LIST) &&
                    !location.pathname.includes(ROUTE_PRE_MY_TEMPLATE) && (
                      <li
                        className="create-icon cursor-pointer"
                        onClick={() => handleClick("addFolder")}
                      >
                        New Folder
                      </li>
                    )}
                  {!location.pathname.includes(ROUTE_PRE_DRAFTS) &&
                    !location.pathname.includes(UPLOAD_AND_SIGN_LIST) &&
                    !location.pathname.includes(ROUTE_PRE_MY_TEMPLATE) && (
                      <li
                        className="create-icon cursor-pointer"
                        onClick={() => handleClick("addDriveFolder")}
                      >
                        Add from Google Drive or DropBox
                      </li>
                    )}
                  {isContractCreator && !location.pathname.includes(UPLOAD_AND_SIGN_LIST) && (
                    <>
                      <li
                        className="create-icon cursor-pointer"
                        onClick={() => {
                          handleClick("newContract");
                          navigate(`/${ROUTE_ADMIN}/${PRE_CONTRACT}`);
                        }}
                      >
                        New Contract
                      </li>
                    </>
                  )}
                  {isUploadSign &&
                    (location.pathname.includes(UPLOAD_AND_SIGN_LIST) ||
                      location.pathname.includes(ROUTE_TEAM_FILES) ||
                      location.pathname.includes(ROUTE_USER_DASHBOARD)) && (
                      <li className="upload-icon cursor-pointer">
                        Upload and Sign
                        <div className="file-upload-link">
                          <input type="file" onChange={handleFileChange} accept="application/pdf" />
                        </div>
                      </li>
                    )}
                  {isContractCreator &&
                    !location.pathname.includes(UPLOAD_AND_SIGN_LIST) &&
                    !location.pathname.includes(ROUTE_TEAM_FILES) &&
                    !location.pathname.includes(ROUTE_USER_DASHBOARD) && (
                      <li
                        className="create-icon cursor-pointer"
                        onClick={() => {
                          navigate(`/${ROUTE_ADMIN}/${PRE_TEMPLATE}`);
                        }}
                      >
                        New Template
                      </li>
                    )}
                </>
              )}
            </ul>
          </div>
        )}
      </div>
      {openTeamCreate && (
        <CreateTeamModal
          isOpen={openTeamCreate}
          onClose={() => setOpenTeamCreate(false)}
          shouldCloseOnOverlayClick={true}
          focusMove={() => handleFocus()}
        />
      )}
    </>
  );
};

UploadDropdown.propTypes = {
  teamCreated: PropTypes.func,
};

export default UploadDropdown;
