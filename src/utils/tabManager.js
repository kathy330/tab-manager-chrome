// Core tab management functionality
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

export const focusTab = async (windowId, tabId) => {
  try {
    await chrome.windows.update(windowId, { focused: true });
    await chrome.tabs.update(tabId, { active: true });
  } catch (error) {
    console.error("Error focusing tab:", error);
    throw error;
  }
};

export const getSelectedTabs = (selectedTabsSet) => {
  return Array.from(selectedTabsSet);
};

export const getTabInfo = (tab) => {
  return {
    id: tab.id,
    title: tab.title,
    favIconUrl: tab.favIconUrl || "default-favicon.png",
    groupId: tab.groupId,
  };
};
