// pages/applyInvoice/applyInvoice.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    invoiceType: [
      {
        name: '不需要发票',
        textIntro: '',
        isDefaultShow: true
      },
      {
        name: '电子发票',
        textIntro: '免费',
        isDefaultShow: false
      },
      {
        name: '纸质发票',
        textIntro: '快递￥10',
        isDefaultShow: false
      }
    ],
    changeInvoiceType: 0,//0代表不开，1代表电子，2代表纸质
    btnText: '保存',
    invoiceNotice: '发票由 湖南省同程亲和力旅游国际旅行社有限公司 开具，发票金额不含优惠券支付部分。',
    invoiceTitle: '',
    invoiceCode: '',
    isDefaultAgree: 1,// 状态1主动获取授权，2为拒绝授权状态，3为显示不支持open-type="openSetting"情况
    emailUrl: '', //email地址
    address: null,//配送地址
  },
  cutInvoiceType: function (e) {
    let index = e.currentTarget.dataset.index
    this.data.invoiceType.map((v, i) => {
      let isShow = `invoiceType[${i}].isDefaultShow`
      if(index == i) {
        this.setData({
          [isShow]: true
        })
        if(v.name == '电子发票') {
          this.setData({
            changeInvoiceType: 1,
            btnText: '索取',
            invoiceNotice: '发票由 湖南省同程亲和力旅游国际旅行社有限公司 开具，发票金额不含优惠券支付部分。电子发票将在游玩结束后1个工作日内发送至您的邮箱。'
          })
        }
        if(v.name == '纸质发票') {
          this.setData({
            changeInvoiceType: 2,
            btnText: '索取',
            invoiceNotice: '发票由 湖南省同程亲和力旅游国际旅行社有限公司 开具，发票金额不含优惠券或礼品卡支付部分。纸质发票预计将于游玩结束后3-7个工作日内以快递方式送达。'
          })
        }
        if (v.name == '不需要发票') {
          this.setData({
            changeInvoiceType: 0,
            btnText: '保存',
            invoiceNotice: '发票由 湖南省同程亲和力旅游国际旅行社有限公司 开具，发票金额不含优惠券支付部分。'
          })
        }
      }else {
        this.setData({
          [isShow]: false
        })
      }
    })
  },
  getInvoiceTitle: function(e) {
    this.setData({
      invoiceTitle: e.detail.value
    })
  },
  getInvoiceCode: function(e) {
    this.setData({
      invoiceCode: e.detail.value
    })
  },
  getWxInvoice: function() {
    const $this = this
    wx.authorize({
      scope: 'scope.invoiceTitle',
      success: () => {
        wx.chooseInvoiceTitle({
          success: (res) => {
            $this.setData({
              invoiceTitle: res.title,
              invoiceCode: res.taxNumber
            })
          },
          fail: () => {
            app.warnNotice('获取发票抬头失败,请重新获取')
          }
        })
      },
      fail: () => {
        app.warnNotice('您已拒绝获取发票授权')
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
  jumpToSendAddress: function() {
    wx.navigateTo({
      url: `/pages/usualAddress/usualAddress`,
    })
  },
  getEmailUrl: function (e) {
    this.setData({
      emailUrl: e.detail.value
    })
  },
  bindGetInvoice: function() {
    let emailReg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
        raisedJson = {
          title: this.data.invoiceTitle,
          taxNumber: this.data.invoiceCode
        }
    
    if (this.data.changeInvoiceType == 1) {
      if (api.trim(this.data.invoiceTitle) != '') {
        if (api.trim(this.data.invoiceCode) != '') {
          //索取电子发票
          if (emailReg.test(this.data.emailUrl)) {
            this.applyInvoiceInfo(raisedJson, 0)
          }else {
            app.warnNotice('请输入正确的电子邮箱')
          }
        }else {
          app.warnNotice('请填写纳税人识别号')
        }
      }else  {
        app.warnNotice('请填写发票抬头')
      }
    } else if (this.data.changeInvoiceType == 2) {
      if (api.trim(this.data.invoiceTitle) != '') {
        if (api.trim(this.data.invoiceCode) != '') {
          if (this.data.addressObj) {
            //索取纸质发票
            this.applyInvoiceInfo(raisedJson, 1)
          }else {
            app.warnNotice('请填写配送地址')
          }
        } else {
          app.warnNotice('请填写纳税人识别号')
        }
      } else {
        app.warnNotice('请填写发票抬头')
      }
    }else {

    }
  },
  applyInvoiceInfo: function (raisedJson, type) {
    const $this = this
    api.ajax({
      url: config.getInvoice,
      method: 'POST',
      data: {
        uid: app.globalData.userInfo.uid,
        orderId: $this.data.ordersNo,
        raisedJson: raisedJson,
        email: $this.data.emailUrl,
        address: $this.data.addressObj,
        openId: app.globalData.userInfo.openid,
        body: '香港一日游发票',
        totalFee: 10,
        type:  type
      }
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if(type == 1) {
            wx.requestPayment({
              'timeStamp': resolve.data.data.timeStamp,
              'nonceStr': resolve.data.data.nonceStr,
              'package': resolve.data.data.package,
              'signType': resolve.data.data.signType,
              'paySign': resolve.data.data.paySign,
              success: (res) => {
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  success: () => {
                    wx.showToast({
                      title: '发票索取成功',
                      icon: 'success',
                      success: () => {
                        setTimeout(() => {
                          wx.navigateBack({
                            data: 1
                          })
                        }, 1500)
                      }
                    })
                  }
                })
              },
              fail: (res) => {
                app.warnNotice('支付失败')
              }
            })
          }else {
            wx.showToast({
              title: '发票索取成功',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  wx.navigateBack({
                    data: 1
                  })
                }, 1500)
              }
            })
          }
        }else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('索取发票失败')
      })
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
    this.setData({
      ordersNo: options.ordersno
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
    const $this = this
    this.setData({
      addressObj: app.globalData.invoiceAddress
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.invoiceTitle']) {
          this.setData({
            isDefaultAgree: 1
          })
        } else if (res.authSetting['scope.invoiceTitle'] !== undefined && !res.authSetting['scope.invoiceTitle']) {
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