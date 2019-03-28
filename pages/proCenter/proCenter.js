// pages/proCenter/proCenter.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoadErr: false,
    productArr: [],
    index: 1,
    size: 10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // if (options.uid) {
    //   app.globalData.shareUid = options.uid
    // }
    if (app.globalData.userInfo && app.globalData.shareUid) {
      api.toBindUser()
    }
    this.dataLoad()
  },
  dataLoad: function () {
    const $this = this
    api.ajax({
      url: `${config.proShare}?index=${$this.data.index}&size=${$this.data.size}`
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (this.data.index <= resolve.data.pages) {
            this.setData({
              productArr: this.data.productArr.concat(resolve.data.data),
              index: this.data.index + 1
            })
          }else {
            
          }
        } else {
          this.setData({
            isLoadErr: true
          })
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        this.setData({
          isLoadErr: true
        })
        app.warnNotice('数据加载失败')
      })
  },
  toGetPoster: function(e) {
    let index = e.currentTarget.dataset.index
    wx.showLoading({
      title: '海报生成中...',
      mask: true
    })
    setTimeout(() => {
      this.getPoster(index)
    }, 300)
  },
  getPoster: function (index) {
    const $this = this
    api.ajax({
      url: `${config.getPoster}/${$this.data.productArr[index].rtId}/createPoster?uid=${app.globalData.userInfo.uid}`,
      method: 'POST',
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let times = new Date().getTime()
          let imgs = `${resolve.data.data}?${times}`
          wx.previewImage({
            current: 0,
            urls: [imgs]
          })
          wx.hideLoading()
        } else {
          wx.hideLoading()
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        wx.hideLoading()
        app.warnNotice('海报生成失败')
      })
  },
  toJumpProDetail: function(e) {
    const $this = this
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${$this.data.productArr[index].rtId}&pronum=${index + 1}`,
    })
  },
  toSharePro(e) {
    //还需先判定是否已经实名认证通过
    this.setData({
      goodsIndex: e.currentTarget.dataset.index
    })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false,
      productArr: [],
      index: 1
    })
    this.dataLoad()
  },
  bindToHome: function () {
    wx.reLaunch({
      url: `/pages/home/home`
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
      isShowHomeBtn: app.globalData.isSharePage
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
    this.dataLoad()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (app.globalData.userInfo && app.globalData.userInfo.isAuth == 1) {
      return {
        path: `/pages/proCenter/proCenter?uid=${app.globalData.userInfo.uid}`,
        title: config.defaultTitle,
        imageUrl: config.defaultUrl
      }
    }else {
      return {
        title: config.defaultTitle,
        imageUrl: config.defaultUrl
      }
    }
  }
})