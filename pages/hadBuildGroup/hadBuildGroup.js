// pages/hadBuildGroup/hadBuildGroup.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  //type == 0已支付 type == 1 已完成 type == 2 未使用已过期 type == 3 已退款
  data: {
    isShowTravelerBox: false,
    isLoadErr: false,
    toCommentTxt: '查看评价',
    isNeedFresh: false, //是否需要刷新二维码
    isCheckSuccess: false, //是否验票通过
    phoneIndex: 0, //手机验票员默认联系下标
    isShowGiftBox: false,
  },
  bindShowTravelerBox: function() {
    this.setData({
      isShowTravelerBox: true
    })
  },
  bindCloseTravelerBox: function() {
    this.setData({
      isShowTravelerBox: false
    })
  },
  // bindLookFeeDetail: function() {
  //   this.setData({
  //     isShowFeeBox: true
  //   })
  // },
  // closeFeeBox: function () {
  //   this.setData({
  //     isShowFeeBox: false
  //   })
  // },
  jumpToProDetail: function() {
    app.globalData.isFromOrdersStage = true
    const $this = this
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${$this.data.ordersObj.rtId}`
    })
  },
  jumpToInvoice: function() {
    const $this = this
    // if(this.data.type == 2) {
    //   wx.navigateTo({
    //     url: `/pages/applyInvoice/applyInvoice?ordersno=${$this.data.ordersObj.platTransNo}`
    //   })
    // }else {
    //   app.warnNotice('只有活动结束后才能够索要发票哦~')
    // }
  },
  bindAgainToBuy: function() {
    const $this = this
    wx.navigateTo({
      url: `/pages/productDetail/productDetail?id=${$this.data.ordersObj.rtId}`
    })
  },
  bindToComment: function() {
    const $this = this
    if (this.data.type == 1 && this.data.ordersObj.isComment == 0) {
      app.globalData.odersDetail = this.data.ordersObj
      wx.navigateTo({
        url: `/pages/writeComment/writeComment`
      })
    }else {
      wx.navigateTo({
        url: `/pages/commentList/commentList?id=${$this.data.ordersObj.rtId}`,
      })
    }
  },
  toPolicyDetail: function () {
    const $this = this
    wx.navigateTo({
      url: `/pages/policyDetail/policyDetail?${$this.data.policyObj.proId}`,
    })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false,
    })
    this.dataLoad()
  },
  showGiftDetail: function (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      isShowGiftBox: true,
      giftDetailBox: this.data.otherGift[index]
    })
  },
  closeGiftDetailBox: function (e) {
    let sign = e.target.dataset.signbox
    if (sign) {
      this.setData({
        isShowGiftBox: false
      })
    }
  },
  // toConTactOfficail: function () {//打电话
  //   wx.makePhoneCall({
  //     phoneNumber: config.officialPhone
  //   })
  // },
  // toCallPhone(e) {
  //   const $this = this
  //   let index = e.currentTarget.dataset.index
  //   if (this.data.ordersObj.tellerTel.length > 0) {
  //     wx.makePhoneCall({
  //       phoneNumber: $this.data.ordersObj.tellerTel[index].tel
  //     })
  //   }
  // },
  handleContact(e) {
    // console.log(e.path)
    // console.log(e.query)
  },
  toCancelOrders: function() {// 取消订单
    if (this.data.ordersObj.allowRefund == 1) {
      this.refundRate()
    }else {
      app.warnNotice('该产品不支持取消订单')
    }
  },
  refundRate: function () {
    const $this = this
    api.ajax({
      url: `${config.refundRate}?uid=${app.globalData.userInfo.uid}&platTransNo=${$this.data.ordersId}`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let obj = resolve.data.data
          wx.showModal({
            content: `当前退款损失费比率为${obj.rate}%,可退款金额为￥${obj.refund},如购买了附加礼品，将全额退还,是否确认取消订单`,
            confirmColor: '#FFDA4C',
            success: (res) => {
              if (res.confirm) {
                this.refundApi()
              }
            }
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('获取数据错误')
      })
  },
  refundApi: function () {
    const $this = this
    wx.showLoading({
      title: '退款中...',
      mask: true
    })
    api.ajax({
      url: `${config.refundApi}?uid=${app.globalData.userInfo.uid}&platTransNo=${$this.data.ordersId}`,
      method: 'POST'
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.hideLoading()
          wx.showToast({
            title: '申请退款成功',
            icon: 'success',
            success: () => {
              app.globalData.isFromRefund = true
              setTimeout(() => {
                wx.navigateBack({
                  data: 1
                })
              }, 1500)
            }
          })
        } else {
          wx.hideLoading()
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        wx.hideLoading()
        app.warnNotice('退款失败')
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ordersId: options.ordersid
    })
    this.dataLoad()
    // this.webSocketLink() //建立websoket连接
  },
  dataLoad: function () {
    wx.showLoading({
      title: 'loading...',
      mask: true
    })
    const $this = this
    api.ajax({
      url: `${config.ordersDetail}/${app.globalData.userInfo.uid}/${$this.data.ordersId}`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            ordersObj: resolve.data.data,
            policyObj: JSON.parse(resolve.data.data.batchJson).safe? JSON.parse(resolve.data.data.batchJson).safe: null,
            otherGift: JSON.parse(resolve.data.data.batchJson).attachList? JSON.parse(resolve.data.data.batchJson).attachList: [],
            applyList: JSON.parse(resolve.data.data.batchJson).applyJson? JSON.parse(resolve.data.data.batchJson).applyJson: [],
            goTime: JSON.parse(resolve.data.data.batchJson).goTime? JSON.parse(resolve.data.data.batchJson).goTime: ''
          })

          if(this.data.ordersObj.tellerTel.length > 0) {
            let telArr = []
            this.data.ordersObj.tellerTel.map((v, i) => {
              telArr.push([v.realName,v.tel])
            })
            this.setData({
              phoneArray: telArr
            })
          }
          if (this.data.ordersObj.isRefund == 1) { //已退款
            this.setData({
              type: 3
            })
          } else {
            if (this.data.ordersObj.actionStatus == 0) { //未使用
              this.setData({
                type: 0
              })
              this.getQrCode()
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
          if(this.data.type == 1) {
            if (resolve.data.data.isComment == 1) {
              this.setData({
                toCommentTxt: '查看评价'
              })
            } else {
              this.setData({
                toCommentTxt: '评价产品'
              })
            }
          }
          wx.hideLoading()
        } else {
          wx.hideLoading()
          this.setData({
            isLoadErr: true
          })
        }
      })
      .catch(err => {
        wx.hideLoading()
        this.setData({
          isLoadErr: true
        })
      })
  },
  bindPickerChange: function(e) { //选择电话联系人
    const $this = this
    wx.makePhoneCall({
      phoneNumber: $this.data.phoneArray[e.detail.value][1]
    })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false
    })
    this.dataLoad()
  },

  refreshCode: function () {
    this.getQrCode()
  },

  getQrCode() {
    const $this = this
    wx.request({
      url: `${config.getQrCOde}/${app.globalData.userInfo.uid}/getQrCode?platTransNo=${$this.data.ordersId}`,
      responseType: 'arraybuffer',  //设置响应类型
      success(res) {
        if (res.statusCode == 200) {
          let codeSrc = wx.arrayBufferToBase64(res.data);  //对数据进行转换操作
          $this.setData({
            codeSrc
          })
          $this.webSocketLink() //调动websocket
        }else {
          app.warnNotice(res.data.message)
         $this.setData({
            isNeedFresh: true,
            codeNoticeTxt: '获取验票码失败',
          })
        }
      },
      fail(e) {
        app.warnNotice('获取验票码失败')
        $this.setData({
          isNeedFresh: true,
          codeNoticeTxt: '获取验票码失败',
        })
      }
    })
  },

  webSocketLink() {
    //建立连接
    const $this = this
    wx.connectSocket({
      url: `${config.tickecWsApi}/${$this.data.ordersId}`,
    })
    //连接成功
    wx.onSocketOpen(function () {
      // wx.sendSocketMessage({
        // data: 'stock',
      // }) 
      // setTimeout(() => {
      //   wx.closeSocket()
        $this.setData({
          isCreateLink: true
        })
      // }, 59*60)
    })

    //接受数据
    wx.onSocketMessage((data) => {
      if (data.data == 'ok') { //验票成功
        this.setData({
          isCheckSuccess: true,
          isNeedFresh: false
        })
        app.globalData.toCheckSuccess = true //验票成功
        wx.closeSocket() //关闭websokect
      }
    })

    //连接失败
    wx.onSocketError(() => {
      app.warnNotice('连接失败')
      this.setData({
        isNeedFresh: true,
        codeNoticeTxt: '验票码wss连接失败',
      })
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
    app.globalData.isFromOrdersStage = false
    app.globalData.isBackFromOrders = true
    app.globalData.odersDetail = null //清空订单详情
    if (app.globalData.isFromCommentPage) {
      this.setData({
        toCommentTxt: '查看评价',
        [`ordersObj.isComment`]: 1
      })
      app.globalData.isFromCommentPage = false
    }
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
    if (this.data.isCreateLink) {
      wx.closeSocket() //页面卸载关闭websokect
    }
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