export default class Toolbar {
  #editor;
  #toolbar;
  #buttons;

  constructor(editor) {
    this.#editor = editor;
    this.#buttons = new Map();
  }

  #getButtonConfig() {
    return [
      {
        name: "bold",
        label: "B",
        title: "Bold",
      },
      {
        name: "italic",
        label: "I",
        title: "Italic",
      },
      {
        name: "underline",
        label: "U",
        title: "Underline",
      },
      {
        name: "strikethrough",
        label: "S",
        title: "Strikethrough",
      },
      {
        name: "separator",
      },
      {
        name: "heading1",
        label: "H1",
        title: "Heading 1",
      },
      {
        name: "heading2",
        label: "H2",
        title: "Heading 2",
      },
      {
        name: "separator",
      },
      {
        name: "bulletList",
        label: "•",
        title: "Bullet List",
      },
      {
        name: "numberedList",
        label: "1",
        title: "Numbered List",
      },
      {
        name: "blockquote",
        label: '"',
        title: "Quote",
      },
      {
        name: "separator",
      },
      {
        name: "openLinkDialog",
        label: "📎",
        title: "Insert Link",
        action: "openLinkDialog",
      },
    ];
  }

  render(container) {
    this.#toolbar = document.createElement("div");
    this.#toolbar.className = "toolbar";
    this.#getButtonConfig().forEach((config) => {
      if (config.name === "separator") {
        const sep = document.createElement("span");
        sep.className = "toolbar-separator";
        this.#toolbar.appendChild(sep);
        return;
      }

      const btn = this.#createButton(config);
      this.#buttons.set(config.name, btn);
      this.#toolbar.appendChild(btn);
    });

    container.insertBefore(this.#toolbar, container.firstChild);
    this.#bindEvents();
  }

  #createButton(config) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toolbar-btn";
    btn.textContent = config.label;
    btn.title = config.title;
    btn.dataset.action = config.name;

    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.#editor.saveSelection();
    });

    const actionName = config.action || config.name;

    btn.addEventListener("click", () => {
      this.#executeAction(actionName);
    });

    return btn;
  }

  #executeAction(action) {
    if (typeof this.#editor[action] === "function") {
      this.#editor[action]();
      this.#updateActiveState();
    }
  }

  #updateActiveState() {
    if (this.#editor.isInEditor()) {
      this.#buttons.forEach((btn) => {
        btn.classList.remove("is-active");
      });
      return;
    }

    const state = this.#editor.getState();
    this.#buttons.forEach((btn, name) => {
      if (state.hasOwnProperty(name)) {
        btn.classList.toggle("is-active", state[name]);
      }
    });
  }

  #bindEvents() {
    document.addEventListener("selectionchange", () => {
      this.#updateActiveState();
    });
  }
}
