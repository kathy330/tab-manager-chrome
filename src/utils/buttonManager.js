/**
 * Manages the create group button visibility and functionality
 * Shows the button when multiple tabs are selected (>1)
 * Removes the button when fewer tabs are selected
 *
 * @param {Set} selectedTabs - Set of currently selected tab IDs
 * @param {Function} onCreateClick - Callback function when create button is clicked
 */
export const updateCreateGroupButton = (selectedTabs, onCreateClick) => {
  const existingButton = document.getElementById("createGroupBtn");

  if (selectedTabs.size > 1) {
    if (!existingButton) {
      const createBtn = createButton();
      createBtn.addEventListener("click", onCreateClick);
      document.querySelector(".controls").appendChild(createBtn);
    }
  } else if (existingButton) {
    existingButton.remove();
  }
};

/**
 * Creates a new group button element with standard styling
 * @returns {HTMLButtonElement} The created button element
 */
const createButton = () => {
  const createBtn = document.createElement("button");
  createBtn.id = "createGroupBtn";
  createBtn.className = "create-group-btn";
  createBtn.textContent = "Create Group";
  return createBtn;
};
