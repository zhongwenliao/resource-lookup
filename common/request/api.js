/**
 * 接口列表文件
 * auth代表接口是否需要token
 * noZoneId代表是否需要zoneId
 */
export default {
  /** 获取行业信息 **/
  industry: {
    url: "/gsIndustryInformation/web/list",
    noZoneId: true,
    method: "get",
    desc: "pid地址获取"
  },
  /** 初始化 ↓ **/
  init: {
    url: "index/init",
    auth: false,
    method: "GET"
    // desc: '初始化数据',
  },

  /** 上传Base64图片 ↓ **/
  uploadBase64: {
    url: "index/uploadBase64",
    auth: false,
    method: "POST"
    // desc: '上传Base64位图片',
  },
  getByCity: {
    url: "/gsZoneInfo/app/getByCity",
    noZoneId: true,
    method: "post",
    desc: "pid地址获取"
  },
  address: {
    url: "/region/web/getRegionList",
    noZoneId: true,
    method: "get",
    desc: "pid地址获取"
  },
  /** 用户 ↓ **/
  user: {
    login: {
      url: "/auth/oauth/token",
      auth: true,
      noZoneId: true,
      method: "POST",
      desc: "登录"
    },
    destroy: {
      url: "/sysUser/app/destroy",
      method: "POST",
      noZoneId: true,
      desc: "注销"
    },
    addOrUpdateCid: {
      url: "/sysUser/app/addOrUpdateCid",
      method: "POST",
      desc: "上传cid"
    },
    verificationCode: {
      url: "/smsPropertie/web/sendLoginVerifyCode",
      auth: true,
      noZoneId: true,
      method: "POST",
      desc: "获取验证码"
    },
    register: {
      url: "/yzUser/app/register",
      auth: true,
      noZoneId: true,
      method: "POST",
      desc: "注册"
    },
    logout: {
      url: "/auth/oauth/logout",
      noZoneId: true,
      method: "GET",
      desc: "退出登录"
    },
    getBanner: {
      url: "/fwBannerInfo/app/getBanner",
      method: "get",
      desc: "获取banner"
    },
    forgotPassword: {
      url: "/sysUser/app/forgot",
      method: "POST",
      desc: "忘记密码",
      auth: true,
      noZoneId: true
    },
    updatePassword: {
      url: "/sysUser/web/updatePassword",
      method: "post",
      desc: "修改账号密码"
    },
    updatePassword2: {
      url: "/sysUser/app/updatePassword",
      method: "post",
      desc: "修改账号密码(适配版)",
      auth: true,
      noZoneId: true
    },
    userInfo: {
      url: "/sysUser/web/getMyself",
      noZoneId: true,
      method: "GET",
      desc: "获取用户信息"
    },
    updateAvatar: {
      url: "/sysUser/web/updateAvatar",
      method: "post",
      desc: "修改App端显示头像"
    },
    roleList: {
      url: "/sysRole/web/getAll",
      method: "GET",
      desc: "获取所有角色信息"
    },
    reLease: {
      url: "/fwItemRelease/app/add",
      method: "post",
      desc: "新增物品放行",
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    },
    releaseList: {
      url: "/fwItemRelease/web/list",
      method: "GET",
      desc: "获取物品放行列表"
    },
    releaseByldList: {
      url: "/fwItemRelease/web/getById",
      method: "GET",
      desc: "根据id获取物品放行列表"
    },
    userInformationList: {
      url: "/sysUserInformation/web/list",
      method: "GET",
      desc: "根据id获取物品放行列表"
    }
  },
  zoneInfo: {
    zoneList: {
      url: "/gsZoneInfo/app/getAll",
      method: "POST",
      noZoneId: true,
      desc: "园区列表"
    },
    roomListDevice: {
      url: "/jgRoomInfo/app/getListByZoneId",
      method: "get",
      desc: "获取房间设备绑定信息"
    },
    getListByZoneIdForUser: {
      url: "/jgRoomInfo/app/getListByZoneIdForUser",
      method: "get",
      desc: "获取房间设备绑定信息"
    },
    // 房间
    buildfloorList: {
      url: "/jgFloorInfo/web/getAll",
      method: "POST",
      noZoneId: true,
      desc: "获取楼栋楼层列表"
    }
  },
  // 账单信息
  billPay: {
    billPreview: {
      url: "/fwJfPaymentInfo/app/billPreview",
      method: "post",
      desc: "账单详情查询"
    },
    getBillByMyself: {
      url: "/fwJfPaymentInfo/app/getBillByMyself",
      method: "get",
      desc: "账单列表查询"
    },
    paymentRecord: {
      url: "/fwJfPaymentInfo/app/paymentRecord",
      method: "get",
      desc: "查看租户缴费记录"
    }
  },
  // 联系物业
  contact: {
    contactAdd: {
      url: "/gsPropertyContact/web/add",
      method: "post",
      desc: "新增联系物业"
    },
    getcontactAll: {
      url: "/gsPropertyContact/web/getAll",
      method: "get",
      desc: "获取联系物业列表"
    }
  },
  // 招商信息
  merchants: {
    intentionApplyList: {
      url: "/fwZsCustomerIntentForm/app/list",
      method: "get",
      desc: "意向申请列表"
    },
    getCollectList: {
      url: "/fwZsInvestmentInfo/app/getCollectList",
      method: "get",
      desc: "招商收藏列表"
    },
    collect: {
      url: "/fwZsInvestmentInfo/app/collect",
      method: "post",
      desc: "招商收藏"
    },
    delCollect: {
      url: "/fwZsInvestmentInfo/app/delCollect",
      method: "get",
      desc: "删除招商收藏"
    },
    intentionApply: {
      url: "/fwZsCustomerIntentForm/app/add",
      method: "post",
      desc: "意向申请",
      noZoneId: true
    },
    merchantsList: {
      url: "/fwZsInvestmentInfo/web/list",
      method: "get",
      desc: "招商列表查询",
      noZoneId: true
    },
    merchantsInfo: {
      url: "/fwZsInvestmentInfo/web/getById",
      method: "get",
      desc: "招商详情接口",
      noZoneId: true
    }
  },
  // 合同信息
  contract: {
    contractList: {
      url: "/fwHtContractInfo/web/list",
      method: "get",
      desc: "合同列表查询"
    },
    contractInfo: {
      url: "/fwHtContractInfo/web/getById",
      method: "get",
      desc: "合同详情接口"
    },
    getAllContractList: {
      url: "/fwHtContractInfo/web/getAll",
      method: "get",
      desc: "全部合同列表查询"
    }
  },
  /** 设备管理 ↓ **/
  equipment: {
    getVisitorHistory: {
      url: "/yzQyEnterpriseUser/app/getVisitorHistory",
      method: "get",
      desc: "访客授权历史记录"
    },
    updateVisitorQrCode: {
      url: "/yzQyEnterpriseUser/app/updateVisitorQrCode",
      method: "post",
      desc: "修改访客授权生效时间"
    },
    getVisitorQrCode: {
      url: "/yzQyEnterpriseUser/app/getVisitorQrCode",
      method: "get",
      desc: "访客授权"
    },
    appall: {
      url: "/devApartment/web/all",
      method: "get",
      desc: "公寓设备列表"
    },
    appRemoteDoor: {
      url: "/devApartment/web/remoteDoor",
      method: "post",
      desc: "公寓远程开门"
    },
    // 远程开门
    remoteDoor: {
      url: "/devDevice/web/remoteDoor",
      method: "post",
      desc: "远程开门"
    },
    getHouseholdQrCode: {
      url: "/yzQyEnterpriseUser/web/getHouseholdQrCode",
      method: "get",
      desc: "一码通行"
    },
    // APP当前登录用户在某个园区下所有的权限门禁设备列表
    equipmentList: {
      url: "/sysUser/web/getAccessControl",
      method: "get",
      desc: "获取APP当前登录用户在某个园区下所有的权限门禁设备列表"
    },
    // 获取设备列表
    getAppDevAuthorizeList: {
      url: "/sysUser/web/getAccessControl",
      method: "get",
      desc: "获取设备列表（不分页）"
    },
    // 获取设备列表
    getAppDevAuthorize: {
      url: "/devDevice/web/list",
      method: "get",
      desc: "获取设备列表"
    },
    // 远程开门
    remoteDoor: {
      url: "/devDevice/web/remoteDoor",
      method: "post",
      desc: "远程开门"
    },
    // 开门记录
    openDoorRecord: {
      url: "/devOpenRecord/web/list",
      method: "get",
      desc: "获取开门记录"
    },
    // 上传开门记录
    addDevOpenRecord: {
      url: "/devOpenRecord/app/addOther",
      method: "post",
      desc: "上传开门记录",
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    },
    // 添加设备
    setDevDevice: {
      url: "/devDevice/web/addOrUpdate",
      method: "post",
      desc: "添加或修改设备"
    },
    // 修改配置设备参数
    modifyParameters: {
      url: "/devDevice/web/modifyParameters",
      method: "post",
      desc: "修改配置设备参数"
    }
  },
  /** 通知 ↓ **/
  notice: {
    noticeList: {
      url: "/fwTzNotificationInfo/web/list",
      method: "get",
      desc: "通知列表"
    },
    noticeInfo: {
      url: "/fwTzNotificationInfo/web/getById",
      method: "get",
      desc: "通知详情"
    }
  },
  //停车业务
  monthCard: {
    // 部门列表，带人数
    jgRoomInfoGetRoomListByEnterpriseId: {
      url: "/jgRoomInfo/web/getRoomListByEnterpriseId",
      method: "post",
      desc: "房间数据"
    },
    //新增停车人员信息
    parkUserInfoAdd: {
      url: "/parkUserInfo/web/add",
      method: "post",
      desc: "新增停车人员"
    },
    //公司审核
    parkUserInfoBillReview: {
      url: "/parkUserInfo/web/billReview",
      method: "post",
      desc: "公司审核"
    },
    //园区审核
    parkUserInfoBillReviewForZone: {
      url: "/parkUserInfo/web/billReviewForZone",
      method: "post",
      desc: "园区审核"
    },
    //删除
    parkUserInfoDelByIds: {
      url: "/parkUserInfo/web/delByIds",
      method: "post",
      desc: "删除"
    },
    //获取根据ID
    parkUserInfoGetById: {
      url: "/parkUserInfo/web/getById",
      method: "get",
      desc: "获取根据ID"
    },
    //根据车牌号码
    parkUserInfogetByLicensePlateNumber: {
      url: "/parkUserInfo/web/getByLicensePlateNumber",
      method: "get",
      desc: "根据车牌号码"
    },
    //获取申办记录列表
    parkUserInfolist: {
      url: "/parkUserInfo/web/list",
      method: "get",
      desc: "获取申办记录列表"
    },
    //获取列表
    parkUserInfopayment: {
      url: "/parkUserInfo/web/payment",
      method: "post",
      desc: "停车月卡缴费"
    },
    //修改
    parkUserInfoupdateById: {
      url: "/parkUserInfo/web/updateById",
      method: "post",
      desc: "修改"
    },
    //停车月卡缴费
    parkUserInfoPayment: {
      url: "/parkUserInfo/app/payment",
      method: "post",
      desc: "停车月卡缴费"
    }
  },
  // 人员管理
  employeeManagement: {
    // 部门列表，带人数
    departmentList: {
      url: "/sysRole/app/getByEnterpriseId",
      method: "get",
      desc: "部门列表"
    },
    // 部门列表，不带人数
    getDepartmentAll: {
      url: "/sysRole/web/getAll",
      method: "get",
      desc: "部门列表，不带人数"
    },
    // 人员权限列表
    roleMenuList: {
      url: "/sysRoleMenu/web/all",
      method: "get",
      desc: "人员权限列表"
    },
    // 新增部门
    addDepartment: {
      url: "/sysRole/web/add",
      method: "post",
      desc: "新增部门",
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    },
    // 删除部门
    delDepartment: {
      url: "/sysRole/web/delByIds",
      method: "post",
      desc: "删除部门"
    },
    // 获取部门详情
    departmentInfo: {
      url: "/sysRole/web/getById",
      method: "get",
      desc: "获取部门详情"
    },
    // 修改部门
    updateDepartment: {
      url: "/sysRole/web/updateById",
      method: "post",
      desc: "修改部门"
    },
    // 获取某部门人员列表
    departmentPersonnelList: {
      url: "/yzQyEnterpriseUser/web/list",
      method: "get",
      desc: "获取某部门人员列表"
    },
    // 根据租户id获取房间信息
    getRoomListByEnterpriseId: {
      url: "/jgRoomInfo/app/getRoomListByEnterpriseId",
      method: "post",
      desc: "根据租户id获取房间信息"
    },
    // 根据租户id获取房间信息和公共信息
    getRoomListBySelf: {
      url: "/jgRoomInfo/app/getRoomListBySelf",
      method: "post",
      desc: "根据租户id获取房间信息"
    },
    // 新增人员
    addEnterpriseUser: {
      url: "/yzQyEnterpriseUser/web/add",
      method: "post",
      desc: "新增人员",
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    },
    // 删除人员信息
    delByIdsEnterpriseUser: {
      url: "/yzQyEnterpriseUser/web/delByIds",
      method: "post",
      desc: "删除人员信息"
    },
    // 根据id 查询人员信息
    getByIdEnterpriseUser: {
      url: "/yzQyEnterpriseUser/web/getById",
      method: "get",
      desc: "根据id 查询人员信息"
    },
    // 修改人员信息
    updateEnterpriseUser: {
      url: "/yzQyEnterpriseUser/web/update",
      method: "post",
      desc: "修改人员信息",
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    },
    // 移动人员到别的部门
    getByEnterpriseId: {
      url: "/sysRole/app/getByEnterpriseId",
      method: "post",
      desc: "根据id 查询人员信息"
    }
  },
  // 报修管理
  repairs: {
    // 获取维修列表
    getMaintenanceInfoList: {
      url: "/fuWxMaintenanceInfo/web/list",
      method: "get",
      desc: "获取维修列表"
    },
    // 获取维修分类列表
    getAllMaintainClassifyList: {
      url: "/fuWxMaintenanceClassification/web/getAll",
      method: "get",
      desc: "获取维修分类列表"
    },
    // 根据ID获取维修信息
    getByIdMaintenanceInfo: {
      url: "/fuWxMaintenanceInfo/web/getById",
      method: "get",
      desc: "根据ID获取维修信息"
    },
    // 新增报修
    addMaintenanceInfo: {
      url: "/fuWxMaintenanceInfo/app/add",
      method: "post",
      desc: "新增报修"
    },
    // 维修后，用户评价
    userEvaluation: {
      url: "/fuWxMaintenanceInfo/app/evaluation",
      method: "post",
      desc: "维修后，用户评价"
    }
  },
  // 会议室预约管理
  meetingRoom: {
    // 获取会议室列表
    getMeetingRoomList: {
      url: "/jgRoomInfo/app/getList",
      method: "get",
      noZoneId: true,
      desc: "获取会议室列表"
    },
    // 根据id获取
    getById: {
      url: "/fwYuyuePublicFacilityReservationInfo/web/getById",
      method: "get",
      noZoneId: true,
      desc: "获取会议室详情"
    },
    // 会议室时间列表信息
    roomTimeList: {
      url: "/fwYuyuePublicFacilityReservationInfoSettings/web/getAll",
      method: "get",
      noZoneId: true,
      desc: "会议室时间列表信息"
    },
    // 新增预约会议室
    addMeetingRoom: {
      url: "/fwYuyuePublicFacilityReservationInfo/app/add",
      method: "post",
      noZoneId: true,
      desc: "新增预约会议室"
    },
    // 预约会议室记录
    getMeetingRoomlist: {
      url: "/fwYuyuePublicFacilityReservationInfo/app/list",
      method: "get",
      noZoneId: true,
      desc: "预约会议室记录"
    },
    // 取消预约 会议室
    cancelAppointment: {
      url: "fwYuyuePublicFacilityReservationInfo/app/cancelAppointment",
      method: "post",
      desc: "取消预约 会议室"
    },
    // 获取允许提前预约日期
    getAppointmentDate: {
      url: "/fwYuyuePublicFacilityReservationInfoSettings/web/getDate",
      method: "get",
      noZoneId: true,
      desc: "获取允许提前预约日期"
    }
  },
  // 用户投诉
  userComplaints: {
    // 新增
    getComplaints: {
      url: "/fwTsComplaintInfo/app/add",
      method: "post",
      desc: "新增投诉"
    },
    // 获取列表
    getComplaintsList: {
      url: "/fwTsComplaintInfo/app/list",
      method: "get",
      desc: "获取列表"
    },
    // 根据id获取投诉信息
    getComplaintsByld: {
      url: "/fwTsComplaintInfo/web/getById",
      method: "get",
      desc: "获取根据id"
    },
    // 获取投诉分类列表
    getComplaintsALL: {
      url: "/fwTsComplaintClassification/web/getAll",
      method: "get",
      desc: "获取投诉分类列表"
    },
    // 投诉后评价
    getComplaintsEvaluation: {
      url: "/fwTsComplaintInfo/app/evaluation",
      method: "post",
      desc: "评价"
    }
  }
};
