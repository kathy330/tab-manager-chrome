// Import styles
import "./styles/popup.css";
import "./styles/components/groups.css";
import "./styles/components/windows.css";
import "./styles/components/dialog.css";

import { WindowList } from "./components/WindowList.js";
import { createTabGroup } from "./utils/tabManager.js";

const updateCreateGroupButton = (selectedTabs) => {
  const existingButton = document.getElementById("createGroupBtn");
  if (selectedTabs.size > 1) {
    if (!existingButton) {
      const createBtn = document.createElement("button");
      createBtn.id = "createGroupBtn";
      createBtn.className = "create-group-btn";
      createBtn.textContent = "Create Group";
      createBtn.addEventListener("click", () => showGroupDialog(selectedTabs));
      document.querySelector(".controls").appendChild(createBtn);
    }
  } else if (existingButton) {
    existingButton.remove();
  }
};

const showGroupDialog = (selectedTabs) => {
  const dialog = document.createElement("div");
  dialog.className = "group-dialog";
  dialog.innerHTML = `
      <div class="dialog-content">
        <input type="text" id="groupName" placeholder="Name this group" class="group-name-input">
        <div class="color-options">
          ${["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan"]
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

  document.body.appendChild(dialog);

  let selectedColor = "blue";
  dialog.querySelector(".color-options").addEventListener("click", (e) => {
    const colorDiv = e.target.closest(".color-option");
    if (colorDiv) {
      dialog
        .querySelectorAll(".color-option")
        .forEach((el) => el.classList.remove("selected"));
      colorDiv.classList.add("selected");
      selectedColor = colorDiv.dataset.color;
    }
  });

  dialog.querySelector("#cancelGroup").addEventListener("click", () => {
    dialog.remove();
  });

  dialog.querySelector("#confirmGroup").addEventListener("click", async () => {
    const name = document.getElementById("groupName").value;
    const tabIds = Array.from(selectedTabs);

    try {
      await createTabGroup(tabIds, name, selectedColor);
      dialog.remove();
      windowList.clearSelection();
      initializeView();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  });
};

document.addEventListener("DOMContentLoaded", function () {
  // Initialize WindowList component
  const windowList = new WindowList("windowsList", (selectedTabs) => {
    updateCreateGroupButton(selectedTabs);
  });

  // async function getAllGroups() {
  //   try {
  //     const windows = await chrome.windows.getAll({ populate: true });
  //     const activeGroupIds = new Set();
  //     const allGroups = new Map();

  //     // Collect all active tab groups
  //     for (const window of windows) {
  //       for (const tab of window.tabs) {
  //         if (tab.groupId !== -1) {
  //           activeGroupIds.add(tab.groupId);
  //         }
  //       }
  //     }

  //     // Get details for all active groups
  //     for (const groupId of activeGroupIds) {
  //       const group = await chrome.tabGroups.get(groupId);
  //       if (group) {
  //         allGroups.set(groupId, {
  //           ...group,
  //           isActive: true,
  //         });
  //       }
  //     }

  //     // Display groups
  //     const groupList = document.getElementById("groupList");
  //     groupList.innerHTML = "";

  //     allGroups.forEach((group) => {
  //       const groupElement = document.createElement("div");
  //       groupElement.className = `group-item ${group.color}`;

  //       const titleSpan = document.createElement("span");
  //       titleSpan.className = "group-title";
  //       titleSpan.textContent = group.title || "Unnamed group";

  //       const statusSpan = document.createElement("span");
  //       statusSpan.className = "group-status";
  //       statusSpan.textContent = group.isActive ? "●" : "○";

  //       groupElement.appendChild(statusSpan);
  //       groupElement.appendChild(titleSpan);
  //       groupList.appendChild(groupElement);

  //       if (group.isActive) {
  //         groupElement.addEventListener("click", async () => {
  //           for (const window of windows) {
  //             const hasGroup = window.tabs.some(
  //               (tab) => tab.groupId === group.id
  //             );
  //             if (hasGroup) {
  //               await chrome.windows.update(window.id, { focused: true });
  //               chrome.tabGroups.update(group.id, {
  //                 collapsed: !group.collapsed,
  //               });
  //               break;
  //             }
  //           }
  //         });
  //       }
  //     });

  //     const groupsSection = document.querySelector(".groups-section");
  //     groupsSection.style.display = allGroups.size ? "block" : "none";
  //   } catch (error) {
  //     console.error("Error getting groups:", error);
  //   }
  // }

  async function initializeView() {
    // await getAllGroups();
    await windowList.render();
  }

  // Initial load
  initializeView();

  // Add refresh button handler
  document
    .getElementById("refreshTabs")
    .addEventListener("click", initializeView);
});
