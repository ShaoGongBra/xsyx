import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, SectionList, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import { request, strToDate, CountDown } from '../utils'
import { Text } from './Base'

const Title = ({
  title,
  startTime,
  onTimeEnd
}) => {

  const [timeText, setTimeText] = useState('')

  useEffect(() => {
    if (startTime) {
      const time = strToDate(startTime).getTime()
      if (time <= (new Date()).getTime()) {
        // 
        onTimeEnd?.(startTime)
      } else {
        const timer = new CountDown()
        timer.onTime(setTimeText)
        timer.onStop(() => onTimeEnd?.(startTime))
        timer.start(time + 0, 'H时M分S秒', true)
        return () => {
          timer.stop()
          setTimeText('')
        }
      }
    }
  }, [startTime])

  return <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
    <Text style={styles.headerTime}>{timeText}</Text>
  </View>
}

const Item = ({
  imgUrl,
  prName,
  saleAmt,
  salesUnit,
  ulimitQty,
  marketingDataDto,
  verificationCode,
  tmBuyStart,
  acId,
  sku,
  prType,
  eskuSn,
  onAdd,
  cart
}) => {

  const addCart = useCallback(() => {
    onAdd?.({
      tmBuyStart,
      pai: acId,
      q: ulimitQty,
      sku,
      pt: prType,
      ess: eskuSn,
      tks: []
    })
  }, [acId, sku, prType, eskuSn, ulimitQty, onAdd])

  const isCart = useMemo(() => {
    if (marketingDataDto.saleRemain === 0) {
      return false
    }
    return cart.some(item => item.ess === eskuSn)
  }, [marketingDataDto.saleRemain, cart, eskuSn])

  return <View style={styles.goods}>
    <Image style={styles.goodsImage} source={{ uri: imgUrl }} />
    <View style={styles.goodsInfo}>
      <Text style={styles.goodsName}>{prName} 限购{ulimitQty}{salesUnit}</Text>
      <View style={styles.goodsSale}>
        <View style={[{ width: marketingDataDto.consumerNum / (marketingDataDto.saleRemain + marketingDataDto.consumerNum) * 100 + '%' }, styles.goodsSaleChild]} />
        <Text style={styles.goodsSaleText}>{marketingDataDto.consumerNum}/{marketingDataDto.saleRemain + marketingDataDto.consumerNum}</Text>
      </View>
      <View style={styles.goodsBottom}>
        <Text style={styles.goodsPrice}><Text style={[styles.goodsPrice, { fontSize: 18 }]}>￥</Text>{saleAmt}</Text>
        {
          marketingDataDto.saleRemain === 0 ?
            <Text style={styles.goodsSold}>已售罄</Text> :
            <TouchableOpacity style={styles.goodsBuy} activeOpacity={0.7} onPress={addCart}>
              {isCart && <View style={styles.goodsBuyChild} />}
            </TouchableOpacity>
        }
      </View>
    </View>
    <View style={styles.goodsTips}>
      {verificationCode && <Text style={styles.goodsTipsCode}>验证码</Text>}
    </View>
  </View>
}

export const Home = () => {

  const [list, setList] = useState([])

  const [refresh, setRefresh] = useState(true)

  const [cart, setCart] = useState([])

  const [timers, setTimers] = useState({})

  const getData = useCallback(() => {
    setRefresh(true)
    let cate
    request({
      demain: 'cms.xsyxsc.com',
      url: 'cms/activity/column/info',
      method: 'POST',
      data: {
        columnType: 'HOURLY_RUSH'
      }
    }).then(res => {
      cate = res.cmsActivityColumnRuleDtos
      return Promise.all(cate.map((item, index) => request({
        demain: 'cms.xsyxsc.com',
        url: 'cms/activity/product/pageInfo',
        method: 'POST',
        data: {
          skuSn: [],
          columnId: item.id,
          columnType: 'HOURLY_RUSH',
          pageNum: 1,
          pageSize: 20
        }
      }).then(res => cate[index].data = res.cmsActivityColumnProductInfos)))
    }).then(res => {
      setList(cate)
    }).finally(() => {
      setRefresh(false)
    })
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  useEffect(() => {
    // 定时器处理
    setTimers(Object.fromEntries(cart.map(item => [item.tmBuyStart, item.tmBuyStart])))
  }, [cart, list])

  const addCart = useCallback(data => {
    setCart(old => {
      const index = old.findIndex(item => item.ess === data.ess)
      if (~index) {
        old.splice(index, 1)
      } else {
        old.push(data)
      }
      return [...old]
    })
  }, [])

  const buy = useCallback(time => {
    // 找到要提交的商品
    const itemList = cart.filter(item => item.tmBuyStart === time)

    const { userInfo = {} } = global
    const { storeInfo = {} } = userInfo
    request({
      demain: 'trade.xsyxsc.com',
      url: 'tradeorder/order/create',
      method: 'POST',
      type: 'form',
      data: {
        order: JSON.stringify({
          ai: userInfo.currentStoreId,
          ct: 'MINI_PROGRAM',
          ot: 'CHOICE',
          iv: 0,
          // 下面三个是用户信息
          un: userInfo.userName,
          wn: userInfo.nickName,
          wi: userInfo.headImgUrl,
          // 下面是收货人
          p: userInfo.mobileNo,
          r: userInfo.nickName,
          si: storeInfo.storeId,
          // 商品列表
          itemList,
          // 验证码
          tk: '',
        })
      }
    }).then(() => {
      getData()
    }).finally(() => {
      // 删除这个时间节点
      setTimers(old => {
        delete old[time]
        return { ...old }
      })
    })
  }, [cart, getData])

  return <SafeAreaView style={styles.container}>
    <SectionList
      onRefresh={getData}
      refreshing={refresh}
      sections={list}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <Item {...item} cart={cart} onAdd={addCart} />}
      renderSectionHeader={({ section }) => <Title
        title={section.startTime.substr(5, 11)}
        startTime={timers[section.startTime]}
        onTimeEnd={buy}
      />}
    />
  </SafeAreaView>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10
  },
  headerTitle: {
    fontSize: 24
  },
  headerTime: {
    fontSize: 18
  },
  goods: {
    backgroundColor: '#2c2a2d',
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16
  },
  goodsImage: {
    width: 180,
    height: 180
  },
  goodsInfo: {
    flex: 1,
    padding: 10
  },
  goodsName: {
    fontSize: 14
  },
  goodsSale: {
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#404040'
  },
  goodsSaleChild: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#d73317'
  },
  goodsSaleText: {
    fontSize: 12,
    textAlign: 'center'
  },
  goodsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'flex-end'
  },
  goodsPrice: {
    fontSize: 28,
    color: '#d53120',
    fontWeight: 'bold'
  },
  goodsSold: {
    color: '#999',
    fontSize: 14
  },
  goodsBuy: {
    width: 26,
    height: 26,
    borderColor: '#555',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  goodsBuyChild: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d53120'
  },
  goodsTips: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  goodsTipsCode: {
    padding: 8,
    backgroundColor: '#d53120'
  }
})