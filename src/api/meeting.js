/**
 * 会诊会议相关API接口
 */
import request from '@/utils/request';

const Meeting = {};

Meeting.joinRoom = function(userName, roomNumber, roomSecret) {
  var req = {
    number: roomNumber,
    secret: roomSecret,
  };

  return request({
    method: 'GET',
    url: '/api/conference/rooms',
    params: req
  })
}

Meeting.getConsultationInformation = function(id) {
  var url = `/api/conference/applications/${id}`;
  return request({
    method: 'GET',
    url: url
  });
}

Meeting.saveReport = function(report) {
  console.info(report);
  var url = `/api/conference/applications/${report.consultationId}/report`;
  var req = {
    reporter: report.reporter,
    content: report.content,
    resources: [].concat(report.resources ?? [])
  };
  return request({
    url: url,
    method: 'POST',
    data: req
  });
}

export default Meeting;