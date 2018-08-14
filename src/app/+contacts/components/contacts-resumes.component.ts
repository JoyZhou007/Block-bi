import {Component, OnInit, Inject, ViewChild, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PersonalModelService, ContactModelService} from '../../shared/services/index.service';
import * as profileConfig from '../../shared/config/profile.config';

@Component({
  selector: 'contacts-resumes',
  templateUrl: '../template/contacts-resumes.component.html',
  styleUrls: ['../../../assets/css/contacts/contact.css', '../../../assets/css/account/account.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [PersonalModelService]
})

export class ContactsResumesComponent implements OnInit {

  public getEducations: any;
  public getExperiences: any;
  public resumeShow: boolean = false;
  public companyData: any;
  public noData: string = profileConfig.PROFILE_COMPANY_NODATA;
  public uid: any;

  public init:boolean = false;
  @Output('hasInit') outHasInit: any = new EventEmitter<any>();

  constructor(public activatedRoute: ActivatedRoute,
              public contactModelService: ContactModelService,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user-data.service') public userDataService: any) {
  }

  ngOnInit() {
    //获取地址参数
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.type == 'resume' && this.uid != params.uid) {
        this.init = false;
        this.uid = params.uid;
        //教育信息初始化
        this.initEducation();
      }
    });
    if(this.translate.lan == 'zh-cn'){
      this.noData = profileConfig.PROFILE_COMPANY_NODATA_ZH;
    }else {
      this.noData = profileConfig.PROFILE_COMPANY_NODATA;
    }
  }

  /**
   * 获取数据
   */
  initEducation() {
    this.contactModelService.fetchFriendInfo(
      {
        data: {
          uid: this.uid,
          personal_module: 'resume',
        }
      }, (data: any) => {
        this.init = true;
        if (data.data && data.status === 1) {
          //educations
          this.getEducations = data.data.educations ? data.data.educations : [];
          //experiences
          this.getExperiences = data.data.experiences ? data.data.experiences : [];
        } else {
          this.dialogService.openError({simpleContent: 'fetch education info failed!'});
          this.resumeShow = true;
        }
        this.outHasInit.emit();
      }
    );
  }
}
