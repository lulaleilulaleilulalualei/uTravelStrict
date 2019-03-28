// pages/usualAddress/usualAddress.js
const app = getApp()
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['请选择配送地区', '', ''],
    isSelectRegion: false,
    userName: '',
    userPhone: '',
    detailAddress: '',
    isDefaultAgree: 1,// 状态1主动获取授权，2为拒绝授权状态，3为显示不支持open-type="openSetting"情况
  },
  getWxAddress: function() {
    const $this = this
    wx.authorize({
      scope: 'scope.address',
      success: () => {
        wx.chooseAddress({ 
          success: (res) => {
            $this.setData({
              userName: res.userName,
              userPhone: res.telNumber,
              region: [res.provinceName, res.cityName, res.countyName],
              detailAddress: res.detailInfo,
              isSelectRegion: true
            })
          },
          fail: () => {
            app.warnNotice('获取微信地址失败,请重新获取')
          }
        })
      },
      fail: () => {
        app.warnNotice('您已拒绝获取微信地址授权')
        if (api.watchOpenSetting()) {
          this.setData({
            isDefaultAgree: 2
          })
        } else {
          this.setData({
            isDefaultAgree: 3
          })
        }
      }
    })
  },
  bindRegionChange: function(e) {
    this.setData({
      isSelectRegion: true,
      region: e.detail.value
    })
  },
  sendUserName: function(e) {
    this.setData({
      userName: e.detail.value
    })
  },
  sendUserPhone: function(e) {
    this.setData({
      userPhone: e.detail.value
    })
  },
  sendDetailAddress: function(e) {
    this.setData({
      detailAddress: e.detail.value
    })
  },
  toCompeleAddress: function() {
    // let phoneReg = /^\s*1[345678]\d{9}$/
    if (api.trim(this.data.userName) != '') {
      if (api.trim(this.data.userPhone) != '') {
        if (this.data.isSelectRegion) {
          if (api.trim(this.data.detailAddress) != '') {
            // 前端验证通过
            app.globalData.invoiceAddress = {
              userName: this.data.userName,
              userPhone: this.data.userPhone,
              address: `${this.data.region.join('')}${this.data.detailAddress}`
            }
            wx.navigateBack({
              data: 1
            })
          }else {
            app.warnNotice('请填写详细地址')
          }
        }else {
          app.warnNotice('请选择所在地区')
        }
      }else {
        app.warnNotice('收件人电话不能为空')
      }
    }else {
      app.warnNotice('收件人不能为空')
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.address']) {
          this.setData({
            isDefaultAgree: 1
          })
        } else if (res.authSetting['scope.address'] !== undefined && !res.authSetting['scope.address']) {
          if (api.watchOpenSetting()) {
            this.setData({
              isDefaultAgree: 2
            })
          } else {
            this.setData({
              isDefaultAgree: 3
            })
          }
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

  // }
})