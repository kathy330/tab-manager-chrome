import { getCurrentWindow, getAllWindows } from "../utils/windowManager.js";
import { focusTab } from "../utils/tabManager.js";

export class WindowList {
  constructor(containerId, onTabSelectionChange) {
    this.container = document.getElementById(containerId);
    this.selectedTabs = new Set();
    this.onTabSelectionChange = onTabSelectionChange;
  }

  async initialize() {
    try {
      const currentWindow = await getCurrentWindow();
      const windows = await getAllWindows();
      this.render(windows, currentWindow);
    } catch (error) {
      console.error("Error initializing WindowList:", error);
    }
  }

  render(windows, currentWindow) {
    this.container.innerHTML = "";

    windows.forEach((window, index) => {
      const windowContainer = this.createWindowContainer(
        window,
        currentWindow,
        index
      );
      this.container.appendChild(windowContainer);
    });
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

    const tabList = this.createTabList(window);

    windowContainer.appendChild(windowHeader);
    windowContainer.appendChild(tabList);
    return windowContainer;
  }

  createTabList(window) {
    const tabList = document.createElement("div");
    tabList.className = "tab-list";

    window.tabs.forEach((tab) => {
      const tabElement = this.createTabElement(tab, window);
      tabList.appendChild(tabElement);
    });

    return tabList;
  }

  createTabElement(tab, window) {
    const tabElement = document.createElement("div");
    tabElement.className = "tab-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "tab-checkbox";
    checkbox.checked = this.selectedTabs.has(tab.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        this.selectedTabs.add(tab.id);
      } else {
        this.selectedTabs.delete(tab.id);
      }
      this.onTabSelectionChange(this.selectedTabs);
    });

    const favicon = document.createElement("img");
    favicon.className = "tab-favicon";
    favicon.src = tab.favIconUrl || "default-favicon.png";
    favicon.alt = "";

    const title = document.createElement("div");
    title.className = "tab-title";
    title.textContent = tab.title;

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

  getSelectedTabs() {
    return this.selectedTabs;
  }
}
