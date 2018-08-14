import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {CompanyModelService, RecruitList} from "../../shared/services/index.service";
import {StructureModelService} from '../../shared/services/model/structure-model.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'recruit',
  templateUrl: '../template/recruit.component.html',
  styleUrls: ['../../../assets/css/meeting/meeting.css'],
  providers: [CompanyModelService]
})

export class RecruitComponent implements OnInit, OnDestroy {

  private jobStatusEntry: any = [
    {status: 0, statusName: '入职状态', type: 'not entry'},
    {status: 1, statusName: '在职状态', type: 'employed'},
    {status: 2, statusName: '暂离职状态(不在组织架构中)', type: 'structure pending'},
    {status: 3, statusName: '冻结状态', type: 'frozen'},
    {status: -1, statusName: '离职状态', type: 'dismissed'}
  ];
  private currentCompany: any;
  private recruitList: any = [];
  private contactList: any;
  public isShowOccupation: boolean = false;
  public currentUserObj: any;
  private retainRecruitList: any = [];
  public searchVal: string;
  private trimSearch: any;
  private currentRecruitList: Array<any> = [];
  // false 显示职员列表  true 显示代填列表
  public isShowSelected: boolean = false;
  public currentCompanyPsid: string;
  public currentStatus: any;
  private update: boolean = false;
  private currentPsid: any;
  private subscription: Subscription;

  constructor(private companyModelService: CompanyModelService,
              public structureModelService: StructureModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('company-data.service') private companyDataService: any,
              @Inject('date.service') public dateFormatService: any) {
  }

  ngOnInit() {
    this.currentCompany = this.companyDataService.getLocationCompanyIn();
    this.contactList = this.userDataService.getContactList();
    this.currentCompanyPsid = this.userDataService.getCurrentCompanyPSID();

    //招聘列表
    this.tabRecruitList();
    this.currentPsid = this.userDataService.getCurrentCompanyPSID();

    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  dealMessage(data: any) {
    switch (data.act) {
      //组织架构变更，刷新列表
      case this.notificationService.config.ACT_STRUCTURE_NOTICE_STRUCTURE_CHANGE:
        this.getStaffList();
        break;
      case this.notificationService.config.ACT_COMPONENT_OCCUPATION_REFRESH:
        this.tabRecruitList();
        break;
    }
  }

  /**
   * 待招聘列表
   */
  getRecruitment() {
    this.companyModelService.getRecruitment({data: {cid: this.currentCompany.cid}}, (response: any) => {
      if (response.status === 1) {
        this.recruitList = this.typeService.bindDataList(RecruitList.init(), response.data);
        this.currentRecruitList = this.retainRecruitList = this.typeService.clone(this.recruitList);
      } else {
        this.dialogService.openError({simpleContent: 'Fetch list failed, please try later!'});
      }
    });
  }

  /**
   * 获取招聘列表
   */
  getStaffList() {
    this.companyModelService.getAllStaff({data: {cid: this.currentCompany.cid}}, (response: any) => {
      if (response.status === 1) {
        this.recruitList = this.typeService.bindDataList(RecruitList.init(), response.data);
        for (let i in this.recruitList) {
          if (this.recruitList[i].status === 0) {
            this.recruitList[i].status = 2
          }
        }
        this.currentRecruitList = this.retainRecruitList = this.typeService.clone(this.recruitList);
      } else {
        this.dialogService.openError({simpleContent: 'Fetch list failed, please try later!'});
      }
    });
  }

  /**
   * 切换列表
   * @param isBool
   */
  tabRecruitList(isBool?: boolean) {
    if (typeof isBool !== 'undefined') {
      this.isShowSelected = isBool;
    }
    if (!this.isShowSelected) {
      this.getStaffList();
    } else {
      this.getRecruitment();
    }
  }

  /**
   * 切换状态列表
   * @param list
   */
  tabRecruitStatusList(list: any) {
    if (list.status === this.currentStatus) {
      this.currentStatus = '';
      this.recruitList = this.typeService.clone(this.currentRecruitList);
    } else {
      this.currentStatus = list.status;
      let newRecruitList: any = [];
      for (let key in this.currentRecruitList) {
        if (this.currentRecruitList[key].status === 0) {
          this.currentRecruitList[key].status = 2;
        }
        if (this.currentRecruitList[key].status === list.status) {
          newRecruitList.push(this.currentRecruitList[key]);
        }
      }
      this.recruitList = newRecruitList;
      this.retainRecruitList = this.typeService.clone(newRecruitList);
    }
  }

  /**
   * 搜索列表
   */
  searchRecruit() {
    clearTimeout(this.trimSearch);
    if (this.searchVal) {
      this.trimSearch = setTimeout(() => {
        this.recruitList = this.typeService.regExpList(this.retainRecruitList, this.searchVal);
      }, 300)
    } else {
      this.recruitList = this.retainRecruitList;
    }
  }

  /**
   * 当前人状态
   * @param status
   */
  currentJobStatusEntry(status: number): string {
    let statusName: string;
    if (!this.isShowSelected && status === 0) {
      status = 2;
    }
    for (let key in this.jobStatusEntry) {
      if (this.jobStatusEntry[key].status === status) {
        statusName = this.jobStatusEntry[key].type;
        break;
      }
    }
    return statusName;
  }

  /**
   * 解除员工
   * @param event
   * @param data
   */
  dismissStaff(event: MouseEvent, data: any) {

    this.dialogService.openConfirm({
      simpleContent: 'Is it certain to fire the employee ?'
    }, () => {
      //默认转移 freeze:0 transfer:1
      let sendObj: any;
      //如果有psid传入psid
      if (data.psid) {
        this.structureModelService.fireEmployee({
          data: {
            psid: data.psid,
            freeze: 0,
            transfer: 1
          }
        }, (res: any) => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: res
          });
          if (res.status === 1) {
            for (let k in this.recruitList) {
              if (this.recruitList[k].uuid === data.uuid) {
                this.recruitList.splice(k, 1);
              }
            }
            //todo im通知 ，组织架构
          } else {
          }
        })
      } else {
        //如果没有psid，传入uuid
        this.companyModelService.fireEmployeeNoStructure({
          data: {
            uuids: [data.uuid],
          }
        }, (res: any) => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: res
          });
          if (res.status === 1) {
            for (let k in this.recruitList) {
              if (this.recruitList[k].uuid === data.uuid) {
                this.recruitList.splice(k, 1);
              }
            }
            //todo im通知 ，组织架构

          } else {

          }
        })
      }
    }, false)
  }

  /**
   *删除员工，not entry
   * @param event
   * @param data
   */
  dismissNotEntry(event: any, data: any) {
    if (event) {
      event.stopPropagation();
    }

    this.dialogService.openConfirm({
      simpleContent: 'Is it certain to fire the employee ?'
    }, () => {
      this.companyModelService.fireNotEntry({
        data: {
          uuids: [data.uuid],
        }
      }, (res: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: res
        });
        if (res.status === 1) {
          for (let k in this.recruitList) {
            if (this.recruitList[k].uuid === data.uuid) {
              this.recruitList.splice(k, 1);
            }
          }
        } else {

        }
      })
    }, false);
  }

  /**
   * 打开聊天窗口
   * @param data
   */
  openChat(data: any) {
    // 普通员工，打开聊天弹窗
    // pending员工 打开mini dialog
    let memberInfo: any = {
      form: 2,
      uid: data.status === 1 ? data.psid : data.uuid,
      user_profile_path: data.profile ? data.profile : '',
      work_name: data.work_name
    };
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-mini-dialog',
        options: {
          isInMail: data.status !== 1,
          member: memberInfo,
          form: 2
        }
      }
    });
  }

  /**
   * 编辑当前人 打开dialog
   * @param event
   * @param data
   */
  editOccupation(event: any, data: any) {
    this.update = !this.update;
    if (data.status != -1) {
      this.currentUserObj = {
        uuid: data.uuid
      };
      // this.isShowOccupation = !this.isShowOccupation;
      let titleBtnList = [];
      //studio没权限
      let type = this.companyDataService.getBusinessType();
      if (data.hasOwnProperty('psid') && data.psid !== '' && type !== '1') {
        titleBtnList = [
          {
            btnText: 'OCCUPATION',
            btnEvent: 'clickTitle',
          },
          {
            btnText: 'PERMISSION',
            btnEvent: 'clickTitle',
          },
        ]
        this.dialogService.openNew({
          titleBtnList: titleBtnList,
          mode: '5',
          title: 'EDIT OCCUPATION',
          isSimpleContent: false,
          componentSelector: 'occupation',
          componentData: {data: data, update: this.update},
          buttons: [{
            type: 'send',
            btnEvent: 'sendData',
          }, {
            type: 'cancel',
          }]
        })
      } else {
        titleBtnList = [
          {
            btnText: 'OCCUPATION',
            btnEvent: 'clickTitle'
          }
        ]
        this.dialogService.openNew({
          titleBtnList: titleBtnList,
          mode: '1',
          title: 'EDIT OCCUPATION',
          isSimpleContent: false,
          componentSelector: 'occupation',
          componentData: {data: data, update: this.update},
          buttons: [{
            type: 'send',
            btnEvent: 'sendData',
          }, {
            type: 'cancel',
          }]
        })
      }
    }
  }

  /**
   * 打开structure
   */
  openStructure() {
    window.open('structure/' + this.currentCompany.cid);
  }

  /**
   * 关闭弹窗
   */
  closeOccupation() {
    this.isShowOccupation = false;
  }

  /**
   * 更新列表
   * @param uuid
   */
  updateList(uuid: string) {
    if (this.isShowSelected) {
      for (let key in this.recruitList) {
        if (this.recruitList[key].uuid === uuid) {
          this.recruitList.splice(parseInt(key), 1);
          this.retainRecruitList = this.typeService.clone(this.recruitList);
          break;
        }
      }
    }
  }

  /**
   * 取消search
   */
  onCloseSearch() {
    this.searchVal = '';
    this.recruitList = this.retainRecruitList;

  }
}
