import { isParentTarget} from '../utils';
const pluginName = 'emrTextInput';

const useEmrTextInputPlugin = function(editorId) {
  var baidu = window.baidu || {};
  var ueditor = baidu.editor = window.UE;

  if (!ueditor) {
    console.error('控制加载异常，请确认是否正确加载编辑器插件');
    return;
  }

  ueditor.plugins[pluginName] = function() {
    var me = this;
    // 注册插件命令
    me.commands[pluginName] = {
      execCommand: function() {
        me.execCommand('inserthtml', '<span>测试功能按钮</span>')
      }
    };

    // 锚点
    var popup = new baidu.editor.ui.Popup({
      editor: this,
      content: '',
      className: 'edui-bubble',
      _edittext: function() {
        baidu.editor.plugins[pluginName].editdom = popup.anchorEl;
        me.execCommand(pluginName);
        this.hide();
      },
      _delete: function() {
        if (window.confirm('确认要删除此域吗？')) {
          baidu.editor.dom.domUtils.remove(this.anchorEl, false);
        }
        this.hide();
      }
    });
    popup.render();

    // 锚点事件绑定
    me.addListener('mouseover', function(t, evt) {
      var pattern = me.body.getAttribute('pattern');
      if (pattern && pattern !== 'design') {
        return;
      }
      evt = evt || window.event;
      var el = evt.target || evt.srcElement;
      var target = isParentTarget(el, 'emrplugin');
      if (!target) {
        popup.hide();
        return;
      }
      var emrplugin = target.getAttribute('emrplugin');
      if (emrplugin === pluginName) {
        var html = popup.formatHtml(`<nobr>${target.getAttribute('title')}  单行文本输入: <span onclick=$$._edittext() class="edui-clickable">编辑</span> <span onclick=$$._delete() class="edui-clickable">删除</span></nobr>`);
        if (html) {
          popup.getDom('content').innerHTML = html;
          popup.anchorEl = target;
          popup.showAnchor(popup.anchorEl);
        } else {
          popup.hide();
        }
      } else {
        popup.hide();
      }
    });
  }

  // 工具栏上的按钮
  baidu.editor.ui.emrTextInput = function(editor, list, title) {
    var dialog = new ueditor.ui.Dialog({
      iframeUrl: editor.options.UEDITOR_HOME_URL + 'dialogs/samjan/input.html',
      editor: editor,
      name: pluginName,
      title: '插入文本输入域',
      cssRules: 'width: 600px; height: 310px',
      buttons: [
        {
          className: 'edui-okbutton',
          label: '确定',
          onclick: function() {
            dialog.close(true);
          }
        },
        {
          className: 'edui-cancelbutton',
          label: '取消',
          onclick: function() {
            dialog.close(false);
          }
        }
      ]
    });

    editor.ready(function() {
      ueditor.utils.cssRule('kfformula', 'img.kfformula{vertical-align: middle;}', editor.document);
    });

    var icon = editor.options.UEDITOR_HOME_URL + 'icons/input.png';
    var link = document.createElement('a');
    link.href = icon;
    link.href = link.href;
    icon = link.href;

    var button = new ueditor.ui.Button({
      name: 'input-1',
      title: '插入单行文本输入域',
      className: 'edui-for-input-1',
      cssRules: `background-image: url(${icon}) !important`,
      onclick: function() {
        dialog.render();
        dialog.open();
      }
    });

    editor.addListener('selectionchange', function() {
      var state = editor.queryCommandState('input');
      if (state === -1) {
        button.setDisabled(true);
        button.setChecked(false);
      } else {
        button.setDisabled(false);
        button.setChecked(state);
      }
    });

    return button;
  }
};

export { useEmrTextInputPlugin }