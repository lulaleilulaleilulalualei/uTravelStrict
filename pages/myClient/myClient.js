// pages/myClient/myClient.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    clientNum: 0,
    isToBottom: false,
    isLoadErr: false,
    index: 1,
    size: 10,
    clientArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userImg: app.globalData.userInfo.avatar,
      userName: app.globalData.userInfo.nickName
    })
    this.getShowClient()
  },
  toLoadMore: function() {
    this.getShowClient()
  },
  toLookClientInfo: function(e) {
    let index = e.currentTarget.dataset.index
    app.warnNotice('功能尚未开放')
  },
  toCallUser: function(e) {
    let index = e.currentTarget.dataset.index
    const $this = this
    wx.makePhoneCall({
      phoneNumber: $this.data.clientArr[index].tel
    })
  },
  getShowClient: function () {
    const $this = this
    api.ajax({
      url: `${config.getClientList}?index=${$this.data.index}&size=${$this.data.size}&cid=${app.globalData.userInfo.uid}`
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (resolve.data.pages > 0) {
            if (this.data.index <= resolve.data.pages) {
              this.setData({
                clientArr: this.data.clientArr.concat(resolve.data.data),
                index: this.data.index + 1,
                clientNum: resolve.data.total
              })
            } else {
              this.setData({
                isToBottom: true
              })
            }
          } else {
            //数据列表为空 resolve.data.pages = 0 同commentArr长度为0,同total等于0
            // this.setData({
            //   isShowNoData: true
            // })
          }
        } else {
          if (this.data.index == 1) {
            this.setData({
              isLoadErr: true
            })
          } else {
            app.warnNotice(resolve.data.message)
          }
        }
      })
      .catch(err => {
        if (this.data.index == 1) {
          this.setData({
            isLoadErr: true
          })
        } else {
          app.warnNotice('数据获取失败，请检查网络')
        }
      })
  },
  toAgainLoad: function () {
    this.setData({
      index: 1,
      isLoadErr: false,
      clientArr: []
    })
    this.getShowClient()
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