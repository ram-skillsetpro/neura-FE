import { Loader } from "core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "core/hook";
import { AnimatePresence, motion } from "framer-motion";
import { renderUploadContainer, uploadFolderToDrive } from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { getTeamId } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import "./add-drive-folder.scss";

const AddDriveFolder: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const driveLinkInputRef = useRef<HTMLInputElement | null>(null);
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const renderUpload = useAppSelector((state) => state.dashboard.createNew);

  const [uploadFolderData, setUploadFolderData] = useState({
    s: "1",
    fnm: "",
    pfg: true,
  });

  const isFUProcess = useAuthorityCheck([USER_AUTHORITY.FU_PROCESS]);
  const [canProcess, setCanProcess] = useState(false);
  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();

  const navValue = searchParams.get("folders") || "";

  useEffect(() => {
    setCanProcess(isFUProcess);
    setUploadFolderData({ ...uploadFolderData, pfg: isFUProcess });
  }, [isFUProcess]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;
    setUploadFolderData({
      ...uploadFolderData,
      [name]: name === "pfg" ? checked : value,
    });
  };
  const handleUploadFolderData = async () => {
    if (!uploadFolderData.fnm) {
      driveLinkInputRef.current && driveLinkInputRef.current.focus();
      return;
    }
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;

    const data = {
      s: +uploadFolderData.s,
      fnm: uploadFolderData.fnm,
      fid: folder?.id,
      pfg: uploadFolderData.pfg ? 1 : 0,
      teamId: getTeamId(),
    };
    dispatch(uploadFolderToDrive(data));
    closePopup();
  };
  useEffect(() => {
    if (renderUpload === "addDriveFolder")
      driveLinkInputRef.current && driveLinkInputRef.current.focus();
    return () => {
      renderUploadContainer("");
    };
  }, [renderUpload]);

  const closePopup = () => {
    dispatch(renderUploadContainer(""));
  };
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="share-outer-wrap add-drive-folder"
        >
          <div className="share-inner">
            <div className="w-full mb-5">
              <div className="fs14 font-bold mb-5 text-body">
                You are adding files and folders from Google Drive or DropBox
              </div>
              <div className="close-popups-upload drive-folder" onClick={closePopup}></div>
              <form>
                <div className="w-full mb-4 relative">
                  <input
                    placeholder="Just add the link"
                    className="input-box"
                    ref={driveLinkInputRef}
                    name="fnm"
                    value={uploadFolderData.fnm}
                    onChange={handleOptionChange}
                  />
                </div>
                <div className={`ch-box ${!canProcess ? "disabled" : ""}`}>
                  <input
                    type="checkbox"
                    name="pfg"
                    checked={uploadFolderData.pfg}
                    onChange={handleOptionChange}
                    className="cursor-pointer"
                    disabled={!canProcess}
                    aria-disabled={!canProcess}
                  />
                  Process on Upload
                </div>
              </form>
            </div>
            <div className="flex items-center border-t pt-3">
              <div className="w-content-left">
                A copy of your folders and files will be stored on SimpleO.
              </div>
              <div className="grow">
                <div className="flex justify-end">
                  <button
                    className="remove-button uppercase tracking-wider mr-3"
                    onClick={closePopup}
                  >
                    Cancel
                  </button>
                  <button
                    className="green-button uppercase tracking-wider"
                    onClick={handleUploadFolderData}
                  >
                    Get
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {isLoading && <Loader />}
    </>
  );
};

export default AddDriveFolder;
