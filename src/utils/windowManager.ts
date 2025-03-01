/**
 * Utility functions for managing Chrome windows
 * Provides methods for getting and manipulating window states
 */

/**
 * Gets the currently focused Chrome window
 * @returns Promise resolving to current window object
 * @throws Error If unable to get current window
 */
export const getCurrentWindow = async (): Promise<chrome.windows.Window> => {
  try {
    return await chrome.windows.getCurrent();
  } catch (error) {
    console.error("Error getting current window:", error);
    throw error;
  }
};

/**
 * Gets all open Chrome windows with their tabs
 * @returns Promise resolving to array of window objects
 * @throws Error If unable to get windows
 */
export const getAllWindows = async (): Promise<chrome.windows.Window[]> => {
  try {
    return await chrome.windows.getAll({ populate: true });
  } catch (error) {
    console.error("Error getting all windows:", error);
    throw error;
  }
};

/**
 * Focuses a specific Chrome window
 * @param windowId - ID of the window to focus
 * @returns Promise that resolves when window is focused
 * @throws Error If unable to focus window
 */
export const focusWindow = async (windowId: number): Promise<void> => {
  try {
    await chrome.windows.update(windowId, { focused: true });
  } catch (error) {
    console.error("Error focusing window:", error);
    throw error;
  }
};
