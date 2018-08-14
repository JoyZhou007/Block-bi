import {Component, Inject, OnInit, ViewChild, Input} from '@angular/core';

@Component({
  selector: 'contacts-recommendation',
  templateUrl: '../template/contacts-recommendation.component.html',
  styleUrls: ['../../../assets/css/contacts/contacts-alert.css']
})

export class ContactsRecommendationComponent implements OnInit {

  public contactList: any;  //联系人列表
  public userData: any; //用户信息
  public companyData: any;  //公司信息
  public isShowContacts: boolean = false; //下拉列表变量
  public recommendContacts: any = {};  //推荐人信息
  public recommendRemark: string = '';  //默认推荐备注信息
  public contactsBorder: boolean = false; //边框变量
  public selectMembers: Array<any> = []; //选中的成员
  private friendType: number; //好友关系

  @ViewChild('selectAllInternal') public selectAllInternal: any;
  @ViewChild('selectAllPartner') public selectAllPartner: any;
  @ViewChild('selectAllClient') public selectAllClient: any;
  @ViewChild('selectAllSupplier') public selectAllSupplier: any;
  @ViewChild('selectAllFriend') public selectAllFriend: any;

  constructor(
    @Inject('app.config') public config:any,
    @Inject('page.element') public element:any,
    @Inject('type.service') public typeService:any,
    @Inject('user-data.service') public userDataService:any,
    @Inject('im.service') public memberService : any,
    @Inject('company-data.service') public companyDataService:any,
    @Inject('dialog.service') public dialogService: any
  ) {
  };

  //启动
  ngOnInit() {
   this.init();
  };

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.recommendContacts = data;
      this.init();
    }
  };

  init() {
    //好友列表
    this.contactList = this.userDataService.getContactList();

    //获取用户信息
    this.getUserIn();

    //增加新属性/去掉自己
    for(let key in this.contactList) {
      if(this.typeService.getDataLength(this.contactList[key]) > 0) {
        for(let k in this.contactList[key]) {
          if(this.contactList[key][k].type !== parseInt(this.recommendContacts.type)) {
            this.contactList[key][k].defaultStyle = true;
          }
          if(this.contactList[key][k].uid === this.recommendContacts.uid) {
            this.contactList[key].splice(k, 1);
          }
        }
      }
    }
  }

  //显示联系人列表
  showContacts() {
    this.isShowContacts = !this.isShowContacts;
    this.contactsBorder = !this.contactsBorder;
  };

  /**
   * 选择/取消选择
   * @param event
   * @param currData
   * @param allTag
   * @param data
   */
  selectCurrent(event: any, currData: any, allTag: any, data: any) {
    if(currData.type === parseInt(this.recommendContacts.type)) {
      if (this.element.hasClass(event.srcElement, 'current')) {
        currData.currentClass = false;
        for (let key in this.selectMembers) {
          if (this.selectMembers[key].uid === currData.uid) {
            this.selectMembers.splice(parseInt(key), 1);
            if (this.element.hasClass(allTag, 'current')) {
              this.element.setClass(allTag, '', 'current');
            }
            break;
          }
        }
      } else {
        currData.currentClass = true;
        if (!this.typeService.isArrayVal(this.selectMembers, 'uid', currData.uid)) {
          this.selectMembers.push(currData);
        }

        if(currData.type !== this.friendType) {
          this.friendType = currData.type;
        }
      }
      this.isSelectedActive(allTag, data, this.typeService.getDataLength(data));
    }
  }

  /**
   * 设置全选按钮样式
   * @param allMember
   * @param data
   * @param length
   */
  isSelectedActive(allMember: any, data?: any, length?: number) {
    let count: number = 0;
    for(let key in data) {
      if(data[key].currentClass) {
        count += 1;
      }
    }
    if(count === length) {
      this.element.setClass(allMember, 'current');
    }else {
      if(this.element.hasClass(allMember, 'current')) {
        this.element.setClass(allMember, '', 'current');
      }
    }
  }

  /**
   * 选中/移除成员
   * @param member
   * @param isSelect
   */
  selectAllMember(member: any, isSelect: boolean = true) {
    let isUid: boolean;
    for(let key in member) {
      isUid = this.typeService.isArrayVal(this.selectMembers, 'uid', member[key]['uid']);
      if(!isUid && isSelect) {
        member[key].currentClass = true;
        this.selectMembers.push(member[key]);
        if(member[key].type !== this.friendType) {
          this.friendType = member[key].type;
        }
      }else {
        for(let k in this.selectMembers) {
          if(member[key]['uid'] === this.selectMembers[k]['uid']) {
            member[key].currentClass = false;
            this.selectMembers.splice(parseInt(k), 1);
          }
        }
      }
    }
  }

  /**
   * 全选/反选
   * @param member
   * @param allMember
   */
  selectAllMembers(member: any, allMember: any) {
    let len: number = this.typeService.getDataLength(member);
    if((len !== 0) || (member[0].type === parseInt(this.recommendContacts.type))) {
      if (!this.element.hasClass(allMember, 'current')) {
        this.element.setClass(allMember, 'current');
        this.selectAllMember(member);
      } else {
        this.element.setClass(allMember, '', 'current');
        this.selectAllMember(member, false);
      }
    }
  }

  /**
   * 删除成员
   * @param event
   * @param member
   */
  deleteTheMember(event: any, member: any) {
    event.stopPropagation();
    let setStyle: any;
    for(let key in this.selectMembers) {
      if(member['uid'] === this.selectMembers[key].uid) {
        this.selectMembers[key].currentClass = false;
        if(member.type === 0) {
          setStyle = this.selectAllInternal;
        }else if(member.type === 1) {
          setStyle = this.selectAllClient;
        }else if(member.type === 2) {
          setStyle = this.selectAllSupplier;
        }else if(member.type === 3) {
          setStyle = this.selectAllPartner;
        }else if(member.type === 4) {
          setStyle = this.selectAllFriend;
        }
        this.isSelectedActive(setStyle.nativeElement);
        this.selectMembers.splice(parseInt(key), 1);
        break;
      }
    }
  }

  //获取用户信息
  getUserIn() {
    if (!this.userData) {
      this.userData = this.userDataService.getUserIn();
    }
    if (!this.companyData) {
      this.companyData = this.companyDataService.getLocationCompanyIn();
    }
  };

  /**
   * 确认选择
   */
  done() {
    this.isShowContacts = false;
    this.contactsBorder = false;
  };

  /**
   * 发送推荐好友
   */
  recommendTheContacts() {
    let newObj: Array<any> = [];
    for(let key in this.selectMembers) {
      newObj.push(this.selectMembers[key].uid);
    }
    this.memberService.recommendNewContacts({
      referral: this.recommendContacts.uid,
      receiver: newObj,
      remark: this.recommendRemark,
      friendType: this.friendType,
      relation: parseInt(this.recommendContacts.type),
      form: 1
    })
  }
}
