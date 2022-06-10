import React from 'react'
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native'

export const Text = ({ style, children, ...props }) => {
  return <RNText style={[styles.text, style]} {...props}>{children}</RNText>
}

const styles = StyleSheet.create({
  text: {
    color: '#fff'
  }
})