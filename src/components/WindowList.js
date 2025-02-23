import { focusTab, getTabInfo } from "../utils/tabManager.js";

export class WindowList {
  constructor(containerId, onTabSelectionChange) {
    this.container = document.getElementById(containerId);
    this.selectedTabs = new Set();
    this.onTabSelectionChange = onTabSelectionChange;
  }

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

    tabElement.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        focusTab(window.id, tab.id);
      }
    });

    return tabElement;
  }

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

  getSelectedTabs() {
    return this.selectedTabs;
  }

  clearSelection() {
    this.selectedTabs.clear();
    this.render(); // Re-render to update checkboxes
  }
}
