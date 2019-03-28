//index.js
//获取应用实例
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    
  },
  onReady: function () {//监听页面初次渲染完成 

  },
  onLoad: function () {//监听页面加载
    api.userLogin(function(){},'index')
  },
  onShow: function () {//监听页面显示
    setTimeout(() => {
      wx.reLaunch({
        // url: `/pages/shareGroup/shareGroup?ordersid=PT2018110810533717974&shareuid=14`
        // url: `/pages/applyInvoice/applyInvoice?ordersno=PT2018101216334222161`
        // url: `/pages/applyInvoice/applyInvoice`
        // url: '/pages/realName/realName'
        url: '/pages/home/home'
      })
    }, 2500)
  }
})
