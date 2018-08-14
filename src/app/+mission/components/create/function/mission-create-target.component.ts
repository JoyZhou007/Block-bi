import {Component, OnInit, Inject, Input, Renderer, OnDestroy} from '@angular/core';
import {
  MissionDetailAPIModel,
} from "../../../../shared/services/model/entity/mission-entity";
import {Subscription} from "rxjs/Subscription";


@Component({
  selector: 'create-target',
  templateUrl: '../../../template/create/function/mission-create-target.component.html'
})

export class MissionCreateTargetComponent implements OnDestroy {
  public isShowCommonGoal: boolean = true;
  public isShowSelfGoal: boolean = false;
  public operatorMemberList: Array<any> = [];
  public targetData: any;
  public amountArr: Array<any> = [];
  public amountInfo: any;
  public commonGoalData: any;
  public total: string = '0';
  public unit: string = 'kg';
  public unitList: Array<any>;
  public isAsApprover: boolean;
  private userData: any;
  public subscription: Subscription;

  constructor(public renderer: Renderer,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.targetData = {
      type: '1',
      amount: this.amountArr
    };
    this.amountInfo = {
      psid: '',
      data: '',
    };
    this.commonGoalData = {
      psid: '',
      data: '',
    };
    this.setMissionUnitList();
    this.getUserIn();
  }


  /**
   * setParams
   * @param param
   */
  @Input() set setParams(param: any) {
    this.operatorMemberList = param;
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_TASk_OPERATOR_CHANGE:
        this.operatorMemberList = data.data;
        break;
      case this.notificationService.config.ACTION_ASSIGNMENT_OPERATOR_CHANGE:
        this.operatorMemberList = data.data;
        break;
      case this.notificationService.config.ACTION_TASK_PUBLISHER_IDENTITY_CHANGE:
        this.isAsApprover = data.data;
        if (this.isAsApprover) {
          for (let i in this.operatorMemberList) {
            if (this.operatorMemberList[i].psid === this.userDataService.getCurrentCompanyPSID()) {
              this.operatorMemberList.splice(parseInt(i), 1);
            }
          }
        } else {
          let isUid = this.typeService.isArrayKey(this.userDataService.getCurrentCompanyPSID(), this.operatorMemberList, 'psid');
          if (!isUid) {
            let a = this.typeService.clone(this.amountInfo);
            a.psid = this.userDataService.getCurrentCompanyPSID();
            a.imageLabel = this.config.resourceDomain + this.userData.user.user_profile_path;
            a.label = this.userData.user.work_name;
            a.p_name = '';
            a.isAdd = false;
            this.operatorMemberList.push(a);
          }
        }
        break;
    }
  }

  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }

  /**
   * 获取计量范围列表
   */
  setMissionUnitList(): void {
    this.unitList = MissionDetailAPIModel.getUNITList();
  }

  /**
   * 切换总目标或者单个的目标
   */
  switchGoalType(type: string) {
    if (type === 'common') {
      this.isShowCommonGoal = true;
      this.isShowSelfGoal = false;
      this.targetData.type = '1';
    } else if (type === 'self') {
      this.isShowSelfGoal = true;
      this.isShowCommonGoal = false;
      this.targetData.type = '2';
    }
    this.amountArr = [];
  }

  /**
   * 选择计量单位
   */
  selectUnit(data: any, unit: any) {
    if (this.isShowCommonGoal) {
      this.unit = unit;
    } else {
      this.unit = unit;
      data.isShowUnit = false;
    }
  }

  /**
   * 统计target创建的数据
   */
  getCreateTargetData() {
    this.amountArr = [];
    if (this.isShowCommonGoal) {
      this.total = this.commonGoalData.data;
      for (let i = 0; i < this.operatorMemberList.length; i++) {
        let a: any;
        a = this.typeService.clone(this.amountInfo);
        if (this.operatorMemberList[i].psid) {
          a.psid = this.operatorMemberList[i].psid;
        } else if (this.operatorMemberList[i].uid) {
          a.psid = this.operatorMemberList[i].uid;
        } else {
          a.psid = this.operatorMemberList[i].id;
        }
        a.data = '0';
        a.amount = '0';
        this.amountArr.push(a);
      }
    } else {
      this.total = '0';
      for (let i = 0; i < this.operatorMemberList.length; i++) {
        let a: any;
        a = this.typeService.clone(this.amountInfo);
        if (this.operatorMemberList[i].psid) {
          a.psid = this.operatorMemberList[i].psid;
        } else if (this.operatorMemberList[i].uid) {
          a.psid = this.operatorMemberList[i].uid;
        } else {
          a.psid = this.operatorMemberList[i].id;
        }
        a.data = this.operatorMemberList[i].data;
        a.unit = this.unit;
        a.amount = '0';
        this.amountArr.push(a);
      }
    }
    this.targetData.amount = this.amountArr;
  }

  /**
   * 验证target 的数据
   */
  verificationTargetDate() {
    let count: number = 0;
    if (this.targetData.type === '2') {
      for (let i in this.targetData.amount) {
        if (parseInt(this.targetData.amount[i].data) > 0) {
          count++;
        }
      }
      if (count === this.targetData.amount.length) {
        return true;
      } else {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The target data is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    } else if (this.targetData.type === '1') {
      if (parseInt(this.commonGoalData.data) > 0) {
        return true;
      } else {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The target data is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
  }

  validateFormData(data: any) {
    if (!data.data) {
      data.isShowError = true;
    } else {
      data.isShowError = false;
    }


  }

}

