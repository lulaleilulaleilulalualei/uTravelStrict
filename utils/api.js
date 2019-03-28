/*
  通用方法
*/
const config = require('../config.js')
const codeJson = require('./foreignCode.js')
const app = getApp()

class Api { //数据请求简单封装
  constructor() {
    this.scrollNum = null
    this.isActive = false
    this.toBindCount = 0
  }

  static ajax(dataObj) {
    const promise = new Promise((resolve, reject, defaults) => {
      wx.request({
        url: dataObj.url,
        method: dataObj.method || 'GET',
        header: dataObj.header || {},
        data: dataObj.data,
        success: resolve,
        fail: reject,
        complete: defaults
      })
    })
    return promise
  }

  static interleave(str) {//回车空格替换
    return str.replace(/(\r\n)|(\n)/g, '\n')
  }

  static userLogin(callBack, pageStatus) { //wx.canIUse('button.open-type.getUserInfo') botton授权兼容处理
    const $this = this
    // 获取用户信息
    wx.login({
      timeout: 10000,
      success: (_res) => {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              if (pageStatus != 'index' && !app.globalData.isSharePage) {
                wx.showLoading({
                  title: '授权登陆中...',
                  mask: true
                })
              }
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                lang: 'zh_CN',
                success: res => {
                  let dataObj = {
                    code: _res.code,
                    nickName: res.userInfo.nickName || '优旅家严选',
                    avatarUrl: res.userInfo.avatarUrl || '../../images/user_test_1.png',
                    gender: res.userInfo.gender || 0,
                    province: res.userInfo.province,
                    city: res.userInfo.city,
                    country: res.userInfo.country,
                    encryptedData: res.encryptedData,
                    iv: res.iv
                  }
                  $this.ajax({
                    url: config.wxLogin,
                    method: 'POST',
                    data: dataObj
                  })
                    .then((resolve) => {
                      if (resolve.statusCode == 200 && resolve.data.code == 0) {
                        app.globalData.userInfo = resolve.data.data
                        typeof callBack == 'function' && callBack('1')
                        if (pageStatus != 'index' && !app.globalData.isSharePage) {
                          wx.hideLoading()
                          wx.showToast({
                            title: '授权登录成功',
                            icon: 'success',
                            mask: true
                          })
                        }
                      }else {
                        wx.hideLoading()
                        app.warnNotice(resolve.data.message)
                      }
                    })
                    .catch((err) => {
                      wx.hideLoading()
                      app.warnNotice('登录失败，请重新登录')
                    })
                },
                fail: () => {
                  wx.hideLoading()
                  app.warnNotice('获取用户信息失败，请重新登录')
                }
              })
            } else if (res.authSetting['scope.userInfo'] !== undefined && !res.authSetting['scope.userInfo']) {
              typeof callBack == 'function' && callBack('0')
            }else {
              typeof callBack == 'function' && callBack()
            }
          },
          fail: () => {
            app.warnNotice('登录异常，请重新登录')
          }
        })
      },
      fail: () => {
        app.warnNotice('登录异常，请重新登录')
      }
    })
  }

  static trim (strs){
    if (Object.prototype.toString.call(strs) === "[object String]") {
      return strs.replace(/(^\s*)|(\s*$)/g, '');
    }
  }

  static watchOpenSetting () {
    let sysInfoVer = wx.getSystemInfoSync().SDKVersion
    if (sysInfoVer.split('.')[0] > 1) {
      if (sysInfoVer.split('.')[1] > 2) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  static getCodeArr() {
    let nameArr = Object.keys(codeJson),
        objArr = []
    for(let i=0;i<nameArr.length;i++) {
      objArr.push({
        name: nameArr[i],
        code: codeJson[nameArr[i]]
      })
    }
    return objArr
  }

  static countDownTime(afterDate,callback) {
    let timer = setInterval(() => {
      let newDate = new Date().getTime(),
        times = Math.floor((afterDate - newDate)/1000)

      if (times <= 0) {
        clearInterval(timer)
        return
      }

      let day = Math.floor(Math.floor(times / 86400)),
        hour = day*24 + Math.floor(times % 86400 / 3600),
        minute = Math.floor((times % 3600) / 60) ,
        second = times % 60

      if (hour < 10) hour = '0' + hour
      if (minute < 10) minute = '0' + minute
      if (second < 10) second = '0' + second

      typeof callback == 'function' && callback(hour, minute, second)
    },1000)
  }

  static scrollListen (n, callback) {
    if (this.scrollNum === null) this.scrollNum = n

    if (this.scrollNum == n) {
      if (!this.isActive) {
        this.isActive = true
        typeof callback == 'function' && callback(n)
      }
    } else {
      this.isActive = false
      this.scrollNum = n
    }
  }

  static countDown(callback) {
    var downObj = {
      maxTime: 60,
      countTxt: '',
      status: false,
      timer: '',
      downTime: function () {
        var $this = this
        if (this.maxTime > 1) {
          this.maxTime--
          this.countTxt = this.maxTime + '秒后获取'
          this.status = true
          typeof callback == 'function' && callback($this.countTxt, $this.status)
          this.timer = setTimeout(function () {
            $this.downTime()
          }, 1000)
        } else {
          this.status = false
          this.timer = setTimeout(function () {
            typeof callback == 'function' && callback('获取验证码', $this.status)
          }, 1000)
        }
      }
    }
    downObj.downTime()
  }

  static pointProblem(arg1, arg2, type) {
    if (arg1 == '') arg1 = 0
    if (arg2 == '') arg2 = 0
    if(type == 'add') {
      let r1, r2, m;
      try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
      try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
      m = Math.pow(10, Math.max(r1, r2))
      return (arg1 * m + arg2 * m) / m 
    }
    if(type == 'sub') {
      var r1, r2, m, n;
      try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
      try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
      m = Math.pow(10, Math.max(r1, r2));
      n = (r1 >= r2) ? r1 : r2;
      return ((arg1 * m - arg2 * m) / m).toFixed(n);
    }
    if(type == 'mul') {
      let m = 0, s1 = '', s2 = '';
      if (arg1 && arg1 != null)
        s1 = arg1.toString();

      if (arg2 && arg2 != null)
        s2 = arg2.toString();

      try { m += s1.split('.')[1].length } catch (e) { }
      try { m += s2.split('.')[1].length } catch (e) { }

      return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
    }
  }
  
  static toBindUser() {
    if (!this.toBindCount) this.toBindCount = 0
    this.toBindCount++
    if (app.globalData.userInfo.uid && app.globalData.shareUid) {
      if (this.toBindCount == 1) {
        this.ajax({
          url: `${config.toBindUser}/${app.globalData.userInfo.uid}/bind/${app.globalData.shareUid}`,
          method: 'POST',
        })
          .then((resolve) => {
            if (resolve.statusCode == 200 && resolve.data.code == 0) {
              console.log('绑定成功')
            } else {
              console.log(resolve.data.message)
              this.toBindCount = 0
            }
          })
          .catch((err) => {
            console.log('绑定失败')
            this.toBindCount = 0
          })
      }
    }
  }

  static getAuthInfo(cb, status) {
    const $this = this
    this.ajax({
      url: `${config.getAuthInfo}/${app.globalData.userInfo.uid}/info`,
    })
      .then(resolve => {
        if (resolve.statusCode == 200) {
          if (resolve.data.code == 0) {
            let obj = resolve.data.data
            if (obj.checkStatus == 0) { //审核中
              typeof cb == 'function' && cb(2, obj)
            } else if (obj.checkStatus == 2) {//驳回
              typeof cb == 'function' && cb(3, obj)
            } else if (obj.checkStatus == 1) {
              app.globalData.userInfo.isAuth = 1
              typeof cb == 'function' && cb(1, obj)
            }
          } else if (resolve.data.code == 2002) {
            typeof cb == 'function' && cb(0)
          } else {
            if (status) {
              app.warnNotice(resolve.data.message)
            }
          }
        } else {
          if (status) {
            app.warnNotice('认证信息请求失败，请检查网络')
          }
        }
      })
      .catch(err => {
        if (status) {
          app.warnNotice('认证信息请求失败，请检查网络')
        }
      }) 
  }
}

module.exports = Api