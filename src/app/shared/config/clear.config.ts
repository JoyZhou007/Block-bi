//程序全局配置
import {storeDataKey} from './member.config';

export const clearStoreData : Array<string> = [
	//需要清除聊天数据
	storeDataKey.MESSAGE_MARK_LIST,
	storeDataKey.USER_NOTIFICATION
];