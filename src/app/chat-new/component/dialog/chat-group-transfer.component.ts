/**
 * Created by allen shan(allen.shan@blockbi.com)
 * on 2017/5/18.
 */
import {AfterViewInit, Component, Inject, Input} from "@angular/core";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {Subscription} from "rxjs";


@Component({
  selector: 'chat-group-transfer',
  templateUrl: '../../template/dialog/chat-group-transfer.component.html'
})

export class ChatGroupTransferComponent implements AfterViewInit {
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public transferGroupInfo: any = {};
  public groupMember: Array<any> = [];
  public selectMember: any = {};
  private subscription: Subscription;


  constructor(public chatModelService: ChatModelService,
              @Inject('im.service') public chatService: any,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_GROUP_TRANSFER) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Transfer failed!' : ''};
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }

    });

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {

  }


  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.transferGroupInfo = data.currentItem;
      this.groupMember = data.groupMember;
      this.removeSelf(this.groupMember);
    }
  };


  /**
   * 下拉菜单去除掉自己
   */
  removeSelf(member: any) {
    for (let i in member) {
      if (member[i].uid === this.userDataService.getCurrentUUID()
        || member[i].uid === this.userDataService.getCurrentCompanyPSID()) {
        member.splice(parseInt(i), 1);
      }
    }
    this.setTransferMemberList(member);
  }


  setTransferMemberList(param: any) {
    this.initSettings();
    this.dropdownSettings.group.push({key: 'Group', title: 'Group member'});
    let optionDataArr = param;
    for (let i in optionDataArr) {
      let optionData = optionDataArr[i];
      let tmpModel = {
        id: optionData.uid,
        isCurrent: false,
        label: optionData.work_name,
        key: optionData.work_name,
        imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
        group: 'Group'
      };
      this.dropdownOptions.push(tmpModel);
    }
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = {
        enableSearch: true,
        enableTab: false,
        isMultiple: false,
        group: [],
        delBtnClass: 'font-remove'
      };
    }
  }


  /**
   * 下拉菜单联动选项 People
   * @param data
   */
  modelChange(data: any) {
    if (data[0]) {
      this.selectMember = data[0][0];
    }
  }


  /**
   * 点击像IM发送转让群主
   */
  transferGroup() {
    this.chatService.sendTransferGroup({
      gid: this.transferGroupInfo.gid,
      form: this.transferGroupInfo.form,
      receiver: this.selectMember.id,
    })
    ;
  }


}