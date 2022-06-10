import React, { useCallback, useEffect, useState } from 'react'
import { View, StatusBar, StyleSheet, Platform, NativeModules, Image, TouchableOpacity, Alert } from 'react-native'
import { noop, user, useUserInfo } from '../utils'
import { Text } from './Base'

const useStatusBarHeight = () => {

  const [height, setHeight] = useState(Platform.OS === 'android' ? StatusBar.currentHeight : 0)

  useEffect(() => {
    if (Platform.OS === 'ios') {
      NativeModules.StatusBarManager.getHeight(statusBarHeight => {
        setHeight(statusBarHeight.height)
      })
    }
  }, [])

  return height
}

export const Header = () => {

  const statusBarHeight = useStatusBarHeight()

  const userInfo = useUserInfo()

  const out = useCallback(() => {
    Alert.alert('退出登录', '是否退出当前账户登录', [
      {
        text: '取消',
        onPress: noop,
        style: 'cancel'
      },
      {
        text: '确定',
        onPress: () => user.out(),
        style: 'default'
      },
    ])
  }, [])

  return <>
    <StatusBar
      animated
      translucent
      backgroundColor='transparent'
      barStyle='light-content'
    />
    <View style={[styles.header, { paddingTop: statusBarHeight, height: statusBarHeight + 44 }]}>
      <View style={styles.headerLeft} />
      <Text style={styles.headerTitle}>兴盛优选</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity activeOpacity={1} onPress={out}>
          <Image style={styles.headerUser} source={{ uri: userInfo.headImgUrl }} />
        </TouchableOpacity>
      </View>
    </View>
  </>
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2b2c30'
  },
  headerLeft: {
    width: 100
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20
  },
  headerRight: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  headerUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10
  }
})