export const noop = () => { }

export const strToDate = dateStr => {
  const reCat = /(\d{1,4})/gm
  return new Date(...dateStr.match(reCat).map((item, index) => index === 1 ? --item : item))
}

export const asyncTimeOut = time => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time)
  })
}

export const endTime = (time, formatStr = 'd天H时M分S秒', isEndTime = false, getAll = false) => {
  if (isEndTime) {
    time = (time - (new Date()).getTime())
  }
  time = Math.max(0, time)
  // 补全
  const completion = (number, length = 2) => {
    if (length === 2) {
      return `${number > 9 ? number : '0' + number}`
    } else {
      return `${number > 99 ? number : number > 9 ? '0' + number : '00' + number}`
    }
  }

  const data = {
    d: Math.floor(time / 1000 / 86400),
    h: Math.floor(time / 1000 / 3600 % 24),
    m: Math.floor(time / 1000 / 60 % 60),
    s: Math.floor(time / 1000 % 60),
    ms: Math.floor(time % 1000)
  }
  if (getAll) {
    return data
  }
  return formatStr
    .replace('d', data.d)
    .replace('D', completion(data.d))

    .replace('h', data.h)
    .replace('H', completion(data.h))

    .replace('ms', data.ms)
    .replace(/Ms|mS|MS/, completion(data.ms, 3))

    .replace('m', data.m)
    .replace('M', completion(data.m))

    .replace('s', data.s)
    .replace('S', completion(data.s))
}

export class CountDown {
  // 剩余时间
  time = 0
  // 格式化类型
  formatStr
  onFunc = null
  // 监听时间
  onTime(func) {
    this.onFunc = func
  }
  // 监听倒计时结束
  stopFunc = null
  onStop(func) {
    this.stopFunc = func
  }
  // 定时器
  timer = null
  // 开始倒计时
  async start(time, formatStr, isEndTime = false, interval = 1000) {
    const now = (new Date()).getTime()
    if (this.timer) {
      this.stop()
    }
    let oldTime = time
    if (isEndTime) {
      oldTime = time - now
    }
    this.formatStr = formatStr
    // 时间余数 保证在最后一下执行刚好时间结束
    const remainder = oldTime % interval
    this.time = oldTime - remainder
    this.onFunc && this.onFunc(endTime(this.time, this.formatStr))
    await asyncTimeOut(remainder)
    let mark = 0
    this.timer = setInterval(() => {
      this.time -= interval
      if (this.time <= 0) {
        this.stop()
        this.stopFunc && this.stopFunc()
        return
      }
      this.onFunc && this.onFunc(endTime(this.time, this.formatStr))
      // 每执行5次重新执行定时器，防止定时器出现偏差
      if (isEndTime && mark === 5 && this.time > 3000) {
        this.start(time, formatStr, isEndTime, interval)
        return
      }
      mark++
    }, interval)
  }

  // 停止执行
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}