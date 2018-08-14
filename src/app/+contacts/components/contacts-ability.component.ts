import {Component, OnInit, Inject, ViewChild, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ContactModelService, ContactsList, PersonalModelService} from '../../shared/services/index.service';
import * as peofileConfig from '../../shared/config/profile.config';
const SKILL_LEVEL: Array<string> = ['Elementary level', 'Limited working level', 'Professional level', 'Native level'];
const SKILL_LEVEL_ZH: Array<string> = ['基础等级', '限于工作', '专业等级', '国家级别'];

@Component({
  selector: 'contacts-ability',
  templateUrl: '../template/contacts-ability.component.html',
  styleUrls: [
    '../../../assets/css/contacts/contact.css',
    '../../../assets/css/account/account.css'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ContactModelService, PersonalModelService]
})

export class ContactsAbilityComponent implements OnInit {
  //params
  public skillList: any;
  private contactList: any;
  public skillNameList: Array<any>;
  public skillLevel: Array<string> = [];
  public likeUsersLen: number;
  private userInfo: any;
  public noData: string = peofileConfig.PROFILE_COMPANY_NODATA;
  public uid: any;
  public init: boolean = false;
  public isZhLan: boolean;
  @Output('hasInit') outHasInit: any = new EventEmitter<any>();

  constructor(public contactModelService: ContactModelService,
              private personalModelService: PersonalModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              public activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.contactList = this.userDataService.getContactList();
    this.userInfo = this.userDataService.getUserIn().user;
    if (this.translate.lan == 'zh-cn') {
      this.isZhLan = true;
      this.skillLevel = SKILL_LEVEL_ZH;
    } else {
      this.isZhLan = false;
      this.skillLevel = SKILL_LEVEL;
    }

    //获取地址参数
    this.activatedRoute.params.subscribe((params: any) => {
      if (this.uid != params.uid && params.type === 'ability') {
        this.init = false;
        this.uid = params.uid;
        //请求json文件
        if (!this.skillNameList) {
          this.personalModelService.queryJson(
            'GET',
            'assets/json/skill.json',
            '',
            (data: any) => {
              this.skillNameList = data;
              this.fetchFriendInfo();
            }
          );
        } else {
          this.fetchFriendInfo();
        }
      }
    });
  }

  /**
   * 点赞
   * @param isPoint
   * @param skill
   */
  doPoint(isPoint: number, skill: any) {
    let params: any;
    if (this.uid) {
      params = {uid: this.uid, skill_id: skill.skill_name};
    }
    this.personalModelService.skillPoint(params, (data: any) => {
      if (data.status === 1) {
        skill.is_point = (skill.is_point === 1) ? 0 : 1;
        if (skill.is_point === 0) {
          for (let list in skill.likeUsers) {
            if (skill.likeUsers[list] && skill.likeUsers[list].uid === this.userInfo.uuid) {
              skill.likeUsers.splice(list, 1);
              this.likeUsersLen = this.typeService.getDataLength(skill.likeUsers);
              break;
            }
          }
        } else {
          skill.likeUsers.push({
            user_profile_path: this.userInfo.user_profile_path,
            uid: this.userInfo.uuid
          });
        }
      }
    })
  }

  //获取数据
  fetchFriendInfo() {
    let params: any = {
      uid: this.uid,
      personal_module: 'user_analysis'
    };
    this.contactModelService.fetchFriendInfo({data: params},
      (response: any) => {
        this.init = true;
        if (response.status === 1) {
          this.skillList = response.data.hasOwnProperty('skill') ? response.data.skill : [];
        } else {
          this.dialogService.openError({simpleContent:'fetch friend info failed!'});
        }
        this.outHasInit.emit();
      }
    );
  }
}
