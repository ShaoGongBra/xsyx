/**
 * 应用配置
 */
 export default {
  /**
   * App Android端 热更新codepush Key
   * 下面4个key值在项目初始化的时候创建，安装运行 codepush-init-android 和 codepush-init-ios 分别获得安卓和ios的发布和测试key，总共4个
   * 运行上面两个命令之前需要正确配置package.json里面的name和codePushAccount两个字段，
   * name是项目名称用作唯一标识，codePushAccount是你当前的账户 通过 appcenter profile list 命令获得的 Username 字段
   */
  codePushAndroidKey: 'U_9nmD5FvUCTGYENXRF_pcLGPG_cxMQ1PHBmT',
  /**
   * App IOS端 热更新codepush Key
   */
  codePushIosKey: 'aLYwVtfNQUm_w5gUVoCimHhph4hAITC1glytE'
}
