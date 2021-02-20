import { DeviceEventEmitter } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import BackgroundTimer from 'react-native-background-timer';
import NotificationService from "./NotificationService";

/**
 * created by ZhouRd on 2021/2/20
 *
 * Android 8.0 开机无法启动服务
 * 应用启动调用pushService，开始进行webSocket连接(需要token验证)
 * 当连接断开后，每过15分钟会重新连接一次。
 *
 * 以下情况需要立即进行连接：
 * 1.网络状态改变
 * 2.用户登录状态改变
 */

async function JDPushService() {
  const SHORT_TIME = 5 * 1000;
  const LONG_TIME = 15 * 60 * 1000;
  let reConnectTime = SHORT_TIME;

  // 推送消息处理
  function handlingNotification(data) {
    DeviceEventEmitter.emit('handlingPushNotification', data);
  }

  const notification = new NotificationService(handlingNotification);
  // 定时器id
  let timeoutId;

  // websocket连接地址
  let host;

  let connectCount = 0;

  let ws;

  let isFirstLoad = false;

  // 网络变更事件监听，状态可用时，进行连接(模拟器网络发生变化不生效)
  NetInfo.addEventListener((NetInfoState) => {
    // 应用首次打开为了避免触发，加入连接次数判断
    (NetInfoState.isConnected && isFirstLoad) ? DeviceEventEmitter.emit('immediateConnect') : log.i('network is not available');
    isFirstLoad = true;
  })();

  // 打开连接
  DeviceEventEmitter.addListener('immediateConnect', () => {
    reConnect(true);
  });

  // 关闭连接
  DeviceEventEmitter.addListener('closeConnect', () => {
    ws.close();
  });

  function connect() {
    // 失败连接次数超过6次,改为15分钟重连
    connectCount > 5 ? reConnectTime = LONG_TIME : reConnectTime = SHORT_TIME;
    connectCount++;
    (ws && ws.readyState === 1) ? ws.close() : '';
    ws = new WebSocket(`ws://${host}/websocket/push`, null, {
      headers: { Authorization: 'Bearer ' + window.token }
    });
    // ws = new WebSocket('ws://192.168.10.151:8000');
    log.i('webSocket start connect, connectCount: ' + connectCount, reConnectTime);

    ws.onopen = () => {
      // 连接次数清空
      connectCount = 0;
      log.i('webSocket connect success');
    };

    ws.onmessage = ({ data }) => {
      const msgObj = JSON.parse(data);
      log.i('message data: ', new Date().toString(), msgObj);
      const sendBackObj = {
        id: msgObj.id,
        type: msgObj.type,
        user: 12, // 固定
      };
      // 收到消息后，send back，会将该条消息标记为已读
      ws.send(JSON.stringify(sendBackObj));
      log.i(JSON.stringify(sendBackObj));

      notification._localNotification({
        title: msgObj.title,
        message: msgObj.content,
        extraData: msgObj.sendbody,
      });
    };

    ws.onclose = () => {
      log.e('webSocket is close...');
      reConnect();
    };
  }

  // 初始化host
  function getHost() {
    const rootUrl = Preferences.getPreference(Preferences.KEYS.APP_ROOT_URL_KEY);
    rootUrl ? host = rootUrl.substr(7, rootUrl.length) : log.d('rootUrl is undefined');
  }

  getHost();
  connect();

  // 服务端关闭webSocket onclose不触发，为保持连接每过一分钟发送消息
  BackgroundTimer.setInterval(function () {
    if (ws && ws.readyState === 1) {
      log.i('webSocket send keep alive' + new Date().toString());
      ws.send('');
    }
  }, 1000 * 60);

  /**
   * js setTimeout 不生效
   * 登录、网络变为可用的情况下会立即进行重新连接，此时会清除先前的定时器
   * 登出、网络变为不可用断开连接
   * @param isResetTimer
   */
  this.reConnect = (isResetTimer = false) => {
    log.i('webSocket try reconnect...' + new Date().toString());
    host ? log.d('host init success') : getHost();
    if (isResetTimer) {
      BackgroundTimer.clearTimeout(timeoutId);
      connect();
    } else {
      timeoutId = BackgroundTimer.setTimeout(function () {
        connect()
      }, reConnectTime);
    }
  };
}

export { JDPushService }
