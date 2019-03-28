// pages/addTraveler/addTraveler.js
const app = getApp()
const api = require('../../utils/api.js')
const config  = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    travelerList: []
  },
  toJumpWriteInfo: function(e) {
    let type = e.currentTarget.dataset.type
    if(type == 'add') {
      wx.navigateTo({
        url: `/pages/writeTravelerInfo/writeTravelerInfo?type=${type}`,
      })
    }else if(type == 'edit') {
      let index = e.currentTarget.dataset.index
      wx.navigateTo({
        url: `/pages/writeTravelerInfo/writeTravelerInfo?type=${type}`,
      })
      app.globalData.travelerInfo = this.data.travelerList[index]
    }
  },
  touchStart: function(e) {
    let touch = e.touches[0]
    this.animatMethod02()
    this.setData({
      startPos: touch.pageX,
      itemIndex: e.currentTarget.dataset.index
    })
  },
  touchMove: function(e) {
    let touch = e.touches[0],
      movePos = touch.pageX

    if (this.data.startPos - movePos > 20) {
      this.animatMethod01()
    }else {
      this.animatMethod02()
    }
  },
  animatMethod01: function() {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })

    let pageW = (wx.getSystemInfoSync().windowWidth / 750) * 120
    animation.translate(-pageW, 0).step()
    this.setData({
      animationData: animation.export()
    })
  },
  animatMethod02: function () {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    animation.translate(0, 0).step()
    this.setData({
      animationData: animation.export()
    })
  },
  deleteTraveler: function(e) {
    let id = e.currentTarget.dataset.id,
        index = e.currentTarget.dataset.index
    const $this = this

    wx.showModal({
      content: `确认删除出行人${$this.data.travelerList[index].chName}的信息`,
      confirmColor: '#FFDA4C',
      success: (res) => {
        if (res.confirm) {
          api.ajax({
            url: `${config.deleteTraveler}/${id}`,
            method: 'DELETE'
          })
            .then((resolve) => {
              if (resolve.statusCode == 200 && resolve.data.code == 0) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  success: () => {
                    let listArr = $this.data.travelerList
                    listArr.splice(index, 1)
                    $this.setData({
                      travelerList: listArr
                    })
                    this.animatMethod02()
                  }
                })
              } else {
                app.warnNotice(resolve.data.message)
              }
            })
            .catch((err) => {
              app.warnNotice('删除失败')
            })
        } else {
          $this.animatMethod02()
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    app.globalData.travelerInfo = {}
    this.getTravelerList()
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
            travelerList: arrList
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