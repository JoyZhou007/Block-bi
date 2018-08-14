import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { BrowserDomAdapter } from "@angular/platform-browser/src/browser/browser_adapter";
import { UserModelService } from "../../../shared/services/model/user-model.service";

/**
 * Created by joyz on 2017/8/3.
 */

@Component({
  selector: 'invite-people',
  templateUrl: '../../template/dialog/user-invite-people-dialog.html',
})

export class UserInvitePeopleDialogComponent implements OnInit, AfterViewInit {
  public emailList: string [] = [];

  public inviteList: Array<{ email: string, errorText: string }> = [{email: '', errorText: ''}];

  constructor(public userModelService: UserModelService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService,
              @Inject('dialog.service') public dialogService: any,) {

  }

  ngOnInit(): void {
  }

  @Input('setOption')
  public set setOption(data: any) {
    this.resetData();
  }

  ngAfterViewInit(): void {
  }

  /**
   * 点击添加邀请人输入框
   * @param {MouseEvent} event
   */
  public clickAddInvitees(event: MouseEvent): void {
    event.stopPropagation();
    this.inviteList.push({email: '', errorText: ''});
  }

  /**
   *  点击删除邀请人框
   * @param {MouseEvent} event
   * @param {number} i
   */
  public clickDeleteInput(event: MouseEvent, i: number): void {
    event.stopPropagation();
    if (this.inviteList.hasOwnProperty(i)) {
      this.inviteList.splice(i, 1);
    }
  }

  /**
   * 点击发送
   */
  public sendData() {
    if (!this.checkValid()) {
      return false;
    } else {
      this.removeRepeat();
      let formData = [];
      formData = this.emailList.map((value) => {
        return {email: value};
      });
      this.userModelService.invitePeoples({
        data: formData,
        lang: this.userDataService.getLanguageNum()
      }, (response: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: response
        });
        if (response.status === 1) {
          // this.inviteList = [{email: '', errorText: ''}];
          this.emailList = [];
        } else {
          // this.inviteList = [{email: '', errorText: ''}];
          this.emailList = [];
        }
      })
    }
  }

  public inputBlur(email: string) {
    let regEmail = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
    if (!email) {
      return {
        valid: false,
        errorText: 'email is required'
      };
    } else if (!regEmail.test(email)) {
      return {
        valid: false,
        errorText: 'email is invalid'
      };
    } else {
      return {
        valid: true,
        errorText: ''
      };
    }
  }

  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  checkValid() {
    let result = true;
    let arr = [];
    this.inviteList.forEach((value, index, array) => {
      if (value.email) {
        arr.push(value);
      }
    });
    if (!arr.length) {
      arr = [{email: '', errorText: ''}];
      result = false;
    }
    this.inviteList = arr;

    this.inviteList.forEach((value, index, array) => {
      if (!this.inputBlur(value.email.trim()).valid) {
        result = false;
        value.errorText = this.inputBlur(value.email).errorText;
      }
    });

    return result;
  }

  /**
   * 去掉重复的email
   */
  private removeRepeat() {
    //去掉 重复
    this.emailList = this.inviteList.map((value) => {
      return value.email.trim();
    });
    this.emailList = this.emailList.filter((value, index, array) => {
      return array.indexOf(value) === index;
    });
  }

  /**
   * 重置数据
   */
  private resetData(): void {
    this.inviteList = [{email: '', errorText: ''}];
    this.emailList = [];
  }
}