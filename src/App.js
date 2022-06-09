import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, Login, Home } from './components'

const HomeScreen = () => {
  return <View style={styles.root}>
    <Header />
    <Login Home={Home} />
  </View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#404040'
  }
})

export default HomeScreen
