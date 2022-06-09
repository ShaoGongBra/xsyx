import React from 'react'
import { View, StatusBar, StyleSheet } from 'react-native'
import { Text } from './Base'

export const Home = () => {
  return <>
    <StatusBar
      animated
      backgroundColor='#333'
      barStyle='light-content'
    />

    <View style={styles.header}>
      <Text style={styles.headerTitle}>兴盛优选</Text>
    </View>
  </>
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20
  }
})