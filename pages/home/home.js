// pages/home/home.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoadErr: false,
    couponArr: [],//获取优惠券列表
    commentArr: [], //空的评论列表
    productArr: [],
    isShowJoinMiniTop: false,
    isShowJoinMiniBox: false,
  },

  toShowJoinColloct: function() { //显示加入到我的小程序提示
    this.setData({
      isShowJoinMiniTop: false,
      isShowJoinMiniBox: true
    })
  },
  toCloseMiniBox: function() {
    wx.setStorage({
      key: 'myMini',
      data: '1'
    })
    this.setData({
      isShowJoinMiniBox: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dataLoad()
    // this.couponLoad() // 优惠券获取
    this.miniAppUpdate() // 小程序触发更新
    // if (options.uid) {
    //   app.globalData.shareUid = options.uid
    //   api.userLogin()
    // }
    if (app.globalData.userInfo && app.globalData.shareUid) {
      api.toBindUser()
    }
    if (!app.globalData.userInfo) {
      api.userLogin()
    }
  },
  dataLoad: function() {
    api.ajax({
      url: config.homeUrl
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            productArr: resolve.data.data.routeList,
            commentArr: resolve.data.data.commentList
          })
          setTimeout(() => {
            this.setData({
              couponObj: '1'
            })
          }, 1500)
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
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false
    })
    this.dataLoad()
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
  jumpToDetail: function(e) {
    const $this = this
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${$this.data.productArr[index].rtId}`,
    })
  },
  couponLoad: function () {
    if (app.globalData.userInfo) {
      const $this = this
      api.ajax({
        url: `${config.getCanUseCoupon}/${app.globalData.userInfo.uid}/usable`
      })
        .then((resolve) => {
          if (resolve.statusCode == 200 && resolve.data.code == 0) {
            this.setData({
              couponArr: resolve.data.data
            })
          } else {
            //优惠券获取失败不做提示
            // app.warnNotice(resolve.data.message)
          }
        })
        .catch(err => {
          //优惠券获取失败不做提示
          // app.warnNotice('优惠券获取失败')
        })
    }
  },
  miniAppUpdate: function() {
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '监测到小程序版本有更新，是否重启应用？',
        confirmColor: '#FFDA4C',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      app.warnNotice('新版本更新失败')
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
    app.globalData.isBackFromOrders = false //从订单页返回
    app.globalData.proInfoObj = null //每个产品的信息回到首页清空
    app.globalData.isSharePage = false //回到首页分享按钮隐藏
    app.globalData.isFromShareGroup = false //从分享进入页面返回到首页 
    app.globalData.shareOrdersObj = null
    app.globalData.ordersObj = null
    app.globalData.isFromOrdersStage = false
    // if (app.globalData.isMineSetting) {
    //   this.couponLoad() // 优惠券获取
      app.globalData.isMineSetting = false
    // }

    const $this = this
    wx.getStorageInfo({
      success: function (res) {
        if (res.keys.indexOf('myMini') != -1) {
          $this.setData({
            isShowJoinMiniTop: false,
            isShowJoinMiniBox: false
          })
        } else {
          if ($this.data.isShowJoinMiniBox) {
            $this.setData({
              isShowJoinMiniTop: false
            })
          }else {
            $this.setData({
              isShowJoinMiniTop: true
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
  onShareAppMessage: function () {
    if (app.globalData.userInfo && app.globalData.userInfo.isAuth == 1) {
      return {
        path: `/pages/home/home?uid=${app.globalData.userInfo.uid}`,
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