import {Injectable, Inject} from '@angular/core';
import {DialogSettings} from "../../../../common/components/dialog/dialog-settings";
import {Router} from "@angular/router";

@Injectable()
export class DialogService {

  constructor(public router: Router,
              @Inject('notification.service') public notificationService: any) {
  }

  /**
   * 打开对话框
   * @param option 对话框选项
   */
  open(option: any) {
    if (option) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-dialog',
          options: option
        }
      });
    }
  }

  /**
   * 打开对话框
   * @param option 对话框选项
   */
  openNew(option: any) {
    if (option) {
      let dialogSettings = new DialogSettings(option);
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-dialog-new',
          options: dialogSettings
        }
      });
    }
  }

  /**
   * 预定义类型
   * confirm框
   * @param option
   * @param confirmEvent
   * @param couldClose
   * @param btnType
   * @param btnText
   */
  openConfirm(option?: any, confirmEvent?: any, couldClose?: boolean, btnType?: string, btnText?: string) {
    if (typeof option === 'undefined') {
      option = {};
    }
    Object.assign(option, {
      mode: '1',
      title: option.hasOwnProperty('title') ? 'Confirm ' + option.title : 'Confirm',
      buttons: [
        {
          type: 'cancel'
        },
        {
          type: btnType ? btnType : 'send',
          btnText: btnText ? btnText : 'CONFIRM',
          couldClose: typeof couldClose != 'undefined' ? couldClose : true,
          btnEvent: confirmEvent ? confirmEvent : ''
        }
      ]
    });
    let dialogSettings = new DialogSettings(option);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }

  /**
   * 预定义类型
   * notice框
   * @param option
   * @param successEvent
   */
  openSuccess(option?: any, successEvent?: Function) {
    if (typeof option === 'undefined') {
      option = {};
    }
    Object.assign(option, {
      mode: '3',
      title: option.hasOwnProperty('title') ? option.title : 'Success',
      modeIcon: 'success',
      buttons: [
        {
          type: 'ok',
          btnEvent: () => {
            if (successEvent) {
              successEvent();
            }
          }
        }
      ]
    });
    let dialogSettings = new DialogSettings(option);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }


  /**
   * 预定义类型
   * warning框
   * @param option
   */
  openWarning(option?: any) {
    if (typeof option === 'undefined') {
      option = {};
    }
    Object.assign(option, {
      mode: '3',
      title: option.hasOwnProperty('title') ? option.title : 'Warning',
      modeIcon: 'warning',
      buttons: [
        {
          type: 'ok'
        }
      ]
    });
    let dialogSettings = new DialogSettings(option);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }

  /**
   * 预定义类型
   * error框
   * @param option
   */
  openError(option?: any) {
    if (typeof option === 'undefined') {
      option = {};
    }
    Object.assign(option, {
      mode: '3',
      title: option.hasOwnProperty('title') ? option.title : 'Error',
      modeIcon: 'error',
      buttons: [
        {
          type: 'ok'
        }
      ]
    });
    let dialogSettings = new DialogSettings(option);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }

  /**
   * 没有登录的警告框
   * @param cleanEvent
   * @param opt
   */
  openNotLoginWarning(cleanEvent: Function, opt?: any) {
    let option = typeof opt === 'undefined' ? {} : opt;
    if (!option.hasOwnProperty('simpleContent') || option.simpleContent == '') {
      option.simpleContent = 'Your system permission has been changed or your session has expired, please re-login';
    }
    let settings = Object.assign(option, {
      mode: '3',
      title: 'Warning',
      modeIcon: 'warning',
      beforeCloseEvent: () => {
        cleanEvent();
        this.router.navigate(['home/login']);
      },
      buttons: [
        {
          type: 'ok'
        }
      ]
    });

    let dialogSettings = new DialogSettings(settings);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }

  /**
   * 没有登录的警告框
   * @param cleanEvent
   * @param opt
   */
  openOtherUserLoginWarning(opt?: any) {
    let option = typeof opt === 'undefined' ? {} : opt;
    if (!option.hasOwnProperty('simpleContent') || option.simpleContent == '') {
      option.simpleContent = 'Other user have logged in , the page will be refreshed';
    }
    let settings = Object.assign(option, {
      mode: '3',
      title: 'Warning',
      beforeCloseEvent: () => {
        window.location.reload();
      },
      buttons: [
        {
          type: 'ok'
        }
      ]
    });
    let dialogSettings = new DialogSettings(settings);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }

  /**
   * 预定义类型
   * 没有权限提示框
   */
  openNoAccess(option?: any) {
    if (typeof option === 'undefined') {
      option = {};
    }
    let needRedirect = true;
    if (this.router.url == '/' || this.router.url == '/user/index') {
      needRedirect = false;
    }
    Object.assign(option, {
      mode: '3',
      title: 'Error',
      modeIcon: 'error',
      simpleContent: 'Sorry, you don\'t have access to this component.',
      beforeCloseEvent: () => {
        if (needRedirect) {
          this.router.navigate(['user/index']);
        }
      },
      buttons: [
        {
          type: 'ok',
          btnEvent: () => {
            if (needRedirect) {
              this.router.navigate(['user/index']);
            }
          }
        }
      ]
    });
    let dialogSettings = new DialogSettings(option);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-dialog-new',
        options: dialogSettings
      }
    });
  }

  /**
   * 关闭对话框
   */
  close() {

  }
}
