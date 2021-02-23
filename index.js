import { NativeModules } from 'react-native';
export { JDPushService, closeConnect, startNewConnection } from './JDPushService';

const { JDRnPushClient } = NativeModules;

export default JDRnPushClient;
