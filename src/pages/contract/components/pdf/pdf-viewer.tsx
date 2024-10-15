// import { AreaHighlight, Highlight, NewHighlight } from "react-pdf-highlighter";

import DOMPurify from "dompurify";
import { PDFDocument, rgb } from "pdf-lib";
import React, { useEffect, useRef, useState } from "react";
import { MESSAGE_TYPE, USER_AUTHORITY } from "src/const";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import AppModal from "src/core/components/modals/app-modal";
import AddSummaryModal from "src/core/components/modals/contract-summary-modal/add-summary-item-modal";
import AddToExisitingClauseModal from "src/core/components/modals/contract-summary-modal/add-to-existing-clause";
import CrossIcon from "src/core/components/svg/cross-icon";
import DownChevronIcon from "src/core/components/svg/down-chevron-icon";
import RotateIcon from "src/core/components/svg/rotate-icon";
import SearchIcon from "src/core/components/svg/search-icon";
import UpChevronIcon from "src/core/components/svg/up-chevron-icon";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { base64toBlob, getAuth } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { setActiveContractTab } from "src/layouts/admin/components/admin-header/header-auth.redux";
import { createComment, setContentHash } from "src/pages/comment/comment-box.redux";
import {
  saveOriginalFile,
  setClipboardText,
  setCurrentHighlightedPage,
  setOriginalPDFContent,
  setRedactedContractBlob,
  setSnippets,
} from "../../contract.redux";
import AreaHighlight from "./AreaHighlight";
import Highlight from "./Highlight";
import PdfError from "./pdf-error";
import { PdfHighlighter } from "./pdf-highlighter";
import PdfLoader from "./pdf-loader";
import Popup from "./popup";
import "./style/pdf-viewer.scss";
import Tip from "./tip";
import { NewHighlight } from "./types";

const getNextId = () => String(Math.random()).slice(2);

const HighlightPopup = ({ comment }: { comment: { text: string; emoji: string } }) => {
  const auth = getAuth();
  const renderMessage = (message: any) => {
    const regex = /@\[([^[]+)]\((\d+)\)/g;
    if (regex.test(message)) {
      return message.replace(
        regex,
        (_: any, name: string, id: string) =>
          `<span class="highlight-${
            id === auth.profileId.toString() ? "current" : "other"
          }-user cursor-pointer" data-profile-id="${id}">@${name}</span>`,
      );
    } else {
      return message;
    }
  };

  return comment.text ? (
    <div
      className="Highlight__popup"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMessage(comment.text)) }}
    ></div>
  ) : null;
};

interface PdfViewerTypes {
  file: string;
  fileId: number;
  teamId: number;
  folderId: number;
  handlePageNumber?: (totalPages: number, currentPage: number) => void;
}

const PdfViewer: React.FC<PdfViewerTypes> = ({
  fileId,
  teamId,
  folderId,
  file,
  handlePageNumber,
}) => {
  /* Hooks */
  const dispatch = useAppDispatch();

  /* Local State */
  const [pdf, setPdf] = useState<string>("");
  const [highlights, setHighlights] = useState<Array<any>>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDocument, setPdfDocument] = useState<any>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const canvasRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0);
  const [currentSearchObject, setCurrentSearchObject] = useState<{ index: number; page: number }>();
  const [reset, setReset] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState(true);
  const [angle, setAngle] = useState(90);
  const [inputPageNumber, setInputPageNumber] = useState<number>(1);
  // const [summary, setSummaryData] = useState({});
  const [isNewClauseModal, setIsNewClauseModal] = useState<boolean>(false);
  const [isExistingClauseModal, setIsExistingClauseModal] = useState<boolean>(false);
  const [selectedContentForNewClause, setSelectedContentForNewClause] = useState<{ text: string }>({
    text: "",
  });
  const { sideBarData, sideBarSummary } = useAppSelector((state) => state.contract);

  const snippetPermission = useAuthorityCheck([USER_AUTHORITY.SNPT_SHR]);
  const redactPermission = useAuthorityCheck([USER_AUTHORITY.RDT_SHR]);
  const isEditPermission = useAuthorityCheck([USER_AUTHORITY.SUMM_EDT]);

  /* Constants */
  const pdfContanerEl: any = null;

  /* Refs */
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const hasPdfLoaded = useRef(false);
  const totalPageRef = useRef(0);

  /* Redux State */
  const { comments: annotationComments, contentHash = "" } = useAppSelector(
    (state) => state.commentBox,
  );
  const { clipboardText, currentHighlightedPage, snippets, originalPDFContent, fileMeta } =
    useAppSelector((state) => state.contract);

  const { parseFlag, processStatus } = fileMeta || {};

  /* Functons */
  const parseIdFromHash = () => contentHash;

  const resetHash = () => {
    dispatch(setContentHash(""));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scrollViewerTo = useRef((highlight: any) => {});

  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo.current(highlight);
    }
  };

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    const obj = { ...highlight, id: getNextId() };
    dispatch(
      createComment({
        fileId,
        msgText: JSON.stringify(obj),
        msgType: MESSAGE_TYPE.ANNOTATED_COMMENT,
      }),
    );
    setHighlights([obj, ...highlights]);
  };

  const updateHighlight = (highlightId: string, position: any, content: any) => {
    setHighlights(
      highlights.map((h) => {
        const { id, position: originalPosition, content: originalContent, ...rest } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      }),
    );
  };

  const onPdfLoaded = (pdf: any) => {
    totalPageRef.current = pdf.numPages;
    setPdfDocument(pdf);
    setPageNumber(1);
  };

  const handleScroll = (pdfContanerEl: any) => {
    pdfContanerEl &&
      pdfContanerEl.addEventListener("scroll", () => {
        const { scrollTop, scrollHeight, clientHeight } = pdfContanerEl;
        const maxPage = totalPageRef.current || 1;
        const newPageNumber = Math.min(
          maxPage,
          Math.ceil((scrollTop / (scrollHeight - clientHeight)) * maxPage),
        );
        if (newPageNumber < 1) {
          setPageNumber(1);
        } else {
          setPageNumber(newPageNumber);
        }
      });
  };

  const handleRotate = () => {
    const currentAngle = angle + 90;
    rotatePdf(null, currentAngle);
    setAngle(currentAngle);
  };

  const rotatePdf = async (e: any, angle: number = 90) => {
    if (pdfDocument) {
      setIsOpen(true);
      const rotation = angle;
      const page = await pdfDocument.getPage(pageNumber || 1);
      const viewport = page.getViewport({ scale: 4, rotation });
      const canvas: any = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;
      } else {
        rotatePdf(e);
      }
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchTerm && searchTerm.length > 2) {
      setSearchActive(true);
      searchPdf(searchTerm);
    }
  };

  const resetPdfSearch = () => {
    setSearchActive(false);
    setSearchTerm("");
    setPdf(base64toBlob(file));
    setPageNumber(1);
    setTimeout(() => {
      const pdfContanerEl = document.querySelector(".PdfHighlighter");
      handleScroll(pdfContanerEl);
    }, 1000);
    searchInputRef.current && searchInputRef.current.focus();
  };

  const textHighlighter = async (searchText: string) => {
    try {
      if (searchText !== "") {
        // Find all elements with class "textLayer" that are not already highlighted
        const textList = document.querySelectorAll(".textLayer:not(.highlighted)");
        textList.forEach((el) => {
          const text = el.innerHTML;
          const re = new RegExp(searchText, "gi"); // search for all instances
          const newText = text.replace(re, `<div class="text-highlight">${searchText}</div>`);
          el.innerHTML = newText;

          // Add a class to mark the element as highlighted
          el.classList.add("highlighted");
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const scrollOnPage = (page: number) => {
    pdfDocument && (window as any).PdfViewer.viewer.scrollPageIntoView({ pageNumber: page });
  };

  const searchPdf = async (searchTerm: string) => {
    try {
      if (pdfDocument && searchTerm) {
        textHighlighter(searchTerm);
        const searchResults = [];
        for (let pageIndex = 0; pageIndex < totalPageRef.current; pageIndex++) {
          const page = await pdfDocument.getPage(pageIndex + 1); // Page numbers start from 1
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join("");
          const re = new RegExp(searchTerm, "gi");
          const matches = [...pageText.matchAll(re)];
          if (matches.length > 0) {
            searchResults.push({
              page: pageIndex + 1,
              matches,
            });
          }
        }
        const mappedSearchResults: any = [];
        searchResults.forEach((data) => {
          data.matches.forEach((match, index) => {
            mappedSearchResults.push({ page: data.page, match: match[0], index });
          });
        });

        setSearchResults(mappedSearchResults);
        if (mappedSearchResults.length > 0) {
          setCurrentSearchIndex(1);
          const searchObject = searchResults[0];

          scrollOnPage(searchObject.page);
          // (window as any).PdfViewer.viewer.scrollPageIntoView({ pageNumber: searchObject.page });

          setTimeout(() => {
            textHighlighter(searchTerm);
          }, 100);

          setTimeout(() => {
            const totalSearch = document.querySelectorAll(
              `.page[data-page-number="${searchObject.page}"] .text-highlight`,
            );
            if (totalSearch[0]) {
              totalSearch[0].scrollIntoView({ block: "center" });
            }
          }, 500);
        }

        if (mappedSearchResults.length === 0) {
          const text = clipboardText;
          let searchString = "";
          const words: string[] = text.split(" ");
          if (words.length > 2) {
            searchString = words.slice(0, 2).join(" ");
          } else {
            searchString = text;
          }
          dispatch(setClipboardText(searchString));
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleSearchNext = () => {
    if (currentSearchIndex >= searchResults.length) {
      return;
    }

    const currentIndex = currentSearchIndex + 1;
    const searchObject = searchResults[currentIndex - 1];

    setCurrentSearchIndex(currentIndex);
    setCurrentSearchObject(searchObject);
    searchObject.page !== pageNumber && scrollOnPage(searchObject.page);
    // (window as any).PdfViewer.viewer.scrollPageIntoView({ pageNumber: searchObject.page });
  };

  const handleSearchPrev = () => {
    if (currentSearchIndex <= 1) {
      return;
    }

    const currentIndex = currentSearchIndex - 1;
    const searchObject = searchResults[currentIndex - 1];

    setCurrentSearchIndex(currentIndex);
    setCurrentSearchObject(searchObject);

    searchObject.page !== pageNumber && scrollOnPage(searchObject.page);
    // (window as any).PdfViewer.viewer.scrollPageIntoView({ pageNumber: searchObject.page });
    if (searchObject.page === 1) {
      setPageNumber(1);
    }
  };

  // PDF redaction code
  const createPDFfromBase64String = async (file: string) => {
    if (!file || file === "") return;

    const contentType = "application/pdf";
    const bytes = atob(file);
    let length = bytes.length;
    const out = new Uint8Array(length);
    while (length--) {
      out[length] = bytes.charCodeAt(length);
    }
    const pdfFile = new Blob([out], { type: contentType });

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRedact = async (position: any) => {
    const pdfDoc = await createPDFfromBase64String(file);

    if (!pdfDoc) {
      return;
    }

    const { rects, pageNumber, boundingRect } = position || {};

    const { width } = boundingRect || {};

    if (Array.from(rects || []).length) {
      rects.forEach(
        (rect: { x1: number; x2: number; y1: number; y2: number; pageNumber: number }) => {
          const { x1, x2, y1, y2, pageNumber } = rect || {};

          const pages = pdfDoc.getPages();
          const firstPage = pages[pageNumber - 1];
          // Target scaled value = 1
          // Scaling factor = 0.605
          // Original scaled Value ≈ 1.6529
          // const scalingFactor = 0.6059;

          // const pageWidth = width * scalingFactor;
          // const pageHeight = height * scalingFactor;
          const pageWidth = firstPage.getWidth();
          const pageHeight = firstPage.getHeight();
          const scalingFactor = pageWidth / width;

          firstPage.drawRectangle({
            x: x1 * scalingFactor,
            y: pageHeight - (y2 * scalingFactor - y1 * scalingFactor) - y1 * scalingFactor,
            width: x2 * scalingFactor - x1 * scalingFactor,
            height: y2 * scalingFactor - y1 * scalingFactor,
            color: rgb(0, 0, 0),
          });
        },
      );
    } else {
      const { x1, x2, y1, y2, pageNumber, width } = boundingRect || {};

      const pages = pdfDoc.getPages();
      const firstPage = pages[pageNumber - 1];

      const pageWidth = firstPage.getWidth();
      const pageHeight = firstPage.getHeight();
      const scalingFactor = pageWidth / width;

      firstPage.drawRectangle({
        x: x1 * scalingFactor,
        y: pageHeight - (y2 * scalingFactor - y1 * scalingFactor) - y1 * scalingFactor,
        width: x2 * scalingFactor - x1 * scalingFactor,
        height: y2 * scalingFactor - y1 * scalingFactor,
        color: rgb(0, 0, 0),
      });
    }

    // {
    //   x1: 138.6754150390625,
    //   y1: 163.70440673828125,
    //   x2: 174.05419921875,
    //   y2: 181.20440673828125,
    //   width: 982.5942572673295,
    //   height: 1389.6152608320062,
    //   pageNumber: 2,
    // }

    const coordinate = {
      position: {
        boundingRect: rects.length ? rects[0] : boundingRect,
        rects,
        pageNumber,
      },
      comment: {
        text: "",
        emoji: "",
      },
    };

    setTimeout(() => {
      scrollViewerTo.current(coordinate);
    }, 1000);

    const pdfBytes = await pdfDoc.save();
    // const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    dispatch(setRedactedContractBlob(blobUrl));
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      !originalPDFContent && dispatch(setOriginalPDFContent(file));
      dispatch(saveOriginalFile(arrayBufferToBase64(base64String)));
      dispatch(setActiveContractTab("redact"));
    };
    reader.readAsArrayBuffer(blob);
    // saveAs(blob, "redacted.pdf");
  };

  const arrayBufferToBase64 = (buffer: any) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const calculatePageDimension = () => {
    const page = document.querySelector(".canvasWrapper");
    if (page) {
      const { clientHeight, clientWidth } = page;
      return { width: clientWidth, height: clientHeight };
    }
    return null;
  };

  const transformCoordinates = (coords: any, pageNumber: number) => {
    const { Left: left, Top: top, Width: width, Height: height } = coords;
    const pdfDimension = calculatePageDimension();
    if (!pdfDimension) return;
    const { width: canvasWidth, height: canvasHeight } = pdfDimension;

    const coordinates = {
      x1: canvasWidth * left,
      y1: canvasHeight * top,
      x2: canvasWidth * (left + width),
      y2: canvasHeight * (top + height),
      pageNumber,
      width: canvasWidth,
      height: canvasHeight,
    };

    return coordinates;
  };

  const renderHighlight = async (pageNumber: number, extractedCoordinates: Array<any>) => {
    if (!extractedCoordinates || extractedCoordinates.length === 0) {
      return;
    }
    const rects = extractedCoordinates.map((data) => {
      return transformCoordinates(data, pageNumber);
    });

    const coordinates = [
      {
        position: {
          boundingRect: rects[0],
          rects,
          pageNumber,
        },
        comment: {
          text: "",
          emoji: "",
        },
      },
    ];

    setHighlights(coordinates);
    scrollViewerTo.current(coordinates[0]);
    setTimeout(() => {
      const elList: NodeListOf<HTMLDivElement> = document.querySelectorAll(".Highlight__part");
      elList.forEach((el: HTMLDivElement) => {
        el.style.background = "#fcff34";
      });
    });
  };

  const checkPageRange = (page: number) => {
    if (page > 0 && page <= totalPageRef.current) {
      return true;
    }
    return false;
  };

  const handlePageNumberChange = (e: any) => {
    const currentPage = Number(e.target.value);
    setInputPageNumber(currentPage);
    if (checkPageRange(currentPage)) {
      scrollOnPage(currentPage);
      setTimeout(() => {
        setPageNumber(currentPage);
      });
    }
  };

  const handlePageNext = () => {
    if (pageNumber && pageNumber < totalPageRef.current) {
      const nextPage = pageNumber + 1;
      setInputPageNumber(nextPage);
      scrollOnPage(nextPage);
      setTimeout(() => {
        setPageNumber(nextPage);
      });
    }
  };

  const handlePagePrev = () => {
    if (pageNumber > 1) {
      const prevPage = pageNumber - 1;
      setInputPageNumber(prevPage);
      scrollOnPage(prevPage);
      setTimeout(() => {
        setPageNumber(prevPage);
      });
    }
  };

  // @ts-ignore
  const addClause = (content, position) => {
    setIsNewClauseModal(true);
    setSelectedContentForNewClause(content);
  };

  // @ts-ignore
  const addToExistingClause = (content, position) => {
    setIsExistingClauseModal(true);
    setSelectedContentForNewClause(content);
    // console.log("Exisiting clause", content);
    // console.log("Existing position", position);
  };

  useEffect(() => {
    scrollToHighlightFromHash();
  }, [contentHash]);

  useEffect(() => {
    setLoadingState(true);
    if (file) {
      setPdf(base64toBlob(file));
      setLoadingState(false);
    }
  }, [file]);

  useEffect(() => {
    const el = document.querySelector(".original");
    const pdfContainerWidth = el?.clientWidth;
    const pdfContainerHeight = el?.clientHeight;
    setHeight(pdfContainerHeight || 0);
    setWidth(pdfContainerWidth || 890);

    window.addEventListener("resize", () => {
      const pdfContainerWidth = el?.clientWidth;
      const pdfContainerHeight = el?.clientHeight;
      setHeight(pdfContainerHeight || 0);
      setWidth(pdfContainerWidth || 890);
    });

    setPageNumber(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        const pdfContanerEl: HTMLDivElement | null = document.querySelector(".PdfHighlighter");
        if (pdfContanerEl && !hasPdfLoaded.current) {
          // pdfContanerEl.style.height = `${height - 81}px`;
          clearInterval(interval);

          handlePageNumber && handlePageNumber(totalPageRef.current, pageNumber);
          hasPdfLoaded.current = true;
          handleScroll(pdfContanerEl);
        }
      },
      1000,
      [pdfContanerEl],
    );

    return () => {
      clearInterval(interval);
      hasPdfLoaded.current = false;
    };
  }, [pdf]);

  // useEffect(() => {
  //   const pdfContanerEl: HTMLDivElement | null = document.querySelector(".PdfHighlighter");
  //   if (pdfContanerEl && height) {
  //     pdfContanerEl.style.height = `${height - 81}px`;
  //   }
  // }, [height]);

  useEffect(() => {
    if (totalPageRef.current && pageNumber) {
      handlePageNumber && handlePageNumber(totalPageRef.current, pageNumber);
    }
  }, [totalPageRef.current, pageNumber]);

  useEffect(() => {
    if (totalPageRef.current) {
      setTimeout(() => {
        textHighlighter(searchTerm);

        if (currentSearchObject) {
          const totalSearch = document.querySelectorAll(
            `.page[data-page-number="${currentSearchObject.page}"] .text-highlight`,
          );
          const index = currentSearchObject.index;

          if (totalSearch[index]) {
            totalSearch[index].scrollIntoView({ block: "center" });
          }
        }
      }, 200);
    }
  }, [currentSearchObject, totalPageRef.current]);

  useEffect(() => {
    const messages = annotationComments
      .filter((d) => d.msg_type === MESSAGE_TYPE.ANNOTATED_COMMENT)
      .map((d) => JSON.parse(d.msg_text));

    setHighlights([...messages]);
  }, [annotationComments]);

  useEffect(() => {
    if (clipboardText) {
      resetPdfSearch();
      setTimeout(() => {
        setReset(true);
      }, 500);
    }
  }, [clipboardText]);

  useEffect(() => {
    if (reset) {
      setReset(false);
      setSearchTerm(clipboardText);
      searchPdf(clipboardText);
      setSearchActive(true);
    }
  }, [reset, clipboardText]);

  useEffect(() => {
    if (!file) {
      setSearchTerm("");
      setSearchActive(false);
      setPageNumber(0);
      setLoadingState(true);
    }

    return () => {
      dispatch(setCurrentHighlightedPage(null));
    };
  }, [file]);

  useEffect(() => {
    if (pdfDocument) {
      calculatePageDimension();
    }

    window.addEventListener("resize", () => {
      calculatePageDimension();
    });
  }, [pdfDocument]);

  useEffect(() => {
    if (currentHighlightedPage && pdfDocument) {
      const { page, coordinates } = currentHighlightedPage || {};
      setTimeout(() => {
        renderHighlight(Number(page), coordinates);
      }, 110);
    }
  }, [currentHighlightedPage, pdfDocument]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setInputPageNumber(pageNumber);
    }, 100);

    return () => {
      clearTimeout(t1);
    };
  }, [pageNumber]);

  const [zoom, setZoom] = useState<number>(100);
  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 100) {
      setZoom(zoom - 10);
    }
  };

  useEffect(() => {
    const pdfViewer: HTMLDivElement | null = document.querySelector(".pdfViewer");
    if (pdfViewer) {
      pdfViewer.style.height = "100%";
      if (zoom) {
        pdfViewer.style.zoom = String(zoom / 100);
      }
    }
  }, [zoom]);

  return (
    <>
      <div
        className="App"
        style={{
          display: "flex",
          height: `${height ? `${height}px` : `100%`}`,
          width: `100%`,
        }}
      >
        <AppModal
          isOpen={isOpen}
          shouldCloseOnOverlayClick={true}
          onClose={() => {
            setIsOpen(false);
          }}
        >
          <button
            title="Rotate PDF"
            onClick={handleRotate}
            className={`button-red msg-delete-btn pdf-rotate-btn pdf-rotate-big`}
          >
            <RotateIcon />
          </button>
          <button
            style={{ top: "58px" }}
            title="Close"
            onClick={() => setIsOpen(false)}
            className={`button-red msg-delete-btn pdf-rotate-btn pdf-rotate-big`}
          >
            <CrossIcon />
          </button>
          <div
            style={{
              height: `95vh`,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <canvas ref={canvasRef}></canvas>
          </div>
        </AppModal>

        <div
          style={{
            height: `${height ? `${height}px` : `100%`}`,
            width: `100%`,
            position: "relative",
          }}
        >
          {pageNumber ? (
            <div className="pdf-toolbar">
              <div title="Zoom Out">
                <button
                  onClick={handleZoomOut}
                  className={`button-red msg-delete-btn pdf-rotate-btn next-prev-btn zoom-btn`}
                >
                  -
                </button>
              </div>
              <div className="page-zoom-container">
                <span>{`${zoom}%`}</span>
              </div>
              <div title="Zoom In">
                <button
                  onClick={handleZoomIn}
                  className={`button-red msg-delete-btn pdf-rotate-btn next-prev-btn zoom-btn`}
                >
                  +
                </button>
              </div>
              <div title="Prev">
                <button
                  onClick={handlePagePrev}
                  className={`button-red msg-delete-btn pdf-rotate-btn next-prev-btn page-prev-btn`}
                >
                  <UpChevronIcon />
                </button>
              </div>
              <div className="page-nav-container">
                <input
                  min="1"
                  max={totalPageRef.current}
                  type="number"
                  placeholder=""
                  value={String(inputPageNumber * 1)}
                  onChange={handlePageNumberChange}
                  onBlur={() => setInputPageNumber(pageNumber)}
                />
              </div>
              <div title="Next">
                <button
                  onClick={handlePageNext}
                  className={`button-red msg-delete-btn pdf-rotate-btn next-prev-btn page-next-btn`}
                >
                  <DownChevronIcon />
                </button>
              </div>
              <div className="custom-search-container">
                <form onSubmit={handleSearch}>
                  <input
                    ref={searchInputRef}
                    readOnly={searchActive}
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
                {searchActive ? (
                  <div onClick={resetPdfSearch} title="Clear Search">
                    <button className={`button-red msg-delete-btn search-btn`}>
                      <CrossIcon />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleSearch} className={`button-red msg-delete-btn search-btn`}>
                    <SearchIcon />
                  </button>
                )}
              </div>
              {searchActive && (
                <>
                  <div title="Prev">
                    <button
                      onClick={handleSearchPrev}
                      className={`button-red msg-delete-btn pdf-rotate-btn next-prev-btn`}
                    >
                      <UpChevronIcon />
                    </button>
                  </div>
                  <div className="search-pager">
                    {searchResults.length > 0 ? currentSearchIndex : 0}/{searchResults.length}
                  </div>
                  <div title="Next">
                    <button
                      onClick={handleSearchNext}
                      className={`button-red msg-delete-btn pdf-rotate-btn next-prev-btn`}
                    >
                      <DownChevronIcon />
                    </button>
                  </div>
                </>
              )}
              <div onClick={rotatePdf} title="Rotate Page">
                <button className={`button-red msg-delete-btn pdf-rotate-btn`}>
                  <RotateIcon />
                </button>
              </div>
            </div>
          ) : (
            ""
          )}

          <PdfLoader
            url={pdf}
            beforeLoad={<LoaderSection />}
            onloadSuccess={onPdfLoaded}
            loadingState={loadingState}
            errorMessage={
              <PdfError
                error=""
                handleError={() => {
                  setPageNumber(0);
                }}
              />
            }
          >
            {(pdfDocument: any) => {
              return (
                <PdfHighlighter
                  pdfDocument={pdfDocument}
                  enableAreaSelection={(event) => event.ctrlKey}
                  onScrollChange={() => {
                    resetHash();
                  }}
                  pdfScaleValue="page-width"
                  scrollRef={(scrollTo) => {
                    scrollViewerTo.current = scrollTo;
                    scrollToHighlightFromHash();
                  }}
                  onSelectionFinished={(
                    position,
                    content,
                    hideTipAndSelection,
                    transformSelection,
                  ) => {
                    const hasSelection = content.text && String(content.text).trim() !== "";

                    return (
                      <Tip
                        onOpen={transformSelection}
                        onConfirm={(comment) => {
                          dispatch(setActiveContractTab("comments"));
                          addHighlight({ content, position, comment });
                          hideTipAndSelection();
                        }}
                        onSnippet={
                          hasSelection && snippetPermission
                            ? () => {
                                dispatch(setActiveContractTab("snippets"));
                                dispatch(setSnippets([...snippets, { content, position }]));
                                hideTipAndSelection();
                              }
                            : undefined
                        }
                        onAddNewclause={
                          hasSelection &&
                          isEditPermission &&
                          fileMeta?.isExtractionAvailable &&
                          parseFlag === 1 &&
                          processStatus === 3
                            ? () => {
                                addClause(content, position);
                                hideTipAndSelection();
                              }
                            : undefined
                        }
                        onRedaction={
                          redactPermission
                            ? () => {
                                handleRedact(position);
                                hideTipAndSelection();
                              }
                            : undefined
                        }
                        onAddToExistingClause={
                          hasSelection &&
                          isEditPermission &&
                          fileMeta?.isExtractionAvailable &&
                          parseFlag === 1 &&
                          processStatus === 3
                            ? () => {
                                addToExistingClause(content, position);
                                hideTipAndSelection();
                              }
                            : undefined
                        }
                        dispatch={dispatch}
                      />
                    );
                  }}
                  highlightTransform={(
                    highlight,
                    index,
                    setTip,
                    hideTip,
                    viewportToScaled,
                    screenshot,
                    isScrolledTo,
                  ) => {
                    const isTextHighlight = !(highlight.content && highlight.content.image);

                    const component = isTextHighlight ? (
                      <Highlight
                        isScrolledTo={isScrolledTo}
                        position={highlight.position}
                        comment={highlight.comment}
                      />
                    ) : (
                      <AreaHighlight
                        isScrolledTo={isScrolledTo}
                        highlight={highlight}
                        onChange={(boundingRect) => {
                          updateHighlight(
                            highlight.id,
                            { boundingRect: viewportToScaled(boundingRect) },
                            { image: screenshot(boundingRect) },
                          );
                        }}
                      />
                    );

                    return (
                      <Popup
                        popupContent={<HighlightPopup {...highlight} />}
                        onMouseOver={(popupContent) => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          return setTip(highlight, (highlight) => popupContent);
                        }}
                        onMouseOut={hideTip}
                        key={index}
                      >
                        {component}
                      </Popup>
                    );
                  }}
                  highlights={highlights}
                />
              );
            }}
          </PdfLoader>
          <div className="pdf-page-footer" style={{ width: `${width}px`, zIndex: 9 }}>
            {file ? `Page ${pageNumber} of ${totalPageRef.current}` : "Loading..."}
          </div>
          <AddSummaryModal
            isOpen={isNewClauseModal}
            onClose={() => {
              setIsNewClauseModal(false);
            }}
            mainClauseData={sideBarData}
            pdfContent={selectedContentForNewClause}
            summary={sideBarSummary}
            fileId={fileId}
            folderId={folderId}
            teamId={teamId}
            shouldCloseOnOverlayClick={true}
          />
          <AddToExisitingClauseModal
            isOpen={isExistingClauseModal}
            onClose={() => {
              setIsExistingClauseModal(false);
            }}
            mainClauseData={sideBarData}
            pdfContent={selectedContentForNewClause}
            summary={sideBarSummary}
            fileId={fileId}
            folderId={folderId}
            teamId={teamId}
            shouldCloseOnOverlayClick={true}
          />
        </div>
      </div>
    </>
  );
};

export default PdfViewer;
