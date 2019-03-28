// pages/buyProduct/buyProduct.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    adultNum: 0,
    childrenNum: 0,
    childNum: 0,
    adultPrice: 0,
    childrenPrice: 0,
    childPrice: 0,
    isShowJoinBox: false,
    isShowSelectShade: false,
    buyNumPosition: 'absolute',
    selectDay: null,
    isShowFeeBox: false,
    priceTotal: 0,
    currentGroup: [], //当天旅行团列表
    groupTotal: 0, //当前旅行团数目
    isLoadErr: false,//数据是否加载错误
    defaultShowDateSelect: true ,// 默认显示日期选择,
    batchId: '', //批次id，默认为空  该功能目前已取消
  },

  toMinusNum: function(e) { //减少数量

    let type = e.currentTarget.dataset.type
    if (this.data.selectDay) {
      if (this.data.selectDay.surplusNum !== null && this.data.selectDay.surplusNum == 0) {
        app.warnNotice('今天已经卖光了')
        return
      }

      if (type == '0') {
        if (this.data.adultNum > 0) {
          this.setData({
            priceTotal: api.pointProblem(this.data.priceTotal, this.data.adultPrice, 'sub'),
            adultNum: this.data.adultNum - 1,
          })
        }
      } else if (type == '1') {
        if (this.data.childrenNum > 0) {
          this.setData({
            priceTotal: api.pointProblem(this.data.priceTotal, this.data.childrenPrice, 'sub'),
            childrenNum: this.data.childrenNum - 1
          })
        }
      } else if (type == '2') {
        if (this.data.childNum > 0) {
          this.setData({
            priceTotal: api.pointProblem(this.data.priceTotal, this.data.childPrice, 'sub'),
            childNum: this.data.childNum - 1
          })
        }
      }
    }else {
      app.warnNotice('请先选择日期')
    }
  },
  toAddNum: function(e) { //增加数量
    let type = e.currentTarget.dataset.type
    if (this.data.selectDay) {
      if (this.data.selectDay.surplusNum !== null && this.data.selectDay.surplusNum == 0) {
        app.warnNotice('今天已经卖光了')
        return
      }

      if (type == '0') {
        this.setData({
          adultNum: this.data.adultNum + 1,
          priceTotal: api.pointProblem(this.data.priceTotal, this.data.adultPrice, 'add')
        })
      } else if (type == '1') {
        this.setData({
          childrenNum: this.data.childrenNum + 1,
          priceTotal: api.pointProblem(this.data.priceTotal, this.data.childrenPrice, 'add')
        })
      } else if (type == '2') {
        this.setData({
          childNum: this.data.childNum + 1,
          priceTotal: api.pointProblem(this.data.priceTotal, this.data.childPrice, 'add')
        })
      }
    }else {
      app.warnNotice('请先选择日期')
    }
  },
  toJumpGroupList: function() { //查看参团列表
    const $this = this
    wx.navigateTo({
      url: `/pages/groupList/groupList?date=${$this.data.selectDay.date}&id=${$this.data.rtId}`,
    })
  },
  toJoinGroup: function(e) { //加入团
    let index = e.currentTarget.dataset.index
    this.setData({
      isShowJoinBox: true,
      itemGroupInfo: this.data.currentGroup[index],
    })
  },
  closeJoinBox: function(e) { //关闭
    let sign = e.target.dataset.sign
    if(sign) {
      this.setData({
        isShowJoinBox: false
      })
    }
  },
  bindJoinGroup: function(e) { //确认加入
    let id = e.currentTarget.dataset.id,
      lack = e.currentTarget.dataset.lack
    this.setData({
      buyNumPosition: "fixed",
      isShowSelectShade: true,
      isShowJoinBox: false,
      batchId: id,
      lackNum: lack
    })
  },
  getSelectDay: function(e) { //日期选择
    this.setData({
      selectDay: e.detail,
    })
    if (e.detail) {
      this.setData({
        adultPrice: e.detail.adultPrice,
        childrenPrice: e.detail.childPrice,
        childPrice: e.detail.babyPrice,
        priceTotal: e.detail.adultPrice * this.data.adultNum + e.detail.childPrice * this.data.childrenNum + e.detail.babyPrice * this.data.childNum,
      })
      // this.getShowTowGroup(e.detail.date)
    }else {
      this.setData({
        priceTotal: 0,
        adultNum: 0,
        childrenNum: 0,
        childNum: 0,
        adultPrice: 0,
        childrenPrice: 0,
        childPrice: 0
      })
    }
  },
  getLoadStatus: function(e) {
    let obj = e.detail
    if(obj.type == 1) {
      if(obj.msg != '') {
        this.setData({
          isLoadErr: true,
          defaultShowDateSelect: false //日期表销毁
        })
      }
    }else {
      if(obj.msg != '') {
        app.warnNotice(obj.msg)
      }
    }
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false,
      defaultShowDateSelect: true
    })
  },
  getShowTowGroup: function(date) {
    const $this = this
    api.ajax({
      url: `${config.getGroupList}/${date}?index=1&size=2&rtId=${$this.data.rtId}`
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            currentGroup: resolve.data.data,
            groupTotal: resolve.data.total
          })
        }else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('获取旅行团失败')
      })
  },
  showFeeBox: function() { //查看明细
    if (this.data.selectDay) {
      this.setData({
        isShowFeeBox: true,
        feeObj: this.getCostDetail(0)
      })
    }else {
      app.warnNotice('请先选择日期')
    }
    
  },
  closeFeeBox: function() {
    this.setData({
      isShowFeeBox: false
    })
  },
  jumpToNext: function() { //下一步
    if (this.data.selectDay) {
      if (this.data.adultNum > 0) {
        const $this = this
        if (this.data.selectDay.surplusNum) {
          if (this.data.selectDay.surplusNum - this.data.adultNum - this.data.childrenNum >= 0) {
            app.globalData.ordersObj = this.getCostDetail(1)
            wx.navigateTo({
              url: `/pages/writeOrders/writeOrders`,
            })
          } else {
            app.warnNotice('您选择的人数已超过剩余上限')
          }
        }else {
          app.globalData.ordersObj = this.getCostDetail(1)
          wx.navigateTo({
            url: `/pages/writeOrders/writeOrders`,
          })
        }
      }else {
        app.warnNotice('请至少选择一名成人')
      }
    }else {
      app.warnNotice('您还没有选择日期')
    }
  },
  getCostDetail: function(type) {
    let ordersObj = { //最终订单详情，将带到下一个页面
      rtId: this.data.rtId,
      productName: app.globalData.proInfoObj ? app.globalData.proInfoObj.title: '',
      destination: app.globalData.proInfoObj ? app.globalData.proInfoObj.destination : '',
      type: app.globalData.proInfoObj.type,
      adultPrice: this.data.adultPrice,
      adultNum: this.data.adultNum,
      childrenPrice: this.data.childrenPrice,
      childrenNum: this.data.childrenNum,
      childPrice: this.data.childPrice,
      childNum: this.data.childNum,
      priceTotal: this.data.priceTotal,
      realPrice: api.pointProblem(this.data.priceTotal, '', 'sub'), //实际金额
      date: this.data.selectDay.date || '',
      batchId: this.data.batchId,
      merchantDiscounts: '', //商家优惠券
      feeType: type //订单填写页面查看
    }
    return ordersObj
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
      rtId: options.id,
      startTime: app.globalData.proInfoObj.startDate
      // lackNum: app.globalData.proInfoObj ? app.globalData.proInfoObj.openNum : app.globalData.shareOrdersObj.oddApplyNum,
      // maxPeople: app.globalData.proInfoObj ? app.globalData.proInfoObj.openNum : app.globalData.shareOrdersObj.openNum
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
    if (app.globalData.isEnterGroupList) {
      this.setData({
        buyNumPosition: "fixed",
        isShowSelectShade: true,
        batchId: app.globalData.batchId || '',
        lackNum: app.globalData.lackNum || ''
      })
      app.globalData.isEnterGroupList = false
      app.globalData.batchId = ''
      app.globalData.lackNum = null
    }
    // if (app.globalData.shareOrdersObj) {
    //   this.setData({
    //     adultPrice: app.globalData.shareOrdersObj.adultPrice,
    //     childrenPrice: app.globalData.shareOrdersObj.childrenPrice,
    //     childPrice: app.globalData.shareOrdersObj.childPrice,
    //     [`selectDay.date`]: app.globalData.shareOrdersObj.date,
    //     batchId: app.globalData.shareOrdersObj.batchId,
    //     goodsName: app.globalData.shareOrdersObj.productName,
    //     destination: app.globalData.shareOrdersObj.destination,
    //     // lackNum: app.globalData.shareOrdersObj.oddApplyNum
    //   })
    //   setTimeout(() => {
    //     app.globalData.shareOrdersObj = null
    //   }, 500) 
    // }
    app.globalData.ordersObj = null
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