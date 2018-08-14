import {Component, ViewEncapsulation, Inject, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CompanyModelService, RecruitList} from "../../shared/services/index.service";
import {Protocol} from "_debugger";

@Component({
  selector: 'not-entry',
  templateUrl: '../template/not-entry.component.html',
  encapsulation:ViewEncapsulation.None
})

export class NotEntryComponent implements OnInit {

  public isShowNotEntry: boolean = false;
  private searchParam: any;
  private val: string = '';
  public currentUserInfo: any;
  private currentCompany: any;
  public notEntryList: Array<any> = [];

  @Output('outShowContactList') outShowContactList: any = new EventEmitter();

  @Input() set showNotEntry(param: any) {
    if(param) {
      setTimeout(() => {
        this.showNotEntryList(true);
      }, 50)
    }
  }

  @Input() set setCurrentUserInfo(param: any) {
    if(param) {
      this.currentUserInfo = param;
    }
  }

  constructor(
    private companyModelService: CompanyModelService,
    @Inject('app.config') public config: any,
    @Inject('type.service') public typeService: any,
    @Inject('notification.service') public notificationService: any,
    @Inject('company-data.service') private companyDataService: any
  ) {}

  ngOnInit() {
    this.currentCompany = this.companyDataService.getLocationCompanyIn();

    this.getNotEntry(() => {
      //搜索
      this.searchParam = {
        val: this.val,
        interfaceType: 'not',
        close: false,
        data: this.notEntryList,
        callBack: (data: any) => {
          this.notEntryList = data;
        }
      };
    });
  }

  /**
   * 待招聘列表
   * @param callBack
   */
  getNotEntry(callBack?: any) {
    this.companyModelService.getRecruitment({data: {cid: this.currentCompany.cid}}, (response: any) => {
      if(response.status === 1 && Object.prototype.toString.call(response.data) === '[object Array]') {
        this.notEntryList = this.typeService.bindDataList(RecruitList.init(), response.data);
        if(callBack) {
          callBack();
        }
      }
    });
  }

  showNotEntryList(isBool: boolean) {
    this.isShowNotEntry = isBool;
  }

  /**
   * 隐藏not entry
   */
  hideNotEntryList() {
    this.isShowNotEntry = false;
    this.outShowContactList.emit(false);
  }

  /**
   * 切换到聊天框
   * @param form
   * @param data
   * @param event
   */
  showChat(form: number, data: any, event: any) {
    event.stopPropagation();
    let chatData = {
      form: form,
      work_name: data.work_name,
      uid: data.uuid,
    };
    let setOptionData = {
      member: chatData,
      isInMail: true
    };
    //显示聊天框
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'bi-mini-dialog',
        options: setOptionData
      }
    });
  }

}