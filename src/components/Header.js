import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, StatusBar, StyleSheet, Platform, NativeModules, Image, TouchableOpacity, Alert } from 'react-native'
import codePush from 'react-native-code-push'
import { noop, updateApp, user, useRouter, useRouters, useUserInfo, router } from '../utils'
import { Text } from './Base'
import { PullView } from './PullView'
import menuImg from '../images/menu.png'

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

  const pullView = useRef(null)

  const statusBarHeight = useStatusBarHeight()

  const userInfo = useUserInfo()

  const [menuShow, setMenuShow] = useState(false)

  const menu = useCallback(() => {
    setMenuShow(old => !old)
  }, [])

  const closeMenu = useCallback(() => {
    pullView.current.close()
  }, [])

  const out = useCallback(() => {
    Alert.alert('退出登录', '是否退出当前账户登录', [
      {
        text: '取消',
        onPress: noop,
        style: 'cancel'
      },
      {
        text: '确定',
        onPress: () => {
          pullView.current.close()
          user.out()
        },
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
      <View style={styles.headerLeft}>
        <TouchableOpacity activeOpacity={1} onPress={menu}>
          <Image style={styles.headerLeftMenu} source={menuImg} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>兴盛优选</Text>
      <View style={styles.headerRight}>
        <Image style={styles.headerUser} source={{ uri: userInfo.headImgUrl }} />
      </View>
    </View>
    {menuShow && <PullView side='left' onClose={menu} ref={pullView}>
      <Menu
        statusBarHeight={statusBarHeight}
        userInfo={userInfo}
        onOut={out}
        onClose={closeMenu}
      />
    </PullView>}
  </>
}

const Menu = ({
  statusBarHeight,
  userInfo,
  onOut,
  onClose
}) => {

  const routers = useRouters()

  const { name: routerName } = useRouter()

  const [codepushVersion, setCodepushVersion] = useState(0)

  useEffect(() => {
    codePush.getUpdateMetadata(codePush.UpdateState.RUNNING).then(res => {
      if (res) {
        setCodepushVersion(res.label)
      }
    })
  }, [])

  return <View style={[styles.menu, { paddingTop: statusBarHeight + 10 }]}>
    <View style={styles.menuUser}>
      <Image style={styles.menuUserHead} source={{ uri: userInfo.headImgUrl }} />
      <View style={styles.menuUserRight}>
        <Text style={styles.menuUserName}>{userInfo.nickName}</Text>
        <Text style={styles.menuUserStore}>{userInfo.storeInfo?.storeName}</Text>
      </View>
    </View>
    {
      routers.map(item => <TouchableOpacity key={item.name} activeOpacity={0.7} onPress={() => {
        router.navigate(item.name)
        onClose()
      }} style={[styles.menuItem, routerName === item.name && styles.menuItemSelect]}>
        <Text style={styles.menuItemName}>{item.option.title}</Text>
      </TouchableOpacity>)
    }
    <TouchableOpacity activeOpacity={0.7} style={styles.menuItem} onPress={updateApp}>
      <Text style={styles.menuItemName}>版本更新</Text>
      <Text style={styles.menuItemDesc}>{codepushVersion}</Text>
    </TouchableOpacity>
    <TouchableOpacity activeOpacity={0.7} style={styles.menuItem} onPress={onOut}>
      <Text style={styles.menuItemName}>退出登录</Text>
    </TouchableOpacity>
  </View>
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
  headerLeftMenu: {
    width: 26,
    height: 26,
    marginLeft: 10
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
  },
  menu: {
    height: '100%',
    width: 260,
    backgroundColor: '#2b2c30'
  },
  menuUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#404040',
    borderRadius: 3,
    margin: 10,
    marginBottom: 30
  },
  menuUserHead: {
    width: 64,
    height: 64,
    borderRadius: 3,
    marginRight: 10
  },
  menuUserRight: {
    flex: 1
  },
  menuUserName: {
    fontSize: 20
  },
  menuUserStore: {
    fontSize: 12,
    color: '#999'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between'
  },
  menuItemSelect: {
    backgroundColor: '#404040'
  },
  menuItemName: {
    fontSize: 16
  },
  menuItemDesc: {
    fontSize: 14,
    color: '#c2c2c2'
  }
})