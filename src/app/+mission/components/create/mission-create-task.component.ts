import {Component, OnInit, Inject, EventEmitter, Output} from '@angular/core';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import * as MissionConstant from '../../../shared/config/mission.config.ts';
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../dropdown/dropdown-element";


@Component({
  selector: 'mission-create-task',
  templateUrl: '../../template/create/mission-create-task.component.html'
})

export class MissionCreateTaskComponent {

  public createTaskData: any;
  public isOpenBidding: boolean = false;
  public psidObj: any = {};
  //operator下拉菜单选项
  public operatorList: any = {};
  public operatorDropdownSettings: any;
  public operatorDropdownOptions: Array<any>;
  public operatorArr: Array<any> = [];
  public operatorData: Array<any> = [];
  // approve下拉菜单选项
  public approveList: any = {};
  public approveDropdownSettings: any;
  public approveDropdownOptions: Array<any>;
  public approveArr: Array<any> = [];
  public approveData: Array<any> = [];

  //Bidder下拉菜单
  public bidderList: any = {};
  public bidderDropdownSettings: any;
  public bidderDropdownOptions: Array<any>;
  public bidderArr: Array<any> = [];
  public bidderData: Array<any> = [];
  public isApprover: boolean = true;
  public missionCommonList: any = {};
  public publisherId: string = MissionConstant.MISSION_USER_IDENTITY_APPROVER;

  @Output() public doCalculationMember = new EventEmitter<any>();
  private currentPublishRole: string = 'APPROVER';

  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              public missionModelService: MissionModelService) {
  }


  //初始化页面后
  ngOnInit() {
    this.createTaskData = {
      missionDescription: ''
    };
    this.getCommonList();
  }

  /**
   * 获取下拉框选项人员的Lsit
   */
  getCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = this.typeService.clone(data.data);
        let userInfo: any = this.userDataService.getUserIn();
        //初始化自己用户对象 插入下拉选项列表
        this.approveList = this.typeService.clone(data.data);
        this.operatorList = this.typeService.clone(data.data);
        this.bidderList = this.typeService.clone(data.data);
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({
          isCurrent: true,
          label: userInfo.user.work_name?userInfo.user.work_name:userInfo.user.p_name,
          key: userInfo.user.work_name?userInfo.user.work_name:userInfo.user.p_name,
          desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
          imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
          group: 'Internal',
          id: this.userDataService.getCurrentCompanyPSID()
        });
        this.approveArr.push(tmpModel);
        this.getApproveList();
        this.getOperatorList();
        this.getBidderList();
      }
    })
  }


  /**
   * approver下拉框设置
   */
  getApproveList() {
    let param = this.approveList;
    this.initApproveSettings();
    let temArr: Array<any> = [];
    this.approveDropdownOptions = [];
    this.approveDropdownSettings.group = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.approveDropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name ? optionData.work_name : optionData.p_name,
            key: optionData.work_name ? optionData.work_name : optionData.p_name,
            desc: optionData.company_name + ' ' + optionData.p_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          });
          temArr.push(tmpModel);
        }
      }
    }
    for (let i in temArr) {
      let isUid = this.typeService.isArrayKey(temArr[i].id, this.approveArr, 'id');
      if (isUid) {
        temArr[i].isCurrent = true;
      }
    }
    this.approveDropdownOptions = this.typeService.clone(temArr);
  }

  approveModelChange(data: any) {
    this.approveArr = data[0];
    this.doJudgeCanEditApprove();
    this.calculationOtherGroup('approve');
  }

  initApproveSettings() {
    if (typeof this.approveDropdownSettings === 'undefined') {
      this.approveDropdownSettings = new DropdownSettings({
        removeEvent: (param: any) => {
          if (param.id == this.userDataService.getCurrentCompanyPSID()) {
            let settings = {
              title: 'Notice!',
              isSimpleContent: true,
              simpleContent: 'As approver, you can not remove yourself!'
            };
            this.dialogService.openWarning(settings);
            return false;
          } else {
            return true;
          }
        }
      });
      this.approveDropdownSettings.isMultiple = true;
    }
  }

  /**
   * operator下拉框设置
   */

  getOperatorList() {
    let param = this.operatorList;
    this.initOperatorSettings();
    this.operatorDropdownOptions = [];
    this.operatorDropdownSettings.group = [];
    let temArr: Array<any> = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.operatorDropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name ? optionData.work_name : optionData.p_name,
            key: optionData.work_name ? optionData.work_name : optionData.p_name,
            desc: optionData.company_name + ' ' + optionData.p_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          });
          temArr.push(tmpModel);
        }
      }
    }
    for (let i in temArr) {
      let isUid = this.typeService.isArrayKey(temArr[i].id, this.operatorArr, 'id');
      if (isUid) {
        temArr[i].isCurrent = true;
      }
    }
    this.operatorDropdownOptions = this.typeService.clone(temArr);
  }

  operatorModelChange(data: any) {
    this.operatorArr = data[0];
    this.calculationOtherGroup('operator');
    this.doCalculationMember.emit(this.operatorArr);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_TASk_OPERATOR_CHANGE,
      data: this.operatorArr
    });
  }

  initOperatorSettings() {
    if (typeof this.operatorDropdownSettings === 'undefined') {
      this.operatorDropdownSettings = new DropdownSettings({
        removeEvent: (param: any) => {
          if (param.id == this.userDataService.getCurrentCompanyPSID()) {
            let settings = {
              title: 'Notice!',
              isSimpleContent: true,
              simpleContent: 'As operator, you can not remove yourself!'
            };
            this.dialogService.openWarning(settings);
            return false;
          } else {
            return true;
          }
        }
      });
      this.operatorDropdownSettings.isMultiple = true;
    }
  }

  /**
   * bidder相关的function
   */
  getBidderList() {
    let param = this.bidderList;
    this.initBidderSettings();
    this.bidderDropdownOptions = [];
    this.bidderDropdownSettings.group = [];
    let temArr: Array<any> = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.bidderDropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name ? optionData.work_name : optionData.p_name,
            key: optionData.work_name ? optionData.work_name : optionData.p_name,
            desc: optionData.company_name + ' ' + optionData.p_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          });
          temArr.push(tmpModel);
        }
      }
    }
    for (let i in temArr) {
      let isUid = this.typeService.isArrayKey(temArr[i].id, this.bidderArr, 'id');
      if (isUid) {
        temArr[i].isCurrent = true;
      }
    }
    this.bidderDropdownOptions = this.typeService.clone(temArr)
  }

  bidderModelChange(data: any) {
    this.bidderArr = data[0];
    this.calculationOtherGroup('bidder');
  }

  initBidderSettings() {
    if (typeof this.bidderDropdownSettings === 'undefined') {
      this.bidderDropdownSettings = new DropdownSettings();
      this.bidderDropdownSettings.isMultiple = true;
    }
  }

  /**
   * @param
   * 切换发布者身份
   */
  switchPublisherId(param: string) {
    if (param == this.currentPublishRole) return;
    let userInfo: any = this.userDataService.getUserIn();
    this.currentPublishRole = param;
    if (param === 'APPROVER') {
      this.isApprover = true;
      this.publisherId = MissionConstant.MISSION_USER_IDENTITY_APPROVER;
      let tmpModel = new DropdownOptionModel();
      tmpModel.initData({
        isCurrent: true,
        label: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
        key: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
        desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
        imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
        group: 'Internal',
        id: this.userDataService.getCurrentCompanyPSID()
      });
      let approveArr: any = this.typeService.clone(this.approveArr);
      approveArr.push(tmpModel);
      this.approveArr = this.typeService.clone(approveArr);
      for (let i in this.operatorArr) {
        if (this.operatorArr[i].id == this.userDataService.getCurrentCompanyPSID()) {
          this.operatorArr.splice(parseInt(i), 1)
        }
      }
      this.calculationOtherGroup('approve');
    } else if (param === 'OPERATOR') {
      this.isApprover = false;
      this.publisherId = MissionConstant.MISSION_USER_IDENTITY_OPERATOR;
      //任务发布者 角色切换成 OPERATOR
      let tmpModel = new DropdownOptionModel();
      tmpModel.initData({
        isCurrent: true,
        label: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
        key: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
        desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
        imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
        group: 'Internal',
        id: this.userDataService.getCurrentCompanyPSID()
      });
      let operatorArr: any = this.typeService.clone(this.operatorArr);
      operatorArr.push(tmpModel);
      this.operatorArr = this.typeService.clone(operatorArr);
      for (let i in this.approveArr) {
        if (this.approveArr[i].id == this.userDataService.getCurrentCompanyPSID()) {
          this.approveArr.splice(parseInt(i), 1)
        }
      }
      this.calculationOtherGroup('operator');
    }
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_TASK_PUBLISHER_IDENTITY_CHANGE,
      data: this.isApprover
    });
  }


  /**
   * 判断是否开启了bidding
   */
  doJudgeBidding(data: any) {
    this.isOpenBidding = data;
  }

  /**
   * 判断最后一个bidder人员的值不可以输入
   */
  doJudgeCanEditApprove() {
    if (this.approveArr.length > 1) {
      this.approveArr[this.approveArr.length - 1].isEdit = false;
      this.approveArr[this.approveArr.length - 1].data = '0';
      for (let i = 0; i < this.approveArr.length - 1; i++) {
        this.approveArr[i].isEdit = true;
        this.approveArr[i].data = '0';
      }
    }
  }

  /**
   * 选择approve operator人员切换筛选
   */
  calculationOtherGroup(data: any) {
    if (data == 'approve') {
      //点击approve之后自动删掉operator下拉列表人员
      this.operatorList.Internal = [];
      this.operatorList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.operatorList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.operatorList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getOperatorList();
      //点击approve之后自动删掉bidder下拉人员
      this.bidderList.Internal = [];
      this.bidderList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.bidderList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.bidderList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getBidderList();
    } else if (data === 'operator') {
      //点击approve之后自动删掉approve下拉人员
      this.approveList.Internal = [];
      this.approveList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.operatorArr, 'id');
        if (!isUid) {
          this.approveList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.operatorArr, 'id');
        if (!isUid) {
          this.approveList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getApproveList();
    } else if (data === 'bidder') {
      //点击bidder之后自动删掉approve下拉人员
      this.approveList.Internal = [];
      this.approveList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.bidderArr, 'id');
        if (!isUid) {
          this.approveList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.bidderArr, 'id');
        if (!isUid) {
          this.approveList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getApproveList();
    }
  }


  /**
   * 获取task的相关数据
   */
  getTaskData() {
    this.approveData = [];
    this.operatorData = [];
    this.bidderData = [];
    for (let i = 0; i < this.operatorArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.psidObj);
      a.psid = this.operatorArr[i].id;
      a.name = this.operatorArr[i].label;
      a.user_profile_path = this.operatorArr[i].imageLabel;
      this.operatorData.push(a);
    }
    for (let i = 0; i < this.approveArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.psidObj);
      a.psid = this.approveArr[i].id;
      a.name = this.approveArr[i].label;
      a.user_profile_path = this.approveArr[i].imageLabel;
      this.approveData.push(a);
    }
    for (let i = 0; i < this.bidderArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.psidObj);
      a.psid = this.bidderArr[i].id;
      a.name = this.bidderArr[i].label;
      a.user_profile_path = this.bidderArr[i].imageLabel;
      this.bidderData.push(a);
    }
  }


}
