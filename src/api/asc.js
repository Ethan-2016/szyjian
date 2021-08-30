/**
 * 日间手术相关API接口
 */
import request from '@/utils/request';

const ASC = {};

/// 疾病诊断字典APIs
ASC.getPagedDiagnosis = function(pageIndex, pageSize, sorting) {
  var req = {
    Sorting: sorting,
    SkipCount: (pageIndex - 1) * pageSize,
    MaxResultCount: pageSize
  };

  return request({
    method: 'GET',
    url: '/api/asc/diagnosis/paging',
    params: req
  });
};

ASC.updateDiagnosis = function(diagnosis) {
  return request({
    method: 'PUT',
    url: `/api/asc/diagnosis/${diagnosis.id}`,
    data: diagnosis
  });
}

/// 术式字典APIs
ASC.getPagedSurgery = function(pageIndex, pageSize, sorting) {
  var req = {
    Sorting: sorting ?? '',
    SkipCount: (pageIndex - 1) * pageSize,
    MaxResultCount: pageSize
  };

  return request({
    method: 'GET',
    url: '/api/asc/surgery/paging',
    params: req
  });
}

ASC.updateSurgery = function(surgery) {
  return request({
    method: 'PUT',
    url: `/api/asc/surgery/${surgery.id}`,
    data: surgery
  });
}

/// 医生主刀准入APIs
ASC.getPagedDoctor = function(pageIndex, pageSize, sorting) {
  var req = {
    Sorting: sorting ?? '',
    SkipCount: (pageIndex - 1) * pageSize,
    MaxResultCount: pageSize
  };
  return request({
    method: 'GET',
    url: '/api/asc/doctor/paging',
    params: req
  });
}

ASC.updateDoctor = function(doctor) {
  return request({
    method: 'PUT',
    url: `/api/asc/doctor/${doctor.id}`,
    data: doctor
  });
}

export default ASC;