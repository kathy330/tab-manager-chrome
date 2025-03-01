/**
 * Background script for the Chrome extension
 * Handles extension installation and background tasks
 */

/**
 * Listener for extension installation event
 * Logs when the extension is installed or updated
 * @listens chrome.runtime.onInstalled
 */
chrome.runtime.onInstalled.addListener((): void => {
  console.log("Extension installed");
});
