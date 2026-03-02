import EventEmitter from "./EventEmitter.js";
import Selection from "./Selection.js";
import Formatter from "./Formatter.js";
import Toolbar from "./Toolbar.js";
import LinkDialog from "./LinkDialog.js";
import { EVENTS } from "./constants.js";

export default class TextEditor {
  #container;
  #options;
  #wrapper;
  #content;
  #events;
  #selection;
  #formatter;
  #toolbar;
  #linkDialog;
  #shortcuts = new Map([
    ["ctrl+b", "bold"],
    ["ctrl+i", "italic"],
    ["ctrl+u", "underline"],
    ["ctrl+shift+x", "strikethrough"],
    ["ctrl+1", "heading1"],
    ["ctrl+2", "heading2"],
    ["ctrl+shift+l", "bulletList"],
    ["ctrl+shift+o", "numberedList"],
    ["ctrl+shift+k", "blockquote"],
  ]);

  constructor(selector, options = {}) {
    this.#container = document.querySelector(selector);
    if (!this.#container) {
      throw new Error(`Element not found for selector: ${selector}`);
    }
    this.#options = {
      placeholder: "Type here...",
      ...options,
    };

    this.#events = new EventEmitter();

    this.#render();
    this.#bindEvents();
  }

  #render() {
    this.#wrapper = document.createElement("div");
    this.#wrapper.className = "text-editor";

    this.#content = document.createElement("div");
    this.#content.className = "text-editor-content";
    this.#content.contentEditable = "true";
    this.#content.dataset.placeholder = this.#options.placeholder;

    this.#wrapper.appendChild(this.#content);
    this.#container.appendChild(this.#wrapper);
    this.#content.focus();

    this.#selection = new Selection(this.#content);
    this.#formatter = new Formatter(this.#content, this.#selection);

    this.#toolbar = new Toolbar(this);
    this.#toolbar.render(this.#wrapper);

    this.#linkDialog = new LinkDialog(this);
  }

  #bindEvents() {
    this.#content.addEventListener("focus", () => {
      if (!this.#content.innerHTML.trim()) {
        this.#content.innerHTML = "<p><br></p>";
      }
      this.#events.emit(EVENTS.FOCUS);
    });

    this.#content.addEventListener("blur", () => {
      this.#events.emit(EVENTS.BLUR);
    });

    this.#content.addEventListener("input", () => {
      if (this.#content.textContent.trim() === "") {
        this.#content.innerHTML = "<p><br></p>";
      }
      this.#events.emit(EVENTS.CHANGE);
    });

    this.#content.addEventListener("keydown", (e) => this.#handleKeyDown(e));
  }

  #handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      if (this.#handleEnter(e)) {
        return;
      }
    }

    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
    if (e.shiftKey) parts.push("shift");
    parts.push(e.key.toLowerCase());

    const combo = parts.join("+");

    const action = this.#shortcuts.get(combo);

    if (action && typeof this[action] === "function") {
      e.preventDefault();
      this[action]();
    }
  }

  #getCurrentBlock() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;

    let node = sel.getRangeAt(0).startContainer;

    while (node && node !== this.#content) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const display = window.getComputedStyle(node).display;
        if (display === "block" || display === "list-item") {
          return node;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  #handleEnter(e) {
    const block = this.#getCurrentBlock();
    if (!block) return false;

    const tagName = block.tagName.toLowerCase();
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);

    const atEnd =
      range.collapsed &&
      range.endOffset === (range.endContainer.textContent || "").length;

    if ((tagName === "h1" || tagName === "h2") && atEnd) {
      e.preventDefault();
      const p = document.createElement("p");
      p.innerHTNL = "<br>";
      block.after(p);

      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      return true;
    }

    if (tagName === "li" && block.textContent.trim() === "") {
      e.preventDefault();
      document.execCommand("insertParagraph");
      document.execCommand("outdent");
      return true;
    }

    if (tagName === "blockquote" && block.textContent.trim() === "") {
      e.preventDefault();
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      block.after(p);
      block.remove();

      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      return true;
    }

    return false;
  }

  on(event, callback) {
    this.#events.on(event, callback);
  }

  off(event, callback) {
    this.#events.off(event, callback);
  }

  saveSelection() {
    this.#selection.save();
  }

  restoreSelection() {
    this.#selection.restore();
  }

  insertHTML(html) {
    this.#selection.insertHTML(html);
  }

  insertText(text) {
    this.#selection.insertText(text);
  }

  getSelectedText() {
    return this.#selection.getSelectedText();
  }

  isCollapsed() {
    return this.#selection.isCollapsed();
  }

  bold() {
    this.#formatter.bold();
  }

  italic() {
    this.#formatter.italic();
  }

  underline() {
    this.#formatter.underline();
  }

  strikethrough() {
    this.#formatter.strikethrough();
  }

  heading1() {
    this.#formatter.heading1();
  }

  heading2() {
    this.#formatter.heading2();
  }

  paragraph() {
    this.#formatter.paragraph();
  }

  blockquote() {
    this.#formatter.blockquote();
  }

  bulletList() {
    this.#formatter.bulletList();
  }

  numberedList() {
    this.#formatter.numberedList();
  }

  getState() {
    return this.#formatter.getState();
  }

  isInEditor() {
    return this.#selection.isInEditor();
  }

  link(url) {
    this.#formatter.link(url);
  }

  unlink() {
    this.#formatter.unlink();
  }
  openLinkDialog() {
    this.#linkDialog.open();
  }
}
