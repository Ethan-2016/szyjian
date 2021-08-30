//迁移页码元素处理代码 WYC20201229

var DCPageInfoManager = new Object();

//WYC20200302:维护页码元素
DCPageInfoManager.InsertPageInfoElement = function (options) {
    var element = DCPageInfoManager.createPageInfo(options);
    if (element != null) {
        DCPageInfoManager.innerInsertPageInfo(element);
    }
};

DCPageInfoManager.createPageInfo = function (options) {
    //防御
    if (options == null || options == undefined) {
        options = new Object();
    }
    if (options.Height == null) {
        options.Height = "65";
    }
    if (options.Width == null) {
        options.Width = "500";
    }
    if (options.ValueType == null) {
        options.ValueType = "PageIndex";
    }
    if (options.FormatString == null) {
        options.FormatString = "第[%PageIndex%]页 共[%NumOfPages%]页";
    }
    if (options.ID == null) {
        options.ID = "pageInfoID";
    }
    var element = document.createElement("label");
    //目前暂时写死，后面再添加变量

    element.setAttribute("dctype", "XTextPageInfoElement");
    element.setAttribute("dc_width", options.Width);
    element.setAttribute("dc_autoheight", "true");
    element.setAttribute("dc_height", options.Height);
    element.setAttribute("dc_valuetype", options.ValueType);
    element.setAttribute("dc_formatstring", options.FormatString);
    element.setAttribute("id", options.ID);
    element.setAttribute("unselectable", "on");
    element.setAttribute("contenteditable", "false");
    element.innerText = "页码";

    return element;
};

DCPageInfoManager.innerInsertPageInfo = function (element) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextPageInfoElement") == false) {
        //console.log("插不了，打回");
        return;
    }
    var sel = DCSelectionManager.LastSelectionInfo;
    if (sel == null) {
        sel = DCSelectionManager.getSelection();
    }
    if (sel.currentContainer != null && element != null) {
        DCWriterControllerEditor.InsertElementAtCurentPosition(element, true);
    }
};