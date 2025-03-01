/**
 * Hot reload functionality for Chrome extension development
 * Automatically reloads the extension when files are changed
 */

/**
 * Recursively gets all files in a directory
 * @param dir - Chrome Extension directory entry
 * @returns Promise resolving to array of files
 */
const filesInDirectory = (dir: DirectoryEntry): Promise<File[]> =>
  new Promise((resolve) =>
    dir.createReader().readEntries((entries: Entry[]) =>
      Promise.all(
        entries
          .filter((e) => e.name[0] !== ".") // Ignore hidden files
          .map((e) =>
            e.isDirectory
              ? filesInDirectory(e as DirectoryEntry)
              : new Promise<File>((resolve) => (e as FileEntry).file(resolve))
          )
      )
        .then((files) => {
          // Properly flatten the array of files
          return ([] as File[]).concat(...(files as (File | File[])[]));
        })
        .then(resolve)
    )
  );

/**
 * Creates a timestamp string based on file names and modification dates
 * Used to detect changes in the directory
 * @param dir - Chrome Extension directory entry
 * @returns Promise resolving to timestamp string
 */
const timestampForFilesInDirectory = (dir: DirectoryEntry): Promise<string> =>
  filesInDirectory(dir).then((files) =>
    files.map((f) => `${f.name}${f.lastModified}`).join()
  );

/**
 * Reloads the active tab and the extension
 * Called when changes are detected
 */
const reload = (): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.reload(tabs[0].id);
    }
    chrome.runtime.reload();
  });
};

/**
 * Watches for changes in the extension directory
 * Compares timestamps to detect changes and triggers reload
 * @param dir - Chrome Extension directory entry
 * @param lastTimestamp - Previous timestamp for comparison
 */
const watchChanges = (dir: DirectoryEntry, lastTimestamp?: string): void => {
  timestampForFilesInDirectory(dir).then((timestamp) => {
    if (!lastTimestamp || lastTimestamp === timestamp) {
      setTimeout(() => watchChanges(dir, timestamp), 1000); // Check every second
    } else {
      reload(); // Reload if timestamp changed
    }
  });
};

// Only enable hot reload in development mode
chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry((dir) => watchChanges(dir));
  }
});
