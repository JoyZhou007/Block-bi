import {Component, Inject, OnInit, HostListener, Input, Renderer} from '@angular/core';
import {Router} from "@angular/router";
import * as MissionConstant from '../../shared/config/mission.config.ts';
import {MissionModelService} from "../../shared/services/index.service";

@Component({
  selector: 'mission-transfer',
  templateUrl: '../template/mission-transfer.component.html',
  providers: [MissionModelService]
})

export class MissionTransferComponent implements OnInit {

  private userData: any;
  private companyData: any;
  public contactList: any;
  public transferMissionIn: any = {};
  public missionObj: any = {};
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public transferArr: Array<any> = [];
  public missionConstant: any;

  constructor(public missionModelService: MissionModelService,
              public router: Router,
              public renderer:Renderer,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('type.service') public typeService: any) {
    this.missionConstant = MissionConstant;
  }

  //初始化页面后
  ngOnInit() {
    this.init();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.missionObj = data;
      this.gteLastUpdate(this.missionObj.last_update_info);
    }
  };

  init() {
    this.getUserIn();
    this.getContactListIn();
  }

  /**
   * 转让MISSION
   */
  transferTheMission() {
    let data = {
      mid: this.missionObj.mid,
      psid: this.transferMissionIn.transfer
    };
    this.missionModelService.missionTransfer({
      data
    }, (res: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
      if (res.status === 1) {
        this.router.navigate(['mission/list']);
      }
    })
  }

  /**
   * 获取联系人列表
   */
  getContactListIn() {
    this.contactList = this.userDataService.getContactList();
    delete this.contactList['Friend'];
    this.getTransferList(this.contactList);
  }

  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.companyData = this.companyDataService.getLocationCompanyIn();
  }


  modelChange(data: any) {
    this.transferArr = data[0];
    if (data[0] && data[0][0]) {
      this.transferMissionIn.transfer = data[0][0].id;
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

  getTransferList(param: any) {
    this.initSettings();
    this.dropdownOptions = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = {
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          };
          this.dropdownOptions.push(tmpModel);
        }
      }
    }
  }

  /**
   * last update function
   */
  gteLastUpdate(fileQueue: any) {
    //计算最后更新时间与当前时间的差返回相应的显示
    let timeDifference: number = (new Date().getTime() - fileQueue.time_str * 1000) / 1000;
    if (timeDifference >= 365 * 24 * 3600) {
      fileQueue['lastUpdateTemplate'] =  this.translateService.manualTranslate('more than a year ago')
    } else if (timeDifference < 365 * 24 * 3600 && timeDifference >= 30 * 24 * 3600) {
      fileQueue['lastUpdateTemplate'] = Math.floor((timeDifference / (30 * 24 * 3600))).toString() + this.translateService.manualTranslate(' months ago')
    } else if (timeDifference < 30 * 24 * 3600 && timeDifference >= 24 * 3600) {
      fileQueue['lastUpdateTemplate'] = Math.floor((timeDifference / (24 * 3600))).toString() + this.translateService.manualTranslate(' days ago')
    } else if (timeDifference < 24 * 3600 && timeDifference >= 3600) {
      fileQueue['lastUpdateTemplate'] = Math.floor((timeDifference / (3600))).toString() + this.translateService.manualTranslate(' hours ago')
    } else if (timeDifference < 3600 && timeDifference >= 60) {
      fileQueue['lastUpdateTemplate'] = Math.floor((timeDifference / 60)).toString() + this.translateService.manualTranslate(' minutes ago')
    } else {
      fileQueue['lastUpdateTemplate'] = this.translateService.manualTranslate('less than one minute ago')
    }
  }
}
