// Functions for managing tab groups
export const getAllGroups = async () => {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    const activeGroupIds = new Set();
    const allGroups = new Map();

    // Collect all active tab groups
    for (const window of windows) {
      for (const tab of window.tabs) {
        if (tab.groupId !== -1) {
          activeGroupIds.add(tab.groupId);
        }
      }
    }

    // Get details for all active groups
    for (const groupId of activeGroupIds) {
      const group = await chrome.tabGroups.get(groupId);
      if (group) {
        allGroups.set(groupId, {
          ...group,
          isActive: true,
        });
      }
    }

    return { allGroups, windows };
  } catch (error) {
    console.error("Error getting groups:", error);
    throw error;
  }
};

export const toggleGroupCollapse = async (groupId, collapsed) => {
  try {
    await chrome.tabGroups.update(groupId, {
      collapsed: !collapsed,
    });
  } catch (error) {
    console.error("Error toggling group collapse:", error);
    throw error;
  }
};
