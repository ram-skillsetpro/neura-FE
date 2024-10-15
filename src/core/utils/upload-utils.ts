import JSZip from "jszip";
import { formatDateWithOrdinal } from "./constant";

export const readDirectory = async (
  directoryEntry: FileSystemDirectoryEntry,
  zip: JSZip,
  path: string,
) => {
  const reader = directoryEntry.createReader();
  const entries = await new Promise<FileSystemEntry[]>((resolve) => reader.readEntries(resolve));
  // Immediately add the directory to ensure empty directories are included
  zip.folder(path);
  for (const entry of entries) {
    // Check if it's a file or directory
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await readDirectoryFile(fileEntry);
      zip.file(`${path}/${entry.name}`, file);
    } else if (entry.isDirectory) {
      // Recursively handle directory entries, including empty ones
      const dirEntry = entry as FileSystemDirectoryEntry;
      await readDirectory(dirEntry, zip, `${path}/${entry.name}`);
    }
  }
};

export const readDirectoryFile = async (fileEntry: FileSystemFileEntry): Promise<ArrayBuffer> => {
  return new Promise<ArrayBuffer>((resolve) => {
    fileEntry.file((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as ArrayBuffer;
        resolve(result);
      };
      reader.readAsArrayBuffer(file);
    });
  });
};

export const downloadZipFile = (blob: Blob, fileName: string) => {
  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;

  // Append the link to the body
  document.body.appendChild(downloadLink);

  // Trigger the download
  downloadLink.click();

  // Remove the link from the body
  document.body.removeChild(downloadLink);
};

export const handleZipGeneration = async (entries: FileSystemEntry[]) => {
  const zip = new JSZip();
  for (const entry of entries) {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await readDirectoryFile(fileEntry);
      zip.file(entry.fullPath, file);
    } else if (entry.isDirectory) {
      await readDirectory(entry as FileSystemDirectoryEntry, zip, entry.name);
    }
  }
  return zip;
};

export const handleZipGenerationFromDirHandle = async (dirHandle: FileSystemDirectoryHandle) => {
  const zip = new JSZip();
  // Start with the root directory name as the base path for all contents
  const rootDirName = dirHandle.name;
  // Helper function to recursively add files and directories to the zip
  const addEntryToZip = async (handle: FileSystemHandle, path: string = "") => {
    if (handle.kind === "directory") {
      const dirHandle = handle;
      let isEmpty = true; // Assume the directory is empty until proven otherwise
      for await (const entry of (dirHandle as any).values()) {
        isEmpty = false; // Found an entry, so the directory is not empty
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === "file") {
          const file = await entry.getFile();
          zip.file(entryPath, file);
        } else if (entry.kind === "directory") {
          await addEntryToZip(entry, entryPath);
        }
      }
      if (isEmpty) {
        // If the directory is empty, add an empty folder to the zip
        zip.folder(path);
      }
    } else if (handle.kind === "file") {
      const file = await (handle as any).getFile();
      const filePath = path ? `${path}/${handle.name}` : handle.name;
      zip.file(filePath, file);
    }
  };

  await addEntryToZip(dirHandle, rootDirName);

  return await generateZipBlob(zip);
};

export const generateZipBlob = async (zip: JSZip) => {
  const zipBlob = new File(
    [await zip.generateAsync({ type: "blob" })],
    `${formatDateWithOrdinal(new Date(), "-")}_uploaded-folder.zip`,
  );
  return zipBlob;
};

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
