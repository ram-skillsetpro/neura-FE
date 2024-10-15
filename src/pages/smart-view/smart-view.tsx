import "assets/css/V3/_search-result.scss";
import DeleteFileModal from "core/components/modals/delete-file-modal/delete-file-modal";
import ShareUserModal from "core/components/modals/share-file-modal/share-file-modal";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import {
  getAuth,
  getFileIcon,
  getShortUsername,
  getUsernameColor,
  removeHtmlTags,
} from "src/core/utils";
import { formatDateWithOrdinal, sharedUsersCount } from "src/core/utils/constant";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import {
  contractReducer,
  fetchSmartView,
  handleFileToOpen,
} from "src/pages/contract/contract.redux";

import { teamReducer } from "src/pages/manage-team/team.redux";
import {
  dashboardReducer,
  getSharedFile,
  getSharedFileSender,
} from "src/pages/user-dashboard/dashboard.redux";
import { FileType } from "../user-dashboard/dashboard.model";
import AggrFilter from "./components/aggr-filter";

const SmartView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterData, setFilterData] = useState<any>(null);
  const auth = getAuth();

  const {
    smartViewResult: searchList,
    smartViewTotalCount,
    isLoading,
  } = useAppSelector((state) => state.contract);

  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const smartViewAuthorityCheck = useAuthorityCheck([USER_AUTHORITY.SMART_FOLDER_USER]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeFileOption, setActiveFileOption] = useState(-1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFileOption = (e: any, index: number) => {
    e.stopPropagation();
    setActiveFileOption(index);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  // const highlightEmTags = (content: string) => {
  //   const emTagRegex = /<em\s+class="hlt1">([^<]+)<\/em>/gi;
  //   return content.replace(emTagRegex, (_, match) => `<span class="highlighted">${match}</span>`);
  // };

  const handleUserProfile = (data: number) => {
    const authData = localStorage.getItem("auth");
    let UserCheck, buttonAction;
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.profileId === data) {
        UserCheck = true;
        buttonAction = true;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction },
        });
      } else {
        UserCheck = !!roleSuperAdmin;
        buttonAction = false;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction, profileId: data },
        });
      }
    }
  };

  const getSharedWithUser = (user: {
    isAdmin: number;
    id: number;
    userName: string;
    logoUrl: string;
  }) => {
    return (
      <li key={user.id} onClick={() => handleUserProfile(user.id)}>
        <div
          className="ic-member tool-tip-wrap"
          style={{
            backgroundColor:
              user?.logoUrl === "" ? getUsernameColor(user.userName) || "" : "initial",
          }}
        >
          {user?.logoUrl !== "" ? <img src={user.logoUrl} /> : `${getShortUsername(user.userName)}`}
          <div className="tool-tip-card rounded-6">
            <div className="block font-bold">{user.userName}</div>
            {user.isAdmin === 1 ? "Admin" : "User"}
          </div>
        </div>
      </li>
    );
  };

  const handleLoadMore = async (newPage: number) => {
    if (newPage >= 1 && (newPage - 1) * 10 <= smartViewTotalCount) {
      setCurrentPage(newPage);
      const payload = {
        pno: newPage,
        ...filterData,
      };
      dispatch(fetchSmartView(payload));
    }
  };

  useEffect(() => {
    smartViewAuthorityCheck && dispatch(fetchSmartView({ pno: 1, loadFilter: true }));
  }, [smartViewAuthorityCheck]);

  const handleFilter = async (filter: any, reset: boolean = false) => {
    const {
      CONTRACT_TYPE_AGG,
      CREDIT_DURATION_RANGE,
      EFFECTIVE_MONTH_YEAR_AGG,
      EFFECTIVE_YEAR_AGG,
      FIRST_PARTY_AGG,
      JURISDICTION_AGG,
      LIABILITY_RANGE,
      SECOND_PARTY_AGG,
      TERMINATION_MONTH_YEAR_AGG,
      TERMINATION_YEAR_AGG,
    } = filter || {};
    const contractType = CONTRACT_TYPE_AGG.map((data: any) => data.key);
    const creditDuration = CREDIT_DURATION_RANGE.map((data: any) => data.key);
    const effectiveMonth = EFFECTIVE_MONTH_YEAR_AGG.map((data: any) => data.key);
    const effectiveYear = EFFECTIVE_YEAR_AGG.map((data: any) => data.key);
    const firstParty = FIRST_PARTY_AGG.map((data: any) => data.key);
    const jurisdiction = JURISDICTION_AGG.map((data: any) => data.key);
    const liability = LIABILITY_RANGE.map((data: any) => data.key);
    const secondParty = SECOND_PARTY_AGG.map((data: any) => data.key);
    const terminationMonth = TERMINATION_MONTH_YEAR_AGG.map((data: any) => data.key);
    const terminationYear = TERMINATION_YEAR_AGG.map((data: any) => data.key);

    setFilterData({
      contractType,
      creditDuration,
      effectiveMonth,
      effectiveYear,
      firstParty,
      jurisdiction,
      liability,
      secondParty,
      terminationMonth,
      terminationYear,
    });

    const payload = !reset
      ? {
          pno: 1,
          contractType,
          creditDuration,
          effectiveMonth,
          effectiveYear,
          firstParty,
          jurisdiction,
          liability,
          secondParty,
          terminationMonth,
          terminationYear,
        }
      : { pno: 1, loadFilter: true };

    const status = await dispatch(fetchSmartView(payload));
    if (status && !reset) {
      dispatch(setFilterActive(true));
    }
  };

  const [shareModal, setShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType>();
  const [deleteFile, setDeleteFile] = useState(false);

  const handleShareFileDialogOpen = async (file: any) => {
    await dispatch(getSharedFile(file.fileId));
    await dispatch(getSharedFileSender(1));
    setShareModal(true);
    setActiveFileOption(-1);
    setSelectedFile(file);
  };

  const handleDeleteFile = (file: any) => {
    setActiveFileOption(-1);
    setDeleteFile(true);
    setSelectedFile(file);
  };

  const handleCloseShareModal = async () => {
    setShareModal(false);
    setSelectedFile(undefined);
  };

  const handleCloseDeleteModal = async () => {
    const payload = {
      pno: currentPage,
      mergeResponse: true,
    };
    dispatch(fetchSmartView(payload));
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  return (
    <>
      {/* {isLoading && <Loader />} */}
      <div className="left-section left-divider-sec" style={{ paddingLeft: 0 }}>
        <div className="left-section-inner">
          {/* breadcrum and Filter section start here */}

          <div className="sticky-search">
            <div className="page-breadcrum mb-3 ">
              <ul className="breadcrum-ul">
                <li className="list">
                  <a href="#">Smart View</a>
                </li>
              </ul>
            </div>
            <div className="filter-sec">
              <AggrFilter handleFilter={handleFilter} />
              <span className="grow" />
            </div>
          </div>

          {/* This month section start here */}
          <section className="mb-5 search-container-1">
            {searchList?.length === 0 ? (
              <h2 className="fs10 mb-5 text-defaul-color font-normal tracking-wider uppercase ml-3">
                {isLoading ? "Loading..." : "No files found!"}
              </h2>
            ) : (
              <>
                <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
                  My Search
                </h2>
                {(searchList?.length > 0 || searchList?.length === 0) &&
                  searchList.map((fileItem, index) => {
                    // const sanitizedHTML = DOMPurify.sanitize(fileItem.txt);
                    const sanitizedHTMLFileName = DOMPurify.sanitize(fileItem.filename);

                    return (
                      <div key={index} className="search-result-card rounded-6 mb-4">
                        <div className="search-result-row">
                          {/* <div className="search-result-checkbox-sec fs10 uppercase">
                            <input type="checkbox" />
                          </div> */}
                          <div className="search-result-name fs10 uppercase left-space tracking-wider">
                            Name
                          </div>
                          <div className="search-result-modified fs10 uppercase tracking-wider">
                            Last Modified
                          </div>
                          <div className="search-result-shared fs10 uppercase tracking-wider">
                            Shared with
                          </div>
                          <div
                            className="search-result-shared fs10 uppercase tracking-wider"
                            style={{ textAlign: "right" }}
                          >
                            Action
                          </div>
                        </div>

                        <div className="search-info">
                          {/* Content first row start here */}
                          <div className="search-result-row">
                            {/* <div className="search-result-checkbox-sec fs12">
                              <input type="checkbox" />
                            </div> */}
                            <div className="search-result-name fs12">
                              <div className="flex items-center">
                                <i className="search-s20 mr-4 ml-3">
                                  <img
                                    src={require(
                                      // eslint-disable-next-line max-len
                                      `assets/images/icon-${getFileIcon(removeHtmlTags(fileItem.filename), fileItem.mimeType)}.svg`,
                                    )}
                                  />
                                </i>
                                <p
                                  className="smart-truncate1 lh2 cursor-pointer"
                                  onClick={() =>
                                    dispatch(
                                      handleFileToOpen({
                                        id: fileItem.fileId,
                                        teamId: fileItem.teamId,
                                        folderId: fileItem.folderId,
                                        fileName: removeHtmlTags(fileItem.filename),
                                        createdBy: fileItem.createdById,
                                        mimeType: fileItem.mimeType,
                                      }),
                                    )
                                  }
                                  key={index}
                                  dangerouslySetInnerHTML={{ __html: sanitizedHTMLFileName }}
                                ></p>
                              </div>
                            </div>
                            <div className="search-result-modified fs12">{`${formatDateWithOrdinal(
                              new Date(fileItem.updatedDate * 1000),
                            )}`}</div>
                            <div className="search-result-shared fs12">
                              <div className="flex">
                                <div className="file-list-shared fs12">
                                  <div className="flex">
                                    <div className="sharing-members li-overlap">
                                      <ul>
                                        {!Array.from(fileItem.sharedWith || []).length && "-"}
                                        {fileItem.sharedWith?.length <= sharedUsersCount
                                          ? fileItem?.sharedWith?.map((user: any) =>
                                              getSharedWithUser(user),
                                            )
                                          : fileItem?.sharedWith
                                              ?.slice(0, sharedUsersCount)
                                              .map((user: any) => getSharedWithUser(user))}
                                        {fileItem.sharedWith?.length > sharedUsersCount && (
                                          <li>
                                            <div className="share-list-wrap">
                                              <div className="shared-all">
                                                +{fileItem.sharedWith?.length - sharedUsersCount}
                                              </div>
                                              <div className="shared-all-list">
                                                {fileItem.sharedWith
                                                  ?.slice(
                                                    -(
                                                      fileItem.sharedWith?.length - sharedUsersCount
                                                    ),
                                                  )
                                                  .map((user: any) => (
                                                    <div
                                                      className="shared-all-row fs11 font-bold items-center"
                                                      key={user.id}
                                                    >
                                                      <i className="u-img-size mr-4 rounded-full">
                                                        {user?.logoUrl !== "" ? (
                                                          <img src={user.logoUrl} />
                                                        ) : (
                                                          <div
                                                            className="ic-member"
                                                            style={{
                                                              backgroundColor:
                                                                user?.logoUrl === ""
                                                                  ? getUsernameColor(
                                                                      user.userName,
                                                                    ) || ""
                                                                  : "initial",
                                                            }}
                                                          >
                                                            {user?.userName !== "" &&
                                                              getShortUsername(user.userName)}
                                                          </div>
                                                        )}
                                                      </i>
                                                      <span className="truncate-line1">
                                                        {user.userName}
                                                      </span>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className="search-result-action file-list-action"
                              style={{ position: "relative" }}
                            >
                              <button
                                className="icon-option-dot"
                                onClick={(e) => handleFileOption(e, fileItem.fileId)}
                              ></button>
                              {activeFileOption === fileItem.fileId && (
                                <div className="dropdown-container">
                                  <div className="dropdown-box">
                                    <ul>
                                      {/* {fileItem.processStatus === 3 && */}
                                      {fileItem.createdById === auth.profileId ? (
                                        <li
                                          onClick={() => handleShareFileDialogOpen(fileItem)}
                                          className="border-bottom"
                                        >
                                          Share
                                        </li>
                                      ) : (
                                        <li className={"file-not-ready-to-share border-bottom"}>
                                          Share
                                        </li>
                                      )}

                                      <li
                                        className={`border-bottom ${
                                          auth.profileId !== fileItem.createdById && "disabled"
                                        }`}
                                        onClick={() =>
                                          auth.profileId !== fileItem.createdById
                                            ? () => {}
                                            : handleDeleteFile(fileItem)
                                        }
                                      >
                                        Delete
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="notch"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Content first row end here */}
                          {/* <div className="search-snippet">
                            <p
                              key={index}
                              dangerouslySetInnerHTML={{
                                __html: highlightEmTags(`...${sanitizedHTML}`),
                              }}
                            ></p>
                          </div> */}
                          <div className="file-item-table">
                            <table className="search-info-list">
                              <thead>
                                <tr>
                                  <th className="name">
                                    <p>First Party</p>
                                  </th>
                                  <th className="name">
                                    <p>Second Party</p>
                                  </th>
                                  <th className="number">
                                    <p>Jurisdiction</p>
                                  </th>
                                  <th className="number">
                                    <p>Effective Date</p>
                                  </th>
                                  <th className="number">
                                    <p>Termination Date</p>
                                  </th>
                                  <th className="number">
                                    <p>Execution Date</p>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="name">
                                    <p>{`${fileItem.firstParty ? fileItem.firstParty : "-"}`}</p>
                                  </td>
                                  <td className="name">
                                    <p>{`${fileItem.secondParty ? fileItem.secondParty : "-"}`}</p>
                                  </td>
                                  <td className="number">
                                    <p>{`${
                                      fileItem.jurisdiction ? fileItem.jurisdiction : "-"
                                    }`}</p>
                                  </td>
                                  <td className="number">
                                    <p>{`${
                                      fileItem.effectiveDate ? fileItem.effectiveDate : "-"
                                    }`}</p>
                                  </td>
                                  <td className="number">
                                    <p>{`${
                                      fileItem.terminationDate ? fileItem.terminationDate : "-"
                                    }`}</p>
                                  </td>
                                  <td className="number">
                                    <p>{`${
                                      fileItem.executionDate ? fileItem.executionDate : "-"
                                    }`}</p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {isLoading ? (
                  <div className="flex justify-end">
                    <div className="simpleO-loader"></div>
                  </div>
                ) : currentPage * 10 > smartViewTotalCount ? null : smartViewTotalCount > 0 ? (
                  <div className="mt-3 mb-2 flex justify-end">
                    <button
                      className={`load-more-btn paginate_button next ${
                        currentPage * 10 > smartViewTotalCount ? "disabled" : ""
                      }`}
                      onClick={() => handleLoadMore(currentPage + 1)}
                    >
                      Load Next
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>

      {shareModal && selectedFile && (
        <ShareUserModal
          isOpen={shareModal}
          onClose={handleCloseShareModal}
          fileName={selectedFile?.filename}
          store="dashboard"
          file={selectedFile}
        />
      )}
      {deleteFile && selectedFile && (
        <DeleteFileModal
          isOpen={deleteFile}
          onClose={handleCloseDeleteModal}
          shouldCloseOnOverlayClick={true}
          file={{ id: selectedFile.fileId, fileName: selectedFile.filename }}
          onlyFileDelete={true}
        />
      )}
    </>
  );
};

export default SmartView;

export const reducer = {
  team: teamReducer,
  contract: contractReducer,
  dashboard: dashboardReducer,
  dataFilter: dataFilterReducer,
};
