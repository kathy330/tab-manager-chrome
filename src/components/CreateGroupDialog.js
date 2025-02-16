import { createTabGroup } from "../utils/tabManager.js";

export class CreateGroupDialog {
  constructor(onGroupCreated) {
    this.onGroupCreated = onGroupCreated;
    this.dialog = null;
    this.selectedColor = "blue";
  }

  show() {
    this.dialog = document.createElement("div");
    this.dialog.className = "group-dialog";
    this.dialog.innerHTML = this.getDialogHTML();
    document.body.appendChild(this.dialog);

    this.setupEventListeners();
  }

  getDialogHTML() {
    return `
      <div class="dialog-content">
        <input type="text" id="groupName" placeholder="Name this group" class="group-name-input">
        <div class="color-options">
          ${this.getColorOptions()}
        </div>
        <div class="dialog-buttons">
          <button id="cancelGroup">Cancel</button>
          <button id="confirmGroup">Create</button>
        </div>
      </div>
    `;
  }

  getColorOptions() {
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
    return colors
      .map(
        (color) =>
          `<div class="color-option ${color}" data-color="${color}"></div>`
      )
      .join("");
  }

  setupEventListeners() {
    this.dialog
      .querySelector(".color-options")
      .addEventListener("click", (e) => {
        const colorDiv = e.target.closest(".color-option");
        if (colorDiv) {
          this.dialog
            .querySelectorAll(".color-option")
            .forEach((el) => el.classList.remove("selected"));
          colorDiv.classList.add("selected");
          this.selectedColor = colorDiv.dataset.color;
        }
      });

    this.dialog.querySelector("#cancelGroup").addEventListener("click", () => {
      this.close();
    });

    this.dialog
      .querySelector("#confirmGroup")
      .addEventListener("click", async () => {
        await this.createGroup();
      });
  }

  async createGroup() {
    const name = document.getElementById("groupName").value;
    const tabIds = Array.from(this.tabIds);

    try {
      await createTabGroup(tabIds, name, this.selectedColor);
      this.close();
      if (this.onGroupCreated) {
        this.onGroupCreated();
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }

  setTabIds(tabIds) {
    this.tabIds = tabIds;
  }

  close() {
    if (this.dialog) {
      this.dialog.remove();
      this.dialog = null;
    }
  }
}
