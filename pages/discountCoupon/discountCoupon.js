// pages/discountCoupon/discountCoupon.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponArr: [],
    index: 1,
    size: 10,
    isToBottom: false, //show没有更多
    isLoadErr: false, //页面错误显示
    noDataText: '没有可以使用的优惠券哦~',
    isShowNoUse: false, //默认不显示
  },
  bindCoupon: function(e) {
    let index = e.currentTarget.dataset.index
    if (this.data.couponArr[index].isUse == 0) {
      if (this.data.couponArr[index].type == 0) {//0是减免券，1是礼品券
        if (this.data.fromtype == 'orders') {
          app.globalData.couponObj = {
            isUse: true,
            id: this.data.couponArr[index].couponId,
            des: this.data.couponArr[index].name,
            price: this.data.couponArr[index].price
          }
          wx.navigateBack({
            data: 1
          })
        }
      }else {
        wx.navigateTo({
          url: '/pages/giftCode/giftCode',
        })
      }
    }else {
      if (this.data.couponArr[index].isUse == 1) {
        app.warnNotice('已使用过的优惠券~')
      }
      if (this.data.couponArr[index].isUse == 2) {
        app.warnNotice('优惠券已过期~')
      }
    }
  },
  toNoUseCoupon() {
    app.globalData.couponObj = {
      isUse: false
    }
    wx.navigateBack({
      data: 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fromtype: options.fromtype,
    })
    if (options.rtid) {
      this.setData({
        rtId: options.rtid
      })
    }
    this.dataLoad()
  },
  dataLoad: function() {
    const $this = this
    let url = ''
    if (this.data.fromtype == 'orders') {
      url = `${config.getCanUseCoupon}/${app.globalData.userInfo.uid}/usable?rtId=${$this.data.rtId}`
    } else if (this.data.fromtype == 'mine') {
      url = `${config.getCouponList}?index=${$this.data.index}&size=${$this.data.size}&uid=${app.globalData.userInfo.uid}`
    }
    api.ajax({
      url: url
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (this.data.fromtype == 'orders') {
            this.setData({
              couponArr: resolve.data.data
            })
            if (this.data.couponArr.length != 0) {
              this.setData({
                isShowNoUse: true
              })
            }
          } else if (this.data.fromtype == 'mine'){
            if (resolve.data.pages > 0) {
              if (this.data.index == 1) { wx.stopPullDownRefresh() }
              if (this.data.index <= resolve.data.pages) {
                this.setData({
                  couponArr: this.data.couponArr.concat(...resolve.data.data),
                  index: this.data.index + 1
                })
              } else {
                this.setData({
                  isToBottom: true
                })
              }
            } else {
              //数据列表为空 resolve.data.pages = 0 同commentArr长度为0,同total等于0
            }
          }
          
        }else {
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
          app.warnNotice('优惠券列表获取失败')
        }
      })
  },
  toAgainLoad: function () {
    this.setData({
      index: 1,
      isLoadErr: false,
      couponArr: []
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
    // this.setData({
    //   index: 1,
    //   couponArr: []
    // })
    // this.dataLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.fromtype == 'mine') {
      this.dataLoad()
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   return {
  //     path: '/pages/home/home',
  //     imageUrl: '../../images/share-cover.png'
  //   }
  // }
})