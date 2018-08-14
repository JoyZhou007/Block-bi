/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/8/3.
 *
 *
 * 显示人物头像模块，单击可打开mini对话框
 */
import {Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from "@angular/core";

const enLetter: Array<string> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export interface UserInfo {
  work_name: string, //工作名字
  p_name: string, //职位名字
  name: string, // 昵称(暂无)
  work_email: string, //工作邮箱
  work_phone: string, //工作电话
  email: string, //私人邮箱
  phone: string, // 私人电话
  location: string, // 地理位置
  user_profile_path: string, //头像路径 不带domain
  uid: string,  //可能是psid也可能是uuid
  profile: string,
  owner_profile: string,
  owner_name: string
}

export interface ProfileImageSetting {
  lazy_load: boolean, //延迟加载
  img_size: number,   //头像大小 20 | 36 | 80 | 230 | 300 | 380
  img_radius: number, //圆角大小  2 | 4  | 5
  img_pos: string,    //头像和名字的排布，'left'|'right'
  show_name: boolean, //是否显示昵称
  show_work_name: boolean,//是否显示工作名
  show_pos_name: boolean, //是否显示职位名
  mini_dialog: boolean,   //是否打开mini聊天框,
  white_color: boolean   //名字样式是否为白色,
  click_event?: Function
}


export const DefaultUserInfo: UserInfo = {
  work_name: '',
  p_name: '',
  name: '',
  work_email: '',
  work_phone: '',
  email: '',
  phone: '',
  location: 'cn',
  user_profile_path: '',
  uid: '',
  profile: '',
  owner_profile: '',
  owner_name: ''
};

export const DefaultSetting: ProfileImageSetting = {
  lazy_load: false, //默认不延迟加载
  img_size: 24,  //头像大小
  img_radius: 4, //圆角大小
  img_pos: 'left', //头像和名字的排布，'left'|'right'
  show_name: false, //是否显示个人名
  show_work_name: true, //是否显示工作名
  show_pos_name: false, //是否显示职位名
  mini_dialog: true, // 打开聊天框
  white_color: false // 字体颜色
};

@Component({
  selector: 'profile-img',
  template: `
      <div class="pull-left {{parentCls}}" *ngIf="profileSetting && userInfo">
          <div *ngIf="!tplImgPath">
              <i *ngIf="!tplImgPath" class="d-letter g-border4 g-margin-right10 d-letter-color">{{tplPNameFirstLetter}}</i>
              <span *ngIf="profileSetting.show_work_name" class="{{profileSetting.white_color ? 'f12-f' : 'f19-f'}} base g-text-indent0">
                {{userInfo.p_name ? userInfo.p_name : ''}}
              </span>
              <!--<span class="pull-left">-->
                <!--<span class="f5-f g-display"></span>-->
              <!--</span>-->
          </div>
          <div *ngIf="tplImgPath">
              <img *ngIf="tplImgPath" width="{{profileSetting.img_size}}" height="{{profileSetting.img_size}}"
                   alt="{{tplWorkName}}"
                   class="pull-left {{imgCls}} {{radiusCls}}"
                   src="{{tplImgPath}}"
                   title="{{!isSelf ? tplWorkName : 'You'}}"
                   (click)="openMissionMiniDialog($event)">
              <i class="base" *ngIf="profileSetting.show_work_name && !profileSetting.show_pos_name">{{tplWorkName}}</i>
              <span class="pull-left" *ngIf="profileSetting.show_work_name && profileSetting.show_pos_name">
                <span class="{{whiteCol ? 'f12-f' : 'f19-f'}} g-display g-text-indent0" style="line-height: 12px;">{{tplWorkName}}</span>
                <span class="f5-f g-display g-margin-top5 g-text-indent0">{{userInfo.p_name ? userInfo.p_name : ''}}</span>
              </span>
          </div>

      </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class ProfileImageComponent implements OnInit, OnDestroy {
  public parentCls: string = '';
  public imgCls: string = '';
  public radiusCls: string = '';
  public tplImgPath: string = '';
  public tplWorkName: string = '';
  // 职位名首字母
  public tplPNameFirstLetter: string = '';
  public isSelf: boolean = false;
  public whiteCol: boolean = false;
  public tplPNameFirstLetterCase: string = '';

  private _userInfo: UserInfo;
  private _settings: ProfileImageSetting;

  @Output('outClick') outClick = new EventEmitter<any>();
  @Input('userInfo')
  public set userInfo(d: any) {
    if (d) {
      // 检查是否有uid
      // 或者psid或者uuid
      // 有uid的情况 优先uid, 其次psid 最后uuid
      let data = this.typeService.clone(d);
      if (!data.hasOwnProperty('uid') && data.hasOwnProperty('psid') && data.psid != '') {
        data['uid'] = data['psid'];
        delete data['psid'];
      } else if (!data.hasOwnProperty('uid') && data.hasOwnProperty('uuid') && data.uuid != '') {
        data['uid'] = data['uuid'];
        delete data['uuid'];
      } else if (!data.hasOwnProperty('uid') && data.hasOwnProperty('id')) {
        data['uid'] = data['id'];
        data['work_name'] = data['label'];
        data['user_profile_path'] = data['imageLabel'];
        data['p_name'] = data['desc'];
      } else if (!data.hasOwnProperty('uid')) {
      }
      let defaultUserInfo = this.typeService.clone(DefaultUserInfo);
      this._userInfo = Object.assign(defaultUserInfo, data);
      this.isSelf = this._userInfo.uid == this.userDataService.getCurrentUUID()
        || this._userInfo.uid == this.userDataService.getCurrentCompanyPSID();
      this.initWorkNameBySetting();
      this.initImageBySize();
    }
  }

  public get userInfo() {
    return this._userInfo;
  }

  @Input('settings')
  public set profileSetting(data: ProfileImageSetting) {
    if (data) {
      this._settings = Object.assign({}, DefaultSetting, data);
      this.initClsBySize();
      this.initImageBySize();
    }
  }

  public get profileSetting() {
    return this._settings;
  }

  constructor(@Inject('app.config') public appConfig: any,
              @Inject('text.const') public textConst: any,
              @Inject('file.service') public fileService: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  initClsBySize() {
    this.parentCls = 'g-vertical-img' + this._settings.img_size.toString();
    this.imgCls = 'g-img' + this._settings.img_size.toString();
    this.radiusCls = 'g-border' + this._settings.img_radius.toString();
  }

  initWorkNameBySetting() {
    this.tplWorkName = '';
    if (this._userInfo) {
      let name = this._userInfo.work_name;
      if (!name) {
        name = this._userInfo.name;
      }
      this.tplWorkName = name ? name : this.textConst.POSITION_EMPTY_PERSON;
      this.tplPNameFirstLetter = this.tplWorkName.substr(0, 1);
      if(/^[A-Za-z]$/.test(this.tplPNameFirstLetter)) {
        this.tplPNameFirstLetterCase = this.tplPNameFirstLetter.toLowerCase();
      }else {
        this.tplPNameFirstLetterCase = enLetter[parseInt(this.tplPNameFirstLetter) - 1];
      }
    }

  }

  initImageBySize() {
    if (this._userInfo && this._settings) {
      // 有头像
      if(this._userInfo.owner_profile) {
        this._userInfo.user_profile_path = this._userInfo.owner_profile;
        delete this._userInfo.owner_profile;
      }
      if(this._userInfo.profile) {
        this._userInfo.user_profile_path = this._userInfo.profile;
        delete this._userInfo.profile;
      }
      if(this._userInfo.owner_name) {
        this._userInfo.work_name = this._userInfo.owner_name;
        delete this._userInfo.owner_name;
      }
      if (this._userInfo.user_profile_path) {
        let isBool: boolean = false;
        if(new RegExp('^' + (this.appConfig.resourceDomain)).test(this._userInfo.user_profile_path)) {
          isBool = true;
        }
        let path = isBool ? this._userInfo.user_profile_path : this.appConfig.resourceDomain + this._userInfo.user_profile_path;
        if (this._settings.img_size) {
          // 匹配实际可用图像地址
          let configSize = this.fileService.getAvailableSize();
          if (this.typeService.inArray(this._settings.img_size, configSize)) {
            path = this.fileService.getImagePath(this._settings.img_size, path);
          } else if (configSize) {
            let fetchSize = 0;
            if (this._settings.img_size >= configSize[configSize.length - 1]) {
              // 最大尺寸
              fetchSize = configSize[configSize.length - 1];
            } else if (this._settings.img_size <= configSize[0]) {
              //最小尺寸
              fetchSize = configSize[0];
            } else {
              //取合适尺寸
              for (let i = 0; i < configSize.length - 1; i++) {
                if (this._settings.img_size >= configSize[i] && this._settings.img_size < configSize[i + 1]) {
                  fetchSize = configSize[i + 1];
                  break;
                }
              }
            }
            path = this.fileService.getImagePath(fetchSize, path);
          }

        }
        this.tplImgPath = path;
      }
    }
  }

  /**
   * 点击用户头像显示半屏聊天(迷你聊天窗) mission
   */
  openMissionMiniDialog(event: MouseEvent) {
    event.stopPropagation();
    if (this._settings.mini_dialog) {
      if (this._userInfo) {
        // uid === 0 代表系统
        if (this._userInfo.uid && this._userInfo.uid != '0') {
          if (!this.isSelf) {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
              data: {
                selector: 'bi-mini-dialog',
                options: {
                  member: {uid: this._userInfo.uid, work_name: this._userInfo.work_name?this._userInfo.work_name: this._userInfo.name},
                  form: this.typeService.isNumber(this._userInfo.uid) ? 2 : 1
                }
              }
            });
          }
        }
      }
    } else {
      this.outClick.emit();
    }

  }

}