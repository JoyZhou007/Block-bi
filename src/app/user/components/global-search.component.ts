import {Component, EventEmitter, Inject, Input, Output, ViewChild} from "@angular/core";
import {SearchModelService} from "../../shared/services/model/search-model.service";
import {DateService} from "../../shared/services/common/data/date.service";
import * as MissionConstant from "../../shared/config/mission.config";

@Component({
  selector: 'global-search',
  templateUrl: '../template/global-search.component.html',
  providers: [SearchModelService]
})
export class globalSearchComponent {

  private searchKeyWords: any;
  private currentSearchPage: number = 1;
  private searchType: number;
  public searchFolderList: Array<any> = [];
  public searchMissionList: Array<any> = [];
  public searchContactList: Array<any> = [];
  @ViewChild('scrollSearchContent') public scrollSearchContent: any;

  @Output() public closeSearchTab: EventEmitter<any> = new EventEmitter();
  private bindPagingEvent: boolean = false;

  constructor(@Inject('app.config') public config: any,
              @Inject('date.service') public dateService: DateService,
              public searchModelService: SearchModelService) {
  }


  @Input() set setSearchType(param: any) {
    if (param) {
      this.searchKeyWords = param.searchKeyWords;
      this.searchType = param.searchType;
      this.searchFromApi();
    }
  }


  ngOnInit() {

  }

  ngAfterViewChecked(): void {
    if (this.scrollSearchContent) {
      let element = this.scrollSearchContent.nativeElement;
      if (!this.bindPagingEvent && element) {
        this.mouseWheelFunc(element);
        this.bindPagingEvent = true;
      }
    }
  }

  /**
   * 滚轮事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    //标准浏览器
    ele.addEventListener('mousewheel', (event: any) => {
      if (event.wheelDelta < 0
        && this.scrollSearchContent.nativeElement.scrollTop === this.scrollSearchContent.nativeElement.scrollHeight - this.scrollSearchContent.nativeElement.clientHeight) {
        this.currentSearchPage++;
        this.loadMoreResultFromApi();
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      if (event.detail > 0
        && this.scrollSearchContent.nativeElement.scrollTop === this.scrollSearchContent.nativeElement.scrollHeight - this.scrollSearchContent.nativeElement.clientHeight) {
        this.currentSearchPage++;
        this.loadMoreResultFromApi();
      }
    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      if (event.wheelDelta < 0 &&
        this.scrollSearchContent.nativeElement.scrollTop === this.scrollSearchContent.nativeElement.scrollHeight - this.scrollSearchContent.nativeElement.clientHeight) {
        this.currentSearchPage++;
        this.loadMoreResultFromApi();
      }
    });
  }

  /**
   * 向下滚动加载 更多
   */
  loadMoreResultFromApi() {
    let data: any = {keywords: this.searchKeyWords, type: this.searchType, page: this.currentSearchPage};
    this.searchModelService.searchGeneral({data}, (res: any) => {
      if (res.status === 1 && res.data) {
        this.dealSearchResult(res.data, true);
      }
    })
  }


  /**
   * 调用api接口搜索
   */
  searchFromApi() {
    let data: any = {keywords: this.searchKeyWords, type: this.searchType, page: this.currentSearchPage};
    this.searchModelService.searchGeneral({data}, (res: any) => {
      if (res.status === 1 && res.data) {
        this.dealSearchResult(res.data);
      }
    })
  }


  dealSearchResult(data: any, isLoadingMore?: boolean) {
    if (!isLoadingMore) {
      this.searchContactList = [];
      this.searchMissionList = [];
      this.searchFolderList = [];
    }
    if (data.hasOwnProperty('Contact') && data['Contact'].hasOwnProperty('NoRelation')) {
      this.searchContactList = this.searchContactList.concat(data['Contact']['NoRelation']);
    }
    if (data.hasOwnProperty('Mission')) {
      this.searchMissionList = this.searchMissionList.concat(data['Mission']);
    }

    if (data.hasOwnProperty('Folder') && data['Folder'].hasOwnProperty('1')) {
      this.searchFolderList = this.searchFolderList.concat(data['Folder']['1']);
    }
    if (data.hasOwnProperty('Folder') && data['Folder'].hasOwnProperty('2')) {
      this.searchFolderList = this.searchFolderList.concat(data['Folder']['2']);
    }
    this.formatMissionTime(this.searchMissionList);
  }


  formatMissionTime(data: any) {
    for (let i in data) {
      let lastUpdateInfo = data[i].last_update_info;
      let lastUpdateTime = data[i].last_update_info.time;
      let day = this.dateService.formatWithTimezone(lastUpdateTime, 'ddS');
      let month = this.dateService.formatWithTimezone(lastUpdateTime, 'mmm');
      let year = this.dateService.formatWithTimezone(lastUpdateTime, 'yyyy');
      let week = this.dateService.formatWithTimezone(lastUpdateTime, 'dddd');
      let hour = this.dateService.formatWithTimezone(lastUpdateTime, 'HH');
      let minute = this.dateService.formatWithTimezone(lastUpdateTime, 'MM');
      let ap = this.dateService.formatWithTimezone(lastUpdateTime, 'tt');
      lastUpdateInfo.formatDate = {
        day: day,
        week: week,
        month: month,
        minute: minute,
        hour: hour,
        year: year,
        ap: ap
      };
      switch (data[i].type) {
        case MissionConstant.MISSION_TYPE_TASK:
          data[i].missionType = MissionConstant.MISSION_TYPE_TASK_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_MEETING:
          data[i].missionType = MissionConstant.MISSION_TYPE_MEETING_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_PROJECT:
          data[i].missionType = MissionConstant.MISSION_TYPE_PROJECT_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_APPLICATION:
          data[i].missionType = MissionConstant.MISSION_TYPE_APPLICATION_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_ASSIGNMENT:
          data[i].missionType = MissionConstant.MISSION_TYPE_ASSIGNMENT_TEXT;
          break;
        default:
          break;
      }
    }
  }

  /**
   * 关闭搜索界面
   */
  closeSearchComponent(event: any) {
    // event.stopPropagation();
    this.closeSearchTab.emit();
  }

  /**
   * 点击搜索出来的contact人员显示详细信息
   */
  showSearchMemberInfo(event: any, person: any) {
    event.stopPropagation();
    window.open('contacts/info/general/' + person.uid);
  }

  /**
   * 点击搜索出来的mission查看mission详情
   */
  showSearchMissionDetail(event: any, mission: any) {
    event.stopPropagation();
    window.open('mission/detail/' + mission.mid);
  }

  /**
   * 进去当前文件夹所在目录
   */
  enterToFolderComponent(event: any, file: any) {
    event.stopPropagation();
    let type: string = file.type == '1' ? 'personal' : 'work';
    window.open('folder/' + type + '?path=' + encodeURI(file.path));
  }


}