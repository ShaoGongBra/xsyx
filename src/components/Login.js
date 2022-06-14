import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { Text } from './Base'
import { useUserInfo, request, user, getUserInfo, toast, useRouter } from '../utils'

export const Login = () => {

  const userInfo = useUserInfo()

  useEffect(() => {
    if (userInfo.login) {
      getUserInfo().then(res => {
        user.set(res)
      })
    }
    request({
      url: 'user/product/indexWindows',
      data: {
        openBrandHouse: 'OPEN'
      }
    }).then(res => {
      console.log('qingqiu',res)
    }).catch(err => {
      console.log('shibai',err)
    })
  }, [userInfo.login])

  const [post, setPost] = useState({
    userName: '',
    verificationCode: '',
    msgId: ''
  })

  const [showCode, setShowCode] = useState(false)

  const setUserName = useCallback(text => setPost(old => ({
    ...old,
    userName: text
  })), [])

  const setCode = useCallback(text => setPost(old => ({
    ...old,
    verificationCode: text
  })), [])

  useEffect(() => {
    if (post.userName.length === 11) {
      // 发送验证码
      request({
        demain: 'user.xsyxsc.com',
        url: 'api/auth/auth/sendVerificationCode',
        type: 'form',
        method: 'POST',
        data: { mobileNo: post.userName, scenes: 'LOGIN', item: 'XSYX_APP_MEMBER' }
      }).then(({ msgId }) => {
        setPost(old => ({
          ...old,
          msgId
        }))
        setShowCode(true)
      })
    } else {
      setShowCode(false)
    }
  }, [post.userName])

  useEffect(() => {
    if (post.userName.length === 11 && post.verificationCode.length === 4) {
      // 登录
      request({
        demain: 'user.xsyxsc.com',
        url: 'api/auth/auth/manualLogin',
        type: 'form',
        method: 'POST',
        data: {
          loginMode: 'VERIFICATION_CODE',
          item: 'XSYX_APP_MEMBER',
          ...post
        }
      }).then(async ({ userKey }) => {
        const info = await getUserInfo(userKey)
        if (!info.storeInfo) {
          // 未设置自提店铺
          toast('请前往小程序设置自提店铺后重新登录')
        } else {
          user.set({
            key: userKey,
            ...info
          })
        }
      })
    }
  }, [post])

  const { component: Page } = useRouter()

  return userInfo.login ?
    <Page /> :
    <TouchableOpacity style={styles.mask} activeOpacity={1} onPress={Keyboard.dismiss}>
      <View style={styles.login}>
        <Text style={styles.title}>登录</Text>
        <View style={styles.inputLayout}>
          <TextInput style={styles.input} onChangeText={setUserName} placeholderTextColor='#fff' maxLength={11} placeholder='手机号' keyboardType='numeric' />
        </View>
        {showCode && <View style={styles.inputLayout}>
          <TextInput autoFocus style={styles.input} onChangeText={setCode} placeholderTextColor='#fff' maxLength={4} placeholder='验证码' keyboardType='numeric' />
        </View>}
      </View>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
  mask: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    alignItems: 'center'
  },
  login: {
    backgroundColor: '#2b2c30',
    width: '80%',
    padding: 20,
    borderRadius: 3,
    marginTop: 150
  },
  title: {
    marginBottom: 10,
    fontSize: 26
  },
  inputLayout: {
    borderBottomColor: '#666',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  input: {
    color: '#fff',
    paddingTop: 0,
    paddingBottom: 0,
    height: 50,
    lineHeight: 50,
    borderWidth: 0,
    backgroundColor: 'transparent'
  }
})