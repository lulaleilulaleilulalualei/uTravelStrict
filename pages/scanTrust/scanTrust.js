// pages/scanTrust/scanTrust.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoadErr: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uid: options.uid,
      ordersId: options.orderid
    })
    wx.showLoading({
      title: '数据载入中...',
      mask: true
    })
    this.dataLoad()
  },
  dataLoad: function () {
    const $this = this
    api.ajax({
      url: `${config.ordersDetail}/${$this.data.uid}/${$this.data.ordersId}`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            ordersObj: resolve.data.data
          })
          if (this.data.ordersObj.isRefund == 1) { //已退款
            this.setData({
              type: 3
            })
          } else {
            if (this.data.ordersObj.actionStatus == 0) { //未使用
              this.setData({
                type: 0
              })
            } else if (this.data.ordersObj.actionStatus == 1) { //已使用
              this.setData({
                type: 1
              })
            } else if (this.data.ordersObj.actionStatus == 2) { //已过期
              this.setData({
                type: 2
              })
            }
          }
          wx.hideLoading()
        } else {
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
  checkTicket: function() { //验票接口
    const $this = this
    api.ajax({
      url: config.checkTicket,
      data: {
        tid: app.globalData.userInfo.uid,
        rtId: $this.data.ordersObj.rtId,
        platTransNo: $this.data.ordersObj.platTransNo
      }
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.showToast({
            title: '验票成功',
            icon: 'success',
            success: () => {
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
        app.warnNotice('验票失败，请检查网络问题')
      })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false,
    })
    this.dataLoad()
  },
  toTrustOrders() {
    this.checkTicket()
  },
  toCancelOrders() {
    wx.navigateBack({
      data: 1
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