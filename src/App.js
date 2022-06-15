import React from 'react'
import { View, StyleSheet } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import { Header, Login } from './components'
import { Home, Category, Config } from './pages'
import { codePushHigh, router } from './utils'

router.use('Home', Home, { title: '整点秒杀' })
router.use('Category', Category, { title: '所有商品' })
router.use('Config', Config, { title: '设置' })

const App = () => {
  return <RootSiblingParent>
    <View style={styles.root}>
      <Header />
      <Login />
    </View>
  </RootSiblingParent>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#404040'
  }
})

export default codePushHigh(App)
