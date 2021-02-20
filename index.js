import { NativeModules } from 'react-native';
import { JDPushService } from './JDPushService';


async function JDPushService() {
  console.log('start www');
}

const { JDRnPushClient } = NativeModules;

export default { JDRnPushClient, JDPushService };
