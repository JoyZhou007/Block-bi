/**
 * Created by simon on 2016/8/9.
 */
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer,
  ViewChild,
  ViewContainerRef
} from "@angular/core";

import { Router } from "@angular/router";
import { ChatMenuList } from "../../shared/services/model/entity/chat-entity";
import { ContactModelService } from "../../shared/services/model/contact-model.service";

import { StructureModelService } from "../../shared/services/model/structure-model.service";
import * as StructureConstant from "../../shared/config/structure.config";
import { Subscription } from "rxjs/Subscription";
import {
  DEPARTMENT_PENDING_ID,
  PositionStructureEntity,
  StructureDepartmentEntity,
  StructureStaffEntity
} from "../../shared/services/model/entity/structure-entity";


@Component({
  selector: 'structure-list',
  templateUrl: '../template/structure-list.component.html'
})

export class StructureListComponent implements OnInit, OnDestroy {
  // 通知变量
  private subscription: Subscription;
  // 所有变量是否就绪
  public isReady: boolean = false;

  // did数组，循环模板用
  public deptKeyArr: Array<string>;
  // 部门对应信息, 按照did分组
  public staffByDeptList: { [key: string]: StructureDepartmentEntity };
  // 无分组员工列表
  private staffList: any;
  // 无分组部门信息列表
  private departmentList: any;
  // 当前cid
  public companyId: any;
  // 当前did
  public departmentId: any;
  // 当前编辑职位
  public editPosition: any;

  // 组织架构导入用
  public currentFormData: FormData;
  private currentFile: File;
  private importTeamSettings: any;

  // public departmentInfo: any;
  // public staffInfo: any;
  // public mainInfo: any;
  // public deptListInfo: any;
  // public departmentStaffList: any;
  // public isAjax: boolean = false;


  /**
   * 由structure.component传入的数据
   */

  @Input('staffByDeptList')
  set setStaffByDeptList(data: any) {
    this.staffByDeptList = data;
    //console.log('staffByDeptList', this.staffByDeptList);
  }

  @Input('currentCid')
  set currentCid(data: any) {
    this.companyId = data;
  }

  @Input('currentDid')
  set currentDid(data: any) {
    this.departmentId = data;
  }

  @Input('staffList')
  set setStaffList(data: any) {
    this.staffList = data;
    //console.log('staffList',   this.staffList);
    this.checkReady();
  }

  @Input('departmentList')
  set setDepartmentList(data: any) {
    this.departmentList = data;
    //console.log('list reset departmentList',   this.departmentList);
    this.checkReady();
  }

  @Input('deptKeyArr')
  set setDeptKeyArr(data: Array<string>) {
    this.deptKeyArr = data;
    this.checkReady();
  }

  @Input('editPosition') set setEditPosition(data: any){
    this.editPosition = data;
  }
  @Output() outClickPosition = new EventEmitter<any>();
  @Output() outEditDepartment = new EventEmitter<any>();
  @Output() outEditPositionLevel = new EventEmitter<any>();
  @Output() outCurrentDid = new EventEmitter<any>();
  //刷新structure
  @Output() outRefreshList = new EventEmitter<any>();

  public currentDepartmentId: string = '';
  public isShowMain: boolean = true;
  //记录menu点击对象的id
  public depName: string;
  @ViewChild('helpViewContainer', {read: ViewContainerRef}) public helpViewContainer;

  constructor(public renderer: Renderer,
              public router: Router,
              public structureModelService: StructureModelService,
              public contactModelService: ContactModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('page.element') public element: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('structure-data.service') public structureDataService: any) {

  }


  ngOnInit(): void {
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
      case this.notificationService.config.ACT_COMPONENT_STRUCTURE_IMPORT:
        this.importStructureAgain();
        break;
      default:
    }
  }

  checkReady() {
    if (this.deptKeyArr && this.staffByDeptList && this.staffList && this.departmentList) {
      this.isReady = true;
    }
  }




  chooseDepartment(event: any, deptInfo: any) {
    event.stopPropagation();
    deptInfo.isClose = false;
    // this.isShowPending = false;
    this.currentDepartmentId = this.currentDepartmentId == deptInfo.did ? '' : deptInfo.did;
    this.depName = deptInfo.name;

    if (deptInfo.did.substr(0, 1) === 'd') {
      let settings = {
        simpleContent: 'For the new department, please upload the current data if you want to enter the department !'
      };
      this.dialogService.openWarning(settings);
      return false;
    }

    if (this.departmentId && this.departmentId === deptInfo.did) {
      return;
    }
    if (this.structureDataService.getUploadStructureFlag() === 1) {
      this.dialogService.openConfirm({
        simpleContent: this.translate.manualTranslate('Are you sure to jump to other organizational structures !'),
      }, () => {
        this.structureDataService.setUploadStructureFlag(0);
        let routerObj: any = {queryParams: {did: deptInfo.did}};
        this.router.navigate(['structure/', this.companyId], routerObj);
        this.outCurrentDid.emit({type: 'dept', id: deptInfo.did});
      });
    } else {
      let routerObj: any = {queryParams: {did: deptInfo.did}};
      this.router.navigate(['structure/', this.companyId], routerObj);
      this.outCurrentDid.emit({type: 'dept', id: deptInfo.did});
    }
    // } else {
    //     this.structureDataService.setUploadStructureFlag(0);
    //     if(this.typeService.isSetKey('did', data)) {
    //         this.router.navigate(['structure', data.company_id, data.did]);
    //     } else {
    //         this.router.navigate(['structure', data.cid]);
    //     }
    // }
  }

  /**
   * 编辑职位
   * @param event
   * @param item
   * @param did
   */
  clickPosition(event: any, item: PositionStructureEntity, did: any) {
    if (event) {
      event.stopPropagation();
    }
    this.outClickPosition.emit([did, item]);
  }

  clickEditDepartment(event: any, did: any) {
    event.stopPropagation();
    this.outEditDepartment.emit(did);
    // this.chooseDepartment(event,data);
  }

  editPositionLevel(event: any, data?: any) {
    event.stopPropagation();
    if (data) {
      this.outEditPositionLevel.emit(data);
    } else {
      this.outEditPositionLevel.emit();
    }
  }

  /**
   * 点击聊天图标，根据是否在职选择不同通道
   * pending状态发送站内信，其余打开聊天mini dialog
   * @param event
   * @param item
   * @param did
   */
  chatOrInMail(event: any, item: StructureStaffEntity, did) {
    if (did == DEPARTMENT_PENDING_ID) {
      this.sendInMail(event, item);
    } else {
      this.openMiniDialog(2, item, event);
    }
  }

  /**
   * 点击pending人员聊天发送站内信
   */
  sendInMail(event: any, item: StructureStaffEntity) {
    event.stopPropagation();
    if (parseInt(item.uuid) != parseInt(this.userDataService.getCurrentUUID())) {
      let setOptionData = {
        member: {user_profile_path: item.profile, uid: item.uuid, work_name: item.work_name},
        isInMail: true
      };
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-mini-dialog',
          options: setOptionData
        }
      });
    }
  }


  /**
   * 导入
   * @param event
   * @param element
   */
  importStructure(event: any, element: any) {
    event.stopPropagation();
    this.importTeamSettings = {
      mode: '3',
      title: 'IMPORT TEAM',
      isSimpleContent: false,
      componentSelector: 'structure-import-dialog',
      componentData: {el: element, viewContainer: this.helpViewContainer},
      showErrorInfo: {
        errorHtml: ''
      },
      buttons: [
        {
          type: 'next',
          disable: true,
          btnEvent: 'sendData'
        }
      ],
    };
    this.dialogService.openNew(this.importTeamSettings);
  }

  /**
   * 切换到聊天框
   * @param form
   * @param data
   * @param event
   */
  showChat(form: number, data: any, event: any) {
    event.stopPropagation();
    if (this.structureDataService.getUploadStructureFlag()) {
      this.dialogService.openWarning({
        simpleContent: `please upload first`
      })
    } else {
      if (parseInt(data.id) === parseInt(this.userDataService.getCurrentCompanyPSID())) {
        // this.dialogService.openWarning({
        //   simpleContent: 'you can not chat yourself.'
        // })
      } else {
        let friendIdentity = ChatMenuList.initFriendId(form, data.id, this.userDataService.getCurrentCompanyPSID());
        let chatData = {
          isFriend: true,
          form: form,
          work_name: data.work_name,
          friendType: friendIdentity,
          uid: parseInt(data.id)
        };
        //显示聊天框
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
          data: chatData
        });
      }

    }

  }

  /**
   * 点击用户头像显示半屏聊天(迷你聊天窗)  tips
   */
  openMiniDialog(form: number, data: StructureStaffEntity, event: any) {
    event.stopPropagation();
    if (this.structureDataService.getUploadStructureFlag()) {
      this.dialogService.openWarning({
        simpleContent: `please upload first`
      })
    } else {
      data['uid'] = data.psid;
      data['user_profile_path'] = data.profile;
      if (parseInt(data.psid) != parseInt(this.userDataService.getCurrentCompanyPSID())) {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
          data: {
            selector: 'bi-mini-dialog',
            options: {
              member: data,
              form: form
            }
          }
        });
      }
    }

  }

  uploadStructure(event: any, inputEle: HTMLInputElement) {
    let a = inputEle.files[0];
    this.currentFile = inputEle.files[0];
    let fileTypes = ['csv', 'xlsx', 'xls'];
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_STRUCTURE_IMPORT_FILE,
      data: {
        file: a
      }
    });
    if (a) {
      let error = '';
      let extension = a.name.split('.').pop().toLowerCase();
      if (fileTypes.indexOf(extension) > -1) {
        let fileReader = new FileReader();
        let self = this;
        fileReader.onload = function (oFREvent: any) {
          // self.importTeamSettings.showErrorInfo.errorHtml = '';
          a['file'] = oFREvent.target.result;
          let formData = new FormData();
          formData.append('file', a);
          self.currentFormData = formData;
          self.structureModelService.importStructure(formData, (response: any) => {
            inputEle.value = '';
            if (response.status === 1) {
              //self.dialogService.openSuccess({simpleContent: self.translate.manualTranslate('Import success, please reload the page')});
              self.importTeamSettings.showErrorInfo.errorHtml = '';
              //按钮可点
              self.notificationService.postNotification({
                act: self.notificationService.config.ACT_COMPONENT_DIALOG_BTN_DISABLE,
                data: {
                  btnList: [{
                    type: 'next',
                    disable: false
                  }]

                }
              });
            } else {
            }

            let errorList = [];
            if (response.hasOwnProperty('data')) {
              if (Object.keys(response.data).length !== 0) {
                errorList = self.buildImportError(response.data);
              }

              let errorStr = '';
              errorList.forEach((value, index, array) => {
                errorStr += `<li class="clearfix">
                                    <span class="pull-left v7-f g-show-error-color">line ${value.line}: &nbsp; ${value.content}</span>
                                    <span class="bi-icon-warning"></span>
                                </li>`;
              });
              if (response.message) {
                self.importTeamSettings.showErrorInfo.errorHtml = `<div class="import-team-error">
                            <div class="f9-f">ERROR: ${response.message}</div>
                            <ul class="import-team-error-list">
                                ${errorStr}
                            </ul>
                        </div>`;
              }
            }
          });
        };
        fileReader.readAsDataURL(a);
      } else {
        error = 'File type is not correct';
      }
      return error;
    }
  }

  /**
   * 收起隐藏 main 下来菜单
   * @param event
   * @param isShow
   */
  toggleMainSelect(event: any) {
    event.stopPropagation();
    this.isShowMain = !this.isShowMain;
  }

  /**
   * 收起隐藏部门下拉菜单
   * @param event
   * @param data
   */
  toggleDepSelect(event: any, data: any) {
    event.stopPropagation();
    this.isShowMain = false;
    data.isCurrent = !data.isCurrent;
    this.chooseDepartment(event, data);
  }


  /**
   * 初始化 import显示的错误
   * @param data
   * @returns {Array<{line: string; content: string}>}
   */
  private buildImportError(data: any): Array<{
    line: string,
    content: string
  }> {
    let arr = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let obj = {};
        obj['line'] = key;
        let errorList = [];
        data[key].forEach((item: number) => {
          switch (item) {
            case StructureConstant.STRUCTURE_IMPORT_ERROR_USERNAME_FORMAT:
              errorList.push('work name format not correct');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_PHONE_FORMAT:
              errorList.push('phone format not correct');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_EMAIL_FORMAT:
              errorList.push('email format not correct');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_ALREADY_IN_COMPANY:
              errorList.push('this work email already used');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_EMAIL_EXIST:
              errorList.push('email already used');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_WORK_NAME_NULL:
              errorList.push('work name no data');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_PHONE_NULL:
              errorList.push('phone no data');
              break;
            case StructureConstant.STRUCTURE_IMPORT_ERROR_EMAIL_NULL:
              errorList.push('email no data');
              break;
          }
        });
        obj['content'] = errorList.join(',');
        arr.push(obj);
      }
    }
    return arr;
  }

  /**
   * 验证通过后导入
   */
  private importStructureAgain() {
    //按钮可点
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_DIALOG_BTN_DISABLE,
      data: {
        btnList: [{
          type: 'next',
          disable: true
        }]

      }
    });
    let formData = new FormData();
    formData.append('file', this.currentFile);
    formData.append('skip_check', 1);
    formData.append('lang', this.userDataService.getLanguageNum());
    this.structureModelService.importStructure(formData, (response: any) => {
      if (response.status === 1) {
        this.dialogService.openSuccess({
          simpleContent: 'import success.'
        });
        this.outRefreshList.emit();

      } else {
        this.dialogService.openError({
          simpleContent: 'import structure failed!'
        })
      }
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_STRUCTURE_IMPORT_FILE_COMPLETE
      })
    })
  }
}
