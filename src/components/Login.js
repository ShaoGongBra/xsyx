import React from 'react'
import { View, StyleSheet, TextInput } from 'react-native'
import { Text } from './Base'

export const Login = ({ Home }) => {
  return <View style={styles.mask}>
    <View style={styles.login}>
      <Text style={styles.title}>请登录</Text>
      <TextInput style={styles.input} placeholderTextColor='#fff' maxLength={11} placeholder='手机号' keyboardType='numeric' />
      <TextInput style={styles.input} placeholderTextColor='#fff' maxLength={4} placeholder='验证码' keyboardType='numeric' />
    </View>
  </View>
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  login: {
    backgroundColor: '#2b2c30',
    width: '80%',
    padding: 20,
    borderRadius: 3
  },
  title: {
    marginBottom: 10,
    fontSize: 32
  },
  input: {
    color: '#fff',
    marginTop: 10,
    borderBottomColor: '#666',
    borderBottomWidth: 0.2
  }
})