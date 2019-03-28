// pages/realName/realName.js
const app = getApp()
const config = require('../../config.js')
const api = require('../../utils/api.js')
const WxMap = require('../../libs/qqmap-wx-jssdk.min.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName: '',
    userTel: '',
    userCode: '',
    userIdCard: '',
    getCodeText: '获取验证码',
    isToGetCode: false, //是否去获取验证码
    // posObj: {
    //   txt: '请定位您的城市',
    //   type: 0
    // },
    // settingBtnStatus: 1, //授权按钮状态
    sIndex: 0,
    sArray: ['请选择渠道商'],
    isHadSelect: false, //渠道商是否被选择
    channelId: null, //渠道商id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getChannel()
  },
  getUserName: function(e) {
    this.setData({
      userName: e.detail.value
    })
  },
  getUserTel: function(e) {
    this.setData({
      userTel: e.detail.value
    })
  },
  getUserCode: function(e) {
    this.setData({
      userCode: e.detail.value
    })
  },
  getUserIdCard: function(e) {
    this.setData({
      userIdCard: e.detail.value
    })
  },
  bindPickerChange: function(e) {
    this.setData({
      sIndex: e.detail.value
    })
    if (e.detail.value != '0') {
      let index = e.detail.value - 1
      this.setData({
        channelId: this.data.channelList[index].acId,
        isHadSelect: true
      })
    }else {
      this.setData({
        isHadSelect: false,
        channelId: null
      })
    }
  },
  // getAddress(callBack) {
  //   const $this = this
  //   wx.chooseLocation({
  //     success: (res) => {
  //       let subdata = {
  //         latitude: res.latitude,
  //         longitude: res.longitude
  //       }
  //       typeof callBack == "function" && callBack(subdata)
  //     },
  //     fail: () => {
  //       // that.restartLocation(null, '请重新发起定位', callBack)
  //       if ($this.watchOpenSetting()) {
  //         $this.setData({
  //           settingBtnStatus: 2
  //         })
  //       }else {
  //         $this.setData({
  //           settingBtnStatus: 3
  //         })
  //       }
  //     }
  //   })
  // },
  toOpenSeting() {
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
  getChannel: function() {
    const $this = this
    api.ajax({
      url: config.getChannel,
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let arr = [], sArray = this.data.sArray
          resolve.data.data.map((v, i) => {
            arr.push(v.chancelName)
          })
          sArray.push(...arr)
          this.setData({
            channelList: resolve.data.data,
            // channelId: resolve.data.data[0].acId,
            sArray: sArray,
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('渠道商获取失败，请检查网络')
      })
  },
  toPostionCity: function() { //获取定位，目前不用
    this.getAddress((subdata) => {
      let userPosition = new WxMap({
        key: config.mapKey
      })
      userPosition.reverseGeocoder({
        location: {
          latitude: subdata.latitude,
          longitude: subdata.longitude
        },
        success: (res) => {
          if (res.status == 0) {
            this.setData({
              posObj: {
                txt: `${res.result.address_component.province} ${res.result.address_component.city} ${res.result.address_component.district}`,
                type: 1
              }
            })
          } else {
            app.warnNotice(res.message)
          }
        },
        fail: (err) => {
          app.warnNotice('获取城市定位信息失败')
        }
      })
    })
  },
  bindToGetCode() {
    if (!this.data.isToGetCode) {
      let phoneReg = /^\s*1[345678]\d{9}$/
      if (phoneReg.test(this.data.userTel)) {
        this.getCode()
      } else {
        app.warnNotice('请输入正确的手机号码')
      }
    }else {
      app.warnNotice('您操作过于频繁，请稍后再试')
    }
  },
  getCode() {
    const $this = this
    api.ajax({
      url: config.getCode,
      method: 'POST',
      data: {
        uid: app.globalData.userInfo.uid,
        tel: $this.data.userTel,
      }
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.showToast({
            title: '短信发送成功',
            icon: 'success'
          })
          api.countDown((txt, status) => {
            $this.setData({
              getCodeText: txt,
              isToGetCode: status
            })
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        app.warnNotice('获取短信失败，请检查网络')
      })
  },
  toApplyInfo: function() {
    let phoneReg = /^\s*1[345678]\d{9}$/,
        codeReg = /^\d{4}$/,
        cardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/

    if (this.data.userName != '') {
      if (phoneReg.test(this.data.userTel)) {
        if (codeReg.test(this.data.userCode)) {
          if (cardReg.test(this.data.userIdCard)) {
            if (this.data.channelId !== null) {
              this.realNameApi()
            }else {
              app.warnNotice('请选择您的渠道商')
            }
          }else {
            app.warnNotice('请输入正确的身份证号')
          }
        }else {
          app.warnNotice('请输入正确的验证码')
        }
      }else {
        app.warnNotice('请输入正确的手机号码')
      }
    }else {
      app.warnNotice('真实姓名不能为空！')
    }
  },
  realNameApi() {
    const $this = this
    wx.showLoading({
      title: '信息提交中...',
      mask: true
    })
    api.ajax({
      url: config.userRealName,
      method: 'POST',
      data: {
        uid: app.globalData.userInfo.uid,
        realName: $this.data.userName,
        idNum: $this.data.userIdCard,
        tel: $this.data.userTel,
        code: $this.data.userCode,
        acId: $this.data.channelId
      }
    })
      .then(resolve => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '信息提交成功',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  app.globalData.userInfo.realName = $this.data.userName
                  app.globalData.userInfo.tel = $this.data.userTel
                  app.globalData.userInfo.idNum = $this.data.userIdCard
                  // app.globalData.userInfo.areaName = $this.data.posObj.txt

                  wx.navigateBack({
                    data: 1
                  })
                }, 1500)
              }
            })
          }, 1000)
        } else {
          wx.hideLoading()
          app.warnNotice(resolve.data.message)
        }
      })
      .catch(err => {
        wx.hideLoading()
        app.warnNotice('认证信息提交失败，请检查网络')
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
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userLocation']) {
    //       this.setData({
    //         settingBtnStatus: 1
    //       })
    //     } else if (res.authSetting['scope.userLocation'] !== undefined && !res.authSetting['scope.userLocation']) {
    //       if (api.watchOpenSetting()) {
    //         this.setData({
    //           settingBtnStatus: 2
    //         })
    //       } else {
    //         this.setData({
    //           settingBtnStatus: 3
    //         })
    //       }
    //     }
    //   }
    // })
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