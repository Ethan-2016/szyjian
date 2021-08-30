//处理二维码和条形码 WYC20190930
  
var DCBarcodeManager = new Object();

DCBarcodeManager.createBarcodeElement = function (options, isTDBarcode) {
    //防御
    if (options == null || options == undefined) {
        options = new Object();
    } else if (isTDBarcode == undefined) {
        isTDBarcode = false;
    }

    var element = document.createElement("img");
    //通用属性
    if (isTDBarcode) {
        element.setAttribute("dctype", "XTextTDBarcodeElement");
    } else {
        element.setAttribute("dctype", "XTextNewBarcodeElement");
    }

    if (options.Width) {
        element.width = element.style.width = options.Width;
    } else {
        element.width = 100;
    }
    if (options.Height) {
        element.height = element.style.height = options.Height;
    } else {
        element.height = 100;
    }
    if (options.ID) {
        element.id = options.ID;
    } else {
        element.id = "";
    }
    if (options.Text) {
        element.setAttribute("text", options.Text);
    } else {
        element.setAttribute("text", "");
    }

    //条形码专用属性
    if (options.BarcodeStyle) {
        element.setAttribute("dc_barcodestyle2", options.BarcodeStyle);
    } else {
        element.setAttribute("dc_barcodestyle2", "Code128C");
    }
    if (options.Name) {
        element.setAttribute("name", options.Name);
    } else {
        element.setAttribute("name", "");
    }
    if (options.FontSize) {
        element.setAttribute("dcfontsize", options.FontSize);
    } else {
        element.setAttribute("dcfontsize", 12);
    }
    if (options.TextAlignment) {
        element.setAttribute("textalignment", options.TextAlignment);
    } else {
        element.setAttribute("textalignment", "");
    }
    if (options.ShowText) {
        element.setAttribute("showtext", options.ShowText);
    } else {
        element.setAttribute("showtext", "");
    }

    //获取图片来源并返回
    element.src = DCBarcodeManager.GetElementImageData(element);
    return element;
};

DCBarcodeManager.GetElementImageData = function (element) {
    var data = "data:image/png;base64,";
    var url = document.body.getAttribute("servicepageurl")
        + "?dcgetbarcodeimage=" + element.getAttribute("dctype")
        + "&id=" + element.id
        + "&width=" + element.width
        + "&height=" + element.height
        + "&text=" + element.getAttribute("text")
        + "&dc_barcodestyle2=" + element.getAttribute("dc_barcodestyle2")
        + "&name=" + element.getAttribute("name")
        + "&dcfontsize=" + element.getAttribute("dcfontsize")
        + "&textalignment=" + element.getAttribute("textalignment")
        + "&showtext=" + element.getAttribute("showtext");
    var settings = {
        async: false,
        type: 'post'
    };
    DCDomTools.fixAjaxSettings(settings);
    $.ajax(
        url,
        settings).always(
            function (responseText, textStatus, jqXHR) {
                if (typeof (responseText) === "object") {
                    responseText = responseText.responseText;
                }
                data = data + responseText;
            });
    return data;
};

DCBarcodeManager.InsertBarcodeElement = function (options) {
    var element = DCBarcodeManager.createBarcodeElement(options, false);
    if (element != null) {
        DCBarcodeManager.innerInsertBarcode(element);
    }
};

DCBarcodeManager.InsertTDBarcodeElement = function (options) {
    var element = DCBarcodeManager.createBarcodeElement(options, true);
    if (element != null) {
        DCBarcodeManager.innerInsertBarcode(element);
    }
};

DCBarcodeManager.innerInsertBarcode = function (element) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextImageElement") == false) {
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