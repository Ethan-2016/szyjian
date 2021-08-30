/*
 * @Author: your name
 * @Date: 2020-11-05 23:52:12
 * @LastEditTime: 2021-01-12 17:01:42
 * @LastEditors: Linbaochang
 * @Description: In User Settings Edit
 * @FilePath: \web\ICIS\src\store\getters.js
 */
let getters = {
  sidebar: state => state.app.sidebar,
  ownerMenus: state => state.sys.ownerMenus,
  decisionParameters: state => state.cdss.parameters,
  activePatient: state => state.workbench.activePatient,
  nowUserTime: state => state.workbench.nowUserTime,
  canulaList: state => state.patientCanula.canulaList,
  skinList: state => state.patientSkin.skinList,
  stroke: state => state.diseaseList,
};
export default getters;
