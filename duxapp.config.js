
const config = {
  /**
   * 热更新上传控制
   * 安卓和ios独立控制 设置common为公共参数
   * {
   *  token：账户设置中心生成的token
   *  account：上传的账号
   *  version：当前代码需要的原生app版本
   *  name：appcenter上的应用名称 不填写默认为package.json的 name + '-' + (ios或者android)
   * }
   */
  codePush: {
    common: {
      token: '09a115a7a099eafe25f32fcf5281ac257aa25aff',
      account: 'xj908634674-live.com',
      version: '^1.0.0'
    },
    android: {},
    ios: {}
  }
}

module.exports = config
