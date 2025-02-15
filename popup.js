// popup.js
document.addEventListener("DOMContentLoaded", function () {
  let selectedTabs = new Set();

  async function getAllGroups() {
    try {
      // First get all current groups from all windows
      const windows = await new Promise((resolve) => {
        chrome.windows.getAll({ populate: true }, resolve);
      });

      const activeGroupIds = new Set();
      const allGroups = new Map();

      // Collect all active tab groups
      for (const window of windows) {
        for (const tab of window.tabs) {
          if (tab.groupId !== -1) {
            activeGroupIds.add(tab.groupId);
          }
        }
      }

      // Get details for all active groups
      for (const groupId of activeGroupIds) {
        const group = await new Promise((resolve) => {
          chrome.tabGroups.get(groupId, resolve);
        });
        if (group) {
          allGroups.set(groupId, {
            ...group,
            isActive: true,
          });
        }
      }

      // Display groups
      const groupList = document.getElementById("groupList");
      groupList.innerHTML = "";

      allGroups.forEach((group) => {
        const groupElement = document.createElement("div");
        groupElement.className = `group-item ${group.color}`;

        const titleSpan = document.createElement("span");
        titleSpan.className = "group-title";
        titleSpan.textContent = group.title || "Unnamed group";

        const statusSpan = document.createElement("span");
        statusSpan.className = "group-status";
        statusSpan.textContent = group.isActive ? "●" : "○";

        groupElement.appendChild(statusSpan);
        groupElement.appendChild(titleSpan);
        groupList.appendChild(groupElement);

        if (group.isActive) {
          groupElement.addEventListener("click", async () => {
            // Find and focus the window containing this group
            for (const window of windows) {
              const hasGroup = window.tabs.some(
                (tab) => tab.groupId === group.id
              );
              if (hasGroup) {
                await chrome.windows.update(window.id, { focused: true });
                chrome.tabGroups.update(group.id, {
                  collapsed: !group.collapsed,
                });
                break;
              }
            }
          });
        }
      });

      const groupsSection = document.querySelector(".groups-section");
      groupsSection.style.display = allGroups.size ? "block" : "none";
    } catch (error) {
      console.error("Error getting groups:", error);
    }
  }

  async function getAllWindows() {
    const currentWindow = await new Promise((resolve) => {
      chrome.windows.getCurrent(resolve);
    });

    chrome.windows.getAll({ populate: true }, function (windows) {
      const windowsListContainer = document.getElementById("windowsList");
      windowsListContainer.innerHTML = "";

      windows.forEach((window, index) => {
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
          const tabElement = document.createElement("div");
          tabElement.className = "tab-item";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "tab-checkbox";
          checkbox.checked = selectedTabs.has(tab.id);
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              selectedTabs.add(tab.id);
            } else {
              selectedTabs.delete(tab.id);
            }
            updateCreateGroupButton();
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
              chrome.windows.update(window.id, { focused: true });
              chrome.tabs.update(tab.id, { active: true });
            }
          });

          tabList.appendChild(tabElement);
        });

        windowContainer.appendChild(windowHeader);
        windowContainer.appendChild(tabList);
        windowsListContainer.appendChild(windowContainer);
      });
    });
  }

  function showGroupDialog() {
    const dialog = document.createElement("div");
    dialog.className = "group-dialog";
    dialog.innerHTML = `
      <div class="dialog-content">
        <input type="text" id="groupName" placeholder="Name this group" class="group-name-input">
        <div class="color-options">
          ${["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan"]
            .map(
              (color) => `
              <div class="color-option ${color}" data-color="${color}"></div>
            `
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

    dialog
      .querySelector("#confirmGroup")
      .addEventListener("click", async () => {
        const name = document.getElementById("groupName").value;
        const tabIds = Array.from(selectedTabs);

        try {
          const groupId = await new Promise((resolve) => {
            chrome.tabs.group({ tabIds }, resolve);
          });

          await chrome.tabGroups.update(groupId, {
            title: name,
            color: selectedColor,
          });

          dialog.remove();
          selectedTabs.clear();
          initializeView();
        } catch (error) {
          console.error("Error creating group:", error);
        }
      });
  }

  function updateCreateGroupButton() {
    const existingButton = document.getElementById("createGroupBtn");
    if (selectedTabs.size > 1) {
      if (!existingButton) {
        const createBtn = document.createElement("button");
        createBtn.id = "createGroupBtn";
        createBtn.className = "create-group-btn";
        createBtn.textContent = "Create Group";
        createBtn.addEventListener("click", showGroupDialog);
        document.querySelector(".controls").appendChild(createBtn);
      }
    } else if (existingButton) {
      existingButton.remove();
    }
  }

  async function initializeView() {
    await getAllGroups();
    await getAllWindows();
  }

  // Initial load
  initializeView();

  // Add refresh button handler
  document
    .getElementById("refreshTabs")
    .addEventListener("click", initializeView);
});
