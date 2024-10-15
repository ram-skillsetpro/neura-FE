import { formatDateWithOrdinal } from "core/utils/constant";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { encodeFileKey } from "src/core/utils";
import FileOption from "src/pages/user-dashboard/components/file-option";
import { SearchResponseResp } from "src/pages/user-dashboard/dashboard.model";
import { searchContract } from "./header-auth.redux";
import "./search-list-card.css";

const SearchResultsCardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const searchList: SearchResponseResp[] =
    useAppSelector((state) => state.headerSearchContract.searchList) || [];
  const searchString = useAppSelector((state) => state.headerSearchContract.searchString) || "";
  const searchParam = new URLSearchParams(location.search);
  const searchTerm = searchParam.get("search") || "";
  const isLoading = useAppSelector((state) => state.headerSearchContract.isLoading) || "";

  const [activeFileOption, setActiveFileOption] = useState(-1);

  const handleFileOption = (e: any, index: number) => {
    e.stopPropagation();
    setActiveFileOption(index);
  };

  const openFile = (file: any) => {
    const encodedString = encodeFileKey(file);
    navigate("/admin/file?key=" + encodedString);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  const highlightEmTags = (content: string) => {
    const emTagRegex = /<em\s+class="hlt1">([^<]+)<\/em>/gi;
    return content.replace(emTagRegex, (_, match) => `<span class="highlighted">${match}</span>`);
  };

  const fetchData = async () => {
    const obj = {
      keyword: searchTerm,
    };
    dispatch(searchContract(obj));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderHeaderRow = () => {
    if (searchList.length > 0) {
      return (
        <div className="file-item header-row">
          {/* TODO: checkbox hide for now */}
          {/* <div className="file-item-selector">
            <p>
              <input type="checkbox" />
            </p>
          </div> */}
          <div className="file-item-icon"></div>
          <div className="file-item-name">
            <p>Name</p>
          </div>
          <div className="file-item-owner">
            <p>Owner</p>
          </div>
          <div className="file-item-date">
            <p>Last Modified</p>
          </div>
          <div className="file-item-size">
            <p>File Size</p>
          </div>
          <div className="file-item-controls">
            <p></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="search-container">
      <div className="search-dashboard-container">
        <div className="search-dashboard-viewer">
          <div className="dashboard-viewer-wrapper">
            <div className="search-files-container">
              <div className="scroller">
                <div className="search-files-container-list">
                  <div className="wrapper nobg">
                    {searchString && (
                      <h3>
                        File contains - <strong>{searchString}</strong>
                      </h3>
                    )}
                    {/* {searchList.length > 0 && (<p className="meta">{searchList.length} Files</p>)} */}
                    {isLoading ? (
                      <Loader />
                    ) : (
                      searchList.length > 0 && <p className="meta">{searchList.length} Files</p>
                    )}
                    {!searchList.length && !isLoading && <h3>No files found !!!</h3>}
                  </div>
                  <div className={searchList?.length > 0 ? "wrapper" : ""}>
                    {renderHeaderRow()}
                    {(searchList?.length > 0 || searchList?.length === 0) &&
                      searchList.map((fileItem, index) => {
                        const sanitizedHTML = DOMPurify.sanitize(fileItem.txt);
                        const sanitizedHTMLFileName = DOMPurify.sanitize(fileItem.fnm);

                        return (
                          <div className="file-item each-item" key={index}>
                            {/* TODO: checkbox hide for now */}
                            {/* <div className="file-item-selector">
                              <p>
                                <input type="checkbox" />
                              </p>
                            </div> */}
                            <div className="file-item-icon">
                              <p>
                                <span className="icon anyfile"></span>
                              </p>
                            </div>
                            <div className="file-item-name">
                              <p
                                onClick={() =>
                                  openFile({
                                    id: fileItem.fid,
                                    teamId: fileItem.tmid,
                                    folderId: fileItem.fdid,
                                    fileName: fileItem.fnm,
                                    createdBy: fileItem.ctby,
                                  })
                                }
                                key={index}
                                dangerouslySetInnerHTML={{ __html: sanitizedHTMLFileName }}
                              ></p>
                            </div>
                            <div className="file-item-owner">
                              <p>{fileItem.ctbynm}</p>
                            </div>
                            <div className="file-item-date">
                              <p>{`${formatDateWithOrdinal(new Date(fileItem.updt * 1000))}`}</p>
                            </div>
                            <div className="file-item-size">
                              <p>{fileItem.fsz ? fileItem.fsz + " MB" : "-"}</p>
                            </div>
                            <div className="file-item-controls">
                              <div
                                className="icon control has-dropdown"
                                onClick={(e) => handleFileOption(e, index)}
                              ></div>
                              {activeFileOption === index && (
                                <FileOption
                                  file={{
                                    id: fileItem.fid,
                                    teamId: fileItem.tmid,
                                    folderId: fileItem.fdid,
                                    status: fileItem.st,
                                  }}
                                />
                              )}
                            </div>
                            <div className="file-item-breakrow"></div>
                            <div className="file-item-snippet">
                              {/* <p key={index} dangerouslySetInnerHTML={{ __html: highlightSearchQuery(sanitizedHTML, searchString) }}></p> */}
                              <p
                                key={index}
                                dangerouslySetInnerHTML={{ __html: highlightEmTags(sanitizedHTML) }}
                              ></p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsCardContainer;
