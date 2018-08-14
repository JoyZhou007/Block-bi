import {Component, OnInit, Inject, ViewChild, Input} from '@angular/core';
import {UserDataService} from '../../shared/services/index.service';
import {storeDataKey} from '../../shared/config/member.config';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'notification-message',
  templateUrl: '../template/notification-message.component.html',
  providers: [UserDataService]
})
export class NotificationMessageComponent implements OnInit {

  public myNotificationList: Array<any> = [];
  public isNotificationMessage: boolean = false;
  public isShowMailMessage: boolean = false;
  public currentDate: string;
  public prevDate: string;
  private msgType: any;
  public isShowNotification: boolean = false;
  public subscription: Subscription;
  private isEvent: boolean = true;
  private notificationStatusKey: string = storeDataKey.USER_NOTIFICATION_MESSAGE_STATUS;
  private noticeKey: string = storeDataKey.NOTICE_NOTIFICATION;
  private requestKey: string = storeDataKey.USER_NOTIFICATION;
  private bindPagingEvent: boolean;
  private currentMsgType: any;
  private isLoadingMore: boolean;
  private isLoadEnd: boolean = true;
  public isCurrent: boolean = false;
  private currentType: number;
  private cacheData: Array<any> = [];

  constructor(
    @Inject('app.config') public config: any,
    @Inject('user-data.service') public userDataService: any,
    @Inject('page.element') public element: any,
    @Inject('date.service') public dateService: any,
    @Inject('bi-translate.service') public translate: any,
    @Inject('type.service') public typeService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('notification.service') public notificationService: any,
    @Inject('notification-data.service') public notificationDataService,
    @Inject('notification-offLine-message.service') public notificationOffLineMessageService: any) {
    }

  //启动
  ngOnInit() {
    this.subscription = this.notificationService.getNotification().subscribe((data: any) => {
      switch (data.act) {
        case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS:
          let requestId: string = data.data.data.request_id;
          let storeData: any = this.userDataService.getStoreData(storeDataKey.USER_NOTIFICATION);
          let key: number = (this.currentType === 1) ? 1 : 2;
          let userKey: string = this.userDataService.getUserDataKey(key);
          let dataList: any = storeData[userKey];
          this.handleStatus(dataList, requestId);
          this.handleNotificationResult(dataList);
          this.userDataService.setStoreData(storeDataKey.USER_NOTIFICATION, storeData);

          warp:
            for (let key in this.myNotificationList) {
              for (let k in this.myNotificationList[key]) {
                if (k !== 'key') {
                  for (let result in this.myNotificationList[key][k]) {
                    if (this.myNotificationList[key][k][result].data.request_id === data.data.data.request_id) {
                      this.myNotificationList[key][k][result].data.handled = 1;
                      break warp;
                    }
                  }
                }
              }
            }
          break;
        case this.notificationService.config.ACT_NOTICE_SWITCH_COMPANY:
          this.notificationDataService.removeNotificationNoticeData();
          this.notificationDataService.removeNotificationRequestData();
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @ViewChild('notificationMessage') private notificationMessage: any;
  @ViewChild('notificationContent') private notificationContent: any;

  @Input() set noticeType(type: string | number) {
    if (type) {
      this.msgType = type;
      this.dataList(this.msgType);
    }
  }

  /**
   * 处理当前 handled
   * @param list
   * @param requestId
   */
  handleStatus(list: any, requestId: string) {
    for (let k in list) {
      if (list[k].data.request_id === requestId) {
        list[k].data.handled = 1;
        break;
      }
    }
  }

  /**
   * 初始化用户 notification
   */
  initUserNotification() {
    this.isCurrent = false;
    let storeData: any = this.notificationDataService.initNotificationData(storeDataKey.USER_NOTIFICATION, 1, this.currentMsgType);
    if(storeData) {
      let userDataKey: string = this.notificationDataService.userDataKey(1);
      this.handleNotificationResult(storeData[userDataKey]);
    }
  }

  /**
   * 数据列表处理
   * @param msgType
   */
  dataList(msgType: any) {
    this.isLoadingMore = false;
    this.isLoadEnd = false;
    this.currentMsgType = msgType;
    this.myNotificationList = [];
    this.currentSystemDate();
    let type: number = parseInt(this.currentMsgType);

    switch(type) {
      case 1:
        //notice to you from people
        this.currentType = 1;
        this.setNotificationNotice(1);
        break;

      case 2:
        //request to you from people
        this.currentType = 1;
        this.setNotificationRequest(1);
        break;

      case 3:
        //You request people from all function

        break;

      case 4:
        //In mail
        let inMailStoreData: any = this.notificationDataService.initNotificationData(storeDataKey.USER_NOTIFICATION, 1);
        this.handleNotificationResult(inMailStoreData['myMail']);
        break;
    }
  }

  setStoreNotification(type: number, msgType: number) {
    if(msgType === 1) {
      this.setNotificationNotice(type);
    }else if(msgType === 2) {
      this.setNotificationRequest(type);
    }
  }

  /**
   * 设置 notification notice
   */
    setNotificationNotice(form: any, isBool?: boolean) {
    let notice: string = storeDataKey.NOTICE_NOTIFICATION;
    let userDataKey: string = this.notificationDataService.userDataKey(form);
    this.currentType = form;
    if(!userDataKey) {
      this.isEvent = true;
      if (form === 1) {
        this.isCurrent = false;
      } else if (form === 2) {
        this.isCurrent = true;
      }
      this.handleNotificationResult([]);
      return false;
    }
    let noticeStoreData: Array<any> = this.notificationDataService.initNotificationData(notice, form, 1);
    let lastDocId: string = '';
    let len: Array<any> = noticeStoreData[userDataKey];
    if (len.length > 0) {
      lastDocId = noticeStoreData[userDataKey][len.length - 1]['data'].notice_id;
    }
    if(len.length === 0 || isBool) {
      this.notificationOffLineMessageService.getNoticeNotification(lastDocId, form, (result: any) => {
        let getData: Array<any> = noticeStoreData[userDataKey];
        noticeStoreData[userDataKey] = getData.concat(result);
        this.handleNotificationResult(noticeStoreData[userDataKey]);
        this.userDataService.setStoreData(notice, noticeStoreData, true);
        this.isEvent = true;
        if (form === 1) {
          this.isCurrent = false;
        } else if (form === 2) {
          this.isCurrent = true;
        }
        if(isBool) {
          if(result.length === 0) {
            this.isLoadEnd = true;
          }
          setTimeout(() => {
            this.isLoadingMore = false;
          }, 1000);
        }
      });
    }else {
      this.handleNotificationResult(noticeStoreData[userDataKey]);
      this.isEvent = true;
      if (form === 1) {
        this.isCurrent = false;
      } else if (form === 2) {
        this.isCurrent = true;
      }
    }
  }

  /**
   * 存储 notification request
   * @param form 获取列表类型 1 个人 2 公司 不传所有
   * @param isBool
   *
   * {
   *  //uuid 数据列表
   *  "a369e33b9e810bc389cadce7b80b950b": [{act: 103040, data: {}}],
   *
   *  //psid 数据列表
   *  "404": [{act: 103040, data: {}}]
   *
   *  //站内信列表
   *  "myMail": [],
   *
   *  //自己发送数据列表
   *  "mySendList": [{act: 103040, data: {}}]
   * }
   *
   */
  setNotificationRequest(form: number, isBool?: boolean) {
    if(this.isEvent) {
      this.isEvent = false;
      this.currentType = form;
      let userDataKey: string = this.notificationDataService.userDataKey(form);
      if(!userDataKey) {
        this.isEvent = true;
        if (this.currentType === 1) {
          this.isCurrent = false;
        } else if (this.currentType === 2) {
          this.isCurrent = true;
        }
        this.handleNotificationResult([]);
        return false;
      }
      let storeData: any = this.notificationDataService.initNotificationData(storeDataKey.USER_NOTIFICATION, form, 2);
      let userData: Array<any> = storeData[userDataKey];
      let lastDocId: string = '';
      if (userData.length > 0) {
        let len: number = userData.length;
        lastDocId = userData[len - 1].data.request_id;
      }
      if (userData.length === 0 || isBool) {
        this.notificationOffLineMessageService.getRequestNotification(lastDocId, form, (result: any) => {
          storeData[userDataKey] = userData.concat(result);
          this.handleNotificationResult(storeData[userDataKey]);
          this.userDataService.setStoreData(storeDataKey.USER_NOTIFICATION, storeData);
          this.isEvent = true;
          if (form === 1) {
            this.isCurrent = false;
          } else if (form === 2) {
            this.isCurrent = true;
          }
          if(isBool) {
            if(result.length === 0) {
              this.isLoadEnd = true;
            }
            setTimeout(() => {
              this.isLoadingMore = false;
            }, 1000);
          }
        })
      }else {
        this.handleNotificationResult(storeData[userDataKey]);
        this.isEvent = true;
        if (form === 1) {
          this.isCurrent = false;
        } else if (form === 2) {
          this.isCurrent = true;
        }
      }
    }
  }

  /**
   * 获取系统当前日期
   */
  currentSystemDate() {
    let myDate: any = new Date();
    let getYear: string = myDate.getFullYear();
    let getMonth = myDate.getMonth() + 1;
    let getDate = myDate.getDate();
    getMonth = getMonth < 10 ? '0' + getMonth : getMonth;
    getDate = getDate < 10 ? '0' + getDate : getDate;
    this.currentDate = getYear + '-' + getMonth + '-' + getDate;
    this.prevDate = getYear + '-' + getMonth + '-' + (getDate - 1);
  }

  /**
   *
   * this.myNotificationList = [
   *  {2015-05-13: [{a: 1, b: 2}]},
   *  {2015-05-14: [{a: 1, b: 2}]},
   *  {2015-05-15: [{a: 1, b: 2}]}
   * ]
   *
   */

  /**
   * 处理结果
   * @param result
   */
  handleNotificationResult(result: any) {
    this.myNotificationList = [];
    let notificationTimeObj: any = {};
    let isFlag: boolean = true;
    this.cacheData = this.typeService.clone(result);
    for (let list in result) {
      let ts: string = this.dateService.formatWithTimezone(result[list].obj.ts, 'yyyy-mm-dd');
      //let a: any = this.dateService.formatLocalDate(result[list].obj.time, false, 'yyyy-mm-dd');
      let newNotificationObj: any = this.typeService.clone(notificationTimeObj);
      newNotificationObj['key'] = ts;
      if (this.typeService.getDataLength(this.myNotificationList) > 0) {
        for (let key in this.myNotificationList) {
          if (this.myNotificationList[key]['key'] === ts) {
            this.myNotificationList[key][ts].unshift(result[list]);
            isFlag = false;
            break;
          } else {
            isFlag = true;
          }
        }
        if (isFlag) {
          newNotificationObj[ts] = [];
          newNotificationObj[ts].unshift(result[list]);
          this.myNotificationList.unshift(newNotificationObj);
        }
      } else {
        newNotificationObj[ts] = [];
        newNotificationObj[ts].push(result[list]);
        this.myNotificationList.push(newNotificationObj);
      }
    }

    if (this.typeService.getDataLength(this.myNotificationList) > 1) {
      //notification 按时间排序
      let newMyNotificationList: Array<any> = [];
      for (let key in this.myNotificationList) {
        let time: number = this.arrayValPush(this.myNotificationList[key]['key'].split('-'));
        if (this.typeService.getDataLength(newMyNotificationList) > 0) {
          for (let k in newMyNotificationList) {
            let firstTime: number = this.arrayValPush(newMyNotificationList[0]['key'].split('-'));
            let currTime: number = this.arrayValPush(newMyNotificationList[k]['key'].split('-'));
            let prevTime: number = 0;
            if (parseInt(k) - 1 >= 0) {
              prevTime = this.arrayValPush(newMyNotificationList[parseInt(k) - 1]['key'].split('-'));
            }
            if (time > firstTime) {
              newMyNotificationList.unshift(this.myNotificationList[key]);
              break;
            } else if ((time > currTime) && (time < prevTime)) {
              newMyNotificationList.splice((parseInt(k) - 1), 0, this.myNotificationList[key]);
              break;
            } else {
              newMyNotificationList.push(this.myNotificationList[key]);
              break;
            }
          }
        } else {
          newMyNotificationList.push(this.myNotificationList[key]);
        }
      }
      this.myNotificationList = newMyNotificationList;
    }
    this.isShowNotification = (this.typeService.getDataLength(this.myNotificationList) > 0);
  }

  /**
   * 数组值相加
   * @param arr
   */
  arrayValPush(arr: Array<any>): number {
    let val: string = '';
    for (let k in arr) {
      val += arr[k];
    }
    return parseInt(val);
  }

  /**
   * 添加到左边 notification message 列表中
   * @param data
   */
  addMyNotification(data: any) {
    let isBool: boolean;
    isBool = this.notificationDataService.filterNotification(data);
    if((!isBool && (this.currentType === 2) && (this.currentMsgType === 2) && (data.obj.msgType !== '')) ||
      (isBool && (this.currentType === 1) && (this.currentMsgType === 1) && (data.obj.msgType !== 'request')) ||
      this.currentMsgType === 4) {
      this.cacheData.push(data);
      this.handleNotificationResult(this.cacheData);
    }
  }

  /**
   * 清除notification
   */
  clearNotification() {
    let msg: string = (this.msgType === 1) ? 'notice' : 'request';
    if (this.msgType === 1) {
      msg = this.translate.manualTranslate('notice to you from people');
    } else if (this.msgType === 2) {
      msg = this.translate.manualTranslate('request to you from people');
    } else if (this.msgType === 3) {
      msg = this.translate.manualTranslate('You request people from all function');
    } else if (this.msgType === 4) {
      msg = this.translate.manualTranslate('In mail');
    }
    let settings = {
      mode: '1',
      title: 'REMOVE NOTIFICATION',
      isSimpleContent: true,
      simpleContent: this.translate.manualTranslate('Are you sure to clean ') + msg,
      buttons: [
        {type: 'cancel'},
        {
          btnEvent: () => {
            switch (this.msgType) {
              case 1:
                let sessionStoreData: any = this.userDataService.getStoreData(storeDataKey.NOTICE_NOTIFICATION, true);
                if (sessionStoreData) {
                  sessionStoreData = [];
                  this.userDataService.setStoreData(storeDataKey.NOTICE_NOTIFICATION, sessionStoreData, true);
                }
                break;
              default:
                let storeData: any = this.userDataService.getStoreData(storeDataKey.USER_NOTIFICATION);
                if (storeData) {
                  if (this.msgType === 3) {
                    storeData['mySendList'] = [];
                  } else if (this.msgType === 4) {
                    storeData['myMail'] = [];
                  } else {
                    let userDataKey: string = this.notificationDataService.userDataKey(this.currentType);
                    storeData[userDataKey] = [];
                  }
                }
                this.userDataService.setStoreData(storeDataKey.USER_NOTIFICATION, storeData);
                break;
            }
            this.myNotificationList = [];
          },
          type: 'delete'
        }
      ]
    };
    this.dialogService.openNew(settings);
  }

  hideNotificationMessage() {
    if (this.element.hasClass(this.notificationMessage.nativeElement, 'h-me-noti-an')) {
      this.isNotificationMessage = false;
    }
  }

  /**
   * 显示 notification message
   */
  showNotificationMessage() {
    if (!this.element.hasClass(this.notificationMessage.nativeElement, 'h-me-noti-an')) {
      this.isNotificationMessage = true;
    }
  }

  /**
   * 收缩notification
   * @param element
   */
  notificationToggleBut(element: any) {
    if (this.element.hasClass(element, 'h-me-noti-h')) {
      //let nodes: any = this.element.getElementChildTag(element, 'dd');
      //let calcHeight: number = this.element.getChildValue(nodes, 52, {height: 'height', borderBottom: 'border-bottom'});
      //this.renderer.setElementStyle(element, 'height', calcHeight + 'px');
      this.element.setClass(element, '', 'h-me-noti-h');
    } else {
      //this.renderer.setElementStyle(element, 'height', '52px');
      this.element.setClass(element, 'h-me-noti-h', '');
    }
  }

  /**
   * 获取 notification 状态
   */
  getNotificationMessageStatus(isBool?: boolean, type?: number) {
    let storeData: any = this.notificationDataService.initNotificationMessageStatus();
    if (isBool && storeData) {
      if (type === 1) {
        storeData.notice = false;
      } else if (type === 2) {
        storeData.request = false;
      } else if (type === 4) {
        storeData.isMail = false;
      }
      this.userDataService.setPersonalData(this.notificationStatusKey, storeData, 0, false);
    }
    return storeData ? storeData : {};
  }


  /**
   * 向下滚动加载更多数据
   */
  ngAfterViewChecked(): void {
    if (this.notificationContent) {
      let element = this.notificationContent.nativeElement;
      if (!this.bindPagingEvent && element) {
        this.mouseWheelFunc(element);
        this.bindPagingEvent = true;
      }
    }
  }

  /**
   * 滚轮事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    //标准浏览器
    ele.addEventListener('mousewheel', (event: any) => {
      if (event.wheelDelta < 0
        && this.notificationContent.nativeElement.scrollTop
        === this.notificationContent.nativeElement.scrollHeight - this.notificationContent.nativeElement.clientHeight
        && !this.isLoadingMore && !this.isLoadEnd) {
        this.loadMoreNotificationFromApi();
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      if (event.detail > 0
        && this.notificationContent.nativeElement.scrollTop
        === this.notificationContent.nativeElement.scrollHeight - this.notificationContent.nativeElement.clientHeight
        && !this.isLoadingMore && !this.isLoadEnd) {
        this.loadMoreNotificationFromApi();
      }
    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      if (event.wheelDelta < 0 &&
        this.notificationContent.nativeElement.scrollTop
        === this.notificationContent.nativeElement.scrollHeight - this.notificationContent.nativeElement.clientHeight
        && !this.isLoadingMore && !this.isLoadEnd) {
        this.loadMoreNotificationFromApi();
      }
    });
  }

  /**
   * 加载更多notification
   */
  loadMoreNotificationFromApi() {
    this.isLoadingMore = true;
    if (this.currentMsgType == 1) {
      this.setNotificationNotice(this.currentType, true);
    } else if (this.currentMsgType == 2) {
      this.setNotificationRequest(this.currentType, true);
    }
  }

  /**
   * 按照天清除通知
   * @param event
   * @param key 当前天的时间
   * @param notificationList
   * @returns {boolean}
   */
  clearNotificationByDay(event: any, key: any, notificationList: any) {
    event.stopPropagation();
    let storeData: any;
    let newStoreData: Array<any> = [];
    let isBool: boolean = (this.msgType === 1);
    let dataKey: string = isBool ? storeDataKey.NOTICE_NOTIFICATION : storeDataKey.USER_NOTIFICATION;
    let userKey: string;

    storeData = this.notificationDataService.getStoreData(dataKey, isBool);
    if(!storeData) {
      return false;
    }
    if(this.currentMsgType === 4) {
      storeData['myMail'] = [];
    }else {
      userKey = this.notificationDataService.userDataKey(this.currentType === 1 ? 1 : 2);
      for (let i in storeData[userKey]) {
        let ts: string = this.dateService.formatWithTimezone(storeData[userKey][i].obj.ts, 'yyyy-mm-dd');
        if (ts != key) {
          newStoreData.push(storeData[userKey][i]);
        }
      }
    }
    storeData[userKey] = newStoreData;
    this.cacheData = newStoreData;
    this.userDataService.setStoreData(dataKey, storeData, isBool);
    for (let i in notificationList) {
      if (notificationList[i].key == key) {
        notificationList.splice(parseInt(i), 1);
      }
    }
  }
}
