import { DeviceEventEmitter } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import BackgroundTimer from 'react-native-background-timer';

import NotificationService from './NotificationService';

/**
 * created by ZhouRd on 2021/2/20
 *
 * 应用启动调用pushService，开始进行webSocket连接(需要token验证)
 * 当连接断开后，每过15分钟会重新连接一次。
 */

let host = '';
let token = '';

let ws;

let connect;

// 定时器id
let timeoutId;

const SHORT_TIME = 5 * 1000;
const LONG_TIME = 15 * 60 * 1000;
let reConnectTime = SHORT_TIME;

async function JDPushService() {
  let connectCount = 0;

  let isFirstLoad = false;

  // 推送消息处理
  function handlingNotification(data) {
    DeviceEventEmitter.emit('handlingPushNotification', data);
  }

  const notification = new NotificationService(handlingNotification);

  // 网络变更事件监听，状态可用时，进行连接(模拟器网络发生变化不生效)
  NetInfo.addEventListener((NetInfoState) => {
    // 应用首次打开为了避免触发，加入连接次数判断
    NetInfoState.isConnected && isFirstLoad
      ? startNewConnection(true)
      : console.log('network is not available');
    isFirstLoad = true;
  })();

  connect = function () {
    if (host && token) {
      // 失败连接次数超过10次,改为15分钟重连
      connectCount > 9
        ? (reConnectTime = LONG_TIME)
        : (reConnectTime = SHORT_TIME);
      ws && ws.readyState === 1 ? ws.close() : '';
      let url = `ws://${host}/websocket/push`;
      ws = new WebSocket(url, null, {
        headers: { Authorization: 'Bearer ' + token },
      });

      ws.onopen = () => {
        // 连接次数清空
        connectCount = 0;
        console.log('webSocket connect success');
      };

      ws.onmessage = ({ data }) => {
        const msgObj = JSON.parse(data);
        const sendBackObj = {
          id: msgObj.id,
          type: msgObj.type,
          user: 12, // 固定
        };
        // 收到消息后，send back，会将该条消息标记为已读
        ws.send(JSON.stringify(sendBackObj));
        // console.log(JSON.stringify(sendBackObj));

        const msgData = {
          subText: msgObj.subTitle || '',
          title: msgObj.title,
          message: msgObj.content,
          bigText: msgObj.content,
        };
        notification.localNotif(msgData);
      };

      ws.onclose = () => {
        console.log('webSocket is close...');
        connectCount++;
        startNewConnection(false);
      };

      ws.onerror = (event) => {
        console.log('websocket error observed: ', event);
      };
    }
  };

  connect();

  // 服务端关闭webSocket onclose不触发，为保持连接每过一分钟发送消息
  BackgroundTimer.setInterval(function () {
    if (ws && ws.readyState === 1) {
      ws.send('');
      console.log('webSocket send keep alive at ' + new Date().toString());
    }
  }, 1000 * 5);
}

/**
 * 重新创建连接，在三种情况下调用:
 * 1. 连接失败后
 * 2. 登陆成功后
 * 3. 网络状态发生改变且变为可用后
 * 2.3 两种情况需清理先前的定时器
 *
 * @param shouldResetTimer
 * @param newHost
 * @param newToken
 */
function startNewConnection(
  shouldResetTimer = false,
  newHost = '',
  newToken = ''
) {
  host = newHost || host;
  token = newToken || token;

  console.log('webSocket try reconnect at ' + new Date().toString());
  if (shouldResetTimer) {
    BackgroundTimer.clearTimeout(timeoutId);
    connect();
  } else {
    timeoutId = BackgroundTimer.setTimeout(function () {
      connect();
    }, reConnectTime);
  }
}

/**
 * 登出或网络变为不可用断开连接
 */
function closeConnect() {
  ws && ws.readyState === 1 ? ws.close() : '';
}

export { JDPushService, closeConnect, startNewConnection };
