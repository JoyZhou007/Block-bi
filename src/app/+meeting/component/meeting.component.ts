/**
 * Created by christine Guo on 2017/4/18.
 */
import {
  Inject, Component, OnInit,
  ViewChild, ViewEncapsulation, AfterViewChecked, ElementRef, OnDestroy, HostListener, AfterContentInit,
} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {MeetingModelService} from '../../shared/services/model/meeting-model.service'
import {Subscription} from "rxjs/Subscription";
import * as meetingConfig from '../../shared/config/meeting.config';
import {Observable} from "rxjs";
@Component({
  selector: 'meeting',
  styleUrls: ['../../../assets/css/meeting/meeting.css'],
  templateUrl: '../template/meeting.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [MeetingModelService],
})
export class MeetingComponent implements OnInit, AfterViewChecked, AfterContentInit, OnDestroy {
  public roomList: Array<any> = []; //房间列表
  public meetingList: Array<any> = []; //会议列表
  public meetingId: string;
  public dateWord = {
    //月份
    month: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],

    monthSmall: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //周
    week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday']
  };
  public roomListClone: Array<any>;

  //分页
  public bindPagingEvent: boolean = false;  //是否绑定分页
  public page: number = 1;  //请求第几页
  public nowShowDate: any;  //请求显示哪天的会议
  public pageIsMAX: boolean = false;  //是否已经是最大分页
  public searchList: Array<any> = [];  //search列表
  public searchText: string = '';
  public isLoading: any = false;  //是否加载分页
  public selectTop: number = 26;  //下拉菜单初始top值
  public subscription: Subscription;
  public noCid: string = meetingConfig.MEETING_NOCID_ERROR;
  public noData: string = meetingConfig.MEETING_NODATA;
  private currentSearchPage: number = 1;
  private isInSearchPart: boolean;
  @ViewChild('scrollToBottom') scrollToBottom: ElementRef;
  @ViewChild('scrollUl') scrollUl: ElementRef;


  constructor(public meetingModelService: MeetingModelService,
              public router: Router,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              public activatedRoute: ActivatedRoute,
              @Inject('app.config') public config: any) {

    this.subscription = this.notificationService.getNotification().subscribe(
      (data: any) => {
        this.dealMessage(data);
      });
  }


  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

  }

  ngAfterContentInit(): void {
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      if (queryParams.hasOwnProperty('keywords')) {
        this.searchText = queryParams['keywords'];
        this.getSearchResult();
        this.isInSearchPart = true;
      } else {
        this.getMeetingList();
        this.isInSearchPart = false;
      }
    });
  }


  /**
   * 一直执行，判断是否该触发下拉加载
   */
  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      let ele = this.scrollToBottom.nativeElement;
      if (!this.bindPagingEvent && ele && ele.hasChildNodes()) {
        for (let i = 0, il = ele.childNodes.length; i < il; i++) {
          if (ele.childNodes[i].id === 'dashboard') {
            let targetElement = ele.childNodes[i];
            this.mouseWheelFunc(targetElement);
            this.bindPagingEvent = true;
          }
        }

      }
    }
  }

  /**
   * 获取meeting 列表
   */
  getMeetingList() {
    //没有公司cid，不能进入meeting
    this.checkPermission(() => {
      //请求room列表
      this.meetingModelService.getMeetingRoomList({}, (response: any) => {
        if (response.status === 1) {
          this.roomList = this.typeService.getObjLength(response.data) > 0 ? response.data : [];
          this.roomListClone = this.typeService.clone(this.roomList);
        }
      });
      //请求room 预定
      let today = this.dateService.nowDateFormat("yyyy-mm-dd");
      this.nowShowDate = today;
      this.page = 1;
      this.meetingModelService.MeetingPreserve({data: {page: this.page, date: today}}, (response: any) => {
        if (response.status === 1) {
          this.meetingList = this.typeService.getObjLength(response.data) > 0 ? response.data : [];
          for (let i = 0; i < this.meetingList.length; i++) {
            this.meetingList[i].isShowSelect = false;
            this.addMeetingAttribute(this.meetingList[i]);
          }
        }
      })
    });
  }

  /**
   * 获取搜索列表
   */
  getSearchResult() {
    this.checkPermission(() => {
      this.meetingModelService.getMeetingRoomList({}, (response: any) => {
        if (response.status === 1) {
          this.roomList = this.typeService.getObjLength(response.data) > 0 ? response.data : [];
          this.roomListClone = this.typeService.clone(this.roomList);
        }
      });
      let data: any = {
        keywords: this.searchText,
        page: this.currentSearchPage
      };
      this.meetingModelService.searchMeeting({data: data}, (response) => {
        if (response.status === 1) {
          this.meetingList =this.typeService.getObjLength(response.data) > 0 ? response.data : [];
          for (let i = 0; i < this.meetingList.length; i++) {
            this.meetingList[i].isShowSelect = false;
            this.addMeetingAttribute(this.meetingList[i]);
          }
        }
      })
    })
  }


  /**
   * 处理通知消息
   * @param data
   */
  dealMessage(data: any) {
    // 添加room
    if (data.act == this.notificationService.config.ACT_COMPONENT_MEETING_ADD_ROOM) {
      this.roomList.push(data.data);
    }
    //修改room
    if (data.act == this.notificationService.config.ACT_COMPONENT_MEETING_UPDATE_ROOM) {
      for (let i = 0; i < this.roomList.length; i++) {
        if (this.roomList[i].id == data.data.id) {
          this.roomList[i].amount = data.data.amount;
          this.roomList[i].name = data.data.name;
          this.roomList[i].projector = data.data.projector;
          this.roomList[i].video = data.data.video;
        }
      }
      this.roomListClone = this.roomList;
    }
    //会议室预定添加
    if (data.act == this.notificationService.config.ACT_COMPONENT_MEETING_ADD_BOOKING_ROOM) {
      this.addMeetingAttribute(data.data);
      this.meetingList.push(data.data);
    }
    //会议室预定修改
    if (data.act == this.notificationService.config.ACTION_MEETING_UPDATEBOOKINGROOM) {
      this.addMeetingAttribute(data.data);
      for (let i = 0; i < this.meetingList.length; i++) {
        if (this.meetingList[i].id == data.data.id) {
          this.meetingList[i] = Object.assign(this.meetingList[i], data.data);
        }
      }
    }
  }

  /**
   * 页面元素滚动触发读取分页数据事件
   * @see MissionListComponent.loadingNextPageMission
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    //Chrome滚动加载
    ele.addEventListener('mousewheel', (event) => {
      this.onScrollFunc(ele);
    })
    // FF
    ele.addEventListener('DOMMouseScroll', () => {
      this.onScrollFunc(ele);
    })
    // IE
    ele.addEventListener('onmousewheel', () => {
      this.onScrollFunc(ele);
    })

  };

  /**
   * 滚动加载判断
   */
  onScrollFunc(ele) {
    //是否到底
    let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);

    if (!this.isInSearchPart) {

      if (!this.pageIsMAX && isToBottom && !this.isLoading) {  //如果没有翻到最后一页 并且已经到底
        this.isLoading = true;
        this.page++;
        this.meetingModelService.MeetingPreserve({data: {page: this.page, date: this.nowShowDate}}, (response: any) => {
          if (response.status === 1) {
            // 允许加载其他分页数据
            this.isLoading = false;
            // 需要重新绑定事件
            this.bindPagingEvent = false;
            if (this.typeService.getObjLength(response.data) > 0) {
              //追加到meeting列表中
              for (let i = 0; i < response.data.length; i++) {
                response.data[i].isShowSelect = false;
                this.addMeetingAttribute(response.data[i]);
                this.meetingList.push(response.data[i]);
              }
            } else {
              this.pageIsMAX = true;
            }
          }
        })
      }
    } else {
      if (!this.pageIsMAX && isToBottom && !this.isLoading) {  //如果没有翻到最后一页 并且已经到底
        this.isLoading = true;
        this.currentSearchPage++;
        let data: any = {
          keywords: this.searchText,
          page: this.currentSearchPage
        };
        this.meetingModelService.searchMeeting({data: data}, (response: any) => {
          if (response.status === 1) {
            // 允许加载其他分页数据
            this.isLoading = false;
            // 需要重新绑定事件
            this.bindPagingEvent = false;
            if (this.typeService.getObjLength(response.data) > 0) {
              //追加到meeting列表中
              for (let i = 0; i < response.data.length; i++) {
                response.data[i].isShowSelect = false;
                this.addMeetingAttribute(response.data[i]);
                this.meetingList.push(response.data[i]);
              }
            } else {
              this.pageIsMAX = true;
            }
          }
        })
      }
    }
  }

  /**
   * search 回车
   */
  onSearchKeyDown(event: any) {
    if (event.keyCode == 13) {
      if (this.searchText !== '') {
        let routerObj = {queryParams: {keywords: this.searchText}};
        this.router.navigate(['/meeting/search'], routerObj);
      } else {
        this.router.navigate(['/meeting/index']);
      }
    }
  }

  /**
   * 处理meeting对象
   */
  addMeetingAttribute(meeting: any) {
    //start
    meeting.startFormat = this.dateService.formatWithTimezone(meeting.start, "HH:MM") + ' ' +
      this.dateService.formatWithTimezone(meeting.start, 'ddS') + ' ' +
      this.dateWord.month[parseInt(this.dateService.formatWithTimezone(meeting.start, "m")) - 1];
    //end
    meeting.endFormat = this.dateService.formatWithTimezone(meeting.end, "HH:MM") + ' ' +
      this.dateService.formatWithTimezone(meeting.end, 'ddS') + ' ' +
      this.dateWord.month[parseInt(this.dateService.formatWithTimezone(meeting.end, "m")) - 1];
    //status
    if (meeting.status == meetingConfig.MEETING_STATUS_CANCEL) {
      meeting.statusFormat = 'Cancel';
    } else if (meeting.status == meetingConfig.MEETING_STATUS_PENDING) {
      meeting.statusFormat = 'Pending';
    } else if (meeting.status == meetingConfig.MEETING_STATUS_ARRANGED) {
      meeting.statusFormat = 'Arranged';
    } else if (meeting.status == meetingConfig.MEETING_STATUS_IN_PROCESS) {
      meeting.statusFormat = 'In process';
    } else if (meeting.status == meetingConfig.MEETING_STATUS_DONE) {
      meeting.statusFormat = 'Done';
    }
    //pic
    //  owner头像
    meeting.user_profile_path = this.userDataService.getCurrentProfilePath() ? this.config.resourceDomain + this.userDataService.getCurrentProfilePath() : '';
    //会议名字
    for (let j = 0; j < this.roomList.length; j++) {
      if (this.roomList[j].id == meeting.crid) {
        meeting.room_name = this.roomList[j].name;
      }
    }
  }

  /**
   * 添加，修改meeting
   * @param type
   * @param meeting
   */
  meetingHandle(type: string, meeting?: any) {
    this.checkPermission(() => {
      let addObj: any = {
        type: type
      };
      let settings: any;
      if (type == 'add') {
        settings = {
          mode: '1',
          title: 'SET MEETING ROOM',
          isSimpleContent: false,
          componentSelector: 'meeting-room-dialog',
          componentData: addObj,
          buttons: [
            {
              type: 'cancel',
            },
            {
              type: 'upload',
              btnText:'UPLOAD',
              btnEvent: 'sendHandle',
            }
          ],
        };

      } else if (type == 'update') {
        addObj.name = meeting.name;
        addObj.amount = meeting.amount;
        addObj.id = meeting.id;
        addObj.projector = meeting.projector;
        addObj.video = meeting.video;

        settings = {
          mode: '1',
          title: 'EDIT MEETING ROOM',
          isSimpleContent: false,
          componentSelector: 'meeting-room-dialog',
          componentData: addObj,
          buttons: [
            {
              type: 'delete',
              btnEvent: () => {
                this.deleteMeeting(meeting.id);
              },
            },
            {
              type: 'upload',
              btnText:'UPLOAD',
              btnEvent: 'sendHandle',
            }
          ],
        };
      }
      this.dialogService.openNew(settings);
    })


  }

  /**
   * 删除会议房间
   */
  deleteRoom(event: any, meetingId: string) {
    this.meetingId = meetingId;
    let settings = {
      mode: '1',
      title: 'DELETE MEETING ROOM',
      simpleContent: meetingConfig.MEETING_DELETEROOM,
      isSimpleContent: true,
      buttons: [
        {
          type: 'cancel',
          btnEvent: '',
        },
        {
          type: 'delete',
          btnEvent: () => {
            this.deleteMeeting()
          },
        }
      ],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 删除meeting room
   */
  deleteMeeting(id?:number) {
    this.meetingModelService.deleteMeetingRoom({id: id ? id : parseInt(this.meetingId)}, (response: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: {data:response} });
      if (response.status == 1) {
        let deleteId = id ? id : this.meetingId;
        for (let i = 0; i < this.roomList.length; i++) {
          if (this.roomList[i].id == deleteId) {
            this.roomList.splice(i, 1);
            this.roomListClone = this.roomList;
          }
        }
      }
    })
  }

  checkPermission(callback?: Function) {
    if (!this.companyDataService.getCurrentCompanyCID()) {
      this.dialogService.openNoAccess();
    } else {
      if (callback) {
        callback();
      }
    }
  }


  /**
   * 添加预定会议
   */
  meetingReserve(type: string, meeting?: any) {
    this.checkPermission(() => {
      let addObj: any = {
        type: type,
        data: this.roomList,
        meetings: this.meetingList
      };
      let settings: any;
      if (type == 'add') {

        settings = {
          mode: '1',
          title: 'ADD MEETING',
          isSimpleContent: false,
          componentSelector: 'meeting-reserve-dialog',
          componentData: addObj,
          buttons: [
            {
              type: 'cancel'
            },
            {
              type: 'send',
              btnEvent: 'addMeeting'
            }
          ],
        };
      } else if (type == 'update') {

        addObj.meeting = meeting;
        settings = {
          mode: '1',
          title: "SET MEETING",
          isSimpleContent: false,
          componentSelector: 'meeting-reserve-dialog',
          componentData: addObj,
          buttons: [
            {
              type: 'cancel',
            },
            {
              type: 'send',
              btnEvent: 'addMeeting',
            }
          ],
        };
      }
      this.dialogService.openNew(settings);
    });

  }

  /**
   * 点击会议室名
   */
  onClickRoomName(event: any, meeting: any, index) {
    event.stopPropagation();
    meeting.isShowSelect = !meeting.isShowSelect;
    this.forEachTime(meeting);
    this.judgeNumber(meeting);
    this.judgeProject(meeting);
    this.judgeVideo(meeting);
    //如果底部不够放下下拉菜单，则改变下拉菜单的top值
    if (meeting.isShowSelect) {
      let pos = document.documentElement.clientHeight - (index * 36 - this.scrollUl.nativeElement.scrollTop);
      if (pos < 320) {
        this.selectTop = -170;
      } else {
        this.selectTop = 26;
      }
    }

  }

  /**
   * 筛选时间段是否重叠
   */
  forEachTime(meeting: any) {
    for (let i = 0; i < this.roomListClone.length; i++) {
      this.roomListClone[i].isTimeOk = true;
      for (let j = 0; j < this.meetingList.length; j++) {
        if (meeting && this.meetingList[j].id == meeting.id && this.meetingList[j].room_name == this.roomListClone[i].name) {
          break;
        }
        if (this.roomListClone[i].name == this.meetingList[j].room_name) {  //该房间已经选过
          if (this.compareDate(this.meetingList[j].end, meeting.start) == 2 ||
            this.compareDate(this.meetingList[j].start, meeting.end) == 1) {
            this.roomListClone[i].isTimeOk = true;
          } else {
            this.roomListClone[i].isTimeOk = false;
            break;
          }
        }
      }
    }
  }

  /**
   * 判断数量
   */
  judgeNumber(meeting: any) {
    for (let i = 0; i < this.roomListClone.length; i++) {
      if (this.roomListClone[i].amount >= parseInt(meeting.attendance)) {
        this.roomListClone[i].isNumberOk = true;
      } else {
        this.roomListClone[i].isNumberOk = false;
      }
    }
  }

  /**
   * 开关判断条件
   */
  judgeProject(meeting: any) {
    if (meeting.projector === 1) {
      for (let i = 0; i < this.roomListClone.length; i++) {
        if (this.roomListClone[i].projector === '1') {
          this.roomListClone[i].isProjectOk = true;
        } else {
          this.roomListClone[i].isProjectOk = false;
        }
      }
    } else {
      for (let i = 0; i < this.roomListClone.length; i++) {
        this.roomListClone[i].isProjectOk = true;
      }
    }
  }

  judgeVideo(meeting: any) {
    if (meeting.video === 1) {
      for (let i = 0; i < this.roomListClone.length; i++) {
        if (this.roomListClone[i].video === '1') {
          this.roomListClone[i].isVideoOk = true;
        } else {
          this.roomListClone[i].isVideoOk = false;
        }
      }
    } else {
      for (let i = 0; i < this.roomListClone.length; i++) {
        this.roomListClone[i].isVideoOk = true;
      }
    }
  }

  /**
   * 比较两个日期的大小
   * @param date
   * @param secondDate
   * @returns {number} 第一个日期大 就返回1, 第二个日期大就返回2 ,相等的就返回 0
   */
  compareDate(date: any, secondDate: any): number {
    let returnStatus: number = 2;
    let newDate = new Date(date);
    let secondNewDate = new Date(secondDate);
    if (newDate.getTime() > secondNewDate.getTime()) {
      returnStatus = 1;
    } else if (newDate.getTime() == secondNewDate.getTime()) {
      returnStatus = 0;
    }
    return returnStatus;
  }

  /**
   * 左侧日历传出天数
   */
  singleCalendar(event: any) {
    this.nowShowDate = event;
    this.page = 1;
    this.pageIsMAX = false;
    this.isLoading = false;
    this.meetingModelService.MeetingPreserve({data: {page: this.page, date: event}}, (response: any) => {
      if (response.status === 1) {
        this.meetingList = this.typeService.getObjLength(response.data) > 0 ? response.data : [];
        for (let i = 0; i < this.meetingList.length; i++) {
          this.meetingList[i].isShowSelect = false;
          this.addMeetingAttribute(this.meetingList[i]);
        }
      }
    })
  }

  /**
   * 点击room列表，选中房间
   */
  onClickRoomList(event: any, meeting: any, room: any) {
    event.stopPropagation();
    if (!room.isNumberOk || !room.isProjectOk || !room.isVideoOk || !room.isTimeOk) {
      return false;
    }
    meeting.crid = room.id;
    meeting.room_name = room.name;
    meeting.mode = '2';

    let meetingObj = {
      data: this.typeService.clone(meeting)
    };
    this.meetingModelService.updateMeetingPreserve(meetingObj, (response) => {
      if (response.status === 1) {

      }
    });
    meeting.isShowSelect = false;
  }

  /**
   * 点击页面
   */
  onClickBody(event: any) {
    for (let i = 0; i < this.meetingList.length; i++) {
      this.meetingList[i].isShowSelect = false;
    }
  }

  /**
   * 取消search
   */
  onCloseSearch(){
    this.searchText = '';
    this.router.navigate(['/meeting/index']);
  }

}