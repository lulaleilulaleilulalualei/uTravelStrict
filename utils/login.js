/*
  登录授权
 */
const app = getApp()
const config = require('../config.js')
const C = require('./common.js')

class LOGIN {
  static buildLogin() {
    if (accessToken) {
      wx.showLoading({
        title: '登录中',
        success: () => {
          setTimeout(() => {
            wx.hideLoading()
          }, 1000)
        }
      })
    } else {
      this.getUserInfo()
    }
  }
  static getUserInfo(cb) {
    const $this = this
    //调用登录接口
    wx.login({
      success: (res) => {
        const code = res.code

        wx.getUserInfo({
          success: (_res) => {

            let params = {
              url: config.getAccessToken,
              method: 'POST',
              // data: {
              //   rawData: _res.rawData,
              //   signature: _res.signature,
              //   encryptedData: _res.encryptedData,
              //   iv: _res.iv,
              //   code: res.code
              // }
            }

            C.commonAjax(params)
              .then((resolve) => {
                if (resolve.data.status == 200) {
                  console.log(resolve.data)
                  wx.setStorageSync('userInfo', resolve.data.data)

                  // typeof cb == "function" && cb(app.globalData.userInfo)

                } else {
                  $this.restartPower('请重新授权！')
                }
              })
              .catch((err) => {
                console.log(err)
                $this.restartPower('可能由于您的网络不稳定导致，请重新授权！')
              })
          },
          fail: (err) => {
            $this.restartPower('只有授权后才能正常使用小程序功能哦！')
          }
        })
      }
    })
  }
  static restartPower(content) {
    const $this = this
    wx.showModal({
      title: '获取授权失败',
      content: content,
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting["scope.userInfo"]) {
                $this.getUserInfo()
              }
            }
          })
        }
      },
      fail: (res) => {
        $this.restartPower('请重新授权！')
      }
    })
  }
}

module.exports = LOGIN