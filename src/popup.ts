// Import styles
import "./styles/popup.css";
import "./styles/components/groups.css";
import "./styles/components/windows.css";
import "./styles/components/dialog.css";

// Import components and utilities
import { WindowList } from "./components/WindowList";
import { showGroupDialog } from "./utils/dialogManager";
import { updateCreateGroupButton } from "./utils/buttonManager";

/**
 * Main popup initialization and event handling
 */
document.addEventListener("DOMContentLoaded", function () {
  let windowList: WindowList;

  const initializeView = async (): Promise<void> => {
    await windowList.render();
  };

  // Initialize components
  windowList = new WindowList("windowsList", (selectedTabs: Set<number>) => {
    updateCreateGroupButton(selectedTabs, () => {
      showGroupDialog(selectedTabs, initializeView, () =>
        windowList.clearSelection()
      );
    });
  });

  // Initial load
  initializeView();

  // Set up refresh functionality
  const refreshButton = document.getElementById("refreshTabs");
  refreshButton?.addEventListener("click", initializeView);
});
