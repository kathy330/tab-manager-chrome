// Functions for managing windows
export const getCurrentWindow = async () => {
  try {
    return await chrome.windows.getCurrent();
  } catch (error) {
    console.error("Error getting current window:", error);
    throw error;
  }
};

export const getAllWindows = async () => {
  try {
    return await chrome.windows.getAll({ populate: true });
  } catch (error) {
    console.error("Error getting all windows:", error);
    throw error;
  }
};

export const focusWindow = async (windowId) => {
  try {
    await chrome.windows.update(windowId, { focused: true });
  } catch (error) {
    console.error("Error focusing window:", error);
    throw error;
  }
};
