// pages/myCenter/myCenter.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAuth: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  toRealName: function() {
    if (this.data.isAuth == 0 || this.data.isAuth == 3) {
      wx.navigateTo({
        url: '/pages/realName/realName'
      })
    }
  },
  // getAuthInfo: function () {
  //   const $this = this
  //   api.ajax({
  //     url: `${config.getAuthInfo}/${app.globalData.userInfo.uid}/info`,
  //   })
  //     .then(resolve => {
  //       if (resolve.statusCode == 200) {
  //         if (resolve.data.code == 0) {
  //           let obj = resolve.data.data
  //           if (obj.checkStatus == 0) { //审核中
  //             this.setData({
  //               isAuth: 2
  //             })
  //           } else if (obj.checkStatus == 2) {//驳回
  //             this.setData({
  //               isAuth: 3
  //             })
  //           } else if (obj.checkStatus == 1) {
  //             this.setData({
  //               isAuth: 1
  //             })
  //             app.globalData.userInfo.isAuth = 1
  //           }
  //           this.setData({
  //             authObj: obj
  //           })
  //         } else if (resolve.data.code == 2002) {
  //           this.setData({
  //             isAuth: 0
  //           })
  //         }else {
  //           app.warnNotice(resolve.data.message)
  //         }
  //       }else {
  //         app.warnNotice('认证信息请求失败，请检查网络')
  //       }
  //     })
  //     .catch(err => {
  //       app.warnNotice('认证信息请求失败，请检查网络')
  //     })
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userUrl: app.globalData.userInfo.avatar,
        userName: app.globalData.userInfo.nickName
      })
    }
    api.getAuthInfo((isAuth, obj)=> {
      this.setData({
        isAuth: isAuth
      })
      if (isAuth != 0) {
        this.setData({
          authObj: obj
        })
      }
    }, 1)
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