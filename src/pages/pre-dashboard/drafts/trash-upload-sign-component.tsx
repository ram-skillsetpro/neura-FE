import { useAppDispatch, useAppSelector } from "core/hook";
import { getFileIcon, getShortUsername, getUsernameColor } from "core/utils";
import {
  LS_UPLOAD_SIGN_FOLDERS_ROUTE,
  formatDateWithOrdinal,
  sharedUsersCount,
} from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import {
  StateValue,
  getLastArrayFromLocalStorage,
  getStateString,
} from "pages/user-dashboard/common-utility/utility-function";
import "pages/user-dashboard/components/my-files/other-files-view.scss";
import "pages/user-dashboard/components/my-files/recent-files-view.scss";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PRE_DRAFTS, USER_AUTHORITY } from "src/const";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { AuthResponse } from "src/pages/auth/auth.model";
import { DraftType } from "./drafts.model";
import {
  clearDeleteUploadSignResponse,
  deleteUploadAndSignDraft,
  getUploadAndSignTrashListData,
  setDeletedUploadSignListPageCount,
} from "./drafts.redux";

const TrashUploadSignFileView: React.FC = () => {
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const [auth] = useLocalStorage<AuthResponse>("auth");
  const navigate = useNavigate();
  const trashUploadAndSignList = useAppSelector((state) => state.drafts?.trashUploadAndSignList); // useAppSelector((state) => state.dashboard.trashUploadAndSignList);

  const [activeFileOption, setActiveFileOption] = useState(-1);
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const trashUploadAndSignResponse = useAppSelector(
    (state) => state.drafts?.trashUploadAndSignResponse,
  );
  const isLoading = useAppSelector((state) => state.drafts.isLoading);

  const [paginationData, setPaginationData] = useState({
    totalItems: trashUploadAndSignResponse.totct as number,
    currentPage: 1,
    itemsPerPage: trashUploadAndSignResponse.perpg,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setSelectAll(checked);
    if (checked) {
      const newVisibleItemIds = rows.map((item) => item.id);
      const uniqueItems = Array.from(new Set([...selectedItems, ...newVisibleItemIds]));
      setSelectedItems(uniqueItems);
    } else {
      const visibleItemIds = rows.map((item) => item.id);
      const remainingSelectedItems = selectedItems.filter((id) => !visibleItemIds.includes(id));
      setSelectedItems(remainingSelectedItems);
    }
  };

  useEffect(() => {
    setSelectAll(false);
  }, [trashUploadAndSignList]);

  useEffect(() => {
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

  const columns = [
    {
      key: "fileSelector",
      label: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ),
      isSorting: false,
    },
    {
      key: "contractName",
      label: "Name",
      isSorting: false,
    },
    { key: "state", label: "Stage", isSorting: false },
    { key: "createdOn", label: "Last Modified", isSorting: false },
    { key: "sharedWith", label: "Shared With", isSorting: false },
    {
      key: "action",
      label: (
        <div className="file-list-action">
          <span className="file-action">Action</span>
        </div>
      ),
      isSorting: false,
    },
  ];

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
    const folder = getLastArrayFromLocalStorage(LS_UPLOAD_SIGN_FOLDERS_ROUTE);
    const payload = {
      currentPage: 1,
      folder,
    };
    dispatch(getUploadAndSignTrashListData(payload));

    return () => {
      dispatch(clearDeleteUploadSignResponse());
    };
  }, []);

  const { itemsPerPage } = paginationData;
  const totalCount = trashUploadAndSignResponse.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      const folder = getLastArrayFromLocalStorage(LS_UPLOAD_SIGN_FOLDERS_ROUTE);
      const payload = {
        currentPage: newPage,
        folder,
      };
      dispatch(setDeletedUploadSignListPageCount(newPage));
      await dispatch(getUploadAndSignTrashListData(payload));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: trashUploadAndSignResponse.totct as number,
      itemsPerPage: trashUploadAndSignResponse.perpg,
    });
  }, [trashUploadAndSignResponse]);

  useEffect(() => {
    setRows(trashUploadAndSignList?.map((data) => dataGenerator(data)));
  }, [trashUploadAndSignList, activeFileOption, selectedItems]);

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

  function getSharedWithUser(user: { id: number; userName: string; logoUrl: string }) {
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
          </div>
        </div>
      </li>
    );
  }

  const handleRestoreDraft = (data: any) => {
    const draftId = data?.id;
    const folder = getLastArrayFromLocalStorage(ROUTE_PRE_DRAFTS);
    const activeStatus = "1";
    dispatch(deleteUploadAndSignDraft(draftId, folder, activeStatus));
  };

  const dataGenerator = (data: DraftType) => {
    return {
      id: data.id,
      processStatus: data.processStatus,
      fileSelector: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            onChange={() => toggleItemSelection(data.id)}
            onClick={(event) => event.stopPropagation()}
            checked={selectedItems?.includes(data.id)}
          />
        </div>
      ),
      contractName: (
        <div className="file-list-name fs12 flex items-center">
          <i className={`w-20 h-20 mr-2`}>
            <img
              src={require(
                `assets/images/icon-${getFileIcon(data.contractName, data.mimeType)}.svg`,
              )}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.contractName}
          >
            {data.contractName}
          </div>
        </div>
      ),
      state: (
        <div className="file-list-modified fs12">{getStateString(data.state as StateValue)}</div>
      ),
      createdOn: (
        <div className="file-list-modified fs12">
          {data.createdOn ? formatDateWithOrdinal(new Date(data.createdOn * 1000)) : "-"}
        </div>
      ),
      sharedWith: (
        <div className="file-list-shared fs12">
          <div className="flex">
            <div className="sharing-members li-overlap">
              <ul>
                {data.userMetas === null && "-"}
                {data.userMetas && data.userMetas?.length <= sharedUsersCount
                  ? data?.userMetas?.map((user) => getSharedWithUser(user))
                  : data?.userMetas
                      ?.slice(0, sharedUsersCount)
                      .map((user) => getSharedWithUser(user))}
                {data.userMetas && data.userMetas?.length > sharedUsersCount && (
                  <li>
                    <div className="share-list-wrap">
                      <div className="shared-all">+{data.userMetas?.length - sharedUsersCount}</div>
                      <div className="shared-all-list">
                        {data.userMetas
                          ?.slice(-(data.userMetas?.length - sharedUsersCount))
                          .map((user) => (
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
                                          ? getUsernameColor(user.userName) || ""
                                          : "initial",
                                    }}
                                  >
                                    {user?.userName !== "" && getShortUsername(user.userName)}
                                  </div>
                                )}
                              </i>
                              <span className="truncate-line1">{user.userName}</span>
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
      ),
      action: (
        <div className="file-list-action">
          <button
            className="icon-option-dot"
            onClick={(e) => handleFileOption(e, data.id)}
          ></button>
          {activeFileOption === data.id && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  <li className="border-bottom" onClick={() => handleRestoreDraft(data)}>
                    Restore Contract
                  </li>
                </ul>
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
    };
  };

  return (
    <AnimatePresence mode="wait">
      {rows.length > 0 && (
        <section className="mb-5">
          <div className="d-table-full">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              Deleted Upload And Sign Contracts
            </h2>
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <DataTable
                className="file-list-card rounded-6 other-files-view"
                data={rows}
                columns={columns}
                paginationData={paginationData}
                onPageChange={getCurrentPageNumber}
                enablePagination={totalPages > 1}
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </section>
      )}
    </AnimatePresence>
  );
};

export default TrashUploadSignFileView;
