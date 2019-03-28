// pages/writeOrders/writeOrders.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAgreeRule: true,
    priceTotal: 0,
    isShowFeeBox: false,
    userRealname: '', //预订人姓名
    cnPhoneNum: '', //大陆手机号
    foreignPhoneNum: '', //境外手机号
    travelerList: [], //出行人列表
    couponText: '查看可用优惠券',
    isAccredit: 1, //默认不显示授权按钮
    isJumpToAddTraverler: false, //进入新增出行人界面

    policyArr: [],
    otherProArr: [],
    befoPolicyPrice: 0, //是否选择保险

    isShowGiftBox: false
  },
  selectUser: function(e) {
    let index = e.currentTarget.dataset.index
    this.data.travelerList.map((v ,i) => {
      if(index == i) {
        let select = `travelerList[${i}].isSelect`
        if(v.isSelect) {
          if (this.data.needUsers > 0) {
            this.setData({
              [select]: false,
              needUsers: this.data.needUsers + 1
            })
          }else {
            this.setData({
              [select]: false,
              needUsers: this.data.needUsers + 1
            })
          }
        }else {
          if (this.data.needUsers > 0) {
            this.setData({
              [select]: true,
              needUsers: this.data.needUsers - 1
            })
          } 
        }

      }
    })
  },
  bindAgreeRule: function() {
    this.setData({
      isAgreeRule: !this.data.isAgreeRule
    })
  },
  showFeeBox: function () {
    this.setData({
      isShowFeeBox: true
    })
  },
  closeFeeBox: function () {
    this.setData({
      isShowFeeBox: false
    })
  },
  toJumpAddTraveler: function() {
    this.setData({
      isJumpToAddTraverler: true
    })
    wx.navigateTo({
      url: `/pages/addTraveler/addTraveler`,
    })
  },
  getUserRealname: function(e) {
    this.setData({
      userRealname: e.detail.value
    })
  },
  bindCNPhone: function(e) {
    this.setData({
      cnPhoneNum: e.detail.value
    })
  },
  bindForeignPhone: function(e) {
    this.setData({
      foreignPhoneNum: e.detail.value
    })
  },
  bindCodeChange: function(e) {
    this.setData({
      codeIndex: e.detail.value,
      codeNum: `+${this.data.foreignCode[e.detail.value].code}`
    })
  },
  jumpToCouponList: function() { //优惠券页面
    const $this = this
    wx.navigateTo({
      url: `/pages/discountCoupon/discountCoupon?fromtype=orders&rtid=${this.data.ordersObj.rtId}`,
    })
  },
  // jumpToInvoice: function() { //发票申请
  //   wx.navigateTo({
  //     url: `/pages/applyInvoice/applyInvoice`,
  //   })
  //['ordersObj.priceTotal']: this.data.ordersObj.priceTotal + v.proPrice,
  //['ordersObj.realPrice']: this.data.ordersObj.realPrice + v.proPrice,
  // },
  toPolicyDetail: function(e) {
    let index = e.currentTarget.dataset.index
    const $this = this
    wx.navigateTo({
      url: `/pages/policyDetail/policyDetail?${$this.data.policyArr[index].proId}`,
    })
  },
  bindSelectInsu: function(e) {
    if (this.data.policyArr.length > 1) {
      this.data.policyArr.map((v, i) => {
        if (!v.isSelect) {
          this.setData({
            ['ordersObj.priceTotal']: api.pointProblem(this.data.ordersObj.priceTotal, this.data.befoPolicyPrice, 'sub'),
            ['ordersObj.realPrice']: api.pointProblem(this.data.ordersObj.realPrice, this.data.befoPolicyPrice, 'sub'),
          })
        }
      })
    }else {
      this.setData({
        ['ordersObj.priceTotal']: api.pointProblem(this.data.ordersObj.priceTotal, this.data.befoPolicyPrice, 'sub'),
        ['ordersObj.realPrice']: api.pointProblem(this.data.ordersObj.realPrice, this.data.befoPolicyPrice, 'sub'),
      })
    }
    

    let index = e.currentTarget.dataset.index
    this.data.policyArr.map((v, i) => {
      let val = `policyArr[${i}].isSelect`
      if(index == i) {
        if(v.isSelect) {
          this.setData({
            [val]: false,
            befoPolicyPrice: 0,
            ['ordersObj.policyObj']: null
          })
        }else {
          this.setData({
            [val]: true,
            befoPolicyPrice: v.proPrice,
            ['ordersObj.priceTotal']: api.pointProblem(this.data.ordersObj.priceTotal, v.proPrice, 'add'),
            ['ordersObj.realPrice']: api.pointProblem(this.data.ordersObj.realPrice, v.proPrice, 'add'),
            ['ordersObj.policyObj']: v
          })
        }
      }else {
        this.setData({
          [val]: false
        })
      }
    })

  },
  toMinusNum: function (e) {
    let index = e.currentTarget.dataset.index
    if (this.data.otherProArr[index].buyNum > 0) {
      let val = `otherProArr[${index}].buyNum`
      this.setData({
        [val]: this.data.otherProArr[index].buyNum - 1,
        ['ordersObj.priceTotal']: api.pointProblem(this.data.ordersObj.priceTotal, this.data.otherProArr[index].proPrice, 'sub'),
        ['ordersObj.realPrice']: api.pointProblem(this.data.ordersObj.realPrice, this.data.otherProArr[index].proPrice, 'sub'),
      })
    }
    this.data.otherProArr.map((v, i) => {
      if(index == i) {
        if(v.buyNum > 0) {
          this.setData({
            [`ordersObj.otherPro[${index}]`]: v
          })
        }else {
          this.setData({
            [`ordersObj.otherPro[${index}]`]: null
          })
        }
      }
    })
  },
  toAddNum: function (e) {
    let index = e.currentTarget.dataset.index,
        val = `otherProArr[${index}].buyNum`
    this.setData({
      [val]: this.data.otherProArr[index].buyNum + 1,
      ['ordersObj.priceTotal']: api.pointProblem(this.data.ordersObj.priceTotal, this.data.otherProArr[index].proPrice, 'add'),
      ['ordersObj.realPrice']: api.pointProblem(this.data.ordersObj.realPrice, this.data.otherProArr[index].proPrice, 'add')
    })

    this.data.otherProArr.map((v, i) => {
      if (index == i) {
        let val = `ordersObj.otherPro${index}`
        this.setData({
          [`ordersObj.otherPro[${index}]`]: v
        })
      }
    })

  },
  jumpToQuitChange: function () { //香港一日游旅行平台协议
    wx.navigateTo({
      url: `/pages/quitChangeRule/quitChangeRule`,
    })
  },
  jumpToSuccurity: function() {//旅游安全须知
    wx.navigateTo({
      url: `/pages/succurityNotice/succurityNotice`,
    })
  },
  jumpToNext: function() {
    let cnPhoneReg = /^\s*1[345678]\d{9}$/,
        foreignPhone = `${this.data.codeNum} ${this.data.foreignPhoneNum}`
    if (api.trim(this.data.userRealname) != '') {
      if (cnPhoneReg.test(this.data.cnPhoneNum) || (this.data.codeNum && api.trim(this.data.foreignPhoneNum) != '')) {
        if (this.data.isAgreeRule) {
          if (this.data.ordersObj.type != 1) {
            if (this.data.needUsers === 0) {
              wx.showLoading({
                title: '正在调用支付...',
                mask: true
              })
              this.toPay()
            } else {
              app.warnNotice('您还有出行人没有选择')
            }
          }else {
            wx.showLoading({
              title: '正在调用支付...',
              mask: true
            })
            this.toPay()
          } 
        } else {
          app.warnNotice('请阅读并同意一日游合同和退改规则')
        }
      } else {
        app.warnNotice('请检查您的大陆手机或境外手机是否填写正确')
      }
    } else {
      app.warnNotice('请填写预订人姓名')
    }
  },
  otherProLoad: function () {
    const $this = this
    api.ajax({
      url: `${config.otherPro}/${$this.data.ordersObj.rtId}`
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let arr1 = resolve.data.data.safeList,
              arr2 = resolve.data.data.attachList
          if(arr1 && arr1.length > 0) {
            arr1.map((v, i) => {
              v.isSelect = false
            })
          }else {
            arr1: []
          }
          if(arr2 && arr2.length > 0) {
            arr2.map((v, i) => {
              v.buyNum = 0
            })
          }else {
            arr2: []
          }
          this.setData({
            policyArr: arr1,
            otherProArr: arr2
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        app.warnNotice('数据加载失败')
      })
  },
  showGiftDetail: function(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      isShowGiftBox: true,
      giftDetailBox: this.data.otherProArr[index]
    })
  },
  closeGiftDetailBox: function(e) {
    let sign = e.target.dataset.signbox
    if(sign) {
      this.setData({
        isShowGiftBox: false
      })
    }
  },
  toPay: function() {
    const $this = this
    let userList = []
    this.data.travelerList.map((v, i) => {
      if (v.isSelect) {
        userList.push(v)
      }
    })
  
    api.userLogin((status) => { //再次做授权登录确认
      if (status == '1') {
        let dataObj = {}
        let arr = [], insuObj = $this.data.ordersObj.policyObj, otherGiftPrice = 0
        if (insuObj) {
          delete insuObj.isSelect
          delete insuObj.proDesc
        }
        if (this.data.ordersObj.otherPro.length > 0) {
          this.data.ordersObj.otherPro.map((v, i) => { 
            if (v) {
              arr.push(v)
              otherGiftPrice += api.pointProblem(v.proPrice, v.buyNum, 'mul')
            }
          })
        }
        if ($this.data.ordersObj.type != 1) {
          dataObj = {
            "uid": app.globalData.userInfo.uid,//用户ID
            "rtId": $this.data.ordersObj.rtId, //商品ID
            "openId": app.globalData.userInfo.openid, //用户openid
            "tel": $this.data.cnPhoneNum,
            "abroadTel": $this.data.foreignPhoneNum ? `${$this.data.codeNum} ${$this.data.foreignPhoneNum}` : '',
            // "routeJson": JSON.stringify({ // 商品JSON
            //   adultPrice: $this.data.ordersObj.adultPrice,
            //   childPrice: $this.data.ordersObj.childrenPrice,
            //   babyPrice: $this.data.ordersObj.childPrice
            // }),
            "realName": $this.data.userRealname, //预订人姓名
            "body": $this.data.ordersObj.productName, //商品名称
            "adultNum": $this.data.ordersObj.adultNum, //成人数
            "childNum": $this.data.ordersObj.childrenNum, //儿童数
            "babyNum": $this.data.ordersObj.childNum, //婴儿数
            "totalFee": $this.data.ordersObj.priceTotal, //总金额
            "payFee": $this.data.ordersObj.realPrice, //实际支付金额
            // "payFee": 0.01,
            "attachFee": otherGiftPrice, //附加产品价格
            "couponId": $this.data.couponId || '', //优惠卷Id
            "couponPrice": $this.data.ordersObj.merchantDiscounts || '',//优惠券价格
            // "isOpen": $this.data.ordersObj.batchId ? 0 : 1, //是否开团 0/加入 1/重新开团
            "batchJson": JSON.stringify({ //批次信息
              // tid: app.globalData.shareUid || '', //分享人的id
              // batchDate: $this.data.ordersObj.date, //开团日期
              // batchId: $this.data.ordersObj.batchId, // 加入团会用到批次ID
              goTime: $this.data.ordersObj.date,
              applyJson: userList, // 用户报名信息
              safe: insuObj,
              attachList: arr
            }),
            "isMeal": 0 //非套餐
          }
        }else {
          dataObj = {
            "uid": app.globalData.userInfo.uid,//用户ID
            "rtId": $this.data.ordersObj.rtId, //商品ID
            "openId": app.globalData.userInfo.openid, //用户openid
            "tel": $this.data.cnPhoneNum,
            "abroadTel": $this.data.foreignPhoneNum ? `${$this.data.codeNum} ${$this.data.foreignPhoneNum}` : '',
            // "routeJson": JSON.stringify({ // 商品JSON
            //   adultPrice: $this.data.ordersObj.adultPrice,
            //   startDate: $this.data.ordersObj.startDate,
            //   endDate: $this.data.ordersObj.endDate
            // }),
            "realName": $this.data.userRealname, //预订人姓名
            "body": $this.data.ordersObj.productName, //商品名称
            "adultNum": $this.data.ordersObj.adultNum, //成人数
            "totalFee": $this.data.ordersObj.priceTotal, //总金额
            "payFee": $this.data.ordersObj.realPrice, //实际支付金额
            // "payFee": 0.01,
            "attachFee": otherGiftPrice, //附加产品价格
            "couponId": $this.data.couponId || '', //优惠卷Id
            "couponPrice": $this.data.ordersObj.merchantDiscounts || '',//优惠券价格
            "batchJson": JSON.stringify({
              safe: insuObj,
              attachList: arr
            }),
            "isMeal": 1 //套餐
          }
        }
        api.ajax({
          url: config.wxPay,
          method: 'POST',
          data: dataObj
        })
          .then((resolve) => {
            if (resolve.statusCode == 200 && resolve.data.code == 0) {
              wx.hideLoading()
              wx.requestPayment({
                'timeStamp': resolve.data.data.timeStamp,
                'nonceStr': resolve.data.data.nonceStr,
                'package': resolve.data.data.package,
                'signType': resolve.data.data.signType,
                'paySign': resolve.data.data.paySign,
                success: (res) => {
                  if (res.errMsg == 'requestPayment:ok') {
                    wx.showToast({
                      title: '支付成功',
                      icon: 'success',
                      success: () => {
                        setTimeout(() => {
                          wx.navigateTo({
                            url: `/pages/hadBuildGroup/hadBuildGroup?type=1&ordersid=${resolve.data.data.orderId}`,
                          })
                        }, 1500)
                      }
                    })
                  }
                },
                fail: (res) => {
                  app.warnNotice('支付失败')
                }
              })
            } else {
              wx.hideLoading()
              app.warnNotice(resolve.data.message)
            }
          })
          .catch((err) => {
            wx.hideLoading()
            app.warnNotice('支付失败')
          })
      } else if(status == '0') {
        wx.hideLoading()
        wx.showModal({
          content: '系统检测到您还未授权，请授权后支付',
          confirmColor: '#FFDA4C',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              if (api.watchOpenSetting()) {
                this.setData({
                  isAccredit: 2
                })
              } else {
                this.setData({
                  isAccredit: 3
                })
              }
            }
          }
        })
      }
    }, 'index')
  },
  toOpenSetting: function () {
    wx.openSetting()
  },
  toConTactOfficail: function () {//打电话
    wx.makePhoneCall({
      phoneNumber: config.officialPhone
    })
  },
  handleContact(e) {
    // console.log(e.path)
    // console.log(e.query)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ordersObj: app.globalData.ordersObj,
      ['ordersObj.policyObj']: null, //增加保险对象
      ['ordersObj.otherPro']: [],// 增加产品对象
    })
    this.otherProLoad() //加载其他产品接口
    if (app.globalData.userInfo) {
      this.getTravelerList() //默认加载出行人列表
    }
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
    app.globalData.isFromRefund = false //当前情况为下单后马上退款，退款成功后app.globalData.isFromRefund为true，这里默认置为false
    if (app.globalData.isBackFromOrders) {
      wx.reLaunch({
        url: `/pages/home/home`
      })
    }

    if (app.globalData.couponObj) {
      if (app.globalData.couponObj.isUse) {
        this.setData({
          couponId: app.globalData.couponObj.id,
          couponText: app.globalData.couponObj.des,
          [`ordersObj.merchantDiscounts`]: app.globalData.couponObj.price,
          [`ordersObj.realPrice`]: api.pointProblem(this.data.ordersObj.priceTotal, app.globalData.couponObj.price, 'sub')
        })
      }else {
        this.setData({
          couponId: '',
          couponText: '查看可用优惠券',
          [`ordersObj.merchantDiscounts`]: '',
          [`ordersObj.realPrice`]: api.pointProblem(this.data.ordersObj.priceTotal, '', 'sub')
        })
      }
      app.globalData.couponObj = null
    }

    if (this.data.isJumpToAddTraverler) {
      this.getTravelerList() //加载出行人列表
    }

    this.setData({
      foreignCode: api.getCodeArr(),
      isAccredit: 1
    })

    if (app.globalData.userInfo.tel != undefined && app.globalData.userInfo.tel != '') {
      this.setData({
        cnPhoneNum: app.globalData.userInfo.tel
      })
    }
    if (app.globalData.userInfo.realName != undefined && app.globalData.userInfo.realName != '') {
      this.setData({
        userRealname: app.globalData.userInfo.realName
      })
    }

  },
  getTravelerList: function () {
    api.ajax({
      url: `${config.getTravelerList}/${app.globalData.userInfo.uid}/persons`,
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let arrList = resolve.data.data
          arrList.map((v, i) => {
            v.isSelect = false
          })
          this.setData({
            travelerList: arrList,
            isJumpToAddTraverler: false,
            needUsers: app.globalData.ordersObj.adultNum + app.globalData.ordersObj.childrenNum
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        app.warnNotice('获取出行人失败')
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