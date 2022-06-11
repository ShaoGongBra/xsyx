import { useEffect, useMemo, useState } from 'react'
import { toast } from './util'

export const router = {
  routers: {},
  current: '',
  use(name, component, option = {}) {
    this.routers[name] = { name, component, option }
    if (!this.current) {
      this.navigate(name)
    }
  },
  navigate(name) {
    if (!this.routers[name]) {
      toast('跳转到一个无效的路由: ' + name)
    } else {
      this.current = name
      this.callbacks.forEach(cb => cb(this.routers[name]))
    }
  },
  callbacks: [],
  onNavigate(cb) {
    this.callbacks.push(cb)
    return () => {
      this.callbacks.splice(this.callbacks.findIndex(cb), 1)
    }
  }
}

const Empty = () => {
  return null
}

export const useRouter = () => {
  const [comp, setComp] = useState(
    router.routers[router.current] ||
    {
      name: '',
      component: Empty,
      option: {}
    }
  )

  useEffect(() => {
    const off = router.onNavigate(data => {
      setComp(data)
    })
    return () => off()
  }, [])

  return comp
}

export const useRouters = () => {

  const arr = useMemo(() => Object.values(router.routers), [])

  return arr
}