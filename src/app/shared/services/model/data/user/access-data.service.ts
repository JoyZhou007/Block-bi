import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';
@Injectable()
export class AccessDataService extends UserDataBaseService {

  constructor(@Inject('store.service') public storeService: any) {
    super(storeService);
  }

  /**
   * 记录用户访问链接
   */
  setAccessRouteIn(route: string) {
    let setRouteIn: any = {};
    let routeIn = this.getData(UserDataBaseService.storeDataKey.USER_ACCESS);

    if (routeIn && routeIn.currentRoute !== route) {
      setRouteIn.beforeRoute = routeIn.currentRoute;
      setRouteIn.currentRoute = route;

      this.setData(UserDataBaseService.storeDataKey.USER_ACCESS, setRouteIn);
    }
  }

  /**
   * 获取用户访问信息
   */
  getAccessRouteIn(): any {
    return this.getData(UserDataBaseService.storeDataKey.USER_ACCESS);
  }

}
