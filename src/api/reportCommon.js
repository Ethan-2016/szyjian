import request from "@/utils/request";

const CommonData = {};

// 根据条件获取药品途径
CommonData.SelectDrugRouteDicInfo = function (drugType) {
  return request({
    method: "GET",
    url: `/api/aims/dictionary/selectDrugRouteDicInfo`,
    params: { "drugType": drugType }
  })
}

// 查询药品单位(编码，名称)
CommonData.SelectDrugUnitDicList = function (query) {
  return request({
    method: "GET",
    url: `/api/aims/dictionary/selectDrugUnitDicList?query=${query}`
  })
}

export default CommonData;