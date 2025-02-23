/**
 * Hot reload functionality for Chrome extension development
 * Automatically reloads the extension when files are changed
 */

/**
 * Recursively gets all files in a directory
 * @param {DirectoryEntry} dir - Chrome Extension directory entry
 * @returns {Promise<File[]>} Promise resolving to array of files
 */
const filesInDirectory = (dir) =>
  new Promise((resolve) =>
    dir.createReader().readEntries((entries) =>
      Promise.all(
        entries
          .filter((e) => e.name[0] !== ".") // Ignore hidden files
          .map((e) =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise((resolve) => e.file(resolve))
          )
      )
        .then((files) => [].concat(...files))
        .then(resolve)
    )
  );

/**
 * Creates a timestamp string based on file names and modification dates
 * Used to detect changes in the directory
 * @param {DirectoryEntry} dir - Chrome Extension directory entry
 * @returns {Promise<string>} Promise resolving to timestamp string
 */
const timestampForFilesInDirectory = (dir) =>
  filesInDirectory(dir).then((files) =>
    files.map((f) => f.name + f.lastModifiedDate).join()
  );

/**
 * Reloads the active tab and the extension
 * Called when changes are detected
 */
const reload = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
    chrome.runtime.reload();
  });
};

/**
 * Watches for changes in the extension directory
 * Compares timestamps to detect changes and triggers reload
 * @param {DirectoryEntry} dir - Chrome Extension directory entry
 * @param {string} [lastTimestamp] - Previous timestamp for comparison
 */
const watchChanges = (dir, lastTimestamp) => {
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
