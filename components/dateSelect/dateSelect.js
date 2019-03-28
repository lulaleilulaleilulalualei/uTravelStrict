// components/dateSelect/dateSele
const app = getApp()
const api = require('../../utils/api.js')
const config = require('../../config.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rtId: {
      type: Number,
    },
    startTime: {
      type: String
    }
  },
  data: {
    hasEmptyGrid: false,
    cur_year: '',
    cur_month: '',
    todayIndex: null,
    averageW: '107rpx',
    isGetPrice: true, //获取价格，默认是成功的
  },
  /**
   * 组件的方法列表
   */
  methods: {
    setNowDate: function () {
      let date = ''
      if (this.data.startTime && new Date(this.data.startTime).getTime() >= new Date().getTime()) {
        let yearNum = this.data.startTime && this.data.startTime.split('-')[0],
            mouthNum = this.data.startTime && this.data.startTime.split('-')[1]
        date = this.data.startTime ? new Date(`${yearNum}-${mouthNum}-01`) : new Date();
      }else {
        date = new Date();
      }
      const cur_year = date.getFullYear();
      let cur_month = date.getMonth() + 1;
      const newDate = date.getDate() - 1; //当前的下标
      const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
      const newData = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      if (cur_month < 10) {
        cur_month = '0' + cur_month
      }
      this.setData({
        cur_year: cur_year,
        cur_month: cur_month,
        weeks_ch,
        newData
      })
      this.calculateEmptyGrids(cur_year, cur_month);
      this.calculateDays(cur_year, cur_month, 1);
    },
    calculateEmptyGrids(year, month) { //当月1号星期几计算
      const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
      let empytGrids = [];
      if (firstDayOfWeek > 0) {
        for (let i = 0; i < firstDayOfWeek; i++) {
          empytGrids.push(i);
        }
        this.setData({
          hasEmptyGrid: true,
          empytGrids
        });
      } else {
        this.setData({
          hasEmptyGrid: false,
          empytGrids: []
        });
      }
    },
    calculateDays(year, month, type) { //当月日期计算
      let days = [];
      const $this = this
      const thisMonthDays = this.getThisMonthDays(year, month);
      wx.showLoading({
        title: 'loading...',
        mask: true
      })
      api.ajax({
        url: `${config.mouthPrice}/${$this.data.rtId}?date=${year}-${month}`
      })
        .then((resolve) => {
          if (resolve.statusCode == 200 && resolve.data.code == 0) {
            let priceArr = resolve.data.data.dates,
              startTime = resolve.data.data.startDate || '',
              endTime = resolve.data.data.endDate || '',
              defaultLimit = 1 //状态1 没有限制 状态2 只有开始时间，没有结束时间 状态 3 只有结束时间,没有开始时间，状态4，两个时间都有
            if (startTime == '' && endTime == '') {
              defaultLimit = 1
            } else if (startTime != '' && endTime == '') {
              defaultLimit = 2
            } else if (startTime == '' && endTime != '') {
              defaultLimit = 3
            } else if (startTime != '' && endTime != '') {
              defaultLimit = 4
            }

            priceArr.map((v, n) =>{
              for (let i = 1; i <= thisMonthDays; i++) {
                if(v.day == i) {
                  let getTimes = new Date(year, month - 1, i).getTime(),
                    sTimeArr = startTime.split('-'),
                    eTimeArr = endTime.split('-'),
                    sTimes = startTime ? new Date(sTimeArr[0], sTimeArr[1] - 1, sTimeArr[2]).getTime(): '',
                    eTimes = endTime ? new Date(eTimeArr[0], eTimeArr[1] - 1, eTimeArr[2]).getTime(): ''

                  switch (defaultLimit) {
                    case 1: //两个时间都没有
                      if (getTimes > this.data.newData) {
                        if (v.isBuy == 1) {
                          days.push({
                            day: i,
                            isBuy: true,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      } else {
                        days.push({
                          day: i,
                          isBuy: false,
                          adultPrice: v.adultPrice,
                          childPrice: v.childPrice,
                          babyPrice: v.babyPrice,
                          isDiscount: v.isDiscount,
                          surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                        });
                      }
                      break;
                    case 2: //只有开始时间，没有结束时间
                      // let sTimes = new Date(startTime[0], startTime[1] - 1, startTime[2]).getTime()
                      if (this.data.newData < sTimes) {
                        if (getTimes >= sTimes) {
                          if (v.isBuy == 1) {
                            days.push({
                              day: i,
                              isBuy: true,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }else {
                            days.push({
                              day: i,
                              isBuy: false,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }
                        }else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      }else {
                        if (getTimes > this.data.newData) {
                          if (v.isBuy == 1){
                            days.push({
                              day: i,
                              isBuy: true,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }else {
                            days.push({
                              day: i,
                              isBuy: false,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }
                        } else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      }
                      break;
                    case 3: //只有结束时间，没有开始时间
                      // let eTimes = new Date(endTime[0], endTime[1] - 1, endTime[2]).getTime()
                      if (this.data.newData < eTimes) {
                        if (getTimes > this.data.newData && getTimes <= eTimes) {
                          if (v.isBuy == 1) {
                            days.push({
                              day: i,
                              isBuy: true,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }else {
                            days.push({
                              day: i,
                              isBuy: false,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }
                        }else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      }else {
                        days.push({
                          day: i,
                          isBuy: false,
                          adultPrice: v.adultPrice,
                          childPrice: v.childPrice,
                          babyPrice: v.babyPrice,
                          isDiscount: v.isDiscount,
                          surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                        });
                      }
                      break;
                    case 4: //两个都有
                      // let sTimes = new Date(startTime[0], startTime[1] - 1, startTime[2]).getTime(),
                          // eTimes = new Date(endTime[0], endTime[1] - 1, endTime[2]).getTime()
                      if (this.data.newData < sTimes) { //当前时间小于开始时间
                        if (sTimes <= getTimes && getTimes <= eTimes) {
                          if (v.isBuy == 1) {
                            days.push({
                              day: i,
                              isBuy: true,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }else {
                            days.push({
                              day: i,
                              isBuy: false,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }
                        } else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      } else if (sTimes <= this.data.newData && this.data.newData < eTimes) { //当前时间大于等于开始时间，小于结束时间
                        if (this.data.newData < getTimes && getTimes <= eTimes) { //
                          if (v.isBuy == 1) {
                            days.push({
                              day: i,
                              isBuy: true,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }else {
                            days.push({
                              day: i,
                              isBuy: false,
                              adultPrice: v.adultPrice,
                              childPrice: v.childPrice,
                              babyPrice: v.babyPrice,
                              isDiscount: v.isDiscount,
                              surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                            });
                          }
                        } else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      } else if (sTimes <= this.data.newData && this.data.newData <= eTimes) { //当前时间跟结束时间是同一天
                        if (v.isBuy == 1) {
                          days.push({
                            day: i,
                            isBuy: true,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        } else {
                          days.push({
                            day: i,
                            isBuy: false,
                            adultPrice: v.adultPrice,
                            childPrice: v.childPrice,
                            babyPrice: v.babyPrice,
                            isDiscount: v.isDiscount,
                            surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                          });
                        }
                      }else {
                        days.push({
                          day: i,
                          isBuy: false,
                          adultPrice: v.adultPrice,
                          childPrice: v.childPrice,
                          babyPrice: v.babyPrice,
                          isDiscount: v.isDiscount,
                          surplusNum: v.stockNum ? v.stockNum - v.sellNum : null
                        });
                      }
                    break;
                  } 
                //结束
                }
              }
            })
            this.setData({
              days
            });
            this.triggerEvent('loadStatus', {type: type, msg: ''})
            setTimeout(() => {
              wx.hideLoading()
            }, 500)
          } else {
            this.triggerEvent('loadStatus', { type: type, msg: resolve.data.message })
            if(type == 2) {
              this.setData({
                isGetPrice: false
              })
              this.getErrMouthDays(year, month)
            }
            setTimeout(() => {
              wx.hideLoading()
            }, 500)
          }
        })
        .catch(err => {
          console.log(err)
          this.triggerEvent('loadStatus', { type: type, msg: '获取价格失败' })
          if (type == 2) {
            this.setData({
              isGetPrice: false
            })
            this.getErrMouthDays(year, month)
          }
          setTimeout(() => {
            wx.hideLoading()
          }, 500)
        })
    },
    getErrMouthDays: function (year, month) { //出错时获取当月天数
      let days = [];
      const $this = this
      const thisMonthDays = this.getThisMonthDays(year, month);
      for (let i = 1; i <= thisMonthDays; i++) {
        let getTimes = new Date(year, month - 1, i).getTime()
        if (getTimes > this.data.newData) {
          days.push({
            day: i,
            isBuy: true,
            adultPrice: 0
          });
        } else {
          days.push({
            day: i,
            isBuy: false,
            adultPrice: 0
          });
        }
      }
      this.setData({
        days
      });
    },
    dateSelectAction: function (e) { //选择某天
      var index = e.currentTarget.dataset.idx;
      if (this.data.days[index].isBuy && this.data.isGetPrice) {
        this.setData({
          todayIndex: index
        })
        this.triggerEvent('selectdayevent', {
          date: `${this.data.cur_year}-${this.data.cur_month < 10 ? '0' + Number(this.data.cur_month) : this.data.cur_month}-${(index + 1) < 10 ? '0' + (index + 1) : (index + 1)}`,
          adultPrice: this.data.days[index].adultPrice,
          childPrice: this.data.days[index].childPrice,
          babyPrice: this.data.days[index].babyPrice,
          surplusNum: this.data.days[index].surplusNum
        })
      }else {
        if (!this.data.isGetPrice) {
          app.warnNotice('未能获取当天价格，请重新加载页面')
        }
      }
    },

    getThisMonthDays(year, month) {
      return new Date(year, month, 0).getDate();
    },
    getFirstDayOfWeek(year, month) {
      return new Date(Date.UTC(year, month - 1, 1)).getDay();
    },
    handleCalendar(e) { //前后月的选择
      const handle = e.currentTarget.dataset.handle;
      const cur_year = this.data.cur_year;
      const cur_month = Number(this.data.cur_month);
      this.setData({
        todayIndex: null
      })
      this.triggerEvent('selectdayevent', null)
      if (handle === 'prev') {
        let newMonth = cur_month - 1;
        let newYear = cur_year;
        if (newMonth < 1) {
          newYear = cur_year - 1;
          newMonth = 12;
        }
        if (newMonth < 10) {
          newMonth = '0' + newMonth
        }

        this.calculateDays(newYear, newMonth, 2);
        this.calculateEmptyGrids(newYear, newMonth);

        this.setData({
          cur_year: newYear,
          cur_month: newMonth
        })

      } else {
        let newMonth = cur_month + 1;
        let newYear = cur_year;
        if (newMonth > 12) {
          newYear = cur_year + 1;
          newMonth = 1;
        }

        if (newMonth < 10) {
          newMonth = '0' + newMonth
        }

        this.calculateDays(newYear, newMonth, 2);
        this.calculateEmptyGrids(newYear, newMonth);

        this.setData({
          cur_year: newYear,
          cur_month: newMonth
        })
      }

    }
  },
  ready: function(options) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          averageW: res.windowWidth / 7 + 'px'
        })
      }
    })
    this.setNowDate();
  }
})
