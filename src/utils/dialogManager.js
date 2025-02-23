import { createTabGroup } from "./tabManager.js";

/**
 * Shows a dialog for creating a new tab group
 * Allows users to:
 * - Name the group
 * - Select a color for the group
 * - Confirm or cancel group creation
 *
 * @param {Set} selectedTabs - Set of tab IDs to be grouped
 * @param {Function} onGroupCreated - Callback function to execute after group is created
 * @param {Function} clearSelection - Function to clear the selected tabs
 */
export const showGroupDialog = (
  selectedTabs,
  onGroupCreated,
  clearSelection
) => {
  const colors = [
    "grey",
    "blue",
    "red",
    "yellow",
    "green",
    "pink",
    "purple",
    "cyan",
  ];
  let selectedColor = "blue";

  const dialog = createDialogElement(colors);
  document.body.appendChild(dialog);

  // Set up event listeners
  setupColorSelection(dialog, (color) => (selectedColor = color));
  setupDialogButtons(dialog, async () => {
    const name = document.getElementById("groupName").value;
    const tabIds = Array.from(selectedTabs);

    try {
      await createTabGroup(tabIds, name, selectedColor);
      dialog.remove();
      clearSelection();
      onGroupCreated();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  });
};

/**
 * Creates the dialog DOM element with all necessary structure
 * @param {string[]} colors - Array of available color options
 * @returns {HTMLElement} The created dialog element
 */
const createDialogElement = (colors) => {
  const dialog = document.createElement("div");
  dialog.className = "group-dialog";
  dialog.innerHTML = `
    <div class="dialog-content">
      <input type="text" id="groupName" placeholder="Name this group" class="group-name-input">
      <div class="color-options">
        ${colors
          .map(
            (color) =>
              `<div class="color-option ${color}" data-color="${color}"></div>`
          )
          .join("")}
      </div>
      <div class="dialog-buttons">
        <button id="cancelGroup">Cancel</button>
        <button id="confirmGroup">Create</button>
      </div>
    </div>
  `;
  return dialog;
};

/**
 * Sets up color selection functionality in the dialog
 * @param {HTMLElement} dialog - The dialog element
 * @param {Function} onColorSelected - Callback when color is selected
 */
const setupColorSelection = (dialog, onColorSelected) => {
  dialog.querySelector(".color-options").addEventListener("click", (e) => {
    const colorDiv = e.target.closest(".color-option");
    if (colorDiv) {
      dialog
        .querySelectorAll(".color-option")
        .forEach((el) => el.classList.remove("selected"));
      colorDiv.classList.add("selected");
      onColorSelected(colorDiv.dataset.color);
    }
  });
};

/**
 * Sets up the dialog buttons (confirm/cancel) functionality
 * @param {HTMLElement} dialog - The dialog element
 * @param {Function} onConfirm - Callback for confirm button click
 */
const setupDialogButtons = (dialog, onConfirm) => {
  dialog.querySelector("#cancelGroup").addEventListener("click", () => {
    dialog.remove();
  });

  dialog.querySelector("#confirmGroup").addEventListener("click", onConfirm);
};
