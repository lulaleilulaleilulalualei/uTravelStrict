// pages/writeTravelerInfo/writeTravelerInfo.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sexArray: ['女' , '男'],
    cnName: '',
    surname: '',
    name: '',
    funcTitle: '新增出行人信息',
    idCard: ''
  },
  getCHName: function(e) {
    this.setData({
      cnName: e.detail.value
    })
  },
  getSurname: function(e) {
    this.setData({
      surname: e.detail.value
    })
  },
  getName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  getIdcard: function (e) {
    this.setData({
      idCard: e.detail.value
    })
  },
  bindSexChange: function(e) {
    this.setData({
      sexIndex: e.detail.value
    })
  },
  toCompelete: function() {
    let reg = /^[A-Z][A-z]*$/,
        cardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/ //身份证效验
    if (api.trim(this.data.cnName) != '') {
      if (api.trim(this.data.surname) != '' && reg.test(this.data.surname)) {
        if (api.trim(this.data.name) != '' && reg.test(this.data.name)) {
          if (api.trim(this.data.idCard) != '' && cardReg.test(this.data.idCard)) {
            if (this.data.sexIndex !== undefined) {
              if (this.data.funcType == 'add') {
                this.writeInfo()
              } else if (this.data.funcType == 'edit') {
                this.editInfo()
              }
            } else {
              app.warnNotice('请选择性别~')
            }
          }else {
            if (api.trim(this.data.idCard) == '') {
              app.warnNotice('身份证不能为空哦~')
            }else {
              app.warnNotice('请填写正确的身份证号码~')
            }
          }  
        }else {
          if (api.trim(this.data.name) == '') {
            app.warnNotice('名(拼音)不能为空哦~')
          }else {
            app.warnNotice('名(拼音)格式书写错误哦~')
          }
        }
      }else {
        if (api.trim(this.data.surname) == '') {
          app.warnNotice('姓(拼音)不能为空哦~')
        }else {
          app.warnNotice('姓(拼音)格式书写错误哦~')
        }
      }
    }else {
      app.warnNotice('中文姓名不能为空哦~')
    }
  },
  writeInfo: function() {
    const $this = this
    let dataObj = {
      uid: app.globalData.userInfo.uid,
      chName: $this.data.cnName,
      pyXing: $this.data.surname,
      pyMing: $this.data.name,
      sex: $this.data.sexIndex,
      idNum: $this.data.idCard
    }
    api.ajax({
      url: config.saveTraveler,
      method: 'POST',
      data: dataObj
    }).
      then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.showToast({
            title: '新增成功',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                wx.navigateBack({
                  data: 1
                })
              }, 1500)
            }
          })
        }else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
          app.warnNotice('出行人保存失败')  
      })
  },
  editInfo: function () {
    const $this = this
    let dataObj = {
      chName: $this.data.cnName,
      pyXing: $this.data.surname,
      pyMing: $this.data.name,
      sex: $this.data.sexIndex,
      idNum: $this.data.idCard,
      id: app.globalData.travelerInfo.id
    }
    api.ajax({
      url: config.editTraveler,
      method: 'PUT',
      data: dataObj
    }).
      then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                wx.navigateBack({
                  data: 1
                })
              }, 1500)
            }
          })
        } else {
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
          app.warnNotice('修改出行人失败')

      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      funcType: options.type
    })
    if (options.type == 'edit') {
      wx.setNavigationBarTitle({ title: '修改出行人' })
      this.setData({
        funcTitle: '修改出行人信息',
        cnName: app.globalData.travelerInfo.chName,
        surname: app.globalData.travelerInfo.pyXing,
        name: app.globalData.travelerInfo.pyMing,
        sexIndex: app.globalData.travelerInfo.sex,
        idCard: app.globalData.travelerInfo.idNum
      })
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