import codePush from 'react-native-code-push'
import { toast } from './util'
import config from '../config/codePush'


export const systemUploadApp = async () => {

}

export const updateApp = async () => {
  if (__DEV__) {
    return toast('调试模式不可用')
  }
  // 有二进制文件更新则不执行codepush更新
  if (await systemUploadApp()) {
    return
  }
  const update = await codePush.getUpdateMetadata(codePush.UpdateState.PENDING)
  if (update) {
    Taro.showModal({
      title: '提示',
      content: '是否立即重启更新到最新版本'
    }).then(({ confirm }) => {
      confirm && update.install(codePush.InstallMode.IMMEDIATE)
    })
  } else {
    codePush.sync({
      deploymentKey: Platform.OS === 'android' ? config.codePushAndroidKey : config.codePushIosKey,
      updateDialog: {
        appendReleaseDescription: true,
        descriptionPrefix: '',
        mandatoryContinueButtonLabel: '更新',
        mandatoryUpdateMessage: '必须安装的更新',
        optionalIgnoreButtonLabel: '稍后',
        optionalInstallButtonLabel: '安装',
        optionalUpdateMessage: '有可用更新,你要安装它吗?',
        title: '有新版本'
      },
      installMode: codePush.InstallMode.IMMEDIATE,
      mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
      rollbackRetryOptions: {
        delayInHours: 0,
        maxRetryAttempts: 5
      }
    }, status => {
      switch (status) {
        case codePush.SyncStatus.CHECKING_FOR_UPDATE:
          toast('正在检查')
          break
        case codePush.SyncStatus.DOWNLOADING_PACKAGE:
          toast('下载中')
          break
        case codePush.SyncStatus.INSTALLING_UPDATE:
          toast('正在安装')
          break
        case codePush.SyncStatus.UP_TO_DATE:
          toast('已经最新版')
          break
        case codePush.SyncStatus.UPDATE_INSTALLED:
          Taro.showModal({
            title: '提示',
            content: '是否立即重启更新到最新版本'
          }).then(({ confirm }) => {
            confirm && codePush.restartApp()
          })
          break
        case codePush.SyncStatus.SYNC_IN_PROGRESS:
          toast('处理中')
          break
        case codePush.SyncStatus.UPDATE_IGNORED:
          // toast('已经忽略当前版本')
          break
        case codePush.SyncStatus.UNKNOWN_ERROR:
          toast('更新遇到未知错误')
          break
        default:
          toast('错误:' + status)
          break
      }
    }, progress => {
      toast((progress.receivedBytes / 1024 | 0) + 'KB/' + (progress.totalBytes / 1024 | 0) + 'KB')
    }).catch(err => {
      toast(err.message)
    })
  }
}

export const codePushHigh = app => __DEV__ ? app : codePush({
  deploymentKey: Platform.OS === 'android' ? config.codePushAndroidKey : config.codePushIosKey,
  rollbackRetryOptions: {
    delayInHours: 0,
    maxRetryAttempts: 5
  }
})(app)