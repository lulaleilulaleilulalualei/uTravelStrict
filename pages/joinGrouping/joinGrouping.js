// pages/joinGrouping/joinGrouping.js
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
    shareJoinText: '分享好友拼团', // '参与拼团'
    isLoadErr: false,
  },
  jumpToProductDetail: function() {
    app.globalData.isFromOrdersStage = true
    const $this = this
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${$this.data.ordersObj.goodsId}`,
    })
  },
  jumpToQuitChange: function() {
    wx.navigateTo({
      url: `/pages/quitChangeRule/quitChangeRule`,
    })
  },
  shareFriend: function() {
    
  },
  toConTactOfficail: function () {//打电话
    wx.makePhoneCall({
      phoneNumber: config.officialPhone
    })
  },
  handleContact(e) {
    // console.log(e.path)
    // console.log(e.query)
  },
  toAgainLoad: function () {
    this.setData({
      index: 1,
      isLoadErr: false,
      currentGroup: []
    })
    this.dataLoad()
  },
  toCancelOrders: function() {
    this.refundRate()
  },
  refundRate: function() {
    const $this = this
    api.ajax({
      url: `${config.refundRate}?uid=${app.globalData.userInfo.uid}&orderId=${$this.data.ordersId}`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let obj = resolve.data.data
          wx.showModal({
            content: `当前损失费比率为${obj.rate * 100}%,可退款金额为￥${obj.refund},是否确认取消订单`,
            confirmColor: '#FFDA4C',
            success: (res) => {
              if (res.confirm) {
                this.refundApi()
              }
            }
          })
        }else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('获取数据错误')
      })
  },
  refundApi: function() {
    const $this = this
    api.ajax({
      url: `${config.refundApi}?uid=${app.globalData.userInfo.uid}&orderId=${$this.data.ordersId}`,
      method: 'POST'
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.showToast({
            title: '退款成功',
            icon: 'success',
            success: () => {
              app.globalData.isFromRefund = true
              setTimeout(() => {
                wx.navigateBack({
                  data: 1
                })
              }, 1500) 
            }
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('退款失败')
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      ordersId: options.ordersid
    })
    this.dataLoad()
  },

  dataLoad: function() {
    const $this = this
    api.ajax({
      url: `${config.ordersDetail}/${app.globalData.userInfo.uid}/${$this.data.ordersId}?type=${$this.data.type}`
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
            isLoadErr: true
          })
        }
      })
      .catch(err => {
        this.setData({
          isLoadErr: true
        })
      })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false
    })
    this.dataLoad()
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
    app.globalData.isBackFromOrders = true
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
  //     path: `/pages/shareGroup/shareGroup?ordersid=${this.data.ordersObj.platTransNo}&shareuid=${app.globalData.userInfo.uid}`,
  //     // imageUrl: '../../images/share-cover.png'
  //   }
  // }
})