import {Component, OnInit, Inject, Input, Renderer, OnDestroy} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
import {MissionDetailAPIModel, MissionFunctionTarget} from "../../../../shared/services/model/entity/mission-entity";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'read-target',
  templateUrl: '../../../template/detail/function/mission-detail-target.component.html'
})


export class MissionDetailTargetComponent implements OnDestroy{

  public missionObj: any;
  public missionConstant: any;
  public targetData: any;
  public completeAmount: number;
  public currentAmount: number;
  public userData: any;
  public isOperator: any;
  public isEditModel: boolean = false;
  public amountData: any;
  public unitList: Array<any>;
  public editTargetData: any;
  public editAmount: any = {};
  public isAsApprover: boolean = true;
  public initOperator:any;
  public isUnlockTarget:boolean=true;
  public subscription: Subscription;

  constructor(public missionModelService: MissionModelService,
              public renderer: Renderer,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any) {
    this.missionConstant = MissionConstant;
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @Input() set setMissionDetail(param: any) {
    this.missionObj = this.typeService.clone(param);
    this.getUserIn();
    this.getTargetData();
    this.getUserRoles(this.missionObj.roles);
  }

  @Input() set setReadType(type: any) {
    this.isEditModel = type;
  }


  ngOnInit() {
    this.amountData = {
      user_profile_path: '',
      psid: '',
      data: '0',
      amount: '0',
      name: '',
      isAdd: true
    };
    this.editTargetData = {
      unit: '',
      total: '',
      type: '',
      amount: [],
    };
    this.setMissionUnitList();
    if(this.isEditModel){
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_MISSION_FUNCTION_TARGET,
        data: this.isUnlockTarget
      });
    }
  }

  ngAfterViewInit() {

  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_ASSIGNMENT_OPERATOR_CHANGE:
        this.targetOperatorChange(data.data[0], 'assignment');
        break;
      case this.notificationService.config.ACTION_TASk_OPERATOR_CHANGE:
        this.targetOperatorChange(data.data[0], 'task');
        break;
      case this.notificationService.config.ACTION_ASSIGNMENT_INIT_TARGET:
        this.targetOperatorChange(data.data, 'assignment');
        break;
      case this.notificationService.config.ACTION_TASK_INIT_TARGET:
        this.targetOperatorChange(data.data, 'task');
        break;
      case this.notificationService.config.ACTION_TASK_PUBLISHER_IDENTITY_CHANGE:
        this.isAsApprover = data.data;
        if (this.isAsApprover) {
          for (let i in this.targetData.amount) {
            if (this.targetData.amount[i].psid == this.userDataService.getCurrentCompanyPSID()) {
              this.targetData.amount.splice(parseInt(i), 1);
            }
          }
        } else {
          let isUid = this.typeService.isArrayKey(this.userDataService.getCurrentCompanyPSID(), this.targetData.amount, 'psid');
          if (!isUid) {
            let a = this.typeService.clone(this.amountData);
            a.psid = this.userDataService.getCurrentCompanyPSID();
            a.user_profile_path = this.userData.user.user_profile_path;
            a.name = this.userData.user.work_name;
            a.p_name = '';
            a.isAdd = false;
            this.targetData.amount.push(a);
          }
        }
        break;
    }
  }


  /**
   * 获取计量范围列表
   */
  setMissionUnitList(): void {
    this.unitList = MissionDetailAPIModel.getUNITList();
  }

  /**
   * 选择计量单位
   */
  selectUnit(data: any, unit: any) {
    if (this.targetData.type === '1') {
      this.targetData.unit = unit;
    } else {
      this.targetData.unit = unit;
      data.isShowUnit = false;
    }
  }

  /**
   * 获取target的数据
   */
  getTargetData() {
    if (this.missionObj.fns[MissionConstant.MISSION_FUNCTION_TARGET]) {
      this.targetData = this.missionObj.fns[MissionConstant.MISSION_FUNCTION_TARGET];
      for (let i in this.targetData.amount) {
        if (this.targetData.amount[i].psid == this.userDataService.getCurrentCompanyPSID()) {
          this.completeAmount = this.targetData.amount[i].amount;
          this.currentAmount = this.completeAmount;
        }
        if (this.targetData.type === '1') {
          this.targetData.amount[i].percent = (((parseInt(this.targetData.amount[i].amount)) / parseInt(this.targetData.total)) * 100).toFixed(2);
        } else {
          this.targetData.amount[i].percent = (((parseInt(this.targetData.amount[i].amount)) / (parseInt((this.targetData.amount[i].data)))) * 100).toFixed(2);
        }
      }
    } else {
      this.targetData = new MissionFunctionTarget().init();
      this.targetData.type = '1';
      this.targetData.unit = 'kg';
    }
  }

  /**
   * 点击++--更换目标数
   */
  changeTargetAmount(param: string) {
    if (param === 'reduce') {
      if (this.currentAmount > 0) {
        this.currentAmount--;
      }
    } else if (param === 'add') {
      this.currentAmount++;
    }
  }


  /**
   * 获取用户角色
   */
  getUserRoles(data: any) {
    for (let i in data) {
      if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_OPERATOR)) {
        this.isOperator = true;
      }
    }
  }

  /**
   * 更新当前进度
   */
  uploadProgress(event: any) {
    event.stopPropagation();
    this.missionModelService.targetUpload({
      mid: this.missionObj.mid,
      amount: this.currentAmount
    }, (res: any) => {
      if (res.status === 1) {
        for (let i in this.targetData.amount) {
          if (this.targetData.amount[i].psid == this.userDataService.getCurrentCompanyPSID()) {
            this.targetData.amount[i].amount = this.currentAmount;
          }
          if (this.targetData.type === '1') {
            this.targetData.amount[i].percent = (((parseInt(this.targetData.amount[i].amount)) / parseInt(this.targetData.total)) * 100).toFixed(2);
          } else {
            this.targetData.amount[i].percent = (((parseInt(this.targetData.amount[i].amount)) / (parseInt((this.targetData.amount[i].data)))) * 100).toFixed(2);
          }
        }
        window.location.reload();
      } else {
        this.dialogService.openWarning({simpleContent:'upgrade progress failed!'});
      }
    });
  }

  /**
   * 取消编辑这个 taret_upload
   */
  cancelTheChange(event: any) {
    event.stopPropagation();
    this.currentAmount = this.completeAmount;
  }


  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }



  /**
   *编辑（TO DO 或者 PENDING 转态下）
   */

  /**
   * 切换总目标或者单个的目标
   */
  switchGoalType(type: string) {
    if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING
      || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_TODO) {
      if (type === 'common') {
        this.targetData.type = '1';
      } else if (type === 'self') {
        this.targetData.type = '2';
      }
    }
  }

  /**
   * 编辑模式下 operator的变化
   */
  targetOperatorChange(data: any, type?: string) {
    let doAmount: any = this.targetData.amount;
    this.targetData.amount = [];
      for(let i=0;i<data.length;i++){
        let a: any = this.typeService.clone(this.amountData);
        a.psid = data[i].id;
        a.user_profile_path = data[i].imageLabel;
        a.name = data[i].label;
        a.p_name = data[i].label;
        this.targetData.amount.push(a);
      }
    if (type === 'task') {
      if (!this.isAsApprover) {
        let isUid = this.typeService.isArrayKey(this.userDataService.getCurrentCompanyPSID(), this.targetData.amount, 'psid');
        if (!isUid) {
          let a = this.typeService.clone(this.amountData);
          a.psid = this.userDataService.getCurrentCompanyPSID();
          a.user_profile_path = this.userData.user.user_profile_path;
          a.name = this.userData.user.work_name;
          a.p_name = '';
          a.isAdd = false;
          this.targetData.amount.push(a);
        }
      }
    }
    for (let i in doAmount) {
      for (let k in this.targetData.amount) {
        if (this.targetData.amount[k].psid === doAmount[i].psid) {
          this.targetData.amount[k].data = doAmount[i].data;
          this.targetData.amount[k].amount = doAmount[i].amount;
        }
      }
    }


  }

  /**
   * 统计target编辑的数据
   */
  getEditTargetData() {
    this.editTargetData.amount=[];
    this.editTargetData.type = this.targetData.type;
    this.editTargetData.unit = this.targetData.unit;
    if (this.targetData.type === '1') {
      this.editTargetData.total = this.targetData.total;
      for (let i  in  this.targetData.amount) {
        let a: any = this.typeService.clone(this.editAmount);
        a.id = this.targetData.amount[i].id ? this.targetData.amount[i].id : '';
        a.psid = this.targetData.amount[i].psid;
        a.amount = '0';
        a.data = '0';
        this.editTargetData.amount.push(a);
      }
    } else if (this.targetData.type === '2') {
      this.editTargetData.total = '0';
      for (let i  in  this.targetData.amount) {
        let a: any = this.typeService.clone(this.editAmount);
        a.id = this.targetData.amount[i].id ? this.targetData.amount[i].id : '';
        a.psid = this.targetData.amount[i].psid;
        a.amount = this.targetData.amount[i].amount;
        a.data = this.targetData.amount[i].data;
        this.editTargetData.amount.push(a);
      }
    }
  }

  /**
   * 验证target 的数据
   */
  verificationTargetDate() {
    if (this.editTargetData.type == '2') {
      let count: number = 0;
      for (let i in this.editTargetData.amount) {
        if (parseInt(this.editTargetData.amount[i].data) > 0) {
          count++;
        }
      }
      if (count === this.editTargetData.amount.length) {
        return true;
      } else {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent:'The target data is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    } else if (this.editTargetData.type == '1') {
      if (parseInt(this.editTargetData.total) > 0) {
        return true;
      } else {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent:'The target data is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
  }

  /**
   * 只能输入数字
   * @param event
   */
  onKeyDown(event: any) {
    let code = event.keyCode;
    if (!this.keyCode(code) || event.ctrlKey || event.shiftKey || event.altKey) {
      event.preventDefault();
      event.target.blur();
      setTimeout(function () {
        event.target.focus();
      })
    }
  }

  keyCode(code) {
    return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 13;
  }

}