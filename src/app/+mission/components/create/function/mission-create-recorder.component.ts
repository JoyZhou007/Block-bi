import {Component, OnInit, Inject, Input, HostListener, OnDestroy} from '@angular/core';
import {MissionModelService} from "../../../../shared/services/index.service";
import {DropdownSettings} from "../../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../../dropdown/dropdown-element";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'create-recorder',
  templateUrl: '../../../template/create/function/mission-create-recorder.component.html'
})

export class MissionCreateRecorderComponent implements OnDestroy {

  public recorderList: any = {};

  public recorderArr: Array<any>;

  public recorderData: Array<any>;

  public recorderPsid: any = {};

  public missionCommonList: any = {};

  public selectList: Array<any> = [];

  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public subscription: Subscription;
  private inputDropdownOptions: Array<any> = [];


  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
  }

  constructor(public missionModelService: MissionModelService,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any) {

  }

  //初始化页面后
  ngOnInit() {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
    this.recorderArr = [];
    this.recorderData = [];
    this.recorderList = {
      internal: [],
      cooperator: []
    };
    this.getMissionCommonList();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 处理消息
   * @param data
   */
  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_MEETING_ATTENDEE_CHANGE:
        this.dropdownSettings.group = [];
        this.setRecorderList();
        break;
    }
  }


  /**
   * 获取下拉框选项人员的List
   */
  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.setRecorderList();
      }
    })
  }


  setRecorderList() {
    this.recorderList.cooperator = [];
    this.recorderList.internal = [];
    for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
      let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.selectList, 'id');
      if (isUid) {
        this.recorderList.internal.push(this.missionCommonList.Internal[i]);
      }
    }
    for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
      let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.selectList, 'id');
      if (isUid) {
        this.recorderList.cooperator.push(this.missionCommonList.Cooperator[i]);
      }
    }
    this.getRecorderList(this.recorderList);
  }


  modelChange(data: any) {
    this.recorderArr = data[0];
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = new DropdownSettings();
    }
  }


  @Input() set setParams(param: any) {
    this.selectList = param;
  }

  getRecorderList(param) {
    this.initSettings();
    this.dropdownOptions = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          if (optionData) {
            let tmpModel = new DropdownOptionModel();
            tmpModel.initData({
              id: optionData.uid,
              isCurrent: false,
              label: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
              key: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
              imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : 'NaN',
              group: key,
              desc: optionData.company_name + ' ' + optionData.p_name
            });
            this.dropdownOptions.push(tmpModel);
          }
        }
      }
    }
    for (let i in this.recorderArr) {
      let isUid = this.typeService.isArrayKey(this.recorderArr[i].id, this.dropdownOptions, 'id');
      let k = parseInt(i);
      if (!isUid) {
        this.recorderArr.splice(k, 1);
      }
    }
    this.inputDropdownOptions = this.typeService.clone(this.dropdownOptions);
  }


  /**
   * 获取memo 记录着数据
   */
  getRecorderData() {
    this.recorderData = [];
    for (let i = 0; i < this.recorderArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.recorderPsid);
      a.psid = this.recorderArr[i].id;
      this.recorderData.push(a);
    }
  }


}

