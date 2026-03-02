export default class LinkDialog {
  #editor;
  #dialog;
  #input;
  #isOpen = false;
  constructor(editor) {
    this.#editor = editor;
    this.#render();
    this.#bindEvents();
  }

  #render() {
    this.#dialog = document.createElement("div");
    this.#dialog.className = "link-dialog";
    this.#dialog.innerHTML = `
    <div class="link-dialog-overlay"></div>
    <div class="link-dialog-content">
        <div class="link-dialog-header">Insert Link</div>
        <input type="url" class="link-dialog-input" placeholder="https://example.com" />
        <div class="link-dialog-actions">
            <button type="button" class="link-dialog-btn link-dialog-btn-cancel">Cancel</button>
            <button type="button" class="link-dialog-btn link-dialog-btn-submit">Insert</button>
        </div>
    </div>    
    `;

    this.#input = this.#dialog.querySelector(".link-dialog-input");
    document.body.appendChild(this.#dialog);
  }

  #bindEvents() {
    this.#dialog
      .querySelector(".link-dialog-overlay")
      .addEventListener("click", () => {
        this.close();
      });
    this.#dialog
      .querySelector(".link-dialog-btn-cancel")
      .addEventListener("click", () => this.close());
    this.#dialog
      .querySelector(".link-dialog-btn-submit")
      .addEventListener("click", () => this.#submit());

    this.#input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.#submit();
      }
      if (e.key === "Escape") this.close();
    });
  }

  open() {
    this.#editor.saveSelection();
    const existingUrl = this.#getExistingUrl();

    this.#dialog.classList.add("is-open");
    this.#input.value = existingUrl || "";
    this.#input.focus();
    this.#input.select();
    this.#isOpen = true;
  }

  #getExistingUrl() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;

    let node = sel.getRangeAt(0).startContainer;

    while (node && node.nodeType !== Node.DOCUMENT_NODE) {
      if (node.nodeName === "A") {
        return node.getAttribute("href");
      }
      node = node.parentNode;
    }
    return null;
  }

  close() {
    this.#dialog.classList.remove("is-open");
    this.#isOpen = false;
  }

  #submit() {
    this.#dialog.classList.add("is-open");
    const url = this.#input.value.trim();
    if (!url) return;

    this.#editor.restoreSelection();
    this.#editor.link(url);
    this.close();
  }
}
