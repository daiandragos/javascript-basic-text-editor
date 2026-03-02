export default class Formatter {
  #editorElement;
  #selection;
  constructor(editorElement, selection) {
    this.#editorElement = editorElement;
    this.#selection = selection;
  }

  #exec(command, value = null) {
    this.#selection.restore();
    this.#editorElement.focus();
    document.execCommand(command, false, value);
  }

  bold() {
    this.#exec("bold");
  }
  italic() {
    this.#exec("italic");
  }
  underline() {
    this.#exec("underline");
  }
  strikethrough() {
    this.#exec("strikeThrough");
  }

  link(url) {
    if (!url) return;
    this.#exec("createLink", url);
  }

  unlink() {
    this.#exec("unlink");
  }

  #toggleBlock(tag) {
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    if (current === tag) {
      this.#exec("formatBlock", "p");
    } else {
      this.#exec("formatBlock", tag);
    }
  }

  #isInsideTag(tagName) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;

    let node = sel.getRangeAt(0).commonAncestorContainer;
    while (node && node !== this.#editorElement) {
      if (node.nodeName && node.nodeName.toLowerCase() === tagName) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  heading1() {
    this.#toggleBlock("h1");
  }

  heading2() {
    this.#toggleBlock("h2");
  }

  paragraph() {
    this.#toggleBlock("p");
  }

  blockquote() {
    if (this.#isInsideTag("blockquote")) {
      this.#exec("outdent");
    } else {
      this.#exec("formatBlock", "blockquote");
    }
  }

  bulletList() {
    this.#exec("insertUnorderedList");
  }
  numberedList() {
    this.#exec("insertOrderedList");
  }

  isBold() {
    return document.queryCommandState("bold");
  }

  isItalic() {
    return document.queryCommandState("italic");
  }

  isUnderline() {
    return document.queryCommandState("underline");
  }

  isStrikethrough() {
    return document.queryCommandState("strikeThrough");
  }

  getState() {
    const blockFormat = document.queryCommandValue("formatBlock").toLowerCase();
    return {
      bold: this.isBold(),
      italic: this.isItalic(),
      underline: this.isUnderline(),
      strikethrough: this.isStrikethrough(),

      heading1: blockFormat === "h1",
      heading2: blockFormat === "h2",
      blockquote: this.#isInsideTag("blockquote"),

      bulletList: document.queryCommandState("insertUnorderedList"),
      numberedList: document.queryCommandState("insertOrderedList"),
    };
  }
}
