import { focusTab, getTabInfo } from "../utils/tabManager";

type TabSelectionChangeCallback = (selectedTabs: Set<number>) => void;

/**
 * WindowList class manages the display and interaction of Chrome windows and their tabs
 * Handles tab selection, window display, and tab focusing functionality
 */
export class WindowList {
  private container: HTMLElement;
  private selectedTabs: Set<number>;
  private onTabSelectionChange: TabSelectionChangeCallback;

  /**
   * Creates a WindowList instance
   * @param containerId - ID of the DOM element to contain the window list
   * @param onTabSelectionChange - Callback function triggered when tab selection changes
   */
  constructor(
    containerId: string,
    onTabSelectionChange: TabSelectionChangeCallback
  ) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id ${containerId} not found`);
    }
    this.container = container;
    this.selectedTabs = new Set();
    this.onTabSelectionChange = onTabSelectionChange;
  }

  /**
   * Handles checkbox state changes for tab selection
   * Updates the selected tabs set and triggers the selection change callback
   * @param checkbox - The checkbox element that was changed
   * @param tabId - The ID of the tab associated with the checkbox
   */
  private handleTabCheckbox(checkbox: HTMLInputElement, tabId: number): void {
    if (checkbox.checked) {
      this.selectedTabs.add(tabId);
    } else {
      this.selectedTabs.delete(tabId);
    }
    this.onTabSelectionChange(this.selectedTabs);
  }

  /**
   * Creates a DOM element representing a tab
   * Includes checkbox for selection, favicon, and title
   * @param tab - Chrome tab object to create element for
   * @param window - Chrome window object containing the tab
   * @returns The created tab element
   */
  private createTabElement(
    tab: chrome.tabs.Tab,
    window: chrome.windows.Window
  ): HTMLElement {
    const tabElement = document.createElement("div");
    tabElement.className = "tab-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "tab-checkbox";
    checkbox.checked = this.selectedTabs.has(tab.id!);
    checkbox.addEventListener("change", () =>
      this.handleTabCheckbox(checkbox, tab.id!)
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
        focusTab(window.id!, tab.id!);
      }
    });

    return tabElement;
  }

  /**
   * Creates a container element for a window and its tabs
   * Includes window header and all tabs in the window
   * @param window - Chrome window to create container for
   * @param currentWindow - Currently active Chrome window
   * @param index - Index of the window in the window list
   * @returns The created window container element
   */
  private createWindowContainer(
    window: chrome.windows.Window,
    currentWindow: chrome.windows.Window,
    index: number
  ): HTMLElement {
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

    if (window.tabs) {
      window.tabs.forEach((tab) => {
        const tabElement = this.createTabElement(tab, window);
        tabList.appendChild(tabElement);
      });
    }

    windowContainer.appendChild(windowHeader);
    windowContainer.appendChild(tabList);
    return windowContainer;
  }

  /**
   * Renders all Chrome windows and their tabs in the container
   * Gets current window state and creates all necessary DOM elements
   */
  public async render(): Promise<void> {
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
   * @returns Set of selected tab IDs
   */
  public getSelectedTabs(): Set<number> {
    return this.selectedTabs;
  }

  /**
   * Clears all tab selections and re-renders the window list
   * Used after operations like group creation are completed
   */
  public clearSelection(): void {
    this.selectedTabs.clear();
    this.render();
  }
}
