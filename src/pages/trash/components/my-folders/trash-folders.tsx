import { useAppDispatch, useAppSelector } from "core/hook";
import { formatDateWithOrdinal } from "core/utils/constant";
import { getTrashFoldersPerPage } from "pages/trash/trash.redux";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { FolderType } from "src/pages/user-dashboard/dashboard.model";
import FolderOption from "../folder-option";
import "../my-files/trash-files.scss";
interface TrashFoldersViewProps {}

const TrashFolders: React.FC<TrashFoldersViewProps> = () => {
  const folderList = useAppSelector((state) => state.trash.folderList);
  const [activeFileOption, setActiveFileOption] = useState(-1);

  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
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
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

  useEffect(() => {
    setSelectAll(false);
  }, [folderList]);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

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
      key: "fileName",
      label: "Name",
      isSorting: false,
    },
    { key: "updatedOn", label: "Deleted Date", isSorting: false },
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

  const foldersAllData = useAppSelector((state) => state.trash.foldersResponse);
  const [paginationData, setPaginationData] = useState({
    totalItems: foldersAllData.totct as number,
    currentPage: 1,
    itemsPerPage: foldersAllData.perpg,
  });
  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  const { itemsPerPage } = paginationData;
  const totalCount = foldersAllData.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(getTrashFoldersPerPage(newPage));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: foldersAllData.totct as number,
      itemsPerPage: foldersAllData.perpg,
    });
  }, [foldersAllData]);

  useEffect(() => {
    setRows(folderList?.map((data) => dataGenerator(data)));
  }, [folderList, activeFileOption, selectedItems]);

  const dataGenerator = (data: FolderType) => {
    return {
      id: data.id,
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
      fileName: (
        <div className="file-list-name fs12 flex items-center">
          <i className={`w-20 h-20 mr-2`}>
            <img src={require(`assets/images/icon-folder.svg`)} />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            data-fulltext={data.folderName}
          >
            {data.folderName}
          </div>
        </div>
      ),
      updatedOn: (
        <div className="file-list-modified fs12">
          {data.updatedOn
            ? formatDateWithOrdinal(new Date(data.updatedOn * 1000))
            : formatDateWithOrdinal(new Date(data.createdOn * 1000))}
        </div>
      ),
      action: (
        <div className="file-list-action">
          <button
            className="icon-option-dot"
            onClick={(e) => handleFileOption(e, data.id)}
          ></button>
          {activeFileOption === data.id && <FolderOption item={data} />}
        </div>
      ),
    };
  };

  return (
    <>
      {rows && rows.length > 0 ? (
        <section className="mb-5">
          <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
            Trash Folders
          </h2>
          <DataTable
            className="file-list-card rounded-6 other-files-view"
            data={rows}
            columns={columns}
            paginationData={paginationData}
            onPageChange={getCurrentPageNumber}
            enablePagination={totalPages > 1}
            isLoading={foldersAllData.isLoading ?? false}
          />
        </section>
      ) : (
        <></>
        // isLoading === false && fileList.length === 0 && <NoDataPage pathname={location.pathname} />
      )}
    </>
  );
};

export default TrashFolders;
