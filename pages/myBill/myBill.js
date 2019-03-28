// pages/myBill/myBill.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navArr: [
      {
        name: '进账',
        type: 'in',
        isShow: true,
      },
      {
        name: '提现',
        type: 'out',
        isShow: false,
      }
    ],
    isLoadErr: false,
    defaultType: 'in',
    inIndex: 1,
    outIndex: 1,
    size: 10,

    inDataArr: [],
    isInToBottom: false,  
    outDataArr: [],
    isOutToBottom: false,

    inFirstLoading: true, //初次加载
    outFirstLoading: true, //初次加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    this.inMoneyLoad()
  },
  cutNav: function(e) {
    let index = e.currentTarget.dataset.index
    this.data.navArr.map((v, i) => {
      let item = `navArr[${i}].isShow`
      if(index == i) {
        this.setData({
          [item]: true,
          defaultType: v.type
        })
        if(v.type == 'in') {
          if (this.data.inFirstLoading) {
            //加载进账列表
            wx.showLoading({
              title: '数据加载中...',
              mask: true
            })
            this.inMoneyLoad()
          }
        }
        if(v.type == 'out') {
          if (this.data.outFirstLoading) {
            wx.showLoading({
              title: '数据加载中...',
              mask: true
            })
            this.outMoneyLoad()
          }
        }
      }else {
        this.setData({
          [item]: false
        })
      }
    })
  },
  inMoneyLoad: function () {
    const $this = this
    api.ajax({
      url: `${config.userInMoneyInfo}/${app.globalData.userInfo.uid}/page?index=${$this.data.inIndex}&size=${$this.data.size}`,
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (resolve.data.pages > 0) {
            if (this.data.inIndex == 1) { wx.stopPullDownRefresh() }
            if (this.data.inIndex <= resolve.data.pages) {
              this.setData({
                inDataArr: this.data.inDataArr.concat(resolve.data.data),
                inIndex: this.data.inIndex + 1
              })
            } else {
              this.setData({
                isInToBottom: true
              })
            }
          } else {
            //数据列表为空 resolve.data.pages = 0 同commentArr长度为0,同total等于0
            this.setData({
              noInDataText: '还没有进账记录哦~'
            })
          }
          wx.hideLoading()
          this.setData({
            inFirstLoading: false
          })
        } else {
          wx.hideLoading()
          if (this.data.inIndex == 1) {
            this.setData({
              isLoadErr: true
            })
          } else {
            app.warnNotice(resolve.data.message)
          }
        }
      })
      .catch((err) => {
        wx.hideLoading()
        if (this.data.inIndex == 1) {
          this.setData({
            isLoadErr: true
          })
        } else {
          app.warnNotice('数据加载失败')
        }
      })
  },
  outMoneyLoad: function () {
    const $this = this
    api.ajax({
      url: `${config.userOutMoneyInfo}/${app.globalData.userInfo.uid}/page?index=${$this.data.outIndex}&size=${$this.data.size}`,
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          if (resolve.data.pages > 0) {
            if (this.data.outIndex == 1) { wx.stopPullDownRefresh() }
            if (this.data.outIndex <= resolve.data.pages) {
              this.setData({
                outDataArr: this.data.outDataArr.concat(resolve.data.data),
                outIndex: this.data.outIndex + 1
              })
            } else {
              this.setData({
                isOutToBottom: true
              })
            }
          } else {
            //数据列表为空 resolve.data.pages = 0 同commentArr长度为0,同total等于0
            this.setData({
              noOutDataText: '还没有提现记录哦~'
            })
          }
          wx.hideLoading()
          this.setData({
            outFirstLoading: false
          })
        } else {
          wx.hideLoading()
          if (this.data.outIndex == 1) {
            this.setData({
              isLoadErr: true
            })
          } else {
            app.warnNotice(resolve.data.message)
          }
        }
      })
      .catch((err) => {
        wx.hideLoading()
        if (this.data.outIndex == 1) {
          this.setData({
            isLoadErr: true
          })
        } else {
          app.warnNotice('数据加载失败')
        }
      })
  },
  toLoadMoreIn: function() { //进账加载更多
    this.inMoneyLoad()
  },
  toLoadMoreOut: function() { //提现加载更多
    this.outMoneyLoad()
  },
  toAgainLoad: function () {
    if (this.data.defaultType == 'in') {
      this.setData({
        inIndex: 1,
        isLoadErr: false,
        inDataArr: []
      })
      this.inMoneyLoad()
    } else if (this.data.defaultType == 'out') {
      this.setData({
        outIndex: 1,
        isLoadErr: false,
        outDataArr: []
      })
      this.outMoneyLoad()
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