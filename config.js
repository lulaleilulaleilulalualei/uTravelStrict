
const host = 'https://yiyou.ulvjia.com'
// const host = 'http://192.168.119.3:8081'
const wsHost = 'wss://yiyou-task.ulvjia.com'

const config = {
  host,
  wsHost,
  defaultTitle: '来一场深度体验旅行吧',
  defaultUrl: '../../images/shareDefault.png',
  
  mapKey: 'FEJBZ-EBXRK-ZEHJA-AEHLS-3ECVJ-LMFZO',
  officialPhone: '400-077-8755',
  homeUrl: `${host}/api/index/details`, //首页
  proShare: `${host}/api/route/page`, //产品中心分享页
  productDetail: `${host}/api/route/details`, //产品详情
  wxLogin: `${host}/api/weixin/login`, //登录
  commentList: `${host}/api/comment/page`, //评论列表
  getTravelerList: `${host}/api/rel`, //查询出行人列表
  saveTraveler: `${host}/api/rel/save/person`,// 保存出行人
  editTraveler: `${host}/api/rel/update/person`,//修改出行人
  deleteTraveler: `${host}/api/rel/delete/person`, //删除出行人
  uploadImg: `${host}/api/upload/images`, //上传文件图片
  submitComment: `${host}/api/comment/submit`, //提交评论
  getGroupList: `${host}/api/batch/list`, //拼团列表
  mouthPrice: `${host}/api/route/prices`, //获取当月所有价格
  otherPro: `${host}/api/route/product`, //其他保险 产品 日期价格信息
  getCanUseCoupon: `${host}/api/coupon`, //查询可用的优惠券
  getCouponList: `${host}/api/coupon/page`, //查询优惠券列表
  getMineOrders: `${host}/api/order`, //获取我的订单
  ordersDetail: `${host}/api/order/details`, //订单详情
  shareOrders: `${host}/api/user`, //分享加载的页面
  getInvoice: `${host}/api/user/ask/invoice`, //索要发票
  refundRate: `${host}/api/route/refund/rate`, //查询退款比率 和退款价格
  refundApi: `${host}/api/route/refund`, //退款
  wxPay: `${host}/api/route/trans/pay`, //小程序支付
  userRealName: `${host}/api/auth/submit/apply`, //用户实名接口
  getCode: `${host}/api/auth/sms`, //获取短信
  getMoney: `${host}/api/dis`, //用户提现 
  userOutMoneyInfo: `${host}/api/dis`, //用户提现记录接口
  userInMoneyInfo: `${host}/api/commission`, //用户进账记录
  lookMoney: `${host}/api/dis`, //查询金额
  getQrCOde: `${host}/api/order`, //获取二维码
  checkTicket: `${host}/api/order/validate/ticket`, //验票接口
  getPoster: `${host}/route`, //获取海报
  inquirePhone: `${host}/api/order/search`, //查询用户手机号信息
  getChannel: `${host}/api/auth/chancel/list`,//获取渠道商
  getAuthInfo: `${host}/api/auth`, //查询认证信息
  toBindUser: `${host}/api/user`, //绑定用户
  getClientList: `${host}/api/user/subordinate/page`, //获取客户列表信息

  tickecWsApi: `${wsHost}/applet/socket`,
}

module.exports = config