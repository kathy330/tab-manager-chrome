import { focusTab, getTabInfo } from "../utils/tabManager.ts";

/**
 * WindowList class manages the display and interaction of Chrome windows and their tabs
 * Handles tab selection, window display, and tab focusing functionality
 */
export class WindowList {
  /**
   * Creates a WindowList instance
   * @param {string} containerId - ID of the DOM element to contain the window list
   * @param {Function} onTabSelectionChange - Callback function triggered when tab selection changes
   */
  constructor(containerId, onTabSelectionChange) {
    this.container = document.getElementById(containerId);
    this.selectedTabs = new Set();
    this.onTabSelectionChange = onTabSelectionChange;
  }

  /**
   * Handles checkbox state changes for tab selection
   * Updates the selected tabs set and triggers the selection change callback
   * @param {HTMLInputElement} checkbox - The checkbox element that was changed
   * @param {number} tabId - The ID of the tab associated with the checkbox
   */
  handleTabCheckbox(checkbox, tabId) {
    if (checkbox.checked) {
      this.selectedTabs.add(tabId);
    } else {
      this.selectedTabs.delete(tabId);
    }
    if (this.onTabSelectionChange) {
      this.onTabSelectionChange(this.selectedTabs);
    }
  }

  /**
   * Creates a DOM element representing a tab
   * Includes checkbox for selection, favicon, and title
   * @param {chrome.tabs.Tab} tab - Chrome tab object to create element for
   * @param {chrome.windows.Window} window - Chrome window object containing the tab
   * @returns {HTMLElement} The created tab element
   */
  createTabElement(tab, window) {
    const tabElement = document.createElement("div");
    tabElement.className = "tab-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "tab-checkbox";
    checkbox.checked = this.selectedTabs.has(tab.id);
    checkbox.addEventListener("change", () =>
      this.handleTabCheckbox(checkbox, tab.id)
    );

    const tabInfo = getTabInfo(tab);
    const favicon = document.createElement("img");
    favicon.className = "tab-favicon";
    favicon.src = tabInfo.favIconUrl;
    favicon.alt = "";

    const title = document.createElement("div");
    title.className = "tab-title";
    title.textContent = tabInfo.title;

    tabElement.appendChild(checkbox);
    tabElement.appendChild(favicon);
    tabElement.appendChild(title);

    // Add click handler to focus the tab when clicked (except checkbox)
    tabElement.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        focusTab(window.id, tab.id);
      }
    });

    return tabElement;
  }

  /**
   * Creates a container element for a window and its tabs
   * Includes window header and all tabs in the window
   * @param {chrome.windows.Window} window - Chrome window to create container for
   * @param {chrome.windows.Window} currentWindow - Currently active Chrome window
   * @param {number} index - Index of the window in the window list
   * @returns {HTMLElement} The created window container element
   */
  createWindowContainer(window, currentWindow, index) {
    const windowContainer = document.createElement("div");
    windowContainer.className = "window-container";
    if (window.id === currentWindow.id) {
      windowContainer.classList.add("current-window");
    }

    const windowHeader = document.createElement("div");
    windowHeader.className = "window-header";
    windowHeader.textContent = `Window ${index + 1}${
      window.id === currentWindow.id ? " (Current)" : ""
    }`;

    const tabList = document.createElement("div");
    tabList.className = "tab-list";

    window.tabs.forEach((tab) => {
      const tabElement = this.createTabElement(tab, window);
      tabList.appendChild(tabElement);
    });

    windowContainer.appendChild(windowHeader);
    windowContainer.appendChild(tabList);
    return windowContainer;
  }

  /**
   * Renders all Chrome windows and their tabs in the container
   * Gets current window state and creates all necessary DOM elements
   * @returns {Promise<void>}
   */
  async render() {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      const windows = await chrome.windows.getAll({ populate: true });

      this.container.innerHTML = "";
      windows.forEach((window, index) => {
        const windowContainer = this.createWindowContainer(
          window,
          currentWindow,
          index
        );
        this.container.appendChild(windowContainer);
      });
    } catch (error) {
      console.error("Error rendering windows:", error);
    }
  }

  /**
   * Returns the set of currently selected tab IDs
   * @returns {Set<number>} Set of selected tab IDs
   */
  getSelectedTabs() {
    return this.selectedTabs;
  }

  /**
   * Clears all tab selections and re-renders the window list
   * Used after operations like group creation are completed
   */
  clearSelection() {
    this.selectedTabs.clear();
    this.render(); // Re-render to update checkboxes
  }
}
