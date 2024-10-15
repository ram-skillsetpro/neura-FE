import "assets/css/V3/_search-result.scss";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fileSourceType,
  FILTER_TYPE,
  ROUTE_ADMIN,
  ROUTE_CONTRACT_VIEW,
  SEARCH_RESULTS,
  USER_AUTHORITY,
} from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import {
  encodeFileKey,
  getFileIcon,
  getShortUsername,
  getUsernameColor,
  removeHtmlTags,
} from "src/core/utils";
import { formatDateWithOrdinal, sharedUsersCount } from "src/core/utils/constant";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { contractReducer, handleFileToOpen } from "src/pages/contract/contract.redux";
import { teamReducer } from "src/pages/manage-team/team.redux";
import FileOption from "src/pages/user-dashboard/components/file-option";
import { SearchResponseResp } from "src/pages/user-dashboard/dashboard.model";
import { dashboardReducer } from "src/pages/user-dashboard/dashboard.redux";
import DataFilter from "../data-filter/data-filter";
import { dataFilterReducer, setFilterActive } from "../data-filter/data-filter.redux";
import { clearAutoCompleteSearchResult, clearSearch, searchContract } from "./header-auth.redux";
import "./search-list-card.css";

const SearchResultsCardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const searchList: SearchResponseResp[] =
    useAppSelector((state) => state.headerSearchContract.searchList) || [];

  const searchString = useAppSelector((state) => state.headerSearchContract.searchString) || "";
  const searchParam: any = new URLSearchParams(location.search);
  const searchTerm = searchParam.get("search") || searchString || "";
  const isLoading = useAppSelector((state) => state.headerSearchContract.isLoading) || "";
  const { autoCompleteSearchList, totalSearchCount, searchCurrentPage, searchIndexHash } =
    useAppSelector((state) => state.headerSearchContract);
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

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

  const fetchData = async () => {
    const payload = {
      keyword: searchTerm,
    };
    dispatch(searchContract(payload));
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleFilter = async () => {
    dispatch(clearSearch());

    const payload = {
      keyword: searchTerm,
    };
    await dispatch(searchContract(payload));
    dispatch(setFilterActive(true));
  };

  const handleLoadMore = async (newPage: number) => {
    if (newPage >= 1 && (newPage - 1) * 10 <= totalSearchCount) {
      const payload = {
        keyword: searchTerm,
        pgn: newPage,
        sIndexHash: searchIndexHash,
      };
      dispatch(searchContract(payload));
    }
  };

  const [mount, setMount] = useState<boolean>(false);

  useEffect(() => {
    if (autoCompleteSearchList.length && !mount) {
      setMount(true);
      dispatch(clearAutoCompleteSearchResult());
    }
  }, [autoCompleteSearchList, mount]);

  useEffect(() => {
    if (location.pathname === "/admin/search-result") {
      localStorage.setItem("previousPath", location.pathname);
    }
    return () => {
      if (location.pathname === "/admin/my-drive" || location.pathname === "/admin/team-files") {
        localStorage.removeItem("previousPath");
      }
    };
  }, [location.pathname]);

  return (
    <>
      {/* {isLoading && <Loader />} */}
      <div className="serach-list-page left-section left-divider-sec" style={{ paddingLeft: 0 }}>
        <div className="left-section-inner">
          {/* breadcrum and Filter section start here */}

          <div className="sticky-search">
            <div className="page-breadcrum mb-3">
              <ul className="breadcrum-ul">
                <li className="list">
                  <a href="#">Search</a>
                </li>
                {searchString && (
                  <li className="list">
                    <a href="#">{searchString}</a>
                  </li>
                )}
              </ul>
            </div>
            <div className="filter-sec">
              <DataFilter
                handleFilter={handleFilter}
                filterType={[
                  FILTER_TYPE.USER_LIST,
                  FILTER_TYPE.CONTRACT_TYPE,
                  FILTER_TYPE.DATE_RANGE,
                ]}
                activeFilterPath={[
                  `/${ROUTE_ADMIN}/${ROUTE_CONTRACT_VIEW}`,
                  `/${ROUTE_ADMIN}/${SEARCH_RESULTS}`,
                ]}
              />
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
                          <div className="search-result-checkbox-sec fs10 uppercase">
                            <input type="checkbox" />
                          </div>
                          <div className="search-result-name fs10 uppercase left-space tracking-wider">
                            Name
                          </div>
                          <div className="search-result-team fs10 uppercase  tracking-wider">
                            Team Name
                          </div>
                          <div className="search-result-team fs10 uppercase  tracking-wider">
                            Folder Name
                          </div>
                          <div className="search-result-modified fs10 uppercase tracking-wider">
                            Last Modified
                          </div>
                          <div className="search-result-shared fs10 uppercase tracking-wider">
                            Shared with
                          </div>
                          <div className="search-result-action tracking-wider">
                            <button className="icon-option-dot" />
                          </div>
                        </div>

                        <div className="search-info">
                          {/* Content first row start here */}
                          <div className="search-result-row">
                            <div className="search-result-checkbox-sec fs12">
                              <input type="checkbox" />
                            </div>
                            <div className="search-result-name fs12">
                              <div className="flex items-center">
                                <i className="search-s20 mr-4">
                                  <img
                                    src={require(
                                      // eslint-disable-next-line max-len
                                      `assets/images/icon-${getFileIcon(removeHtmlTags(fileItem.filename), fileItem.mimeType)}.svg`,
                                    )}
                                  />
                                </i>
                                <p
                                  style={{ cursor: "pointer" }}
                                  onClick={(event) => {
                                    if (event.ctrlKey || event.metaKey) {
                                      const encodedString = encodeFileKey({
                                        id: fileItem.fileId,
                                        teamId: fileItem.teamId,
                                        folderId: fileItem.folderId,
                                        fileName: removeHtmlTags(fileItem.filename),
                                      });
                                      window.open(`/admin/file?key=${encodedString}`, "_blank");
                                    } else {
                                      dispatch(
                                        handleFileToOpen({
                                          id: fileItem.fileId,
                                          teamId: fileItem.teamId,
                                          folderId: fileItem.folderId,
                                          fileName: removeHtmlTags(fileItem.filename),
                                          createdBy: fileItem.createdById,
                                          mimeType: fileItem.mimeType,
                                          source: fileSourceType.SEARCH,
                                          other: {
                                            pgn: searchCurrentPage - 1,
                                            sIndexHash: searchIndexHash,
                                            keyword: searchTerm,
                                          },
                                        }),
                                      );
                                    }
                                  }}
                                  key={index}
                                  dangerouslySetInnerHTML={{
                                    __html: sanitizedHTMLFileName,
                                  }}
                                ></p>
                              </div>
                            </div>
                            <div className="search-result-team fs12">{fileItem.teamName}</div>
                            <div className="search-result-team fs12">
                              {!fileItem.folderName || fileItem.folderName === ""
                                ? "-"
                                : fileItem.folderName}
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
                            <div className="search-result-action file-list-action">
                              <button
                                className="icon-option-dot"
                                onClick={(e) => handleFileOption(e, index)}
                              ></button>
                              {activeFileOption === index && (
                                <FileOption
                                  file={{
                                    id: fileItem.fileId,
                                    teamId: fileItem.teamId,
                                    folderId: fileItem.folderId,
                                    status: fileItem.st,
                                    fileName: fileItem.filename,
                                    createdBy: fileItem.createdById,
                                  }}
                                />
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
                ) : (searchCurrentPage - 1) * 10 > totalSearchCount ? null : totalSearchCount >
                  0 ? (
                  <div className="mt-3 mb-2 flex justify-end">
                    <button
                      className={`load-more-btn paginate_button next ${
                        (searchCurrentPage - 1) * 10 > totalSearchCount ? "disabled" : ""
                      }`}
                      onClick={() => handleLoadMore(searchCurrentPage)}
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
    </>
  );
};

export default SearchResultsCardContainer;

export const reducer = {
  team: teamReducer,
  contract: contractReducer,
  dashboard: dashboardReducer,
  dataFilter: dataFilterReducer,
};
