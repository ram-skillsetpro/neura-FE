import fileThumb from "assets/images/file-img.jpg";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { encodeFileKey, getFileIcon, getShortUsername, getUsernameColor } from "src/core/utils";
import { handleFileToOpen } from "src/pages/contract/contract.redux";
import { fetchSuggestedFilesList } from "../../dashboard.redux";

const SuggestedFiles = () => {
  const dispatch = useAppDispatch();

  const { suggestedFiles } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchSuggestedFilesList());
  }, []);

  return (
    <AnimatePresence mode="wait">
      {suggestedFiles.length ? (
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section className="suggest-sec mb-5">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              Suggested
            </h2>
            <div className="my-d-sugg-file-sec">
              {suggestedFiles.map((data, index) => (
                <div
                  key={index}
                  className="sugg-card"
                  onClick={(event) => {
                    if (event.ctrlKey || event.metaKey) {
                      const encodedString = encodeFileKey({
                        id: data.id,
                        teamId: data.teamId,
                        folderId: data.folderId,
                        fileName: data.fileName,
                      });
                      window.open(`/admin/file?key=${encodedString}`, "_blank");
                    } else {
                      dispatch(
                        handleFileToOpen({
                          id: data.id,
                          teamId: data.teamId,
                          folderId: data.folderId,
                          status: data.processStatus,
                          fileName: data.fileName,
                          createdBy: data.createdBy,
                          mimeType: data.mimeType,
                        }),
                      );
                    }
                  }}
                >
                  <section>
                    <div className="flex items-center">
                      <div className="icon-s20">
                        <img
                          src={require(
                            `assets/images/icon-${getFileIcon(data.fileName, data.mimeType)}.svg`,
                          )}
                        />
                      </div>
                      <div className="file-name">{data.fileName}</div>
                    </div>
                    <div className="file-img-sec">
                      <div className="file-img">
                        <img src={fileThumb} />
                      </div>
                      <div className="sharing-members file-img-fix">
                        <ul>
                          <li>
                            <div className="ic-member tool-tip-wrap">
                              {/* <img src={Avatar} /> */}
                              <div
                                className="ic-member"
                                style={{ background: getUsernameColor(data.firstName || "") || "" }}
                              >
                                {getShortUsername(data.firstName || "")}
                              </div>
                              <div className="tool-tip-card rounded-6">
                                <div className="block font-bold">{data.firstName}</div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      ) : (
        ""
      )}
    </AnimatePresence>
  );
};

export default SuggestedFiles;
