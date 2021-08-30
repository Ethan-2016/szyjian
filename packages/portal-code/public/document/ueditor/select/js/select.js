
  function EmrSelect(){
    const that = this;
    this.targetInput = null;
    this.multipleVal = ""
    this.filterableMultipleHtml = ""
    this.config = {
      split: ',',
      optionName: 'option',
      valName: 'val'
    }

    this.init = function(tag){
      document.addEventListener('click', this.clickBodyToSelectEvent);
      let selectInputNodes = document.getElementsByClassName("emr-select-input");
      let selectInputNodesLen = selectInputNodes.length;
    }

    this.showESD = function(target){ // target就是input
      this.config.optionName = target.dataset.optionname
      this.config.valName = target.dataset.valname
      let strSplit = that.config.split
      let selectDropdownNode = document.getElementById('emrSelectDropdown')
      const filterable = that.targetInput.getAttribute('filterable');
      const multiple = that.targetInput.getAttribute('multiple');
      if(selectDropdownNode){
        selectDropdownNode.style.display="block"
      }else{
        selectDropdownNode = document.createElement("div");
      }
      selectDropdownNode.className="emr-select-dropdown"
      selectDropdownNode.id="emrSelectDropdown"
      selectDropdownNode.dataset.ignore="1"
      selectDropdownNode.style.minWidth="120px"
      selectDropdownNode.style.display="block"
      let pos = target.getBoundingClientRect();
      selectDropdownNode.style.position="fixed"
      selectDropdownNode.style.top= pos.top + pos.height + 'px'
      selectDropdownNode.style.left = pos.left + 'px'
      document.body.append(selectDropdownNode)
      let url = target.getAttribute('data-url');
      let filterableMultipleHtml = `<p style="" class="erm-selected-display" id="selectedDisplay"  contenteditable="false">${that.filterableMultipleHtml || "暂无选择"}</p>`
      let ulStartHtml = `<ul class="emr-select-dropdown-list" style="padding-left: 0;top: 24px; text-align: center; color: #333; max-height: ${13*20+'px'}"  contenteditable="false">`
      let paraStr = target.parentNode.parentNode.getAttribute('obj').replace(/\'/g, '\"')
      let paraArray = JSON.parse(paraStr).paraArrayStr
      paraArray = paraArray?paraArray:[]
      let paraArrayLen = paraArray ? paraArray.length : 0
      let urlPara = ""
      // controlId: "1"
      // paraInitVal: "1"
      // paraName: "1"
      for (let j = 0; j < paraArrayLen; j++){
        let controlNode = document.getElementById(paraArray[j].controlId)
        let paraVal;
        if (controlNode) {
          if (controlNode.getAttribute('emrplugin') == "input" || controlNode.getAttribute('emrplugin') == "textarea") {
            let controlNodes = document.getElementsByName(paraArray[j].controlId)
            paraVal = controlNodes[0].innerText || paraArray[j].paraInitVal
          } else if (controlNode.getAttribute('emrplugin') == "radio") {
            let controlNodes = document.getElementsByName(paraArray[j].controlId)
            for (let i = 0; i < controlNodes.length; i++) {
              if (controlNodes[i].checked) {
                paraVal = controlNodes[i].getAttribute("value") || paraArray[j].paraInitVal
              }
            }
          } else if (controlNode.getAttribute('emrplugin') == "checkbox") {
            let controlNodes = document.getElementsByName(paraArray[j].controlId)
            for (let i = 0; i < controlNodes.length; i++) {
              if (controlNodes[i].checked) {
                if (paraVal === undefined) {
                  paraVal = controlNodes[i].getAttribute("value")
                } else {
                  paraVal += ','+controlNodes[i].getAttribute("value")
                }
              }
            }
            paraVal = paraVal || paraArray[j].paraInitVal
          } else if (controlNode.getAttribute('emrplugin') == "select") {
            let controlNodes = document.getElementsByName(paraArray[j].controlId)
            paraVal = controlNodes[0].dataset.val.replace(/\//g, ',') || paraArray[j].paraInitVal
          }
        }
        if (paraVal === undefined) {
          continue;
        }
        if (j == 0) {
          urlPara = `${paraArray[j].paraName}=${paraVal}`
        } else {
          urlPara += `&${paraArray[j].paraName}=${paraVal}`
        }
      }
      if (urlPara) {
        if (url.includes("?")) {
          url += '&'+urlPara
        } else {
          url += '?'+urlPara
        }
      }
      // console.log('~~~~~~', url)
      //拼装下拉选择框
      if (url) {
        if(filterable){
          let val = target.value;
          if(!val){
            let selectDropdownHtml;
            // console.log("multiple", val)
            if (multiple) {
              selectDropdownHtml = filterableMultipleHtml + ulStartHtml + `请输入关键字</ul>`;
            } else {
              selectDropdownHtml = ulStartHtml + `请输入关键字</ul>`;
            }
            target.oninput = function () {
              if (!multiple) {
                target.dataset.val = ''
                target.dataset.option = ''
              }
              that.showESD(target)
            }
            selectDropdownNode.innerHTML = selectDropdownHtml;
            // return;
          }else{
            // console.log("val", val)
            if (url.includes("?")) {
              url += '&query='+val
            } else {
              url += '?query='+val
            }
          }
        }
        let selectDropdownHtml = ulStartHtml + `正在加载···</ul>`;
        selectDropdownNode.innerHTML = selectDropdownHtml;
        let valArr = target.dataset.val ? target.dataset.val.split(strSplit) : [];
        // console.log(url)
        that.ajax.get(url, function (res) {
          let resLen = res.data?res.data.length:0
          if(resLen){
            if(multiple){
              selectDropdownHtml = filterableMultipleHtml + ulStartHtml;
            }else{
              selectDropdownHtml = ulStartHtml;
            }
            // console.log("----------", that.config)
            for(let j = 0; j < resLen; j++){
              selectDropdownHtml += `<div contenteditable="false" class="emr-select-dropdown-item ${valArr.includes(res.data[j][that.config.valName]) ? 'active' : ''}" 
              data-val="${res.data[j][that.config.valName]}" data-option="${res.data[j][that.config.optionName]}"><span>${res.data[j][that.config.optionName]}</span></div>`
              // <span>${res.data[j][that.config.valName]}</span>
            }
            selectDropdownHtml += `</ul>`;
            selectDropdownNode.innerHTML = selectDropdownHtml;
            // console.log(res.data, resLen)
          }else{
            if(multiple){
              selectDropdownHtml = filterableMultipleHtml + ulStartHtml + `暂无数据</ul>`;
            }else{
              selectDropdownHtml = ulStartHtml + `暂无数据</ul>`;
            }
            selectDropdownNode.innerHTML = selectDropdownHtml;
          }
        })
      } else {
        // 单选， 数据来源手动录入
        let selectDropdownHtml;
        if (multiple) {
          selectDropdownHtml = filterableMultipleHtml;
        } else {
          selectDropdownHtml = ulStartHtml
        }
        // <div  contenteditable="false" class="emr-select-dropdown-item" style="">黄金糕黄金糕黄金糕黄金糕</div>
        let optionsNode = target.previousElementSibling.childNodes
        let valArr = target.dataset.val? target.dataset.val.split(strSplit) : [];
        if (optionsNode.length) {
          for (let i = 0; i < optionsNode.length; i++){
            selectDropdownHtml += `<div  contenteditable="false" class="emr-select-dropdown-item  ${valArr.includes(optionsNode[i].value) ? 'active' : ''}" data-val="${optionsNode[i].value}" data-option="${optionsNode[i].innerText}"><span>${optionsNode[i].innerText}</span></div>`
            // <span>${optionsNode[i].value}<span>
          }
        } else {
          selectDropdownHtml += `暂无数据`
        }
        selectDropdownHtml += "</ul>";
        selectDropdownNode.innerHTML = selectDropdownHtml;
      }
    }
    
    this.handleData = function(target){
      let strSplit = that.config.split
      let dataOption = target.dataset.option; //选项
      let dataVal = target.dataset.val; //值
      const filterable = that.targetInput.getAttribute('filterable');
      const multiple  = that.targetInput.getAttribute('multiple');
      if(multiple){ //多选
        let valArr = that.targetInput.dataset.val? that.targetInput.dataset.val.split(strSplit) : [];
        let optionArr = that.targetInput.dataset.option? that.targetInput.dataset.option.split(strSplit) : [];
        let valPos = valArr.indexOf(dataVal);
        if (valPos < 0){
          valArr.push(dataVal)
          optionArr.push(dataOption)
          target.setAttribute("class", "emr-select-dropdown-item active")
        } else {
          target.setAttribute("class", "emr-select-dropdown-item")
          valArr.splice(valPos, 1)
          optionArr.splice(valPos, 1)
        }
        that.targetInput.dataset.val = valArr.join(strSplit);
        that.targetInput.dataset.option = optionArr.join(strSplit);
        that.filterableMultipleHtml = ""
        if (!valArr.length) {
          that.filterableMultipleHtml = `暂无选择`
        } else {
          for (let i = 0; i < valArr.length; i++){
            that.filterableMultipleHtml += `<span class="emr-tag-btn" contenteditable="false" data-val="${valArr[i]}" data-option="${optionArr[i]}">${optionArr[i]}</span>`
          }
        }
        document.getElementById("selectedDisplay").innerHTML = that.filterableMultipleHtml;
      }else{//单选
        that.targetInput.value =  dataOption;
        that.targetInput.dataset.val = dataVal;
        that.targetInput.dataset.option = dataOption;
        that.targetInput.setAttribute("value", dataOption)
        document.getElementById("emrSelectDropdown").style.display = "none";
        // that.targetInput.size = that.targetInput.value.replace(/[^\x00-\xff]/g, '**').length || 5
      }
      
    }

    this.clickBodyToSelectEvent = function(){
      // 兼容性处理
      var event = window.event;
      var target = event.target || event.srcElement;
      let strSplit = that.config.split
      // 判断是否匹配目标元素
      if (target.className.includes("emr-select-input")) {
        let pluginObjStr = $(target).parent().parent().attr('obj').replace(/\'/g, '\"')
        let obj = pluginObjStr?JSON.parse(pluginObjStr):{}
        if(obj.isEditable===0){
          return;
        }
        event.preventDefault();
        that.targetInput = target
        that.filterableMultipleHtml = ""
        let valArr = target.dataset.val ? target.dataset.val.split(strSplit) : [];
        let optionArr = target.dataset.option ? target.dataset.option.split(strSplit) : [];
        let valArrLen = valArr.length
        if (!valArrLen) {
          that.filterableMultipleHtml = `暂无选择`
        } else {
          for (let i = 0; i < valArrLen; i++){
            that.filterableMultipleHtml += `<span class="emr-tag-btn" contenteditable="false" data-val="${valArr[i]}" data-option="${optionArr[i]}">${optionArr[i]}</span>`
          }
        }
        that.showESD(target);
      }else if (target.className.includes("emr-select-dropdown-item")){
        event.preventDefault();
        that.handleData(target);
      }else if($(target).parent()[0].className.includes("emr-select-dropdown-item")) {
        event.preventDefault();
        that.handleData($(target).parent()[0]);
      }else if (target.className.includes("emr-select-dropdown-list")){
        event.preventDefault();
      }else if (target.className.includes("emr-select-tags")){//多选用于显示数据的元素
        target.style.display = "none";
        // that.multipleVal = target.previousSibling.value;
        // target.previousSibling.value = ""
        target.previousSibling.click(); //触发input点击事件
        event.preventDefault();
      } else if (target.className.includes("emr-tag-btn")) {
        event.preventDefault();
        let valArr = that.targetInput.dataset.val? that.targetInput.dataset.val.split(strSplit) : [];
        let optionArr = that.targetInput.dataset.option? that.targetInput.dataset.option.split(strSplit) : [];
        let val = target.dataset.val;
        let pos = valArr.indexOf(val);
        valArr.splice(pos, 1)
        optionArr.splice(pos, 1)
        let itemNodes = document.getElementsByClassName("emr-select-dropdown-item")
        for (let i = 0; i < itemNodes.length; i++){
          if (itemNodes[i].dataset.val == val) {
            itemNodes[i].className="emr-select-dropdown-item"
          }
        }
        if (!valArr.length) {
          that.filterableMultipleHtml = `暂无选择`
          that.targetInput.dataset.val = ""
          that.targetInput.dataset.option = ""
        } else {
          that.filterableMultipleHtml = ""
          for (let i = 0; i < valArr.length; i++){
            that.filterableMultipleHtml += `<span class="emr-tag-btn" contenteditable="false" data-val="${valArr[i]}" data-option="${optionArr[i]}">${optionArr[i]}</span>`
          }
          that.targetInput.dataset.val = valArr.join(strSplit)
          that.targetInput.dataset.option = optionArr.join(strSplit)
        }
        
        document.getElementById("selectedDisplay").innerHTML = that.filterableMultipleHtml;
      }else if (target.className.includes("erm-selected-display")){
      }else{
        if(that.targetInput){
          const filterable = that.targetInput.getAttribute('filterable');
          const multiple  = that.targetInput.getAttribute('multiple');
          that.targetInput.value = that.targetInput.value || that.targetInput.dataset.option || '';
          if(multiple){
            // that.targetInput.size = that.targetInput.value.replace(/[^\x00-\xff]/g, '**').length || 5
            that.targetInput.nextElementSibling.style.display = "inline-block"
          }
        }
        if (document.getElementById('emrSelectDropdown')) {
          document.getElementById('emrSelectDropdown').style.display = "none";
        }
      }
    }

    this.ajax = {
      get: function(url,callback){
          // XMLHttpRequest对象用于在后台与服务器交换数据
          var xhr=new XMLHttpRequest();
          xhr.open('GET',url,false);
          xhr.onreadystatechange=function(){
              // readyState == 4说明请求已完成
              if(xhr.readyState==4){
                  if(xhr.status==200 || xhr.status==304){
                      callback(JSON.parse(xhr.responseText));
                  }
              }
          }
          xhr.send();
      },
      // data应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
      post: function(url,data,callback){
          var xhr=new XMLHttpRequest();
          xhr.open('POST',url,false);
          // 添加http头，发送信息至服务器时内容编码类型
          xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
          xhr.onreadystatechange=function(){
              if (xhr.readyState==4){
                  if (xhr.status==200 || xhr.status==304){
                      // console.log(xhr.responseText);
                      callback(xhr.responseText);
                  }
              }
          }
          xhr.send(data);
      }
    }
  }
  const emrSelect = new EmrSelect();
  window.emrSelect = emrSelect
  emrSelect.init();

  let editDateTimeObj = {
    date: '',
    time: '',
    format: '',
    formatDate: '',
    formatTime: ''
  };
  $(document).ready(function(){
    $('body').on("mouseover", '.emr-select-box', function(){
      let pluginObjStr = $(this).parent().attr('obj').replace(/\'/g, '\"')
      let obj = pluginObjStr?JSON.parse(pluginObjStr):{}
      if(obj.isEditable===0){
        return;
      }
      $('body').find(".emr-select-box-icon").hide();
        let icon = `<span style="
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
          width: 1em;
          height: 1em;
          cursor: pointer;
          z-index: 2;
          background: url(./delete.png);
          background-size: contain;"
          data-active-datetime="1"
          class="emr-select-box-icon"></span>`
      let iconNodeLen = $(this).find(".emr-select-box-icon").length;
      if(iconNodeLen==0){
        $(this).append(icon);
      }else{
        let _this = this;
        $(this).find(".emr-select-box-icon").show().css('display', 'inline-flex');
      }
    }).on("mouseout", '.emr-select-box', function(){
      $(this).find(".emr-select-box-icon").hide();
    })
    
    $('body').on("click", '.emr-select-box-icon', function(){
      $(this).siblings("input").attr("data-val", "");
      $(this).siblings("input").attr("data-option", "");
      $(this).siblings("input").val("")
      $(this).siblings("input").attr("value", "");
    })

    $(document).on('input', ".emr-select-input", function () {
      $(this).click();
      let val = $(this).val()
      $(this).attr('data-option', val);
      let options = $(this).siblings("select").find("option")
      let noHas = true;
      for (let i = 0; i < options.length; i++){
        let item = options[i]
        if(item.innerText==val){
          noHas = false
        }
      }
      if(noHas){
        $(this).attr('data-val', "");
      }
    })
    // 日期时间控件
    var _time = null;
    $('body').on("click", '.data-time-mask', function(){
      $(this).siblings(".calendar-delete-icon").hide();
      clearTimeout(_time);
      let _this = this;
      _time = setTimeout(function(){
          //单击事件在这里
          initEditDateTine(_this, "click");
      }, 250);
    }).on("dblclick", '.data-time-mask', function(){
      $(this).siblings(".calendar-delete-icon").hide();
      clearTimeout(_time);
      initEditDateTine(this, "dblclick");
    })


    $('body').on("dblclick", '.calendar-time', function(){
      let oriVal = $(this).val();
      let format = JSON.parse($(this).parent().attr('obj').replace(/\'/g, '\"'));
      let datetype = format.textType
      let calendarDate  = $(this).siblings('.calendar-date')
      let emrFieldValue = $(this).siblings('.emr-field-value');
      if(!oriVal){
        let datetime = moment().format(datetype.replace('yyyy', 'YYYY').replace('dd', 'DD'))
        if(datetype.includes("yyyy")){
          editDateTimeObj.date = datetime.split(' ')[0]
          if(datetype.includes("HH")){
            editDateTimeObj.time = datetime.split(' ')[1]
          }else{
            editDateTimeObj.time = null
          }
        }else{
          editDateTimeObj.date = ''
          editDateTimeObj.time = datetime.split(' ')[0]
        }
        emrFieldValue.text(datetime)
      }
      $(this).val(editDateTimeObj.time)
      calendarDate && calendarDate.val(editDateTimeObj.date)
      $(this)[0].selectionStart =  0;
      $(this)[0].selectionEnd = editDateTimeObj.time.length;
    });

    $(document).on('mouseover', '.data-time-mask', function(e){
      let deleteImg = `<span style="
        position: absolute;
        right: 5px;
        width: 1em;
        top: 50%;
        transform: translateY(-50%);
        height: 1em;
        cursor: pointer;
        z-index: 2;
        background: url(./delete.png);
        background-size: contain;"
        class="calendar-delete-icon"></span>`
      calendarIcon  = $(this).siblings('.calendar-delete-icon')
      $(".calendar-delete-icon").hide();
      if(calendarIcon[0]){
        calendarIcon.show();
      }else{
        $(this).after(deleteImg);
      }
    }).on("mouseout", '.data-time-mask', function(){
      $(this).siblings(".calendar-delete-icon").hide();
    })

    $(document).on('mouseover', '.calendar-delete-icon', function(e){
      $(this).show();
    })

    $(document).on("click", '.calendar-delete-icon', function(){
      $(this).siblings("input").val("")
      $(this).siblings(".emr-field-value ").text("")
    })
    

    $('body').on("click", '.calendar-icon', function(){
      let dateNode = $(this).siblings('.calendar-date')[0]
      let dateFieldValue = $(this).siblings('.emr-field-value')
      let calendarTime = $(this).siblings('.calendar-time')
      dateNode.focus();
      // console.log('laydate', laydate)
      laydate.render({
        elem: dateNode,
        type: 'date',
        format: editDateTimeObj.formatDate,
        value: editDateTimeObj.date,
        show: true,
        closeStop: '#data-time-mask',
        done: function(value, date){
          $(dateNode).change();
          // console.log(editDateTimeObj);
          let datetime;
          if(editDateTimeObj.format.includes("HH")){
            datetime = moment(value + ' ' + calendarTime.val()).format(editDateTimeObj.format.replace('yyyy', 'YYYY').replace('dd', 'DD'))
          }else{
            datetime = value?moment(value).format(editDateTimeObj.format.replace('yyyy', 'YYYY').replace('dd', 'DD')):""
          }
          // console.log('---------------------editDateTimeObj.formatDate.includes("HH")', editDateTimeObj.formatDate.includes("HH"), datetime)
          dateFieldValue.text(datetime)
        },
        ready: function(data) {
        }
      })
    })

    $(document).on("input", '.calendar-time', function(){
      let dateFieldValue = $(this).siblings('.emr-field-value')
      let calendarDate = $(this).siblings('.calendar-date')
      let editTimeInputNode = $(this)[0]
      let selectionStart = editTimeInputNode.selectionStart,
      selectionEnd = editTimeInputNode.selectionEnd;
      let time = $(this).val()
      if(time.includes(":")){
        let timeArr = time.split(':')
        let timeArrLen = timeArr.length
        if(time.lastIndexOf(':', selectionStart-1) == -1){
          if(isNaN(+timeArr[0])){
            timeArr[0] = "00"
          }
          let hour = +timeArr[0] + ''
          if(+hour>=3){
            if(+hour > 23){
              hour = '23'
            }
            timeArr[0] = hour.padStart(2, "0")
            time = timeArr.join(':');
            $(this).val(time)
            editTimeInputNode.selectionStart =  1 * 3;
            editTimeInputNode.selectionEnd = 1 * 3 + 2;
          }else{
            timeArr[0] = hour.padStart(2, "0")
            time = timeArr.join(':');
            $(this).val(time)
            editTimeInputNode.selectionStart =  2;
            editTimeInputNode.selectionEnd = 2;
          }
        } else if(time.indexOf(':', selectionStart) == -1) {
          if(isNaN(+timeArr[timeArrLen-1])){
            timeArr[timeArrLen-1] = "00"
          }
          let third = +timeArr[timeArrLen-1] + ''
          if(+third>=6){
            if(+third > 59){
              third = '59'
            }
            timeArr[timeArrLen-1] = third.padStart(2, "0")
            time = timeArr.join(':');
            $(this).val(time)
            editTimeInputNode.selectionStart =  time.length-2;
            editTimeInputNode.selectionEnd = time.length;
          }else{
            timeArr[timeArrLen-1] = third.padStart(2, "0")
            time = timeArr.join(':');
            $(this).val(time)
            editTimeInputNode.selectionStart =  time.length;
            editTimeInputNode.selectionEnd = time.length;
          }
        } else {
          if(isNaN(+timeArr[1])){
            timeArr[1] = "00"
          }
          let second = +timeArr[1] + ''
          if(+second>=6){
            if(+second > 59){
              second = '59'
            }
            timeArr[1] = second.padStart(2, "0")
            time = timeArr.join(':');
            $(this).val(time)
            editTimeInputNode.selectionStart =  time.length-2;
            editTimeInputNode.selectionEnd = time.length;
          }else{
            timeArr[1] = second.padStart(2, "0")
            time = timeArr.join(':');
            $(this).val(time)
            editTimeInputNode.selectionStart =  time.lastIndexOf(':');
            editTimeInputNode.selectionEnd = time.lastIndexOf(':');
          }
        }
      }else{
        let hour;
        if(time){
          hour = time.padStart(2, "0")
          if(+hour>=3){
            if(+hour > 23){
              hour = '23'
            }
            let signLen = editDateTimeObj.formatTime.split(":").length - 1
            if(signLen==1){
              time = hour+":00"
            }else{
              time = hour+":00:00"
            }
            $(this).val(time)
            editTimeInputNode.selectionStart =  1 * 3;
            editTimeInputNode.selectionEnd = 1 * 3 + 2;
          }else{
            hour = time.padStart(2, "0")
            // console.log("hour---------", hour)
            let signLen = editDateTimeObj.formatTime.split(":").length - 1
            if(signLen==1){
              time = hour+":00"
            }else{
              time = hour+":00:00"
            }
            $(this).val(time)
            editTimeInputNode.selectionStart =  2;
            editTimeInputNode.selectionEnd = 2;
          }
        }
      }
      
      let datetime;
      if(editDateTimeObj.format.includes('yyyy')){
        if(editDateTimeObj.format.includes("HH")){
          datetime = moment(editDateTimeObj.date + ' ' + $(this).val()).format(editDateTimeObj.format.replace('yyyy', 'YYYY').replace('dd', 'DD'))
        }else{
          datetime = editDateTimeObj.date
        }
      }else{
        datetime = $(this).val()
      }
      dateFieldValue.text(datetime)
    })
    
    $(document).on("mouseup", '.calendar-time', function(){
      let dateFieldValue = $(this).siblings('.emr-field-value')
      let calendarDate = $(this).siblings('.calendar-date')
      // editTimeInputNode.selectionStart =  editDateTimeObj.time.length - 2;
      // editTimeInputNode.selectionEnd = editDateTimeObj.time.length;
      let editTimeInputNode = $(this)[0]
      let selectionStart = editTimeInputNode.selectionStart,
      selectionEnd = editTimeInputNode.selectionEnd;
      let n = Math.floor(selectionStart/3)
      if(selectionStart == selectionEnd){
        editTimeInputNode.selectionStart =  n * 3;
        editTimeInputNode.selectionEnd = n * 3 + 2;
      }
    }) 

    $(document).on('click', function(e){
      finishEdit(e);
    })

    $(top.document).on('click', function(e){
      finishEdit(e);
    })
    
    function finishEdit(e){
      if(!$(e.target).attr('data-active-datetime')){
        let inputTimeNode = $('.calendar-time[data-active-datetime="1"]');
        let inputDateNode = $('.calendar-date[data-active-datetime="1"]');
        if(inputTimeNode[0]){
          inputTimeNode.hide();
          inputTimeNode.siblings('.calendar-icon').hide();
          inputTimeNode.siblings('.calendar-date').hide();
          inputTimeNode.attr('data-active-datetime', 0)
          inputTimeNode.siblings('.calendar-icon').attr('data-active-datetime', 0);
        }else{
          inputDateNode.hide();
          inputDateNode.siblings('.calendar-icon').hide();
          inputDateNode.siblings('.calendar-date').hide();
          inputDateNode.attr('data-active-datetime', 0)
          inputDateNode.siblings('.calendar-icon').attr('data-active-datetime', 0);
        }
        $('.data-time-mask').show();
      }
    }
  });
  $(document).keydown(function(event){
    let inputTimeNode = $('.calendar-time[data-active-datetime="1"]')[0];
    if(!inputTimeNode){
      return;
    }
    let time = $(inputTimeNode).val()
    let selectionStart = inputTimeNode.selectionStart;
    if(event.keyCode == 37){
      //do somethings;
      if(time.indexOf(':', selectionStart) && inputTimeNode.selectionStart != inputTimeNode.selectionEnd){
        setTimeout(()=>{
          inputTimeNode.selectionStart = selectionStart-3
          inputTimeNode.selectionEnd = selectionStart-1
        }, 0)
      }
    }else if (event.keyCode == 39){
      //do somethings;
      if(time.lastIndexOf(':', selectionStart-1) && inputTimeNode.selectionStart != inputTimeNode.selectionEnd){
        setTimeout(()=>{
          inputTimeNode.selectionStart = selectionStart+3
          inputTimeNode.selectionEnd = selectionStart+5
        }, 0)
      }
    }
    
  });

  jQuery.event.special.mousewheel = {
    setup: function(_, ns, handle) {
          this.addEventListener("mousewheel", handle, {
              passive: false,
          });
      }
  };
  $(document).on("mousewheel DOMMouseScroll", function (event) {
    var delta = (event.originalEvent.wheelDelta && (event.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                (event.originalEvent.detail && (event.originalEvent.detail > 0 ? -1 : 1));              // firefox
    let inputTimeNode = $('.calendar-time[data-active-datetime="1"]')[0];
    if(inputTimeNode){
      event.preventDefault();
      let selectionStart = inputTimeNode.selectionStart
      let time = $(inputTimeNode).val();
      let timeArr = time.split(":");
      let n = Math.floor(inputTimeNode.selectionStart/3);
      if (delta > 0) {
      // 向上滚
        let val = --timeArr[n]
        if (n == 0) {
          if(val<0){
            val = 23
          }
        } else {
          if(val<0){
            val = 59
          }
        }
        timeArr[n] = (val+'').padStart(2, '0')
        // console.log("down+++++");
      //do somthing
      } else if (delta < 0) {
        let val = ++timeArr[n]
        if(n==0){
          if(val>23){
            val=0
          }
        }else{
          if(val>59){
            val=0
          }
        }
        // 向下滚
        timeArr[n] = (val+'').padStart(2, '0')
        // console.log("up+++++");
      //do somthing
      }
      $(inputTimeNode).val(timeArr.join(":"))
      inputTimeNode.selectionStart = selectionStart
      inputTimeNode.selectionEnd = selectionStart + 2
      
    }
  });
  function initEditDateTine(_this, type){
    let dataTimeMask = $(_this);
    dataTimeMask.hide();
    let dateTimePlugin = dataTimeMask.parent()
    let emrFieldValue = dateTimePlugin.find('.emr-field-value');
    let oriVal = emrFieldValue.text().trim();
    let format = JSON.parse($(_this).parent().attr('obj').replace(/\'/g, '\"'));
    let datetype = format.textType

    let img1 = `<span style="
    position: absolute;
    right: 5px;
    width: 1em;
    height: 1em;
    cursor: pointer;
    z-index: 2;
    opacity: 1;
    background: url(./calendar.png);
    background-size: contain;"
    data-active-datetime="1"
    class="calendar calendar-icon"></span>`
    let img2 = `<span style="
    position: absolute;
    right: 5px;
    width: 1em;
    height: 1em;
    cursor: pointer;
    z-index: 2;
    opacity: 0;
    background: url(./calendar.png);
    background-size: contain;"
    data-active-datetime="1"
    class="calendar calendar-icon"></span>`
    let dateEle = `<input style="
    position: absolute;
    left: 0;
    width: 0;
    height: 1px;
    border: none;
    outline: none;
    cursor: pointer;
    z-index: 2;
    font-size: ${format.fontSize}px;
    background: none;"
    data-active-datetime="1"
    class="calendar calendar-date"/>`
    let input = `<input style="
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      border: none;
      border-bottom: 1px dashed #000;
      outline: none;
      width: 100%;
      padding-left: 5px;
      font-size: ${format.fontSize}px;
      min-height: ${format.fontSize}px;
      line-height: ${format.fontSize}px;
      box-sizing: border-box;
      z-index: 2"
      data-active-datetime="1"
    class="calendar calendar-time">`
    let calendarIcon, calendarDate;
    if(datetype.includes("yyyy")){
      calendarIcon  = dateTimePlugin.find('.calendar-icon')
      if(calendarIcon[0]){
        calendarIcon.attr('data-active-datetime', 1)
        calendarIcon.show();
        if(datetype.includes("HH")){
          calendarIcon.css({ 'opacity' : 1 })
        }else{
          calendarIcon.css({ 'opacity' : 0 })
        }
      }else{
        if(datetype.includes("HH")){
          emrFieldValue.after(img1);
        }else{
          emrFieldValue.after(img2);
        }
      }
      calendarDate  = dateTimePlugin.find('.calendar-date')
      if(calendarDate[0]){
        calendarDate.attr('data-active-datetime', 1)
        calendarDate.attr('style', `position: absolute;left: 0;width: 0;height: 1px;
        font-size: ${format.fontSize}px;border: none;outline: none;cursor: pointer;z-index: 2;background: none;`)
        calendarDate.show();
      }else{
        emrFieldValue.after(dateEle);
      }
    }
    let editTimeInput, editTimeInputNode;
    if(datetype.includes("HH")){
      editTimeInput = dateTimePlugin.find('.calendar-time');
      if(editTimeInput[0]){
        editTimeInput.attr('data-active-datetime', 1)
        editTimeInput.attr('style', `position: absolute;top: 0;
        font-size: ${format.fontSize}px;
        min-height: ${format.fontSize}px;
        line-height: ${format.fontSize}px;
        bottom: 0;left: 0;right: 0;border: none;border-bottom: 1px dashed #000;outline: none;width: 100%;z-index: 2;padding-left: 5px;box-sizing: border-box;`)
        editTimeInput.show();
      }else{
        emrFieldValue.after(input);
      }
      editTimeInput = dateTimePlugin.find('.calendar-time')
      editTimeInputNode = editTimeInput[0]
      editTimeInput.focus();
    }else{
      dateTimePlugin.find('.calendar-time').hide();
      dateTimePlugin.find('.calendar-date').attr('style', `position: absolute;left: 0;right: 0; top: 0; bottom: 0;
      font-size: ${format.fontSize}px;
      min-height: ${format.fontSize}px;
      line-height: ${format.fontSize}px;border: none; border-bottom: 1px dashed #000; outline: none; width: 100%; cursor: pointer;z-index: 2;`)
      calendarDate = dateTimePlugin.find('.calendar-date')
      calendarDate.focus();
    }
    
    // console.log("datetype", datetype) //yyyy-MM-dd HH:mm:ss
    let datetypeArr = datetype.split(' ');
    let datetypeArrLen = datetypeArr.length
    if(datetype.includes("yyyy")){
      editDateTimeObj.formatDate = datetypeArr[0]
      if(datetype.includes("HH")){
        editDateTimeObj.formatTime = datetypeArr[1]
      }else{
        editDateTimeObj.formatTime = null
      }
    }else{
      editDateTimeObj.formatDate = null
      editDateTimeObj.formatTime = datetypeArr[0]
    }
    
    editDateTimeObj.format = datetype;
    emrFieldValue.focus();
    if(type=="dblclick"){
      if(oriVal){
        if(datetype.includes("yyyy")){
          editDateTimeObj.date = oriVal.split(' ')[0]
          if(datetype.includes("HH")){
            editDateTimeObj.time = oriVal.split(' ')[1]
          }else{
            editDateTimeObj.formatTime = null
          }
        }else{
          editDateTimeObj.date = ''
          editDateTimeObj.time = oriVal.split(' ')[0]
        }
      }else{
        let datetime = moment().format(datetype.replace('yyyy', 'YYYY').replace('dd', 'DD'))
        if(datetype.includes("yyyy")){
          editDateTimeObj.date = datetime.split(' ')[0]
          if(datetype.includes("HH")){
            editDateTimeObj.time = datetime.split(' ')[1]
          }else{
            editDateTimeObj.time = null
          }
        }else{
          editDateTimeObj.date = ''
          editDateTimeObj.time = datetime.split(' ')[0]
        }
        emrFieldValue.text(datetime)
      }
      editTimeInput && editTimeInput.val(editDateTimeObj.time)
      calendarDate && calendarDate.val(editDateTimeObj.date)
      if(editDateTimeObj.time){
        editTimeInputNode.selectionStart =  0;
        editTimeInputNode.selectionEnd = editDateTimeObj.time.length;
      }
    }else{
      if(oriVal){
        if(datetype.includes("yyyy")){
          editDateTimeObj.date = oriVal.split(' ')[0]
          if(datetype.includes("HH")){
            editDateTimeObj.time = oriVal.split(' ')[1]
          }else{
            editDateTimeObj.time = null
          }
        }else{
          editDateTimeObj.date = ''
          editDateTimeObj.time = oriVal.split(' ')[0]
        }
      }else{
        let datetime = moment().format(datetype.replace('yyyy', 'YYYY').replace('dd', 'DD'))
        // console.log('datetype.includes("yyyy")', datetime.split(' ')[0])
        if(datetype.includes("yyyy")){
          editDateTimeObj.date = datetime.split(' ')[0]
          editDateTimeObj.time = ''
          emrFieldValue.text('')
        }else{
          editDateTimeObj.date = ''
          editDateTimeObj.time = '' //datetime.split(' ')[0]
          emrFieldValue.text('')
        }
      }
      editTimeInput && editTimeInput.val(editDateTimeObj.time)
      calendarDate && calendarDate.val(editDateTimeObj.date)
      if(editDateTimeObj.time){
        editTimeInputNode.selectionStart =  editDateTimeObj.time.length - 2;
        editTimeInputNode.selectionEnd = editDateTimeObj.time.length;
      }
    }
    if(!datetype.includes("HH")){
      dateTimePlugin.find('.calendar-icon').click();
    }
  }

$(document).on("click", ".textarea-temp-box", function () {
  let org = '';
  // let org = $(this).parent().siblings(".emr-field-value").html()
  // if (org) {
  //   org += "<br/>"
  // }
  $(this).parent().siblings(".emr-field-value").html(org + $('.textarea-temp-content', this).html().replace(/\n/g,'<br/>')) 
})

$(document).on("mouseover", ".emr-plugin[emrplugin='textarea']", function () {
  $(this).find(".textarea-template-box").css({"display": "block"})
}).on("mouseout", ".emr-plugin[emrplugin='textarea']", function () {
  $(this).find(".textarea-template-box").css({"display": "none"})
})

$(document).on("click", ".btn-group .btn", function () {
  let dataLink = this.id.split('-')[0] + '-';
  let originalVal = $(`#${this.id.split('-')[0]}`).attr("data-value")
  let originalValArr = originalVal ? originalVal.split(',') : []
  let copyValArr = [...originalValArr]
  let clickBtnVal = this.id.split('-')[1];
  if (!originalValArr.includes(clickBtnVal)) {
    $(this).css("border-bottom", "1px solid #0e4ddc")
    $(`[link="${this.id}"]`).css({ "display": "inline-block" })
    copyValArr.push(clickBtnVal)
  } else {
    $(this).css("border-bottom", "none")
    $(`[link="${this.id}"]`).css({ "display": "none" })
    copyValArr.splice(copyValArr.indexOf(clickBtnVal),1);
  }
  $(`#${this.id.split('-')[0]}`).attr("data-value", copyValArr.join(','))
  // $(this).css("border-bottom", "1px solid #0e4ddc")
  // $(this).siblings(".btn").css("border-bottom", "none")
  // $('[link^="' + dataLink+'"]').css({ "display": "none"})
  // $(`[link="${this.id}"]`).css({ "display": "block"})
  // $(`#${this.id.split('-')[0]}`).attr("data-value", this.id.split('-')[1])
})