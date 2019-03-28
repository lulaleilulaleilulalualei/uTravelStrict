// pages/checkingTicket/checkingTicket.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userTel: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  toScanCode: function() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        let userInfo = JSON.parse(res.result)
        wx.navigateTo({
          url: `/pages/scanTrust/scanTrust?uid=${userInfo.uid}&orderid=${userInfo.platTransNo}`
        })
      }
    })
  },
  bindGetPhoneVal: function(e) {
    this.setData({
      userTel: e.detail.value
    })
  },
  toInquireTicket: function() {
    let telTeg = /^\s*1[345678]\d{9}$/
    if (telTeg.test(this.data.userTel)) {
      wx.showLoading({
        title: '查询中...',
        mask: true
      })
      const $this = this
      api.ajax({
        url: `${config.inquirePhone}/${$this.data.userTel}`
      })
        .then(resolve => {
          if (resolve.statusCode == 200 && resolve.data.code == 0) {
            wx.hideLoading()
            if (resolve.data.data.length > 0) { 
              if (resolve.data.data.length > 1) {
                this.setData({
                  moreOrders: resolve.data.data
                })
              } else {
                let phoneOrders = resolve.data.data[0]
                wx.navigateTo({
                  url: `/pages/scanTrust/scanTrust?uid=${phoneOrders.uid}&orderid=${phoneOrders.platTransNo}`
                })
              }
            }else {
              app.warnNotice('该手机号没有订单')
            }
          }else {
            wx.hideLoading()
            app.warnNotice(resolve.data.message)
          }
        })
        .catch(err => {
          wx.hideLoading()
          app.warnNotice('手机号查询失败，请检查网络')
        })
    }else {
      app.warnNotice('请输入正确的手机号码')
    }
  },
  toCheckTicket: function(e) {
    let index = e.currentTarget.dataset.index
    this.data.moreOrders.map((v, i) => {
      if(index == i) {
        wx.navigateTo({
          url: `/pages/scanTrust/scanTrust?uid=${v.uid}&orderid=${v.platTransNo}`
        })
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
    this.setData({
      moreOrders: [],
      userTel: ''
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

  // }
})