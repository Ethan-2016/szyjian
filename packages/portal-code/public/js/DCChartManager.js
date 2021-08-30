var DCChartManager = new Object();

DCChartManager.InsertChartElement = function (parameter) {
    var element = DCChartManager.createChartElement(parameter);
    if (element != null) {
        DCChartManager.innerInsertChart(element);
    }
};

DCChartManager.createChartElement = function (parameter) {
    if (parameter == null || parameter.ChartDatas == null) {
        return null;
    }
    var chartimg = document.createElement("img");
    chartimg.setAttribute("dctype", "XTextChartElement");
    if (parameter.ID) {
        chartimg.id = parameter.ID;
    }
    if (parameter.Name) {
        chartimg.name = parameter.Name;
    }
    if (parameter.Width) {
        chartimg.width = parameter.Width;
    } else {
        chartimg.width = "600px";
    }
    if (parameter.Height) {
        chartimg.height = parameter.Height;
    } else {
        chartimg.height = "300px";
    }
    chartimg.setAttribute("chartdatas", JSON.stringify(parameter.ChartDatas));
    DCChartManager.UpdateChartElement(chartimg);
    return chartimg;
};

DCChartManager.UpdateChartElement = function (chartelement) {
    var url = document.body.getAttribute("servicepageurl");
    url = url + "?dcgetchartimage=1"
        + "&width=" + chartelement.width
        + "&height=" + chartelement.height;
    var settings = {
        async: false,
        method: "POST",
        data: {
            "chartdata": encodeURI(chartelement.getAttribute("chartdatas"))
        },
        type: 'POST'
    };
    DCDomTools.fixAjaxSettings(settings);
    $.ajax(
        url,
        settings).always(
            function (responseText, textStatus, jqXHR) {
                chartelement.src = "data:image/png;base64," + responseText;
            });
};


DCChartManager.innerInsertChart = function (element) {
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