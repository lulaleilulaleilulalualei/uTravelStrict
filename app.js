//app.js
App({
  onLaunch: function () {
    
  },
  onShow: function(res) {
    if (res.scene == 1008 || res.scene == 1007) {
      this.globalData.isSharePage = true
      if (res.query.uid) {
        this.globalData.shareUid = res.query.uid
      }
    } else if (res.scene == 1012 || res.scene == 1013) { //长按图片识别二维码 手机相册选取二维码
      // this.globalData.isSharePage = true
    }
  },
  globalData: {
    userInfo: null,
    isSharePage: false, //是否为分享页面
    isEnterGroupList: false,
    invoiceAddress: null,
    isNeedInvoice: false,
    ordersObj: null,
    isFromOrdersStage: false, //在未完成订单的订单阶段中查看产品详情，不可对详情做操作
    isBackFromOrders: false,
    shareUid: '', //分享人id
  },
  warnNotice: function (title) {
    let sysInfoVer = wx.getSystemInfoSync().SDKVersion
    if (sysInfoVer.split('.')[0] <= 1) {
      if (sysInfoVer.split('.')[1] >= 9) {
        wx.showToast({
          title: title,
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: title,
          icon: 'loading'
        })
      }
    } else {
      wx.showToast({
        title: title,
        icon: 'none'
      })
    }
  } 
})