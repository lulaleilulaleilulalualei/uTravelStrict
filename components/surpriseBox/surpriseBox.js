// components/surpriseBox/surpriseBox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    couponArr: {
      type: Array,
      value: '0',
      observer: function (newVal, oldVal, changedPath) {
        if(newVal.length != 0) {
          setTimeout(() => {
            this.setData({
              isShowBox: true
            })
          }, 1000) 
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowBox: false, //是否显示弹框
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeSupBox: function() {
      this.setData({
        isShowBox: false
      })
    },

  },

  ready: function() {
    
  }
})
