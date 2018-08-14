import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';

@Injectable()
export class ChatMessageDataService extends UserDataBaseService {

  constructor(@Inject('store.service') public storeService: any,
              @Inject('user-data.service') public userDataService: any) {
    super(storeService);
  }

  /**
   *
   * @param source
   * @param key
   */
  updateChatListCache(source: any, key?: any) {
    if (source) {
      let oldCache = this.getChatListCache();
      if (typeof key !== 'undefined' && oldCache) {
        oldCache[key] = source;
        this.setChatListCache(oldCache);
      } else {
        this.setChatListCache(source);
      }
    }
  }

  getChatListCache(key?: string) {
    let data = this.sessionGetData(UserDataBaseService.storeDataKey.CHAT_GROUP_LIST);
    return key && data && data.hasOwnProperty(key) ? data[key] : data;
  }

  setChatListCache(data: any) {
    this.sessionSetData(UserDataBaseService.storeDataKey.CHAT_GROUP_LIST, data);
  }

  removeChatListCache() {
    this.sessionRemoveData(UserDataBaseService.storeDataKey.CHAT_GROUP_LIST);
  }

  /**
   * 是否初始化过菜单
   */
  getChatHasLoaded() {
    return this.sessionGetData(UserDataBaseService.storeDataKey.CHAT_HAS_LOADED);
  }

  setChatHasLoaded(data: any) {
    this.sessionSetData(UserDataBaseService.storeDataKey.CHAT_HAS_LOADED, data);
  }

  removeChatHasLoaded() {
    this.sessionRemoveData(UserDataBaseService.storeDataKey.CHAT_HAS_LOADED);
  }


}

