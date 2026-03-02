import TextEditor from "./TextEditor.js";

const editor = new TextEditor("#editor", {
  placeholder: "Start typing here...",
});

// let's use our editor
window.editor = editor;
