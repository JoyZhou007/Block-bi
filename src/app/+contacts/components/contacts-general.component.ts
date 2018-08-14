import {
  Component, OnInit, Inject, ViewChild, Input, ViewEncapsulation, Output, EventEmitter,
  OnDestroy
} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PersonalModelService, ContactModelService} from '../../shared/services/index.service';
import * as profileConfig from '../../shared/config/profile.config';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'contacts-general',
  templateUrl: '../template/contacts-general.component.html',
  styleUrls: [
    '../../../assets/css/contacts/contact.css',
    '../../../assets/css/account/account.css'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ContactModelService, PersonalModelService]
})

export class ContactsGeneralComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public contactsInfo: any = {};
  public genderVal: string;
  public countryVal: string;
  public shortName: string;
  public isPrivate: boolean = false;
  private uid: string;
  public individual: any = {};
  public companyList: Array<any> = [];
  public privacy: any = {};
  public noData: string = profileConfig.PROFILE_COMPANY_NODATA;
  public init: boolean = false;
  public subscription: Subscription;
  public currentPSID = '';
  @Output('hasInit') outHasInit: any = new EventEmitter<any>();

  constructor(public activatedRoute: ActivatedRoute,
              public contactModelService: ContactModelService,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('const-interface.service') public constInterfaceService: any) {
  }

  ngOnInit() {
    this.currentPSID = this.userDataService.getCurrentCompanyPSID();
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND) {
        if (message.hasOwnProperty('data')
          && message.data.hasOwnProperty('owner')
          && message.data.owner.hasOwnProperty('uuid') && message.data.owner.uuid == this.uid
          && message.data.owner.hasOwnProperty('psid')) {
          if (this.companyList) {
            for (let k in this.companyList) {
              if (this.companyList[k].uid == message.data.owner.psid) {
                this.companyList[k].could_add = false;
                break;
              }
            }
          }
        }
      }
    });
    this.activatedRoute.params.subscribe((params: any) => {
      if (this.uid != params.uid && params.type === 'general') {
        this.uid = params.uid;
        this.isPrivate = !this.typeService.isNumber(this.uid);
        this.init = false;
        //初始化个人数据
        this.fetchFriendInfo();
      }
    });
    if(this.translate.lan == 'zh-cn'){
      this.noData = profileConfig.PROFILE_COMPANY_NODATA_ZH;
    }else {
      this.noData = profileConfig.PROFILE_COMPANY_NODATA;
    }
  }

  /**
   * 获取用户信息
   */
  fetchFriendInfo(): any {
    this.contactModelService.fetchFriendInfo(
      {
        data: {
          uid: this.uid,
          personal_module: 'general'
        }
      }, (response: any) => {
        this.init = true;
        if (response.status === 1) {
          if (response.data && this.typeService.getObjLength(response.data) > 0) {
            this.contactsInfo = response.data;
            this.individual = this.contactsInfo.individual;
            this.companyList = this.contactsInfo.company;
            this.privacy = this.contactsInfo.privacy;
            //性别初始化
            this.genderVal = this.constInterfaceService.transformGender(parseInt(this.individual.gender));
            //国家初始化
            this.constInterfaceService.initCountry(this.individual.country, (data: string) => {
              this.countryVal = data;
            });
            //银行初始化
            this.constInterfaceService.initBank(parseInt(this.individual.bank_type), (data: string) => {
              this.shortName = data;
            });
          }
        } else {
          this.dialogService.openError({simpleContent:'fetch friend info failed!'});
        }
        this.outHasInit.emit(true);
      }
    );
  }

  addBusinessFriend(event: any, companyData: any) {
    event.stopPropagation();
    let settings = {
      mode: '1',
      title: 'NEW CONTACT',
      isSimpleContent: false,
      componentSelector: 'new-contact',
      componentData: {
        relationship: {company: true},
        work_name: companyData.work_name,
        p_name: companyData.p_name ? companyData.p_name : '',
        company_name: companyData.company_name ? companyData.company_name : '',
        user_profile_path: companyData.user_profile_path ? companyData.user_profile_path : '',
        uid: companyData.uid,
        uuid: ''
      },
      buttons: [{type: 'cancel'}, {btnEvent: 'sendFriendRequest'}]
    };
    this.dialogService.openNew(settings);
  }
}
