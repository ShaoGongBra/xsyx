import React, { useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { View, StyleSheet, Image as ImageRN, ScrollView } from 'react-native'
import { Text, PullView } from '../components'

const Image = ({
  uri
}) => {

  const [height, setHeight] = useState(0)

  const layout = useCallback(({ nativeEvent: { layout } }) => {
    ImageRN.getSize(
      uri,
      (width, height) => {
        setHeight(height / width * layout.width)
      }
    )
  }, [uri])

  return <ImageRN
    onLayout={layout}
    style={{ height }}
    source={{ uri }}
  />
}

export const GoodsDetail = forwardRef((props, ref) => {

  const [show, setShow] = useState(false)

  const [list, setList] = useState([])

  const close = useCallback(() => {
    setShow(false)
    setList([])
  }, [])

  useImperativeHandle(ref, () => ({
    show(data) {
      setShow(true)
      setList(data)
    }
  }))

  return <>
    {show && <PullView onClose={close}>
      <View style={styles.goodsTitle}>
        <Text style={styles.goodsTitleText}>详情</Text>
      </View>
      <ScrollView style={styles.goodsContent}>
        {
          list.map(item => <Image key={item} uri={item} />)
        }
      </ScrollView>
    </PullView>}
  </>
})


const styles = StyleSheet.create({
  goodsTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#2c2a2d',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden'
  },
  goodsContent: {
    height: 500
  }
})