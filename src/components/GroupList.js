import { getAllGroups } from "../utils/groupManager.js";
import { focusWindow } from "../utils/windowManager.js";
import { toggleGroupCollapse } from "../utils/groupManager.js";

export class GroupList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.groups = new Map();
  }

  async initialize() {
    try {
      const { allGroups, windows } = await getAllGroups();
      this.groups = allGroups;
      this.render(windows);
    } catch (error) {
      console.error("Error initializing GroupList:", error);
    }
  }

  render(windows) {
    this.container.innerHTML = "";

    this.groups.forEach((group) => {
      const groupElement = this.createGroupElement(group);

      if (group.isActive) {
        groupElement.addEventListener("click", async () => {
          for (const window of windows) {
            const hasGroup = window.tabs.some(
              (tab) => tab.groupId === group.id
            );
            if (hasGroup) {
              await focusWindow(window.id);
              await toggleGroupCollapse(group.id, group.collapsed);
              break;
            }
          }
        });
      }

      this.container.appendChild(groupElement);
    });

    // Show/hide groups section based on whether there are groups
    const groupsSection = document.querySelector(".groups-section");
    groupsSection.style.display = this.groups.size ? "block" : "none";
  }

  createGroupElement(group) {
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

    return groupElement;
  }
}
