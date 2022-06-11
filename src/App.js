import React from 'react'
import { View, StyleSheet } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import { Header, Login, Home, Category } from './components'
import { codePushHigh, router } from './utils'

router.use('Home', Home, { title: '整点秒杀' })
router.use('Category', Category, { title: '所有商品' })

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
