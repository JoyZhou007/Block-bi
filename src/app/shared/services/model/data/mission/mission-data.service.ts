/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/1.
 */
import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';

@Injectable()
export class MissionDataService extends UserDataBaseService {
  private KEY_PROJECT_TOKEN:string = 'project_token';
  private KEY_GRNERAL_TOKEN:string = 'general_token';
  constructor(@Inject('store.service') public storeService: any) {
    super(storeService);
  }

  /**
   * 检查是否需要生成token
   * @returns {string | null}
   */
  requestToken(tokenKey:string) : any{
    return this.sessionGetData(tokenKey);
  }

  /**
   * 对于尚未提交的project保存临时用token
   * @param tokenKey
   * @param token
   */
  cacheToken(tokenKey:string, token: string): void {
    this.sessionSetData(tokenKey, token);
  }

  /**
   * 删除临时token
   */
  removeToken(tokenKey:string){
    this.sessionRemoveData(tokenKey);
  }
}
