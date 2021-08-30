// import request from '@/utils/request';

const sysMenu = {};

sysMenu.datas = function(){
  return [{
    name: "系统设置",
    childs: [
      {name:'菜单管理', url:'/system/menu'},
      {name:'角色管理', url:'/system/role'},
      {name:'用户管理', url:'/system/user'},
    ]
  },{
    name: "日间设置",
    childs: [
      {name:'日间诊断设置', url:'/system/ascDiag'},
      {name:'术式准入设置', url:'/system/surAccess'},
      {name:'主刀准入设置', url:'/system/mScalpel'},
    ]
  }];
};

export default sysMenu;