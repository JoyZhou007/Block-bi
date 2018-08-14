import {Component, OnInit, Inject, Input, Output,EventEmitter} from '@angular/core';
@Component({
  selector: 'personal-photo',
  templateUrl: '../template/personal-photo.component.html'
})
export class PersonalPhotoComponent implements OnInit {

  public userLoginData: any;
  public personalData: any;
  public cropStatus: number = 0;
  public avatarUrl: any;
  public fileData: any = '';
  public avatarType: number = 2;
  public userUuid: number;
  public avatarId: number;
  public deletePic:boolean = false;
  public upload:any;

  constructor(@Inject('user-data.service') public userDataService: any,
              @Inject('app.config') public config: any,
              @Inject('file.service') public file: any) {
  }
  @Output() public uploadResult : EventEmitter<any> = new EventEmitter();
  @Input() set uploadPic(data : any) {
    this.upload = data;
  }
  ngOnInit() {
    this.userLoginData = this.userDataService.getUserIn();
    this.userUuid = this.userLoginData.user.uuid;
    this.avatarUrl = this.config.resourceDomain + this.userDataService.getCurrentProfilePath(380);
    this.avatarId = 0;
    this.avatarType = 1; //用户头像
    this.cropStatus = 0;
    this.fileData = '';
  }

  //显示上传的头像
  doShowAvatar(data: any) {
    this.userLoginData.user.user_profile_path = data.file_path;
    this.userDataService.setUserIn(this.userLoginData);
    this.avatarUrl = this.config.resourceDomain + data.file_path;
    this.uploadResult.emit(data.id);
  }

  /**
   * 裁剪图片后
   */
  doCropEvent(img: any) {
    this.avatarUrl = img;
    this.fileData = img;
  }

}
