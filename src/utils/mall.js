import { Alert, Linking } from 'react-native'
import { request } from './net'
import { noop } from './util'

/**
 * 商品购买
 * @param {Array} itemList 商品列表
 */
export const goodsBuy = async itemList => {
  const { userInfo = {} } = global
  const { storeInfo = {} } = userInfo

  const data = {
    order: JSON.stringify({
      ai: storeInfo.areaId,
      ct: 'MINI_PROGRAM',
      ot: 'CHOICE',
      iv: 0,
      // 下面三个是用户信息
      un: userInfo.userName,
      wn: userInfo.nickName,
      wi: userInfo.headImgUrl,
      // 下面是收货人
      p: userInfo.mobileNo,
      r: userInfo.nickName,
      si: storeInfo.storeId,
      // 商品列表
      itemList,
      // 验证码
      tk: '',
    })
  }

  await request({
    demain: 'trade.xsyxsc.com',
    url: 'tradeorder/order/create',
    method: 'POST',
    type: 'form',
    data
  })
  Alert.alert('购买成功', '订单将在10分钟后自动取消，请前往小程序完成支付', [
    {
      text: '稍后',
      onPress: noop,
      style: 'cancel'
    },
    {
      text: '去支付',
      onPress: () => Linking.openURL('weixin://'),
      style: 'default'
    }
  ])
}