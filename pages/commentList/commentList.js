// pages/commentList/commentList.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentArr: [],
    index: 1,
    size: 10,
    isToBottom: false,
    isLoadErr: false,
    commentTotal: 0, //评论数目默认为0
  },
  previewImg: function (e) {
    let index = e.currentTarget.dataset.index,
      imgInd = e.currentTarget.dataset.imgind,
      imgArr = this.data.commentArr[index].pictures.split(',')
    wx.previewImage({
      current: imgArr[imgInd],
      urls: imgArr
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.dataLoad()
  },
  dataLoad: function() {
    const $this = this
    api.ajax({
      url: `${config.commentList}?rtId=${$this.data.id}&index=${$this.data.index}&size=${$this.data.size}`,
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (resolve.data.pages > 0) { 
            if (this.data.index == 1) { wx.stopPullDownRefresh() }
            if (this.data.index <= resolve.data.pages) {
              this.setData({
                commentArr: this.data.commentArr.concat(resolve.data.data),
                index: this.data.index + 1,
                commentTotal: resolve.data.total
              })
            }else {
              this.setData({
                isToBottom: true
              })
            }
            wx.setNavigationBarTitle({ title: `点评(${resolve.data.total})` })
          }else {
            //数据列表为空 resolve.data.pages = 0 同commentArr长度为0,同total等于0
            this.setData({
              noDataText: '还没有评论哦~'
            })
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
      .catch((err) => {
        if(this.data.index == 1) {
          this.setData({
            isLoadErr: true
          })
        }else {
          app.warnNotice('数据加载失败')
        }
      })
  },
  toAgainLoad: function() {
    this.setData({
      index: 1,
      isLoadErr: false,
      commentArr: []
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
      commentArr: []
    })
    this.dataLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.dataLoad()
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})