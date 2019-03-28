// pages/mine/mine.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userUrl: '../../images/user_test_1.png',
    nickName: '优旅家严选',
    isAccredit: 0,// 状态0为未授权状态，1为授权状态，2为拒绝授权状态，3为显示不支持open-type="openSetting"情况, 4无法授权，页面报错
    ordersList: [],
    isLoadErr: false,
    scrollH: 'auto',
    index: 1, //页数
    size: 10, //每页加载数量
    isHadMore: true, //是否还有更多
    isManageer: 0, //默认不是管理者
    isShowAuthStatus: false, //是否显示授权状态

    isShowJoinMiniTop: false,
    isShowJoinMiniBox: false,
  },

  jumpToOrdersDetail: function(e) {
    let index = e.currentTarget.dataset.index,
      type = e.currentTarget.dataset.type, //团状态
      isRefund = this.data.ordersList[index].isRefund, //是否退团
      ordersNo = this.data.ordersList[index].platTransNo
    
    // if (isRefund == 1) {
      wx.navigateTo({
        url: `/pages/hadBuildGroup/hadBuildGroup?type=${type}&ordersid=${ordersNo}`,
      })
    // }else {
    //   if (type == 0) {
    //     wx.navigateTo({
    //       url: `/pages/joinGrouping/joinGrouping?type=${type}&ordersid=${ordersNo}`,
    //     })
    //   } else {
    //     wx.navigateTo({
    //       url: `/pages/hadBuildGroup/hadBuildGroup?type=${type}&ordersid=${ordersNo}`,
    //     })
    //   }
    // }
  },
  jumpToCoupon: function() {
    wx.navigateTo({
      url: '/pages/discountCoupon/discountCoupon?fromtype=mine',
    })
  },
  jumpTopManager: function() {
    wx.navigateTo({
      url: '/pages/managerPage/managerPage'
    })
  },
  toJoinMyStore: function() {
    wx.navigateTo({
      url: '/pages/myStore/myStore'
    })
  },
  toScanCodePage() {
    wx.navigateTo({
      url: '/pages/checkingTicket/checkingTicket',
    })
  },
  getUserInfo: function (e) { //按钮登录授权
    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.showLoading({
        title: '授权登陆中...',
        mask: true
      })
      const $this = this
      api.userLogin((status) => {
        if (status == '1') {
          this.setData({
            isAccredit: 1,
            userUrl: app.globalData.userInfo.avatar,
            nickName: app.globalData.userInfo.nickName,
            isAuth: app.globalData.userInfo.isAuth,
            isManageer: app.globalData.userInfo.isTeller,
            isShowAuthStatus: false,
            index: 1,
            ordersList: []
          })
          this.mineOrdersLoad()
          app.globalData.isMineSetting = true
          if (app.globalData.userInfo && app.globalData.shareUid) {
            api.toBindUser()
          }
          wx.hideLoading()
          wx.showToast({
            title: '授权登录成功',
            icon: 'success',
            mask: true
          })
        }
      })
    } else {
      app.warnNotice('您已拒绝授权，只有授权后才能享受我们的产品哦~')
      if (api.watchOpenSetting()) {
        this.setData({
          isAccredit: 2,
          isShowAuthStatus: true
        })
      } else {
        this.setData({
          isAccredit: 3,
          isShowAuthStatus: true
        })
      }
    }
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false,
      ordersList: []
    })
    this.mineOrdersLoad()
  },
  toOpenSetting: function () {
    wx.showModal({
      content: '系统检测到您拒绝授权，是否重新授权',
      confirmColor: '#FFDA4C',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting()
        }
      }
    })
  },

  toShowJoinColloct: function () { //显示加入到我的小程序提示
    this.setData({
      isShowJoinMiniTop: false,
      isShowJoinMiniBox: true
    })
  },
  toCloseMiniBox: function () {
    wx.setStorage({
      key: 'myMini',
      data: '1'
    })
    this.setData({
      isShowJoinMiniBox: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = wx.getSystemInfoSync()
    this.setData({
      scrollH: sysInfo.windowHeight - (sysInfo.windowWidth / 750) * (100 + 130 + 100 + 100) + 'px',
    })
    // if (options.uid) {
    //   app.globalData.shareUid = options.uid
    // }
    if (app.globalData.userInfo && app.globalData.shareUid) { 
      api.toBindUser()
    }
    if (app.globalData.userInfo) {
      this.mineOrdersLoad()
    }
  },
  mineOrdersLoad: function() {
    const $this = this
    api.ajax({
      url: `${config.getMineOrders}/${app.globalData.userInfo.uid}/page?index=${$this.data.index}&size=${$this.data.size}`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (this.data.index <= resolve.data.pages) {
            this.setData({
              ordersList: this.data.ordersList.concat(resolve.data.data),
              index: this.data.index + 1
            })
          }else {
            this.setData({
              isHadMore: false
            })
          }
        }else {
          if (this.data.index == 1) {
            this.setData({
              isLoadErr: true
            })
          }else {
            app.warnNotice(resolve.data.message)
          } 
        }
      })
      .catch(err => {
        if (this.data.index == 1) {
          this.setData({
            isLoadErr: true
          })
        }else {
          app.warnNotice('我的订单加载失败')
        } 
      })
  },
  lowerLoad: function() {
    this.mineOrdersLoad()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const $this = this
    wx.getStorageInfo({
      success: function (res) {
        if (res.keys.indexOf('myMini') != -1) {
          $this.setData({
            isShowJoinMiniTop: false,
            isShowJoinMiniBox: false
          })
        } else {
          if ($this.data.isShowJoinMiniBox) {
            $this.setData({
              isShowJoinMiniTop: false
            })
          } else {
            $this.setData({
              isShowJoinMiniTop: true
            })
          }
        }
      }
    })

    app.globalData.isBackFromOrders = false
    if (app.globalData.userInfo) {
        this.setData({
          isAccredit: 1,
          userUrl: app.globalData.userInfo.avatar,
          nickName: app.globalData.userInfo.nickName,
          isAuth: app.globalData.userInfo.isAuth,
          isManageer: app.globalData.userInfo.isTeller
      })
    }else {
      this.accreditStatus()
      this.setData({
        isShowAuthStatus: true
      })
    }

    if (app.globalData.toCheckSuccess) { //验票成功进入订单详情页刷新列表
      this.setData({
        index: 1,
        ordersList: []
      })
      this.mineOrdersLoad()
      app.globalData.toCheckSuccess = false
    }

    if (app.globalData.isFromRefund) { //退款刷新加载
      this.setData({
        index: 1,
        ordersList: []
      })
      this.mineOrdersLoad()
      app.globalData.isFromRefund = false
    }

    if (app.globalData.userInfo && app.globalData.userInfo.isAuth != 1) {//认证状态监测
      api.getAuthInfo((isAuth, obj) => {
        if (isAuth == 1) {
          this.setData({
            isAuth: app.globalData.userInfo.isAuth
          })
        }
      }, 0)
    }
  },
  accreditStatus: function () {
    const $this = this
    api.userLogin((status) => {
      if (status == '1') {
        $this.setData({
          isAccredit: 1,
          userUrl: app.globalData.userInfo.avatar,
          nickName: app.globalData.userInfo.nickName,
          isAuth: app.globalData.userInfo.isAuth,
          isManageer: app.globalData.userInfo.isTeller,
          isShowAuthStatus: false,
          index: 1,
          ordersList: []
        })
        if (app.globalData.userInfo && app.globalData.shareUid) {
          api.toBindUser()
        }
        app.globalData.isMineSetting = true
        this.mineOrdersLoad()
      } else if (status == '0') {
        if (api.watchOpenSetting()) {
          this.setData({
            isAccredit: 2
          })
        } else {
          this.setData({
            isAccredit: 3
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (app.globalData.userInfo && app.globalData.userInfo.isAuth == 1) {
      return {
        path: `/pages/home/home?uid=${app.globalData.userInfo.uid}`,
        title: config.defaultTitle,
        imageUrl: config.defaultUrl
      }
    }else {
      return {
        title: config.defaultTitle,
        imageUrl: config.defaultUrl
      }
    }
  }
})