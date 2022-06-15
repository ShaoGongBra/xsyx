import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, SectionList, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import { request, goodsBuy, strFormatToDate } from '../utils'
import { Text, GoodsDetail, PullView } from '../components'
import cartImg from '../images/cart.png'

const cartData = {
  list: [],
  // 更改数量
  num(data) {
    this.change('num', data)
  },
  // 清空
  clear(data) {
    this.change('clear', data)
  },
  change(type, data) {
    this.list = (() => {
      if (type === 'num') {
        const { add, ..._data } = data
        const index = this.list.findIndex(v => v.ess === data.ess)
        if (~index) {
          const item = this.list[index]
          item.q += add
          if (!item.q) {
            // 删除
            this.list.splice(index, 1)
          }
        } else {
          _data.q = 1
          this.list.push(_data)
        }
        return [...this.list]
      } else if (type === 'clear') {
        if (data) {
          data.forEach(ess => {
            this.list.splice(this.list.findIndex(v => v.ess === ess), 1)
          })
          return [...this.list]
        } else {
          return []
        }
      }
    })()
    this.callbacks.forEach(cb => cb(this.list))
  },
  callbacks: [],
  onChange(cb) {
    this.callbacks.push(cb)
    return () => {
      this.callbacks.splice(this.callbacks.findIndex(cb), 1)
    }
  }
}

const useCart = () => {

  const [cart, setCart] = useState(cartData.list)

  useEffect(() => {
    const off = cartData.onChange(data => {
      if (typeof data === 'object') {
        setCart(data)
      }
    })
    return () => off()
  }, [])

  return cart
}

const Item = ({
  imgUrl,
  prName,
  saleAmt,
  salesUnit,
  ulimitQty,
  verificationCode,
  tmBuyStart,
  tmBuyEnd,
  acId,
  sku,
  prId,
  prType,
  eskuSn,
  cart,
  showAll,
  onPress
}) => {

  const addCart = useCallback(add => {
    cartData.num({
      title: prName,
      pai: acId,
      add,
      sku,
      pi: prId,
      pt: prType,
      ess: eskuSn,
      tks: [],
      other: {
        imgUrl,
        prName,
        saleAmt,
        salesUnit,
        ulimitQty,
        verificationCode,
        tmBuyStart,
        tmBuyEnd,
        acId,
        sku,
        prId,
        prType,
        eskuSn
      }
    })
  }, [acId, sku, prType, eskuSn, ulimitQty])

  const add = useCallback(() => addCart(1), [addCart])

  const reduce = useCallback(() => addCart(-1), [addCart])

  const cartNum = useMemo(() => {
    return cart.find(item => item.ess === eskuSn)?.q || 0
  }, [cart, eskuSn])

  const click = useCallback(() => {
    // onPress?.(detailUrls)
  }, [])

  return <TouchableOpacity activeOpacity={1} style={styles.goods} onPress={click}>
    <Image style={styles.goodsImage} resizeMethod='resize' source={{ uri: imgUrl }} />
    <View style={styles.goodsInfo}>
      <Text style={styles.goodsName}>{prName}{ulimitQty ? ` 限购${ulimitQty}${salesUnit}` : ''}</Text>
      <View style={styles.goodsBottom}>
        <Text style={styles.goodsPrice}><Text style={[styles.goodsPrice, { fontSize: 18 }]}>￥</Text>{saleAmt}</Text>
        {
          showAll ?
            <View style={styles.goodsBuys}>
              <Text style={styles.goodsBuysAdd} onPress={reduce}>-</Text>
              <Text style={styles.goodsBuysNum}>{cartNum}</Text>
              <Text style={styles.goodsBuysAdd} onPress={add}>+</Text>
            </View> :
            <TouchableOpacity style={styles.goodsBuy} activeOpacity={0.7} onPress={add}>
              {cartNum > 0 && <Text style={styles.goodsBuyChild}>{cartNum}</Text>}
            </TouchableOpacity>
        }
      </View>
    </View>
    <View style={styles.goodsTips}>
      {verificationCode && <Text style={styles.goodsTipsCode}>验证码</Text>}
    </View>
  </TouchableOpacity>
}

export const Category = () => {

  const detail = useRef(null)

  const [cates, setCates] = useState([])

  const [cateSelect, setCateSelect] = useState(0)

  const [list, setList] = useState([])

  const cart = useCart()

  useEffect(() => {
    request({
      url: 'user/product/indexWindows',
      data: {
        openBrandHouse: 'OPEN'
      }
    }).then(res => {
      const list = {}
      for (const key in res) {
        if (res.hasOwnProperty(key) && typeof res[key] === 'object') {
          res[key].forEach(item => {
            list[item.windowId || item.brandWindowId] = item.windowName
          })
        }
      }
      setCates(Object.keys(list).map(id => ({
        id,
        name: list[id]
      })))
    })
  }, [])

  const getList = useCallback(windowId => {
    const pageSize = 30
    const getMalls = async (malls, pageNum = 1) => {
      const res = await request({
        url: 'user/product/getCommonProducts',
        method: 'POST',
        data: {
          clientType: 'MINI_PROGRAM',
          rankVersion: 'v2',
          type: 'CategoryWindow',
          windowId,
          pageSize,
          pageNum,
          secondWindowId: '',
          windowPositionType: 'CLASSIFY',
          useNewLiveKey: false,
          position: 'CLASSIFY',
          channelUse: 'WXAPP',
          requireCoupon: 'TRUE',
          userScopeTypes: ['NORMAL'],
          ndTrueSales: false,
        }
      })
      if (res?.products) {
        malls.push(...res?.products)
      }
      if (!res?.products || res.products.length < pageSize) {
        return true
      }
      await getMalls(malls, pageNum + 1)
    }
    const malls = []
    getMalls(malls).then(() => {
      const arr = {}
      malls.forEach(item => {
        const key = item.tmBuyStart
        arr[key] = arr[key] || {
          title: key,
          data: []
        }
        arr[key].data.push(item)
      })
      setList(Object.values(arr).sort((a, b) => strFormatToDate('yyyy-MM-dd HH:mm:ss', a.title) - strFormatToDate('yyyy-MM-dd HH:mm:ss', b.title)))
    })
  }, [])

  useEffect(() => {
    if (!cates[cateSelect]) {
      return
    }
    getList(cates[cateSelect].id)
  }, [cates, cateSelect, getList])

  const showDetail = useCallback(list => {
    detail.current.show(list)
  }, [])

  return <>
    <SafeAreaView style={styles.container}>
      <View style={styles.lists}>
        <View style={styles.cates}>
          <FlatList
            data={cates}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => <Text
              style={[styles.catesItem, cateSelect === index && styles.catesItemSelect]}
              onPress={() => setCateSelect(index)}
            >{item.name}</Text>}
          />
        </View>
        <View style={styles.list}>
          <SectionList
            sections={list}
            keyExtractor={item => item.prName}
            renderItem={({ item }) => <Item {...item} cart={cart} onPress={showDetail} />}
            renderSectionHeader={({ section }) => <Text style={styles.listTime}>{section.title.substr(5, 11)}</Text>}
          />
        </View>
      </View>
    </SafeAreaView>
    <Cart />
    <GoodsDetail ref={detail} />
  </>
}

const Cart = () => {

  const [show, setShow] = useState(false)

  const cart = useCart()

  const total = useMemo(() => {
    return cart.reduce((prev, current) => {
      prev.count += current.q
      prev.price += current.q * current.other.saleAmt
      return prev
    }, { count: 0, price: 0 })
  }, [cart])

  const buy = useCallback(() => {
    // 找到要提交的商品

    const itemList = cart.filter(item => strFormatToDate('yyyy-MM-dd HH:mm:ss', item.other.tmBuyStart) < new Date()).map(({ other, ...item }) => item)
    if (!itemList.length) {
      return
    }
    goodsBuy(itemList).then(() => cartData.clear(itemList.map(v => v.ess)))
  }, [cart])

  const changeShow = useCallback(() => setShow(old => !old), [])

  return <>
    <View style={styles.cart}>
      <Text style={styles.cartPrice}><Text style={styles.cartPriceChild}>￥</Text>{total.price.toFixed(2)}</Text>
      <TouchableOpacity activeOpacity={1} style={styles.cartSubmit} onPress={buy}>
        <Text style={styles.cartSubmitText}>提交订单</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity activeOpacity={1} style={styles.cartIcon} onPress={changeShow}>
      <Image style={styles.cartIconImg} source={cartImg} />
      {total.count > 0 && <View style={styles.cartIconNum}>
        <Text>{total.count}</Text>
      </View>}
    </TouchableOpacity>
    <CartList cart={cart} show={show} onClose={changeShow} />
  </>
}

const CartList = ({
  show,
  cart,
  onClose
}) => {

  const [list, setList] = useState([])

  useEffect(() => {
    const arr = {}
    cart.forEach(item => {
      const key = item.other.tmBuyStart
      arr[key] = arr[key] || {
        title: key,
        data: []
      }
      arr[key].data.push(item.other)
    })
    setList(Object.values(arr).sort((a, b) => strFormatToDate('yyyy-MM-dd HH:mm:ss', a.title) - strFormatToDate('yyyy-MM-dd HH:mm:ss', b.title)))
  }, [cart])

  return show && <PullView onClose={onClose}>
    <View style={styles.cartList}>
      <View style={styles.cartListTitle}>
        <Text style={styles.cartListTitleText}>购物车</Text>
      </View>
      <SectionList
        sections={list}
        style={{ height: 500, paddingHorizontal: 10 }}
        keyExtractor={item => item.prName}
        renderItem={({ item }) => <Item {...item} cart={cart} showAll />}
        renderSectionHeader={({ section }) => <Text style={styles.listTime}>{section.title.substr(5, 11)}</Text>}
      />
    </View>
  </PullView>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  lists: {
    flex: 1,
    flexDirection: 'row'
  },
  cates: {
    width: 80,
    backgroundColor: '#2b2c30'
  },
  catesItem: {
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'center'
  },
  catesItemSelect: {
    backgroundColor: '#404040'
  },
  list: {
    flex: 1,
    paddingHorizontal: 10
  },
  listTime: {
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: 'bold'
  },
  goods: {
    backgroundColor: '#2c2a2d',
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8
  },
  goodsImage: {
    width: 120,
    height: 120
  },
  goodsInfo: {
    flex: 1,
    padding: 10
  },
  goodsName: {
    fontSize: 14
  },
  goodsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'flex-end'
  },
  goodsPrice: {
    fontSize: 20,
    color: '#d53120',
    fontWeight: 'bold'
  },
  goodsBuys: {
    flexDirection: 'row',
    alignItems: 'center'
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
  goodsBuysNum: {
    fontSize: 14,
    color: '#d53120',
    paddingHorizontal: 10
  },
  goodsBuysAdd: {
    fontSize: 24,
    color: '#ccc',
    padding: 5
  },
  goodsBuyChild: {
    fontSize: 14,
    color: '#d53120'
  },
  goodsTips: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  goodsTipsCode: {
    padding: 8,
    backgroundColor: '#d53120'
  },
  cart: {
    height: 60,
    backgroundColor: '#2b2c30',
    flexDirection: 'row',
    paddingLeft: 120,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cartPrice: {
    fontSize: 32,
    color: '#d53120',
    fontWeight: 'bold'
  },
  cartPriceChild: {
    fontSize: 16,
    color: '#d53120'
  },
  cartSubmit: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#d53120',
    borderRadius: 30
  },
  cartSubmitText: {
    fontSize: 16
  },
  cartIcon: {
    position: 'absolute',
    left: 20,
    bottom: 5,
    width: 80,
    height: 80,
    backgroundColor: '#222',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartIconImg: {
    width: 56,
    height: 56
  },
  cartIconNum: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#d53120',
    height: 24,
    minWidth: 24,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  cartList: {
    backgroundColor: '#404040',
    height: 520
  },
  cartListTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#2c2a2d',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden'
  },
  cartListContent: {
    height: 500
  }
})