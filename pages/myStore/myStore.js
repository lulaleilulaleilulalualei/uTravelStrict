// pages/myStore/myStore.js
const app = getApp()
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  toJumpMyClient: function() {
    wx.navigateTo({
      url: '/pages/myClient/myClient'
    })
  },
  jumpToMyCenter: function() {
    wx.navigateTo({
      url: '/pages/myCenter/myCenter'
    })
  },
  jumpToMyBill: function() {
    if (this.data.isAuth == 1) {
      wx.navigateTo({
        url: '/pages/myBill/myBill'
      })
    }else {
      app.warnNotice('请先通过认证哦~')
    }
  },
  jumpToMyWallet: function() {
    if (this.data.isAuth == 1) {
      wx.navigateTo({
        url: '/pages/myWallet/myWallet'
      })
    }else {
      app.warnNotice('请先通过认证哦~')
    }
  },
  jumpToProCenter: function() {
    if (this.data.isAuth == 1) {
      wx.navigateTo({
        url: '/pages/proCenter/proCenter'
      })
    } else {
      app.warnNotice('请先通过认证哦~')
    }
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
      userUrl: app.globalData.userInfo.avatar,
      isAuth: app.globalData.userInfo.isAuth
    })
    
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