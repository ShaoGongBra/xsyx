import qs from 'qs'
import { toast } from './util'

export const request = ({
  demain = 'mall.xsyxsc.com',
  url,
  protocol = 'https',
  method = 'GET',
  data = {},
  type = 'json',
  toast: isToast = true
}) => {
  const { userInfo = {} } = global
  const { storeInfo = {} } = userInfo
  method = method.toUpperCase()
  data = {
    clientType: 'MINI_PROGRAM',
    userKey: userInfo.key || '',
    storeId: storeInfo.storeId || '',
    areaId: storeInfo.areaId || '',
    provinceCode: storeInfo.provinceId || '',
    cityCode: storeInfo.cityId || '',
    areaCode: storeInfo.countyId || '',
    saleRegionCode: storeInfo.areaId || '',
    ...data
  }
  url = `${protocol}://${demain}/${url}${method === 'GET' ? '?' + qs.stringify(data) : ''}`
  const option = {
    method,
    headers: {
      'content-type': type === 'json' ? 'application/json' : 'application/x-www-form-urlencoded',
      accept: 'application/json, text/plain, */*',
      version: '2.3.29',
      userKey: userInfo.key || '',
      source: 'applet',
      'x-feature-tag': 'item_product_home',
      'accept-language': 'zh-CN,zh-Hans;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      clientType: 'MINI_PROGRAM',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac',
      prebuy: 'true',
      referer: 'https://servicewechat.com/wx6025c5470c3cb50c/625/page-frame.html',
      fuzzy: 'true',
    }
  }

  if (method === 'POST') {
    option.body = type === 'json' ? JSON.stringify(data) : qs.stringify(data)
    option.headers['content-length'] = option.body.length
  }

  return fetch(url, option).then(async res => {
    if (res.status === 200) {
      const data = await res.json()
      if (data.rspCode === 'success') {
        return data.data
      }
      throw data.rspDesc
    } else {
      throw res.statusText
    }
  }).catch(err => {
    if (isToast) {
      toast(`${typeof isToast === 'string' ? isToast + ': ' : ''}${typeof err === 'object' ? JSON.stringify(err) : err}`)
    }
    throw err
  })
}