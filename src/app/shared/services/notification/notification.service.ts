import {Injectable, Inject} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import {NotificationList, NotificationConfigNew} from '../../config/notification.config';
import {Observable} from "rxjs";

@Injectable()
export class NotificationService {
  private defaultModule = 'message';
  // Observable any sources
  private notificationSource: {[key: string]: any} = {};
  // Observable any streams
  private notification: {[key: string]: Subject<any>} = {};
  private moduleList: Array<string>;
  //notification的配置
  public config: NotificationConfigNew;
  //notification 服务模块
  public module: NotificationList;
  public setting: number;


  constructor(@Inject('user-data.service') public userDataService: any) {
    this.module = new NotificationList();
    //TODO 新旧设置迭代更新，逐步废弃旧数据
    this.config = new NotificationConfigNew();
    this.initNotification();
  }


  /**
   * 自动对应全局处理函数
   */
  // dealMessage() {
  //   this.getNotification().subscribe(
  //     (message: any) => {
  //       if (message) {
  //         let fnName = this.config.hasConstant(message.act);
  //         if (fnName) {
  //           if (message.component && fnName) {
  //             message.component[fnName](message.param);
  //           } else if (fnName && typeof this[fnName] === 'function') {
  //             this[fnName](message.param);
  //           } else {
  //             console.warn('没有找到对应处理的函数:' + fnName);
  //           }
  //         } else {
  //           console.warn('act不是可用方法' + message.act);
  //         }
  //       }
  //     });
  // }

  /**
   * 生成notification module list
   */
  initNotification() {
    this.moduleList = this.module.getModule();
    for (let key in this.moduleList) {
      if (!this.notificationSource
        || (this.notificationSource && !this.notificationSource.hasOwnProperty(this.moduleList[key]))) {
        this.notificationSource[this.moduleList[key]] = new Subject<any>();

        this.notification[this.moduleList[key]] =
          this.notificationSource[this.moduleList[key]].asObservable();
      }
    }
  }

  /**
   * 添加新的通知模块
   * @param key
   */
  setNotification(key: string) {
    if (typeof this.notification[key] === 'undefined') {
      this.notificationSource[key] = new Subject<any>();
      this.notification[key] =
        this.notificationSource[key].asObservable();
    }
  }

  /**
   *
   * @param module
   * @returns {any}
   */
  getNotification(module?: string): Observable<any> {
    module = module ? module : this.defaultModule;
    // if (this.notificationSource[module].closed) {
    //   this.setNotification(module);
    // }
    return this.notification[module];
  }

  /**
   * 发送异步消息
   * @param message
   * @param module
   */
  postNotification(message: any, module?: string) {
    module = module ? module : this.defaultModule;
    if (typeof this.notificationSource[module] !== 'undefined') {
      this.notificationSource[module].next(message);
    }
  }

  /**
   * 获取用户登录session
   */
  getUserSession() {
    return this.userDataService.getSessionId();
  }

  cleanNotification() {
    // delete this.notificationSource;
    // delete this.notification;
  }

}




