import asyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { request } from './net'

export const getUserInfo = async (userKey = global.userInfo?.key) => {
  const userInfo = await request({
    demain: 'user.xsyxsc.com',
    url: 'api/member/user/getUserInfo',
    type: 'form',
    toast: '获取用户信息',
    data: { userKey }
  })
  userInfo.storeInfo = await request({
    demain: 'mall-store.xsyxsc.com',
    url: 'mall-store/store/getStoreInfo',
    type: 'form',
    toast: '获取自提点信息',
    data: { userKey, storeId: userInfo.currentStoreId }
  })
  return userInfo
}

export const user = {
  key: 'userInfo',
  async get() {
    let info = await asyncStorage.getItem(this.key)
    if (info) {
      info = JSON.parse(info)
      if (info.key) {
        info.login = true
      }
    } else {
      info = {}
    }
    global.userInfo = info
    return info
  },
  async set(data = {}) {
    const info = { ...global.userInfo, ...data }
    if (info.key) {
      info.login = true
    }
    global.userInfo = info
    this.callbacks.forEach(cb => cb(info))
    await asyncStorage.setItem(this.key, JSON.stringify(info))
  },
  async out() {
    const info = {}
    global.userInfo = info
    this.callbacks.forEach(cb => cb(info))
    await asyncStorage.setItem(this.key, JSON.stringify(info))
  },
  callbacks: [],
  onChange(cb) {
    this.callbacks.push(cb)
    return () => {
      this.callbacks.splice(this.callbacks.indexOf(cb), 1)
    }
  }
}

export const useUserInfo = () => {
  const [info, setInfo] = useState({})

  useEffect(() => {
    user.get().then(res => {
      setInfo(res)
    })
    const off = user.onChange(setInfo)

    return () => off()
  }, [])

  return info
}