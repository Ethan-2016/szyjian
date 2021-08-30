import moment from 'moment';

var renderToolBar = function(editor, commands) {
  if (!editor) return;

  let editorUI = window.baidu.editor.ui;
  var html = '';
  for(var i = 0; i < commands.length; i++) {
    let cmdUI = editorUI[commands[i]];
    if (!cmdUI) {
      html += '<div class="edui-box edui-separator edui-default"></div>';
    } else {
      let ui = cmdUI(editor);
      html += ui.renderHtml();
    }
  }
  return html;
}

export { renderToolBar };