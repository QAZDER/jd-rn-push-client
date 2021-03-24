import { NativeModules } from 'react-native';

export {
  JDPushService,
  startNewConnection,
  closeConnect,
} from './JDPushService';

const { JDRnPushClient } = NativeModules;

export default JDRnPushClient;
