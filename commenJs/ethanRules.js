   /*
    * @Author: 吴应
    * @Date: 2021年4月16日11:13:25
    * @LastEditTime: 2021年4月16日11:13:30
    * @LastEditors: Please set LastEditors
    * @Description: In User Settings Edit
    * @FileName: 校验规则
    * @FilePath: src\benchs\preHospital\commenJs\ethanRules.js
    */
   const ethanRules = {}


   // 是否手机号码或者固话,必填
   ethanRules.validatePhoneRequired = function (rule, value, callback) {
       if (!value) {
           return callback(new Error('请输入联系电话'));
       }
       const reg = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/;
       if (value == '' || value == undefined || value == null) {
           callback();
       } else {
           if ((!reg.test(value)) && value != '') {
               callback(new Error('请输入正确的电话号码或者固话号码'));
           } else {
               callback();
           }
       }
   }
   // 是否手机号码或者固话,非必填
   ethanRules.validatePhoneTwo = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       const reg = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/;
       if (value == '' || value == undefined || value == null) {
           callback();
       } else {
           if ((!reg.test(value)) && value != '') {
               callback(new Error('请输入正确的电话号码或者固话号码'));
           } else {
               callback();
           }
       }
   }
   // 是否手机号码
   ethanRules.validatePhone = function (rule, value, callback) {
       const reg = /^[1][3-9][0-9]{9}$/;
       if (value == '' || value == undefined || value == null) {
           callback();
       } else {
           if ((!reg.test(value)) && value != '') {
               callback(new Error('请输入正确的电话号码'));
           } else {
               callback();
           }
       }
   }
   // 是否身份证号码,非必填,忽略Y开头
   ethanRules.validateIdNo = function (rule, value, callback) {
       console.log('是否身份证号码,非必填', value)
       if (!value) {
           return callback();
       }
       if (value.indexOf('Y') != 0) {
           return callback();
       }
       const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
       if (value == '' || value == undefined || value == null) {
           callback();
       } else {
           if ((!reg.test(value)) && value != '') {
               callback(new Error('请输入正确的身份证号码'));
           } else {
               callback();
           }
       }
   }
   // 验证是否整数
   ethanRules.isIntegerRequired = function (rule, value, callback) {
       if (!value) {
           return callback(new Error('输入不可以为空'));
       }
       setTimeout(() => {
           if (!Number(value)) {
               callback(new Error('请输入正整数'));
           } else {
               const re = /^[0-9]*[1-9][0-9]*$/;
               const rsCheck = re.test(value);
               if (!rsCheck) {
                   callback(new Error('请输入正整数'));
               } else {
                   callback();
               }
           }
       }, 0);
   }
   // 验证是否整数,非必填
   ethanRules.isInteger = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       setTimeout(() => {
           if (!Number(value)) {
               callback(new Error('请输入正整数'));
           } else {
               const re = /^[0-9]*[1-9][0-9]*$/;
               const rsCheck = re.test(value);
               if (!rsCheck) {
                   callback(new Error('请输入正整数'));
               } else {
                   callback();
               }
           }
       }, 0);
   }
   // 两位小数验证,非必填
   ethanRules.validateValidity = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       if (!/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(value)) {
           callback(new Error('最多两位小数！！！'));
       } else {
           callback();
       }
   }
   // 两位小数验证,非必填
   ethanRules.validateContacts = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       if (!value) {
           return callback(new Error('请输入中文'))
       }
       if (!/^[\u0391-\uFFE5A-Za-z]+$/.test(value)) {
           callback(new Error('不可输入特殊字符'))
       } else {
           callback()
       }
   }
   // 两位小数验证,非必填
   ethanRules.validateNumber = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       let numberReg = /^\d+$|^\d+[.]?\d+$/
       if (value !== '') {
           if (!numberReg.test(value)) {
               callback(new Error('请输入数字'))
           } else {
               callback()
           }
       } else {
           callback(new Error('请输入值'))
       }
   }
   // 两位小数验证,非必填
   ethanRules.onePoint = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       if (!/^[0-9]+([.]{1}[0-9]{1})?$/.test(value)) {
           callback(new Error('最多一位小数！！！'));
       } else {
           callback();
       }
   }
   // 表达式检验只能是 0-9，(,),<,=,>,|,&
   ethanRules.expressionStr = function (rule, value, callback) {
       if (!value) {
           return callback();
       }
       if (/[^0-9value()<=>&| \x22]/.test(value)) {
           callback(new Error('表达式含有非法字符'));
       } else {
           callback();
       }
   }

   export default ethanRules