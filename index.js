import { NativeModules } from 'react-native';
import { JDPushService } from './JDPushService';

const { JDRnPushClient } = NativeModules;

export { JDPushService };
export default JDRnPushClient;
