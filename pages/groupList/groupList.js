// pages/groupList/groupList.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowJoinBox: false,
    index: 1,
    size: 10,
    currentGroup: [] ,//当前拼团数组
    isToBottom: false, //show没有更多
    isLoadErr: false, //页面错误显示
    groupTotal: 0 ,//团数目默认为0
  },
  toJoinGroup: function(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      isShowJoinBox: true,
      itemGroupInfo: this.data.currentGroup[index]
    })
  },
  closeJoinBox: function (e) {
    let sign = e.target.dataset.sign
    if (sign) {
      this.setData({
        isShowJoinBox: false
      })
    }
  },
  bindJoinGroup: function(e) {
    let id = e.currentTarget.dataset.id,
    lack = e.currentTarget.dataset.lack
    this.setData({
      isShowJoinBox: false
    })
    app.globalData.isEnterGroupList = true
    app.globalData.lackNum = lack
    app.globalData.batchId = id
    wx.navigateBack({
      data: 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      date: options.date,
      goodsId: options.id
    })
    this.getShowGroup()
  },
  getShowGroup: function () {
    const $this = this
    api.ajax({
      url: `${config.getGroupList}/${$this.data.date}?index=${$this.data.index}&size=${$this.data.size}&goodsId=${$this.data.goodsId}`
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (resolve.data.pages > 0) {
            if (this.data.index == 1) { wx.stopPullDownRefresh() }
            if (this.data.index <= resolve.data.pages) {
              this.setData({
                currentGroup: this.data.currentGroup.concat(resolve.data.data),
                index: this.data.index + 1,
                groupTotal: resolve.data.total
              })
            }else {
              this.setData({
                isToBottom: true
              })
            }
          }else {
            //数据列表为空 resolve.data.pages = 0 同commentArr长度为0,同total等于0
            this.setData({
              noDataText: '还没有人拼团报名哦~'
            })
          }
        } else {
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
          app.warnNotice('获取旅行团失败')
        }
      })
  },
  toAgainLoad: function () {
    this.setData({
      index: 1,
      isLoadErr: false,
      currentGroup: []
    })
    this.getShowGroup()
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
    this.setData({
      index: 1,
      currentGroup: []
    })
    this.getShowGroup()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getShowGroup()
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})