// pages/myWallet/myWallet.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inpVal: '',
    canLimit: 0, //默认值0
    disTips: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  toJumpBill() {
    wx.navigateTo({
      url: '/pages/myBill/myBill'
    })
  },
  toGetAllDeposit() {
    this.setData({
      inpVal: this.data.canLimit
    })
  },
  getInpValue(e) {
    this.setData({
      inpVal: e.detail.value
    })
  },
  lookMoney() {
    const $this = this
    api.ajax({
      url: `${config.lookMoney}/${app.globalData.userInfo.uid}/info`
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            canLimit: resolve.data.data.walletMoney,
            disTips: resolve.data.data.disTips
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('无法查询可提现金额，请检查网络')
      })
  },
  bindToAccount() {
    if (this.data.inpVal <= this.data.canLimit) {
      if (this.data.inpVal >= 1) {
        //提现接口
        this.toGetMoney()
      } else {
        app.warnNotice('可提现金额不得低于1元')
      }
    }else {
      app.warnNotice('可提现金额不得高于收入金额')
    }
  },
  toGetMoney() {
    wx.showLoading({
      title: '提现申请中...',
      mask: true
    })
    const $this = this
    api.ajax({
      url: `${config.getMoney}/user/apply`,
      method: 'POST',
      data: {
        uid: app.globalData.userInfo.uid,
        money: $this.data.inpVal,
      }
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.hideLoading()
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            mask: true,
            success: () => {
              setTimeout(() => {
                wx.navigateTo({
                  url: `/pages/moneyApplySuc/moneyApplySuc?applysum=${$this.data.inpVal}`,
                })
              }, 1500)
            }
          })
        } else if (resolve.data.code == 20001){
          wx.hideLoading()
          app.warnNotice('功能正在维护中...')
          this.setData({
            inpVal: ''
          })
        }else {
          wx.hideLoading()
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        wx.hideLoading()
        app.warnNotice('提现失败，请检查网络')
        this.setData({
          inpVal: ''
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
    this.setData({
      wxName: app.globalData.userInfo.nickName,
      inpVal: ''
    })
    this.lookMoney()
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