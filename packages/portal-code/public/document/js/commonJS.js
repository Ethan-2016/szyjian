var host = window.location.origin;

//document.write('<script type="text/javascript" src="./js/libs/vue.js"></script>');
//document.write('<script type="text/javascript" src="./js/libs/element-ui/lib/index.js"></script>');

// document.write('<link rel="stylesheet" href="'+host+'/src/common/js/libs/element-ui/lib/theme-chalk/index.css">');

//document.write('<link type="text/css" rel="stylesheet" href="./css/theme/index.css">');
//document.write('<script type="text/javascript" src="./js/libs/axios.min.js"></script>')
//document.write('<script type="text/javascript" src="./js/libs/moment-with-locales.min.js"></script>')

//document.write('<link type="text/css" rel="stylesheet" href="./css/common.css">');

const API_ENDPOINT = "http://183.239.150.130:8800/ims";
// const API_ENDPOINT = "http://192.168.1.249:8802/ims";
const API_ENDPOINT_QC = "http://183.239.150.130:8800/qc";

function Message(obj){
    if(window.$message){
        window.$message(obj);
    } else if (window.parent.$message) { // 挂载在index.html的window中
        window.parent.$message(obj);
    }
}

// 获取URL参数
const getQueryParam = (key) => {
    const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
    const r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}

// url参数转对象
function parseQueryString(url) {
    var reg_url = /^[^\?]+\?([\w\W]+)$/,
        reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
        arr_url = reg_url.exec(url),
        ret = {};
    if (arr_url && arr_url[1]) {
        var str_para = arr_url[1], result;
        while ((result = reg_para.exec(str_para)) != null) {
            ret[result[1]] = result[2];
        }
    }
    return ret;
}

// 数组去重
function uniq(array){
    var newArr = []; //一个新的临时数组
    for(var i = 0; i < array.length; i++){
        if(newArr.indexOf(array[i]) == -1){
            newArr.push(array[i]);
        }
    }
    return newArr;
}

function compare(a, b){
    return a - b;
}

function addLocalStorage(key, value) {
    if (key != "") {
        if (value && typeof value === 'object') {
            value = JSON.stringify(value);
        }
        window.localStorage.setItem(key, value);
    }
}

function getLocalStorage(key) {
    if (key != "") {
        let value = window.localStorage.getItem(key);
        
        if(value){
            if(isJSON(value)){
                value = JSON.parse(value);
            }
        }else{
            value = "";
        }

        return value;
    }
}

// 判断字符串是否为JSON格式
function isJSON(str){
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){ // obj可能为空 {} 、[]
                return true;
            }else{
                return false;
            }

        } catch(e) {
            console.log('error：'+str+'!!!'+e);
            return false;
        }
    }
}

function urlParamsTransformToJson(url){
    let arr = url.split("?")[1].split("&");   //先通过？分解得到？后面的所需字符串，再将其通过&分解开存放在数组里
    let obj = {};

    for (let i of arr) {
        obj[i.split("=")[0]] = i.split("=")[1];  //对数组每项用=分解开，=前为对象属性名，=后为属性值
    }
    return obj;
}

function checkChangeState(change){
    // var state = false;
    window.localStorage.setItem('changeState', 'changed');
}

function clearChangeState(){
    window.localStorage.removeItem('changeState');
}

function beforeLeavePage($confirm){
    var state = window.localStorage.getItem('changeState');
    if(state == 'changed') {
        // $confirm('数据还未保存，确定离开？', '提 示', {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        // }).then(() => {
        //     return true;6
        // }).catch(() => {
        //     return false;
        // });
        return true;
    }
    return false;
}

function refreshPage(_this){//刷新
    var isLeaved = beforeLeavePage();
    if(isLeaved){
        _this.$confirm('数据还未保存，确定离开?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
                clearChangeState();
                window.location.reload();
            }).catch(() => {
                return false;
            })
    }else{
        window.location.reload()
    }
}

function notSaveMessage(that, message){
    console.log('notSaveMessage')
    that.$confirm(message || '数据还未保存，确定离开?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).then(() => {
            clearChangeState();
            window.location.reload();
        }).catch(() => {
            return false;
        }
    )
}