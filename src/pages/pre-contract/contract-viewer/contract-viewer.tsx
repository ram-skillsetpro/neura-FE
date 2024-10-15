// src/components/PDFViewer.js
// import "pdfjs-dist/web/pdf_viewer.css";
import React, { useEffect, useRef, useState } from "react";
import { CommonService } from "src/core/services/common.service";
import { base64toBlob } from "src/core/utils";
import { getDocument, GlobalWorkerOptions } from "vendor/pdfjs-dist/legacy/build/pdf";
import "vendor/pdfjs-dist/web/AnnotationLayer.css";
import "vendor/pdfjs-dist/web/TextLayer.css";

// eslint-disable-next-line max-len
GlobalWorkerOptions.workerSrc = new URL(
  "vendor/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface IPDFViewer {
  file: string;
}

const ContractViewer: React.FC<IPDFViewer> = ({ file }) => {
  const [numPages, setNumPages] = useState(0);
  const pagesRef = useRef<any>([]);
  const [pdfUrl, setPDF] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      setPDF(base64toBlob(file));
    } catch (error) {
      CommonService.toast({
        type: "error",
        message: "Invalid file type",
      });
    }
  }, [file]);

  const renderPDF = async () => {
    const loadingTask = getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    setNumPages(pdf.numPages);

    const renderPage = async (pageNumber: number) => {
      const page = await pdf.getPage(pageNumber);

      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;

        const viewport = page.getViewport({
          scale: (containerWidth / page.getViewport({ scale: 1 }).width) * 2,
        });

        const canvas = pagesRef.current[pageNumber - 1];
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;
      }
    };

    for (let i = 1; i <= pdf.numPages; i++) {
      await renderPage(i);
    }
  };

  useEffect(() => {
    if (pdfUrl) {
      renderPDF();
    }
  }, [pdfUrl]);

  return (
    <div ref={containerRef} style={{ width: "100%", overflow: "auto" }}>
      {Array.from({ length: numPages }, (_, index) => (
        <div key={index}>
          <canvas style={{ width: "100%" }} ref={(el) => (pagesRef.current[index] = el)} />
        </div>
      ))}
    </div>
  );
};

export default ContractViewer;
