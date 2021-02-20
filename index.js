import { NativeModules } from 'react-native';

const { JDRnPushClient } = NativeModules;

async function JDPushService() {
  console.log('JDPushService is called...');
}

export default { JDRnPushClient, JDPushService };
