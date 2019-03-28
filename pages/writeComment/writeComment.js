// pages/writeComment/writeComment.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lightStar: '../../images/commet_level.png',
    darkStar: '../../images/noToCommentStar.png',
    dataImg: [],
    startLevel: -1,
    commentText: '', //评论文本
    score: null, //产品评分
  },
  selectStarLevel: function(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      startLevel: index,
      score: index + 1
    })
  },
  bindGetWriteText: function(e) {
    this.setData({
      commentText: e.detail.value
    })
  },
  selectPhoto: function() {
    if (this.data.dataImg.length <= 9) {
      if (this.data.dataImg.length == 9) {
        app.warnNotice('上传图片已达上限')
        return
      }
      const $this = this
      let imgArr = this.data.dataImg
      wx.chooseImage({
        count: 9,
        success: (res) => {
          var paths = res.tempFilePaths
          for (let i = 0; i < paths.length; i++) {
            wx.uploadFile({
              url: config.uploadImg,
              filePath: paths[i],
              name: 'files',
              success: (res) => {
                let obj = JSON.parse(res.data)
                if (obj.code == 0) {
                  imgArr.push(obj.data[0])
                  $this.setData({
                    dataImg: imgArr
                  })
                  if ($this.data.dataImg.length > 9) {
                    $this.setData({
                      dataImg: $this.data.dataImg.slice(0, 9)
                    })
                    app.warnNotice('最多显示9张图片')
                  }
                }else {
                  app.warnNotice(obj.message)
                }
              },
              fail: () => {
                app.warnNotice('图片上传失败')
              }
            })
          }
        }
      })
    }else {
      app.warnNotice('图片不能超过九张')
    }
  },
  previewImg: function (e) {//预览图片
    let index = e.currentTarget.dataset.index
    let currentUrl = this.data.dataImg[index]
    const $this = this

    wx.previewImage({
      current: currentUrl,
      urls: $this.data.dataImg
    })
  },
  deleteImg: function(e) {
    let imgArr = this.data.dataImg,
        index = e.currentTarget.dataset.index

    imgArr.splice(index, 1)
    this.setData({
      dataImg: imgArr
    })
  },
  submitComment: function() {
    if(this.data.score !== null) {
      if (api.trim(this.data.commentText) != '') {
        this.toSubmint()
      }else {
        app.warnNotice('评论内容不能为空哦~')
      }
    }else {
      app.warnNotice('您还没给我们的产品打分哦~')
    }
  },
  toSubmint: function() {
    const $this = this

    api.ajax({
      url: config.submitComment,
      method: 'POST',
      data: {
        uid: app.globalData.userInfo.uid,
        rtId: $this.data.rtId,
        content: $this.data.commentText,
        pictures: $this.data.dataImg.join(','),
        score: $this.data.score,
        orderId: $this.data.orderId
      }
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                app.globalData.isFromCommentPage = true
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
        app.warnNotice('评论失败')
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      rtId: app.globalData.odersDetail.rtId,
      orderId: app.globalData.odersDetail.orderId,
      ordersObj: app.globalData.odersDetail,
      goTime: JSON.parse(app.globalData.odersDetail.batchJson).goTime
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