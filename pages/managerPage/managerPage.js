// pages/managerPage/managerPage.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeArr: [
      {
        text: '出行人',
        isShow: true
      }
      // {
      //   text: '地址',
      //   isShow: false
      // },
    ],
    travelerList: [],
    region: ['请选择配送地区', '', ''],
    isSelectRegion: false,
    userName: '',
    userPhone: '',
    detailAddress: '',
    isDefaultType: 1,
    isDefaultAgree: 1,// 状态1主动获取授权，2为拒绝授权状态，3为显示不支持open-type="openSetting"情况
    isLoadErr: false,
    isScroll: true
  },
  cutManager: function(e) {
    let index = e.currentTarget.dataset.index
    this.data.typeArr.map((v, i) => {
      let show = `typeArr[${i}].isShow`
      if(index == i) {
        this.setData({
          [show]: true
        })
        this.animatMethod02() //删除复位
        if(v.text == '出行人') {
          this.setData({
            isDefaultType: 1
          })
        }else if(v.text == '地址') {
          this.setData({
            isDefaultType: 2
          })
        }
      }else {
        this.setData({
          [show]: false
        })
      }
    })
  },
  toJumpWriteInfo: function (e) {
    let type = e.currentTarget.dataset.type
    if (type == 'add') {
      wx.navigateTo({
        url: `/pages/writeTravelerInfo/writeTravelerInfo?type=${type}`,
      })
    } else if (type == 'edit') {
      let index = e.currentTarget.dataset.index
      wx.navigateTo({
        url: `/pages/writeTravelerInfo/writeTravelerInfo?type=${type}&`,
      })
      app.globalData.travelerInfo = this.data.travelerList[index]
    }
  },
  touchStart: function (e) {
    let touch = e.touches[0]
    this.animatMethod02()
    this.setData({
      startPos: touch.pageX,
      itemIndex: e.currentTarget.dataset.index
    })
  },
  touchMove: function (e) {
    let touch = e.touches[0],
      movePos = touch.pageX

    if (this.data.startPos - movePos > 20) {
      this.animatMethod01()
    } else {
      this.animatMethod02()
    }
  },
  animatMethod01: function () {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })

    let pageW = (wx.getSystemInfoSync().windowWidth / 750) * 120 //位移
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
  deleteTraveler: function (e) {
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

  getWxAddress: function () {
    const $this = this
    wx.authorize({
      scope: 'scope.address',
      success: () => {
        wx.chooseAddress({
          success: (res) => {
            $this.setData({
              userName: res.userName,
              userPhone: res.telNumber,
              region: [res.provinceName, res.cityName, res.countyName],
              detailAddress: res.detailInfo,
              isSelectRegion: true
            })
          },
          fail: () => {
            app.warnNotice('获取微信地址失败,请重新获取')
          }
        })
      },
      fail: () => {
        app.warnNotice('您已拒绝获取微信地址授权')
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
  bindRegionChange: function (e) {
    this.setData({
      isSelectRegion: true,
      region: e.detail.value
    })
  },
  sendUserName: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  sendUserPhone: function (e) {
    this.setData({
      userPhone: e.detail.value
    })
  },
  sendDetailAddress: function (e) {
    this.setData({
      detailAddress: e.detail.value
    })
  },
  toCompeleAddress: function () {
    let phoneReg = /^\s*1[345678]\d{9}$/
    if (app.trim(this.data.userName) != '') {
      if (phoneReg.test(this.data.userPhone)) {
        if (this.data.isSelectRegion) {
          if (app.trim(this.data.detailAddress) != '') {
            // 前端验证通过
            app.globalData.invoiceAddress = {
              userName: this.data.userName,
              userPhone: this.data.userPhone,
              address: `${this.data.region.join('')}${this.data.detailAddress}`
            }
            wx.navigateBack({
              data: 1
            })
          } else {
            app.warnNotice('请填写详细地址')
          }
        } else {
          app.warnNotice('请选择所在地区')
        }
      } else {
        app.warnNotice('请填写正确的联系电话')
      }
    } else {
      app.warnNotice('收件人不能为空')
    }
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
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.address']) {
          this.setData({
            isDefaultAgree: 1
          })
        } else if (res.authSetting['scope.address'] !== undefined && !res.authSetting['scope.address']) {
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
          this.setData({
            isLoadErr: true
          })
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        this.setData({
          isLoadErr: true
        })
        app.warnNotice('获取出行人失败')
      })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false
    })
    this.getTravelerList()
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
  //   return {
  //     path: '/pages/home/home',
  //     imageUrl: '../../images/share-cover.png'
  //   }
  // }
})