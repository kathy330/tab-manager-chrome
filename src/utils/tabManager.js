/**
 * Utility functions for managing Chrome tabs
 * Provides methods for manipulating tabs and tab groups
 */

/**
 * Creates a new tab group with specified properties
 * @param {number[]} tabIds - Array of tab IDs to include in the group
 * @param {string} name - Name for the new group
 * @param {string} color - Color identifier for the group (e.g., 'blue', 'red')
 * @returns {Promise<number>} Promise resolving to the new group ID
 * @throws {Error} If group creation fails
 */
export const createTabGroup = async (tabIds, name, color) => {
  try {
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, {
      title: name,
      color: color,
    });
    return groupId;
  } catch (error) {
    console.error("Error creating tab group:", error);
    throw error;
  }
};

/**
 * Focuses a specific tab in a specific window
 * @param {number} windowId - ID of the window containing the tab
 * @param {number} tabId - ID of the tab to focus
 * @returns {Promise<void>} Promise that resolves when tab is focused
 * @throws {Error} If unable to focus tab
 */
export const focusTab = async (windowId, tabId) => {
  try {
    await chrome.windows.update(windowId, { focused: true });
    await chrome.tabs.update(tabId, { active: true });
  } catch (error) {
    console.error("Error focusing tab:", error);
    throw error;
  }
};

/**
 * Converts a Set of selected tab IDs to an array
 * @param {Set<number>} selectedTabsSet - Set of selected tab IDs
 * @returns {number[]} Array of selected tab IDs
 */
export const getSelectedTabs = (selectedTabsSet) => {
  return Array.from(selectedTabsSet);
};

/**
 * Extracts relevant information from a Chrome tab object
 * @param {chrome.tabs.Tab} tab - Chrome tab object
 * @returns {Object} Object containing essential tab information
 * @property {number} id - Tab ID
 * @property {string} title - Tab title
 * @property {string} favIconUrl - URL of tab's favicon or default icon
 * @property {number} groupId - ID of tab's group (-1 if not grouped)
 */
export const getTabInfo = (tab) => {
  return {
    id: tab.id,
    title: tab.title,
    favIconUrl: tab.favIconUrl || "default-favicon.png",
    groupId: tab.groupId,
  };
};
