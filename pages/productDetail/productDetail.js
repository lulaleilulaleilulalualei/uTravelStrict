// pages/productDetail/productDetail.js
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')
// const WxParse = require('../../wxParse/wxParse.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleArr: [
      {
        text: '行程介绍',
        boxId: 'lineIntro',
        boxTop: 0,
        isActive: true
      },
      {
        text: '费用说明',
        boxId: 'costExplain',
        boxTop: 0,
        isActive: false
      },
      {
        text: '使用说明',
        boxId: 'useExplain',
        boxTop: 0,
        isActive: false
      },
      {
        text: '购买须知',
        boxId: 'buyNotice',
        boxTop: 0,
        isActive: false
      }
    ],
    isScroll: true,
    navCutTop: null,
    boxHeight: '100%',
    navPostion: 'absolute',
    activeIndex: 0,
    spotIcon: '../../images/spot_icon.png',
    foodIcon: '../../images/have_dinner.png',
    hotelIcon: '../../images/hotel_icon.png',
    isAccredit: 0,// 状态0为未授权状态，1为授权状态，2为拒绝授权状态, 3为显示不支持open-type="openSetting"情况
    isLoadErr: false,
    isPastDate: false, //是否过期
    adultNum: 1, //套餐购买份数
    priceTotal: 0, //套餐总价格
    isBuyCombo: false, //是否购买套餐
    marketPrice: null, //市场价
    isSHowAccreditBox: false, //是否显示授权页面

    isFloat: false, //导航浮动
    proNumNotice: '',

    carRich: wx.canIUse('rich-text'),

    indicatorDots: true,
    autoplay: false,
    interval: 3000,
    duration: 600,

    isShowJoinMiniTop: false
  },
  // previewImg: function(e) { //图片预览功能
  //   let index = e.currentTarget.dataset.index,
  //     imgInd = e.currentTarget.dataset.imgind,
  //     imgArr = this.data.commentObj.comments[index].pictures.split(',')
  //   wx.previewImage({
  //     current: imgArr[imgInd],
  //     urls: imgArr
  //   })
  // },
  toMakePoster: function() {
    wx.showLoading({
      title: '海报生成中...',
      mask: true
    })
    setTimeout(() => {
      this.getPoster()
    }, 300)
  },
  getPoster: function () {
    const $this = this
    api.ajax({
      url: `${config.getPoster}/${$this.data.id}/createPoster?uid=${app.globalData.userInfo.uid}`,
      method: 'POST',
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          let times = new Date().getTime()
          let imgs = `${resolve.data.data}?${times}`
          wx.previewImage({
            current: 0,
            urls: [imgs]
          })
          wx.hideLoading()
        } else {
          wx.hideLoading()
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        wx.hideLoading()
        app.warnNotice('海报生成失败')
      })
  },
  toShowJoinColloct: function () { //显示加入到我的小程序提示
    this.setData({
      isShowJoinMiniTop: false
    })
  },
  imgToPreview: function (e) { //图片预览功能
    let index = e.currentTarget.dataset.index
    const $this = this
    wx.previewImage({
      current: $this.data.photosImg[index],
      urls: $this.data.photosImg
    })
  },
  detailsPreviewImg: function() {
    const $this = this
    wx.previewImage({
      current: 0,
      urls: [$this.data.proIntro.thumb]
    })
  },
  queryMultipleNodes: function(id,callBack) { //获取到顶部的距离
    var query = wx.createSelectorQuery()//创建节点查询器 query
    query.select(id).boundingClientRect()//这段代码的意思是选择Id=the-id的节点，获取节点位置信息的查询请求
    query.selectViewport().scrollOffset()//这段代码的意思是获取页面滑动位置的查询请求
    query.exec(function (res) {
      typeof callBack == 'function' && callBack(res[0].top)
    })
    // wx.createSelectorQuery().select(id).boundingClientRect(function (rect) {
      // console.log(rect.top)
      // typeof callBack == 'function' && callBack(res[0].top)
    // }).exec();
    // wx.createSelectorQuery().select(id).boundingClientRect(function (rect) {
    //   console.log(rect.top)
    // }).exec()
    // wx.createSelectorQuery().select(id).boundingClientRect().exec(function(res) {
    //   console.log(res[0].top)
    // })
  },
 detailScroll: function(e) { //行程随滚动，动态改变
    let scrollTop = e.detail.scrollTop
    if (!this.data.navCutTop) {
      this.queryMultipleNodes('#productIntro', (top) => {
        this.setData({
          navCutTop: top
        })
      })
    }else {
      if (scrollTop > this.data.navCutTop) {
        if (!this.data.isFloat) {
          this.setData({
            navPostion: 'fixed',
            isFloat: true
          })
        }
      } else {
        if (this.data.isFloat) {
          this.setData({
            navPostion: 'absolute',
            isFloat: false
          })
        }
      }
    }
    let arr = this.data.titleArr
    for(let i = 0; i<arr.length; i++) {
      if(!arr[i].boxTop) {
        let boxTop = `titleArr[${i}].boxTop`
        this.queryMultipleNodes(`#${arr[i].boxId}`, (top) => {
          this.setData({
            [boxTop]: top - (wx.getSystemInfoSync().windowWidth / 750) * 60
          })
        })
      }else {
        if (scrollTop > arr[0].boxTop) {
          if (arr[i + 1]) {
            if (arr[i].boxTop < scrollTop && scrollTop < arr[i + 1].boxTop) {
              api.scrollListen(i, n => {
                  this.data.titleArr.map((v, ind) => {
                    let show = `titleArr[${ind}].isActive`
                    if(ind == n) {
                      this.setData({
                        [show]: true
                      })
                    }else {
                      this.setData({
                        [show]: false
                      })
                    }
                  })
              })
            }
          }else {
            if (scrollTop > arr[i].boxTop) {
              api.scrollListen(i, n => {
                this.data.titleArr.map((v, ind) => {
                  let show = `titleArr[${ind}].isActive`
                  if (ind == n) {
                    this.setData({
                      [show]: true
                    })
                  } else {
                    this.setData({
                      [show]: false
                    })
                  }
                })
              })
            }
          }
        }else {
          let showDefault = `titleArr[0].isActive`
          this.setData({
            [showDefault]: true,
            activeIndex: 0
          })
        }
      }
    }
  },
  toNavCut(e) { //行程查看
    let index = e.currentTarget.dataset.index
    this.data.titleArr.map((v, i) => {
      let show = `titleArr[${i}].isActive`
      if(i == index) {
        this.setData({
          [show]: true
        })
      }else {
        this.setData({
          [show]: false
        })
      }
    })
    this.setData({
      toView: this.data.titleArr[index].boxId
    })
  },
  jumpToCommentList: function() { //跳转到评论列表页面
    const $this = this
    wx.navigateTo({
      url: `/pages/commentList/commentList?id=${$this.data.id}`,
    })
  },
  toBuyProduct: function() { //跳转到购买页面
    const $this = this

    if (this.data.isPastDate) {
      app.warnNotice('产品已过期')
      return
    }

    if (this.data.isAccredit == 1) {
      if (!this.data.isFromOrdersStage) { //来自非订单查看页面
        if (this.data.proObj.type != 1) {
          wx.navigateTo({
            url: `/pages/buyProduct/buyProduct?id=${$this.data.id}`,
          })
        } else {
          this.setData({
            isBuyCombo: true
          })
        }
      }
    }
  },
  getUserInfo: function(e) { //按钮登录授权
    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.showLoading({
        title: '授权登陆中...',
        mask: true
      })
      const $this = this
      api.userLogin((status) => {
        if (status == '1') {
          // if (!this.data.isFromOrdersStage) {
            wx.hideLoading()
            wx.showToast({
              title: '授权登录成功',
              icon: 'success',
              mask: true,
              success: () => {
                this.setData({
                  isAccredit: 1,
                  isSHowAccreditBox: false
                })
                if (app.globalData.userInfo && app.globalData.shareUid) {
                  api.toBindUser()
                }
                // if (!this.data.isFromOrdersStage) {
                //   setTimeout(() => {
                //     if (this.data.proObj.type != 1) {
                //       wx.navigateTo({
                //         url: `/pages/buyProduct/buyProduct?id=${$this.data.id}`,
                //       })
                //     } else {
                      // this.setData({
                      //   isBuyCombo: true
                      // })
                    // }
                  // }, 1500)
                // }
              }
            })
          // }
        }
      })
    }else {
      app.warnNotice('您已拒绝授权，只有授权后才能享受我们的产品哦~')
      if (api.watchOpenSetting()) {
        this.setData({
          isAccredit: 2,
          isSHowAccreditBox: true
        })
      } else {
        this.setData({
          isAccredit: 3,
          isSHowAccreditBox: true
        })
      }
    }
  },
  colseBuyProdutBox: function(e) {
    let sign = e.target.dataset.sign
    if (sign) {
      this.setData({
        isBuyCombo: false
      })
    }
  },
  toConTactOfficail: function() {//打电话
    wx.makePhoneCall({
      phoneNumber: config.officialPhone
    })
  },
  handleContact(e) {
    // console.log(e.path)
    // console.log(e.query)
  },
  toOpenSetting: function() {
    wx.openSetting()

  },

  toMinusNum: function() {
    if (this.data.adultNum > 0) {
      this.setData({
        priceTotal: api.pointProblem(this.data.priceTotal, this.data.proObj.adultPrice, 'sub'),
        adultNum: this.data.adultNum - 1,
      })
    }
  },
  toAddNum: function() {
    this.setData({
      adultNum: this.data.adultNum + 1,
      priceTotal: api.pointProblem(this.data.priceTotal, this.data.proObj.adultPrice, 'add')
    })
  },
  jumpToNext: function() {
    app.globalData.ordersObj = { //最终订单详情，将带到下一个页面
      rtId: this.data.id,
      productName: this.data.proObj.title,
      type: this.data.proObj.type,
      adultPrice: this.data.proObj.adultPrice,
      adultNum: this.data.adultNum,
      priceTotal: this.data.priceTotal,
      realPrice: api.pointProblem(this.data.priceTotal, '', 'sub'), //实际金额
      merchantDiscounts: '', //商家优惠券
      startDate: this.data.proObj.startDate,
      endDate: this.data.proObj.endDate,
      feeType: 1 //订单填写页面查看
    }

    if (this.data.adultNum > 0) {
      wx.navigateTo({
        url: `/pages/writeOrders/writeOrders`,
      })
    }else {
      app.warnNotice('请至少选择一份')
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const scene = decodeURIComponent(options.scene)
    if (scene != 'undefined') {
      this.setData({
        id: scene.split('-')[0],
      })
      if (scene.split('-')[1]) {
        app.globalData.shareUid = scene.split('-')[1]
      }else {
        this.setData({
          isFromOrdersStage: true
        })
      }
      app.globalData.isSharePage = true
    }else {
      this.setData({
        id: options.id,
      })
    }
    if (app.globalData.userInfo && app.globalData.shareUid) {
      api.toBindUser()
    }

    this.dataLoad()
  },
  dataLoad: function () {
    const $this = this
    wx.showLoading({
      title: 'loading...',
      mask: true
    })
    api.ajax({
      url: `${config.productDetail}/${$this.data.id}`
    })
      .then((resolve) => {
        if (resolve.statusCode == 200 && resolve.data.code == 0) {
          this.setData({
            proObj: resolve.data.data.route,
            // proIntro: resolve.data.data.goods.content? JSON.parse(resolve.data.data.goods.content): '',
            commentObj: resolve.data.data.comments,
            marketPrice: resolve.data.data.route.realPriceText? resolve.data.data.route.realPriceText.split(' ')[0]: null,
            photosImg: resolve.data.data.route.photos.split(',')
          })
          let contentTxt = this.data.proObj.content.replace(/section/g, "div")
          let contentTxt2 = contentTxt.replace(/<img/g, '<img class="photo"')
          this.setData({
            contentTxt: contentTxt2
          })
          // let article = this.data.proObj.content
          // WxParse.wxParse('article', 'html', article, $this, 5);

          if (this.data.adultNum != 0) {
            this.setData({
              priceTotal: api.pointProblem(this.data.adultNum, this.data.proObj.adultPrice, 'mul')
            })
          }
          if (this.data.proObj.endDate) {
            let nowTime = new Date().getTime(),
              endTime = new Date(this.data.proObj.endDate).getTime()
            if (nowTime > endTime) {
              this.setData({
                isPastDate: true, //已经过期
              })
            }
          }

          app.globalData.proInfoObj = this.data.proObj
          setTimeout(() => {
            wx.hideLoading()
          }, 500)
        } else {
          wx.hideLoading()
          this.setData({
            isLoadErr: true
          })
          app.warnNotice(resolve.data.message)
        }
      })
      .catch((err) => {
        wx.hideLoading()
        this.setData({
          isLoadErr: true
        })
        app.warnNotice('数据加载失败')
      })
  },
  previewCommentImg: function (e) {
    let index = e.currentTarget.dataset.index,
      imgInd = e.currentTarget.dataset.imgind,
      imgArr = this.data.commentObj.comments[index].pictures.split(',')
    wx.previewImage({
      current: imgArr[imgInd],
      urls: imgArr
    })
  },
  toAgainLoad: function () {
    this.setData({
      isLoadErr: false
    })
    this.dataLoad()
  },
  bindToHome: function() {
    wx.reLaunch({
      url: `/pages/home/home`
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
    if (!app.globalData.userInfo) {
      this.accreditStatus()
      if (!app.globalData.isSharePage) {
        this.setData({
          isSHowAccreditBox: true
        })
      }
    }else {
      this.setData({
        isAccredit: 1
      })
    }
    
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          boxHeight: res.windowHeight + 'px'
        })
      }
    })
    
    if (app.globalData.isFromOrdersStage) {
      this.setData({
        isFromOrdersStage: app.globalData.isFromOrdersStage
      })
      app.globalData.isFromOrdersStage = false
    }
    
    this.setData({
      isShowHomeBtn: app.globalData.isSharePage
    })

    if (app.globalData.isSharePage) {
      this.setData({
        isShowJoinMiniTop: true
      })
    }

    app.globalData.ordersObj = null
  },
  accreditStatus: function() {
    const $this = this
    api.userLogin((status) => {
      if (status == '1') {
        $this.setData({
          isAccredit: 1,
          isSHowAccreditBox: false
        })
        if (app.globalData.userInfo && app.globalData.shareUid) {
          api.toBindUser()
        }
      } else if (status == '0'){
        if (api.watchOpenSetting()) {
          $this.setData({
            isAccredit: 2
          })
        }else {
          $this.setData({
            isAccredit: 3
          })
        }
      }

      if (app.globalData.isSharePage && !app.globalData.userInfo) {
        this.setData({
          isSHowAccreditBox: true
        })
      }

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
  onShareAppMessage: function () {
    let title = this.data.proObj.subTitle || '一起来做深度体验旅行吧',
      url = `${this.data.proObj.thumb}?x-oss-process=style/thumb750x640` || '../../images/shareDefault.png'

    if (app.globalData.userInfo && app.globalData.userInfo.isAuth == 1) {
      return {
        path: `/pages/productDetail/productDetail?id=${this.data.id}&uid=${app.globalData.userInfo.uid}`,
        title: title,
        imageUrl: url
      }
    }else {
      return {
        path: `/pages/productDetail/productDetail?id=${this.data.id}`,
        title: title,
        imageUrl: url
      }
    }
  }
})