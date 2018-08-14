import {Component, Inject, Input, OnInit} from "@angular/core";
import {CompanyModelService} from "../../shared/services/index.service";

/**
 * data: [
 *  {name: 'owner', data: data, tab: 'OWNER', isShow: true, type: 2}
 * ]
 * 对象key => admin | builder | holder | owner
 * 格式 admin = {data: data, type: 4, name}
 *
 */

@Component({
  selector: 'edit-core-orga',
  templateUrl: '../template/edit-core-orga.component.html',
  providers: [CompanyModelService]
})

export class EditCoreOrgaComponent implements OnInit {

  public buildData: Array<any> = [];
  private currentData: any;
  private currentDataList: Array<any> = [];
  public isShowBut: boolean = true;
  public searchVal: string = '';
  private type: number;
  public searchData: any;
  private sendData: Array<any> = [];
  public comment: string = '';
  private searchPervData: any;
  private name: string;
  private trimSearch: any;
  public isErrorShow: boolean;
  public userInfo: any;
  public isShow: boolean;
  public isEditShow: boolean;

  @Input() set setOption(data: any) {
    if (data) {
      //重置数据
      this.searchData = [];
      this.searchVal = '';
      this.comment = '';
      this.isErrorShow = false;

      this.buildData = data;
      this.currentData = this.buildData[0];
      this.name = this.buildData[0].name;
      this.currentDataList = this.currentData.data;
      this.sendData = this.typeService.clone(this.currentDataList);
    }
  }

  constructor(private companyModelService: CompanyModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('im.service') public memberService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any) {
  }

  ngOnInit() {
    this.userInfo = this.userDataService.getUserIn();
    this.elementToggle();
  }

  /**
   * 是否显示下面元素
   */
  elementToggle() {
    if (this.name !== 'holder') {
      this.isShow = this.sendData[0].uuid === this.userInfo.user.uuid;
    }
  }

  /**
   * 发送申请
   */
  editCoreOrga() {
    if (this.name === 'holder') {

    } else {
      if ((this.typeService.getDataLength(this.currentDataList) > 0) &&
        (this.typeService.getDataLength(this.sendData) > 0) &&
        (this.currentDataList[0].uuid === this.sendData[0].uuid)) {
        this.isErrorShow = true;
        return false;
      }
    }
    let data: any = {
      comment: this.comment,
      role: this.currentData.type,
      candidates: [],
      cid: this.companyDataService.getLocationCompanyIn().cid,
      company_name: this.companyDataService.getCurrentCompanyName()
    };

    //ceo 传 psid
    if(this.currentData.type === 4) {
      data.candidates[0] = this.sendData[0].psid;
    }else {
      //uuid
      for (let uid in this.sendData) {
        let Uid: string = this.sendData[uid].uuid;
        this.sendData[uid].cid = this.companyDataService.getLocationCompanyIn().cid;
        data.candidates.push(Uid);
      }
    }

    //显示聊天框
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_SELF_MESSAGE,
      type: 'company-builder',
      name: this.name,
      data: this.sendData
    });
    this.memberService.setCompanyAdmin(data);
    // 性质是发通知给其他成员 所以不需要确定是否成功直接关闭
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
      data: false
    })
  }

  /**
   * 搜索联系人
   */
  searchContactsImport() {
    let data: any = {
      keywords: this.searchVal,
      cid: this.companyDataService.getLocationCompanyIn().cid,
      admin_type: this.currentData.type
    };
    clearTimeout(this.trimSearch);
    if (!this.searchVal) {
      this.sendData = this.currentDataList;
    } else {
      this.trimSearch = setTimeout(() => {
        this.companyModelService.searchAdminCandidates({data: data}, (response: any) => {
            if (response.status === 1 && this.typeService.getObjLength(response.data) > 0) {
              this.searchData = response.data;
            }else {
              this.searchData = [];
            }
          })
      }, 300)
    }
  }

  /**
   * 删除
   * @param data
   * @param index
   */
  deleteSelect(data: any, index: number) {
    this.sendData.splice(index, 1);
    for (let key in this.searchData) {
      if (data.uuid === this.searchData[key].uuid) {
        this.searchData[key].current = false;
        break;
      }
    }
  }

  /**
   * 选择当前联系人
   * @param list
   */
  selectedCurrentPersonal(list: any) {
    if (this.currentData.name === 'holder') {
      list.current = !list.current;
      if (list.current) {
        this.sendData.push(list);
        this.isErrorShow = false;
      } else {
        this.setSearchElementStyle(list);
      }
    } else {
      this.sendData = [];
      if ((this.searchPervData && list.uuid !== this.searchPervData.uuid) ||
        (this.searchPervData && list.psid !== this.searchPervData.psid)) {
        this.searchPervData.current = false;
      }
      list.current = !list.current;
      if (list.current) {
        this.searchPervData = list;
        this.sendData.push(list);
        this.isErrorShow = false;
      } else {
        this.searchPervData = {};
        this.sendData = this.typeService.clone(this.currentDataList);
      }
    }
  }

  /**
   * 选择tab
   * @param tab
   */
  selectTabType(tab: any) {
    this.currentData.isShow = false;
    this.currentData = tab;
    this.currentDataList = this.currentData.data;
    this.isErrorShow = false;
    this.name = tab.name;
    this.sendData = this.typeService.clone(this.currentDataList);
    tab.isShow = true;
    this.isShowBut = !(this.name === 'holder');

    //this.elementToggle();
    this.isEditShow = false;
    if (this.typeService.getDataLength(this.searchData) > 0) {
      for (let key in this.searchData) {
        let isBool: boolean = this.typeService.isArrayVal(this.sendData, this.searchData[key].uuid, 'uuid');
        this.searchData[key].current = !!isBool;
      }
    }
    if(this.searchVal) {
      this.searchContactsImport();
    }
  }

  /**
   * 删除对应的数据
   * @param data
   */
  setSearchElementStyle(data: any) {
    for (let key in this.sendData) {
      if (this.sendData[key].uuid === data.uuid) {
        this.sendData.splice(parseInt(key), 1);
        break;
      }
    }
  }

  /**
   * 取消search
   */
  onSearchClose(){
    this.searchVal = '';
  }
}
