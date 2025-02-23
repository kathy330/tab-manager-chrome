// Import styles
import "./styles/popup.css";
import "./styles/components/groups.css";
import "./styles/components/windows.css";
import "./styles/components/dialog.css";

// Import components and utilities
import { WindowList } from "./components/WindowList.js";
import { showGroupDialog } from "./utils/dialogManager.js";
import { updateCreateGroupButton } from "./utils/buttonManager.js";

/**
 * Main popup initialization and event handling
 */
document.addEventListener("DOMContentLoaded", function () {
  let windowList;

  const initializeView = async () => {
    await windowList.render();
  };

  // Initialize components
  windowList = new WindowList("windowsList", (selectedTabs) => {
    updateCreateGroupButton(selectedTabs, () => {
      showGroupDialog(selectedTabs, initializeView, () =>
        windowList.clearSelection()
      );
    });
  });

  // Initial load
  initializeView();

  // Set up refresh functionality
  document
    .getElementById("refreshTabs")
    .addEventListener("click", initializeView);
});
