/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/25.
 */
import {Inject, Injectable} from '@angular/core';
import {
  Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import {storeDataKey} from '../shared/config/member.config';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
              @Inject('bi-translate.service') public translateService,
              @Inject('user.service') public userService) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot) {
    let result = false;
    try {
      localStorage.setItem('test', '1');
      localStorage.removeItem('test');
    } catch (e) {
      alert(this.translateService.manualTranslate('You are in private browsing mode, our system not support.'));
      return false;
    }
    if (localStorage.getItem(storeDataKey.USER_SESSION_ID) || sessionStorage.getItem(storeDataKey.USER_SESSION_ID)) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    if (state.url !== '/' && state.url !== '/user/logout') {
      this.router.navigate(['home/login'], {queryParams: {returnUrl: state.url}});
    } else {
      this.router.navigate(['home/login']);
    }
    return result;
  }
}