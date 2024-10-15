import React, { useEffect } from "react";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAppSelector } from "src/core/hook";

const DocuSign: React.FC<{ SignButtonHide?: boolean }> = () => {
  const integKey = useAppSelector((state) => state.docusign.integKey);
  const preSignedUrl = useAppSelector((state) => state.docusign.preSignedUrl);
  const isLoading = useAppSelector((state) => state.docusign.isLoading);
  useEffect(() => {
    const integrationKey = integKey;
    const url = preSignedUrl || ""; // Use a default URL if preSignedUrl is undefined
    const loadDocuSign = async () => {
      try {
        if (!(window as any).DocuSign) {
          console.error("DocuSign not available. Make sure it's loaded correctly.");
          return;
        }
        if (preSignedUrl && integrationKey) {
          const docusign = await (window as any).DocuSign?.loadDocuSign(integrationKey);

          const signing = docusign.signing({
            url,
            displayFormat: "focused",
            style: {
              branding: {
                primaryButton: {
                  backgroundColor: "#333",
                  color: "#fff",
                },
              },
              signingNavigationButton: {
                finishText: "You have finished the document! Hooray!",
                position: "bottom-center",
              },
            },
          });

          // signing.on("ready", () => {});

          signing.on("sessionEnd", () => {
            window.close();
          });

          signing.mount("#js-library-iframe");
        }
      } catch (ex) {
        console.error("Error loading DocuSign", ex);
      }
    };

    loadDocuSign();
  }, [integKey, preSignedUrl]);
  return (
    <>
      {isLoading && <Loader />}
      <iframe
        id="js-library-iframe"
        src={preSignedUrl}
        style={{ height: "100%", minHeight: "400px", width: "100%", border: "0px" }}
      ></iframe>
    </>
  );
};

export default DocuSign;
