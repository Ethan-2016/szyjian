var Advice = {}
Advice.bottleSignPrint = function(params) {
  return API.POST(`/document/area/advice/bottleSignPrint`,params).then((res)=>{
    return res;
  });
}
Advice.print = function(params) {//adviceIds:[]  打印完成回调  /area/advice/print
  return API.POST(`/document/area/advice/print`,params).then((res)=>{
    return res;
  });
}
Advice.getPatientInfo = function(params){//获取病人接口---病区患者信息
  return API.GET(`/document/area/patient/list`,{params:params}).then(res=>{
    return res;
  })
}
