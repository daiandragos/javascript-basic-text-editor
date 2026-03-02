export default class Selection {
  #editorElement;
  #savedRange;

  constructor(editorElement) {
    this.#editorElement = this.#editorElement;
    this.#savedRange = null;
  }

  getSelection() {
    return window.getSelection();
  }

  getRange() {
    const sel = this.getSelection();
    return sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
  }

  getSelectedText() {
    return this.getSelection().toString();
  }

  isCollapsed() {
    return this.getSelection().isCollapsed;
  }

  isInEditor() {
    const sel = this.getSelection();

    return sel.anchorNode && this.#editorElement?.contains(sel.anchorNode);
  }

  save() {
    const sel = this.getSelection();
    if (sel.rangeCount > 0) {
      this.#savedRange = sel.getRangeAt(0).cloneRange();
    }
  }

  restore() {
    if (this.#savedRange) {
      const sel = this.getSelection();
      sel.removeAllRanges();
      sel.addRange(this.#savedRange);
    }
  }

  insertHTML(html) {
    this.restore();
    const range = this.getRange();
    if (!range) return;

    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
    range.collapse(false);
  }

  insertText(text) {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    this.insertHTML(escaped);
  }
}
