<template>
  <div class="emr-editor">
    <div class="emreditor-toolbar">
      <ul class="tab-list">
        <li class="tab-list-item head">
          {{ title }}
        </li>
        <li v-for="(tab, index) in tabs" class="tab-list-item" :class="{active: currentTabIndex == index}" :key="index" @click="tabClicked(tab, index)">
          {{ tab }}
        </li>
      </ul>
      <div class="toolbar-content">
        <div v-for="(bar, index) in bars" class="toolbar-content-item" :class="{active: currentTabIndex == index}" :key="index">
          <div class="edui-default">
            <div class="edui-toolbar" v-html="bar"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="editor-canvas">
      <div class="paper">
        <ueditor-wrap v-model="content" :config="editorConfig" @ready="ready" :destroy="false" @before-init="initEmrEditor"></ueditor-wrap>
      </div>
    </div>
  </div>
</template>

<script>
import UeditorWrap from 'vue-ueditor-wrap';
import { useEmrEditorPlugins } from './plugins';
import { renderToolBar } from './toolbar';

export default {
  name: 'EmrEditor',
  components: {
    UeditorWrap,
  },
  props: {
    title: {
      type: String,
      default: '尚哲编辑器'
    },
    toolbars: {
      type: Array,
      default() {
        return [
          {
            name: '文件',
            commands: [
              'source', 'undo', 'redo', 'formatmatch', 'removeformat', '|', 'print', 'preview', 'searchreplace', '|', 'allwidgets', 'allhtml'
            ],
          },
          {
            name: '编辑',
            commands: [
              'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'subscript', 'superscript', '|',
              'paragraph', 'fontfamily', 'fontsize', '|',
              'indent', 'outdent', '|',
              'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
              'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'indent', '|',
              'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', 'paste'
            ],
          },
          {
            name: '插入',
            commands: [
              'simpleupload', 'insertimage', 'scrawl', 'inserttable', '|', 'pagebreak', 'spechars', '|', 'kityformula', '|', 'horizontal', 'snapscreen', '|',
              'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', '|',
              'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'emrpagebreak',
            ]
          },
          {
            name: '表格',
            commands: [
              'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', '|',
              'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', '|', 'tablecellrelavance', 'tablecellgroupmutil', 'tablecellwidth', 'tablecelleditable', 'tablefileds', 'tablecellchooseshow', 'tableprintcellwidth', 'tablesetselector', 'settingsplitrow'
            ],
          },
          {
            name: '表单控件',
            commands: [
              'emrTextInput', 'template', 'controllibrary', 'input', 'textarea', 'radio', 'checkbox', 'select', 'tabs', 'emrtable', 'remarksetting', 'emrbutton'// 'timeinput'
            ],
          }
        ]
      }
    },
    value: {
      type: String,
      default: ''
    }
  },
  watch: {
    content() {
      this.$emit('input', this.content);
    }
  },
  data() {
    return {
      content: this.value,
      ue: null,
      currentTabIndex: 0,
      tabs: [],
      bars: [],
      editorConfig: {
        // 使用自定义toolbars，给默认的toolbars赋值为空即可。
        toolbars: [],
        // 初始内容
        initialContent:'' ,
        // 编辑器不自动被内容撑高
        autoHeightEnabled: true,
        // 初始容器高度
        // initialFrameHeight: '100%',
        // 初始容器宽度
        initialFrameWidth: '100%',
        // 上传文件接口（这个地址是我为了方便各位体验文件上传功能搭建的临时接口，请勿在生产环境使用！！！部署在国外的服务器，如果无法访问，请自备梯子）
        serverUrl: 'http://35.201.165.105:8000/controller.php',
        // UEditor 资源文件的存放路径，如果你使用的是 vue-cli 生成的项目，通常不需要设置该选项，vue-ueditor-wrap 会自动处理常见的情况，如果需要特殊配置，参考下方的常见问题2
        UEDITOR_HOME_URL: '/ueditor/',
        // 层级设置为最底层，防止挡住topbar的菜单显示
        zIndex: 0,
        // 获取编辑器内容时，使用utf8编码
        charset: 'utf-8',
        // 禁用元素路径显示
        elementPathEnabled: false,
        // 禁用字数统计
        wordCount: false,
      }
    };
  },
  mounted() {

  },
  methods: {
    initEmrEditor(editorId) {
      useEmrEditorPlugins(editorId);
    },

    tabClicked(item, index) {
      this.currentTabIndex = index;
    },
    ready(editorInstance) {
      console.info('UEditor Ready, instance: ', editorInstance);
      this.ue = editorInstance;
      // 分解toolbars
      this.tabs = this.toolbars.map(b => b.name);
      this.$nextTick(() => {
        this.bars = this.toolbars.map(b => {
          return renderToolBar(this.ue, b.commands);
        });
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.emr-editor {
  height: 100%;
  display: flex;
  flex-direction: column;;

  .emreditor-toolbar {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    margin: 0 auto;
    background-color: #f1f1f1;

    .tab-list {
      width: 100%;
      margin: 2px 0px;

      .tab-list-item {
        font-size: 12px;
        display: inline-block;
        padding: 3px 15px;
        margin: 2px 4px 0 4px;
        border-bottom: none;
        cursor: pointer;

        &:hover {
          background: #ffffff;
        }
        &.head {
          background: #1DC5AA;
          color: #ffffff;
          padding: 4px 15px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          margin: 0;
          cursor: default;
        }
        &.active {
          background-color: #ffffff;
        }
      }
    }

    .toolbar-content {
      width: 100%;

      .toolbar-content-item {
        width: calc(100% - 12px);
        display: none;
        padding: 6px;
        &.active {
          display: block;
          background-color: #fdfdfd;
          border-bottom: 1px solid #f3f3f3;
        }
      }
    }
  }

  .editor-canvas {
    flex: auto;
    padding: 1rem 0;
    background-color: #f1f1f1;
    overflow: auto;

    .paper {
      width: 210mm;
      height: 297mm;
      border: 1px solid #fcfcfc;
      margin: auto;
      background-color: #ffffff;
      box-shadow: 4px 4px 10px #fafafa;
    }
  }
}
</style>

<style>
.edui-default {
}

.edui-default .edui-editor {
  border: none !important;
}

.edui-default .edui-toolbar .edui-icon {
    background-position: center center;
    background-repeat: no-repeat;
}

.edui-default .edui-toolbar .edui-button.edui-for-input-1 .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-checkbox-1 .edui-icon {
    width: 20px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-textarea-1 .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-select-1 .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-tabs-1 .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-emrtable-1 .edui-icon {
    width: 20px !important;
    background-size: 80% 116%;
}

.edui-default .edui-toolbar .edui-button.edui-for-table-cell-width .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-table-cell-editable .edui-icon {
    width: 30px !important;
    background-size: 85%;
}

.edui-default .edui-toolbar .edui-button.edui-for-settingsplitrow .edui-icon {
    width: 30px !important;
    background-size: 65%;
}

.edui-for-settingsplitrow .edui-dialog-body{
    width: 460px !important;
}

.edui-default .edui-toolbar .edui-button.table-cell-editable .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-table-fileds .edui-icon {
    width: 30px !important;
}

.edui-default .edui-toolbar .edui-button.edui-for-table-setting-selector .edui-icon{
    width: 20px !important;
    background-size: 80%;
}

.edui-default .edui-toolbar .edui-button.edui-for-emrbutton-1 .edui-icon{
    width: 20px !important;
    background-size: 100%;
}

.edui-default .edui-toolbar .edui-button.edui-for-remarksetting .edui-icon{
    width: 20px !important;
    background-size: 90%;
}
</style>