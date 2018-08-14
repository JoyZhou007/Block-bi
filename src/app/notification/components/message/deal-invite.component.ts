import {Component, Inject, OnInit,
  AfterViewInit, Input} from '@angular/core';
import {
  ContactModelService, ContactInfo
} from '../../../shared/services/index.service';


@Component({
  selector: 'deal-invite',
  templateUrl: '../../template/message/deal-invite.component.html',
  providers: [ContactModelService]
})

export class DealInviteComponent implements OnInit {
  public userData:any;
  public companyData:any;
  public inviteList:any;
  public inviteGroupMember:any;
  public selectMemmbers:any;
  public addMemberList:boolean=false;
  public isFriendToggle:any;
  public isAllFriendSelect:boolean=false;
  public allFriendChange:boolean=false;
  public friendIndex:number=0;
  public newWorkMemberInfo:any;
  public newWorkMembers:any;
  public allInviteList:any;
  public showHoverBorder: boolean = false;

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.inviteList=data;
      this.init();
    }
  }

  constructor(
    public contactModelService:ContactModelService,
    @Inject('notification.service') public notificationService:any,
    @Inject('app.config') public appConfig:any,
    @Inject('type.service') public typeService:any,
    @Inject('im.service') public chatService:any,
    @Inject('user-data.service') public userDataService:any,
    @Inject('company-data.service') public companyDataService:any,
    @Inject('page.element') public element:any) {
  }
  //启动
  ngOnInit() {
    this.init();
  }

  init() {
    this.allInviteList=[];
    this.newWorkMembers=[];
    this.selectMemmbers=[];
    this.newWorkMemberInfo={};
    this.inviteGroupMember = {perm:1,setWords:'PRIVATE',setClassValue:'new-private-invite'};
    this.getUserIn();
  }

  //获取用户信息
  getUserIn() {
    if(!this.userData) {
      this.userData = this.userDataService.getUserIn();
    }
    if(!this.companyData) {
      this.companyData = this.companyDataService.getLocationCompanyIn();
    }
  }

  //点击下拉显示待选的联系人
  invitePeople() {
    this.addMemberList = !this.addMemberList;
    this.showHoverBorder = !this.showHoverBorder;
  }

  showAllFriend() {
    this.isFriendToggle=!this.isFriendToggle;
  }

  /**
   * 点击选择新的FRIEND成员进群
   */
  selectInviteMember(data:any) {

    let isUid = this.typeService.isArrayKey(data.uid, this.newWorkMembers, 'uid');
    if (!isUid) {
      let a: any;
      a = this.typeService.clone(this.newWorkMemberInfo);
      a.uid=data.uid;
      this.newWorkMembers.push(data);
      this.selectMemmbers.push(a);
    }
    this.friendIndex++;
    if(this.friendIndex === this.allInviteList.length) {
      this.isAllFriendSelect=true;
      this.allFriendChange=true;
    }
  }

  /**
   * 确认选择
   */
  done() {
    this.addMemberList = false;
    this.showHoverBorder = false;
  }

  /**
   * 群组同意邀请
   */
  inviteNewMembers() {
    this.chatService.newGroupInvite({
      introducer:this.inviteList.owner,
      form:this.inviteList.form,
      gid:this.inviteList.gid,
      name:this.inviteList.name,
      members:this.newWorkMembers,
    });
  }


  /**
   * 删除被选中的人
   */
  deleteTheMember(data:any,event:any) {
    event.stopPropagation();
    for (var i in this.newWorkMembers) {
      if (this.newWorkMembers[i] === data) {
        let k = parseInt(i);
        this.newWorkMembers.splice(k, 1);
        this.selectMemmbers.splice(k,1);
      }
    }
      this.friendIndex--;
      this.isAllFriendSelect=false;
      this.allFriendChange=false;
    }

  /**
   * 群主全选所有非群主邀请的人
   */
  selectAllInviteMembers(data:any) {
    if(!this.isAllFriendSelect) {
      for(let i=0;i<data.length;i++) {
        let isUuid = this.typeService.isArrayKey(data[i].uid, this.newWorkMembers, 'uid');
        if (!isUuid) {
          let a: any;
          a = this.typeService.clone(this.newWorkMemberInfo);
          a.uid=data[i].uid;
          this.newWorkMembers.push(data[i]);
          this.selectMemmbers.push(a);
        }
      }
      this.isAllFriendSelect=true;
      this.allFriendChange=true;
    } else {
      for(let i=0;i<data.length;i++) {
        for (var j in this.newWorkMembers) {
          if (this.newWorkMembers[j] === data[i]) {
            let k = parseInt(j);
            this.newWorkMembers.splice(k,1);
            this.selectMemmbers.splice(k,1);
          }
        }
      }
      this.isAllFriendSelect=false;
      this.allFriendChange=false;
    }
  }

}
