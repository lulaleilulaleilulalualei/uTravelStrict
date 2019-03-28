// pages/shareGroup/shareGroup.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hour: '00',
    minute: '00',
    second: '00',
    isLoadErr: false,
    isAccredit: 0,// 状态0为未授权状态，1为授权状态，2为拒绝授权状态,3为显示不支持open-type="openSetting"情况
    noDataText: '额~来晚了，团已经解散了'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ordersId: options.ordersid,
      shareUid: options.shareuid
    })
    this.dataLoad()
  },
  dataLoad: function() {
    const $this = this
    api.ajax({
      url: `${config.shareOrders}/${$this.data.shareUid}/share/${$this.data.ordersId}`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            ordersObj: resolve.data.data
          })
          api.countDownTime(resolve.data.data.oddTime, (h, m, s) => {
            $this.setData({
              hour: h,
              minute: m,
              second: s
            })
          })
        }else {
          this.setData({
            isLoadErr: false
          })
        }
      })
      .catch(err => {
        this.setData({
          isLoadErr: false
        })
      })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false
    })
    this.dataLoad()
  },
  bindToHome: function () {
    wx.reLaunch({
      url: `/pages/home/home`
    })
  },
  jumpToProductDetail: function () {
    const $this = this
    app.globalData.isFromOrdersStage = true
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${$this.data.ordersObj.goodsId}`,
    })
  },
  jumpToWriteOrders: function() {
    const $this = this
    if (this.data.hour < 24) {
      app.warnNotice('该团剩余报名时间小于24小时，已无法报名')
      return
    }
    if (this.data.ordersObj.batchStatus == 1) {
      app.warnNotice('该团已拼满，请选择其他的团')
      return
    }
    app.globalData.isFromShareGroup = true
    if (this.data.isAccredit == 1) {
      app.globalData.shareOrdersObj = { //最终订单详情，将带到下一个页面
        goodsId: this.data.ordersObj.goodsId,
        productName: this.data.ordersObj.goodsName,
        adultPrice: this.data.ordersObj.adultPrice,
        childrenPrice: this.data.ordersObj.childPrice,
        childPrice: this.data.ordersObj.babyPrice,
        date: this.data.ordersObj.batchDate,
        batchId: this.data.ordersObj.batchId,
        oddApplyNum: this.data.ordersObj.oddApplyNum,
        destination: this.data.ordersObj.destination,
        openNum: this.data.ordersObj.openNum,
        merchantDiscounts: '', //商家优惠券
        feeType: 1 //订单填写页面查看
      }
      app.globalData.isEnterGroupList = true //进入后只可选择日期
      wx.navigateTo({
        url: `/pages/buyProduct/buyProduct?id=${$this.data.ordersObj.goodsId}`,
      })
    }
  },
  getUserInfo: function (e) { //按钮登录授权
    if (e.detail.errMsg == 'getUserInfo:ok') {
      const $this = this
      api.userLogin((status) => {
        if (status == '1') {
          app.globalData.isFromShareGroup = true
           wx.navigateTo({
            url: `/pages/writeOrders/writeOrders`,
          })
        }
      })
    } else {
      app.warnNotice('您已拒绝授权，只有授权后才能享受我们的产品哦~')
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
    app.globalData.isFromOrdersStage = false //如果是从订单详情或者参与拼团点击查看详情进入产品详情页，默认无法下订单，只可查看
    app.globalData.isFromShareGroup = false //标识是否从分享拼图页面进入订单页
    app.globalData.shareOrdersObj = null
    app.globalData.isBackFromOrders = false
    this.setData({
      isShowHomeBtn: true
    })

    if (!app.globalData.userInfo) {
      this.accreditStatus()
    } else {
      this.setData({
        isAccredit: 1
      })
    }
  },
  accreditStatus: function () {
    const $this = this
    api.userLogin((status) => {
      if (status == '1') {
        $this.setData({
          isAccredit: 1
        })
      } else {
        if (api.watchOpenSetting()) {
          $this.setData({
            isAccredit: 2
          })
        } else {
          $this.setData({
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
  // onShareAppMessage: function () {
  //   return {
  //     path: `/pages/shareGroup/shareGroup?ordersid=${this.data.ordersId}&shareuid=${app.globalData.userInfo.uid}`,
  //     // imageUrl: '../../images/share-cover.png'
  //   }
  // }
})