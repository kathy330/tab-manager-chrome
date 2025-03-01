import { createTabGroup } from "./tabManager";

type ColorType =
  | "grey"
  | "blue"
  | "red"
  | "yellow"
  | "green"
  | "pink"
  | "purple"
  | "cyan";

/**
 * Shows a dialog for creating a new tab group
 * Allows users to:
 * - Name the group
 * - Select a color for the group
 * - Confirm or cancel group creation
 *
 * @param selectedTabs - Set of tab IDs to be grouped
 * @param onGroupCreated - Callback function to execute after group is created
 * @param clearSelection - Function to clear the selected tabs
 */
export const showGroupDialog = (
  selectedTabs: Set<number>,
  onGroupCreated: () => void,
  clearSelection: () => void
): void => {
  const colors: ColorType[] = [
    "grey",
    "blue",
    "red",
    "yellow",
    "green",
    "pink",
    "purple",
    "cyan",
  ];
  let selectedColor: ColorType = "blue";

  const dialog = createDialogElement(colors);
  document.body.appendChild(dialog);

  // Set up event listeners
  setupColorSelection(dialog, (color: ColorType) => (selectedColor = color));
  setupDialogButtons(dialog, async () => {
    const nameElement = document.getElementById(
      "groupName"
    ) as HTMLInputElement;
    const name = nameElement.value;
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
 * @param colors - Array of available color options
 * @returns The created dialog element
 */
const createDialogElement = (colors: ColorType[]): HTMLElement => {
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
 * @param dialog - The dialog element
 * @param onColorSelected - Callback when color is selected
 */
const setupColorSelection = (
  dialog: HTMLElement,
  onColorSelected: (color: ColorType) => void
): void => {
  dialog.querySelector(".color-options")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const colorDiv = target.closest(".color-option") as HTMLDivElement | null;
    if (colorDiv) {
      dialog
        .querySelectorAll(".color-option")
        .forEach((el) => el.classList.remove("selected"));
      colorDiv.classList.add("selected");
      const color = colorDiv.dataset.color as ColorType;
      onColorSelected(color);
    }
  });
};

/**
 * Sets up the dialog buttons (confirm/cancel) functionality
 * @param dialog - The dialog element
 * @param onConfirm - Callback for confirm button click
 */
const setupDialogButtons = (
  dialog: HTMLElement,
  onConfirm: () => Promise<void>
): void => {
  dialog.querySelector("#cancelGroup")?.addEventListener("click", () => {
    dialog.remove();
  });

  dialog.querySelector("#confirmGroup")?.addEventListener("click", onConfirm);
};
