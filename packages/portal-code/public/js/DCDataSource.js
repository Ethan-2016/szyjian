
// 数据源处理功能模块

var DCDataSource = new Object();

DCDataSource.GetDataSourceBindingDescriptionsJSON = function () {
    var ctl = document.WriterControl;
    if (ctl == null) {
        return 0;
    }
    var result = new Object();
    $("input,select,textarea,span[dctype='XTextInputFieldElement'],td").each(function () {
        var dataSourceName = this.getAttribute("datasourcename");
        var path = this.getAttribute("datasourcepath");
        //wyc20210223:优化对单元格的处理
        if (this.nodeName == "TD") {
            dataSourceName = this.parentElement.getAttribute("datasourcename");
        }
        /////////////////////////////////
        if (dataSourceName != null && dataSourceName.length > 0) {
            var items = result[dataSourceName];
            if (items == null) {
                items = new Array();
                result[dataSourceName] = items;
            }
            if (path != null && path.length > 0) {
                var match = false;
                for (var iCount = 0; iCount < items.length; iCount++) {
                    if (path == items[iCount]) {
                        match = true;
                        break;
                    }
                }
                if (match == false) {
                    items.push(path);
                }
            }
        }
    });
    var objResult = new Object();
    for (var name in result) {
        var items = result[name];
        //wyc20210223:优化数据源绑定描述信息，直接返回名称为绑定路径值为空的JSON对象
        //var strItem = "";
        var obj = new Object();
        for (var iCount = 0; iCount < items.length; iCount++) {
            var tempitem = items[iCount];
            obj[tempitem] = '';
            //if (strItem.length > 0) {
            //    strItem = strItem + "," + items[iCount];
            //}
            //else {
            //    strItem = items[iCount];
            //}
        }
        objResult[name] = obj;
    }
    return objResult;//JSON.stringify(objResult );
};

DCDataSource.WriteDataFromDataSourceToDocument = function () {
    var ctl = document.WriterControl;
    if (ctl == null || ctl.ParameterValues == null ) {
        return 0;
    }
    var result = 0; 
    $("input,select,textarea,span[dctype='XTextInputFieldElement'],table[dctype='XTextTableElement']").each(function () {
        var dataSourceName = this.getAttribute("datasourcename");
        if (this.nodeName == "TABLE") {
            var row = this.querySelector("tr[datasourcename]");
            if (row != null) {
                dataSourceName = row.getAttribute("datasourcename");
            }
        }
        var path = this.getAttribute("datasourcepath");
        var pathForText = DCDataSource.GetValueBind(this)["BindingPathForText"];
        if (path != null && path.length > 0) {
            path = path.toLowerCase();
        }
        if (pathForText != null && pathForText.length > 0) {
            pathForText = pathForText.toLowerCase();
        }
        var dctype = this.getAttribute("dctype");
        if (dataSourceName != null && dataSourceName.length > 0) {
            var ds = ctl.GetDocumentParameterValue(dataSourceName);
            if (ds != null) {
                var pValue = ds;
                if (path != null && path.length > 0 && Array.isArray(pValue) == false) {
                    pValue = ds[path];
                }
                if (dctype == "XTextTableElement" && Array.isArray(pValue) == true) {
                    //在这里要遍历找到包含数据源属性的表格行并进行绑定操作，表格绑定数据源只接受对象数组
                    WriterCommandModuleTable.WriteDataToTable2(this, dataSourceName, pValue);
                }              
                else if (dctype == "XTextCheckBoxElement" || dctype == "XTextRadioBoxElement") {
                    var checkedvalue = this.getAttribute("dc_checkedvalue");
                    if (pValue === true || pValue === false) {
                        ctl.SetElementCheckedByID(this.id, pValue);
                        result++;
                    } else {
                        var ischecked = checkedvalue != null && checkedvalue.length > 0 && pValue == checkedvalue;
                        ctl.SetElementCheckedByID(this.id, ischecked);
                    }
                }
                else if (pValue !== undefined &&
                    pValue !== null && DCWriterControllerEditor.SetElementText(this, pValue) == true) {
                    // xym 20200903 添加数据源绑定时Text的绑定路径(仅适用于输入域元素)
                    if (DCInputFieldManager.IsInputFieldElement(this) == true) {
                        if (pathForText != null && pathForText.length > 0) {
                            var pText = ds[pathForText];
                            if (pText != null && pText != pValue) {
                                DCInputFieldManager.SetCurrentInputFieldValue(pText, pValue, false, this, true);
                            }
                        }
                    }
                    result++;
                }
            }
        }
    });
    return result;
};

DCDataSource.WriteDataFromDocumentToDataSource = function () {
    var ctl = document.WriterControl;
    if (ctl == null ) {
        return 0;
    }
    var result = 0;
    $("input,select,textarea,span[dctype='XTextInputFieldElement'],table[dctype='XTextTableElement']").each(function () {
        var dctype = this.getAttribute("dctype");
        var dataSourceName = this.getAttribute("datasourcename");
        if (this.nodeName == "TABLE") {
            var row = this.querySelector("tr[datasourcename]");
            if (row != null) {
                dataSourceName = row.getAttribute("datasourcename");
            }
        }
        var path = this.getAttribute("datasourcepath");
        if (dataSourceName != null && dataSourceName.length > 0) {
            var pValue = null;
            if (dctype == "XTextTableElement") {
                //在这里要遍历表格行，根据绑定信息提取出JSON对象数组
                pValue = WriterCommandModuleTable.ReadDataFromTable2(this, dataSourceName);
            }
            else if (dctype == "XTextCheckBoxElement" || dctype == "XTextRadioBoxElement") {
                pValue = this.checked;
            } else {
                pValue = DCWriterControllerEditor.GetElementText(this);
            }
            if (path != null && path.length > 0) {
                var ds = ctl.GetDocumentParameterValue(dataSourceName, true);
                // 20210324 xym 修复获取绑定数据源信息出错问题
                if (typeof (ds) != "object") {
                    ds = {};
                }
                ds[path] = pValue;
            } else {
                // ctl.SetDocumentParameterValue(dataSourceName, pValue);
            }
            result++;
        }
    });
    return result;
};

// 获取数据源绑定信息
DCDataSource.GetValueBind = function (field) {
    if (field == null || !field.getAttribute) {
        return {};
    }
    var dc_valuebinding = field.getAttribute("dc_valuebinding");
    if (dc_valuebinding == null || dc_valuebinding.length == 0) {
        return {};
    }
    var data = {};
    var arr = dc_valuebinding.split(";");
    for (var i = 0; i < arr.length; i++) {
        var temporary = arr[i].split(":");
        if (temporary.length == 2) {
            data[temporary[0]] = temporary[1];
        }
    }
    return data;
}

DCDataSource.ClearDataSource = function () {
    $("input,select,textarea,span[dctype='XTextInputFieldElement']").each(function () {
        var dataSourceName = this.getAttribute("datasourcename");
        
        var path = this.getAttribute("datasourcepath");
        var pathForText = DCDataSource.GetValueBind(this)["BindingPathForText"];
        if (path != null && path.length > 0) {
            path = path.toLowerCase();
        }
        if (pathForText != null && pathForText.length > 0) {
            pathForText = pathForText.toLowerCase();
        }
        var dctype = this.getAttribute("dctype");
        if (dataSourceName != null && dataSourceName.length > 0) {
            if (dctype == "XTextCheckBoxElement" || dctype == "XTextRadioBoxElement") {
                DCWriterControllerEditor.SetElementCheckedByID(this.id, false);
            }
            else if ( DCWriterControllerEditor.SetElementText(this, "") == true) {
                if (DCInputFieldManager.IsInputFieldElement(this) == true) {
                    DCInputFieldManager.SetCurrentInputFieldValue("", "", false, this, true);
                }
            }
        }
    });
};
