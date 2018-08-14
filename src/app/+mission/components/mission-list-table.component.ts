/**
 * Created by joyz on 2017/7/12.
 */
import {
  AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output,
  ViewChild
} from "@angular/core";
import {TypeService} from "../../shared/services/model/base/type.service";
import {DateService} from "../../shared/services/common/data/date.service";
import {MissionModelService} from "../../shared/services/model/mission-model.service";
import {
  MissionDetailAPIModel, MissionDetailTplModel,
  MissionListFilter, MissionStaticFunction
} from "../../shared/services/model/entity/mission-entity";
import * as MissionConstant from '../../shared/config/mission.config';
import {Router} from "@angular/router";
import {Draft} from "../../shared/services/model/entity/chat-entity";
import {forEach} from "@angular/router/src/utils/collection";


@Component({
  selector: 'mission-list-table',
  templateUrl: '../template/mission-list-table.component.html',
})

export class MissionListTableComponent implements OnInit, AfterViewInit, AfterViewChecked {

  //显示用的模板数据
  public tplShownDataList: Array<MissionDetailTplModel> = [];
  public formatStr = 'HH:MM ddS mmm';
  public missionConstant: any;
  public MissionDetailAPIModel = MissionDetailAPIModel;
  public MissionDetailTplModel = MissionDetailTplModel;

  @ViewChild('scrollToBottom') public scrollToBottom: ElementRef;

  //是否绑定滚轮事件
  public bindPageEvent: boolean = false;

  public isLoading: boolean = false;

  public _calendarFilter: MissionListFilter;
  @Output() OutputIsDraw = new EventEmitter<boolean>();
  //选中所有mission
  public isChooseAll: boolean = false;
  //点击显示下拉菜单
  public showProgressMenu: boolean = false;
  //当前status 的key
  public currentMissionStatusKey: string = '-1';

  @Input('calendarFilter') set calendarFilter(data: MissionListFilter) {
    data.page_no_schedule = '1';
    this._calendarFilter = data;
  }

  get calendarFilter() {
    return this._calendarFilter;
  }

  @Output() outLoadingNextPage = new EventEmitter<any>();

  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;

  //progress 下拉菜单
  public missionStatusNameList: Array<{key: string, name: string}> = [];

  ngOnInit(): void {
    this.missionStatusNameList = [
      {
        key: '-1',
        name: 'all'
      },
      {
        key: '0',
        name: 'delete'
      },
      {
        key: '1',
        name: 'todo'
      },
      {
        key: '2',
        name: 'pending'
      },
      {
        key: '3',
        name: 'reset'
      },
      {
        key: '4',
        name: 'doing'
      },
      {
        key: '5',
        name: 'pause'
      },
      {
        key: '7',
        name: 'done'
      },
      {
        key: '8',
        name: 'storage'
      },
    ]
  }

  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: TypeService,
              @Inject('date.service') public dateFormatService: DateService,
              @Inject('notification.service') public notificationService: any,
              public missionModelService: MissionModelService,
              public router: Router) {
    this.missionConstant = MissionConstant;
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      let ele = this.scrollToBottom.nativeElement;
      if (!this.bindPageEvent && ele && ele.hasChildNodes()) {
        for (let i = 0, il = ele.childNodes.length; i < il; i++) {
          if (ele.childNodes[i].id === 'dashboard') {
            let targetElement = ele.childNodes[i];
            this.mouseWheelFunc(targetElement);
            this.bindPageEvent = true;
          }
        }

      }
    }
  }

  /**
   * index 页面元素滚动触发分页数据事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    // Chrome
    ele.addEventListener('mousewheel', () => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      let loadEnd = this.calendarFilter['page_no_schedule'] === MissionConstant.MISSION_PAGER_ENDING;
      if (isToBottom && !this.isLoading && !loadEnd) {
        this.isLoading = true;
        this.outLoadingNextPage.emit(['page_no_schedule']);
      }
    });
    // FF
    ele.addEventListener('DOMMouseScroll', () => {
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      let loadEnd = this.calendarFilter['page_no_schedule'] === MissionConstant.MISSION_PAGER_ENDING;
      if (isToBottom && !this.isLoading && !loadEnd) {
        this.isLoading = true;
        this.outLoadingNextPage.emit(['page_no_schedule']);
      }
    });
    // IE
    ele.addEventListener('onmousewheel', () => {
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      let loadEnd = this.calendarFilter['page_no_schedule'] === MissionConstant.MISSION_PAGER_ENDING;
      if (isToBottom && !this.isLoading && !loadEnd) {
        this.isLoading = true;
        this.outLoadingNextPage.emit(['page_no_schedule']);
      }
    });
  };

  ngAfterViewInit(): void {
  }

  public initDataList(data: Array<MissionDetailAPIModel>) {
    this.tplShownDataList = this.initListForTemplate(data);
  }

  /**
   * 处理为适合模板显示的数据
   * @param data
   * @return Array<MissionDetailTplModel>
   */
  public initListForTemplate(data: Array<MissionDetailAPIModel>): Array<MissionDetailTplModel> {
    if (typeof data === 'undefined') {
      return data;
    }
    let cloneData = [];
    data.forEach((obj: MissionDetailAPIModel) => {
      let tplObj = this.initDetailForTemplate(obj);
      cloneData.push(tplObj);
    });
    return cloneData;
  }


  /**
   * 将API对象转为TPL对象, 并初始化一些显示参数
   * @param dataObj
   * @returns {MissionDetailTplModel}
   */
  public initDetailForTemplate(dataObj: MissionDetailAPIModel): MissionDetailTplModel {
    let tplObj = new MissionDetailTplModel().init();
    let cloneObj = this.typeService.clone(dataObj);
    this.typeService.bindData(tplObj, cloneObj);
    tplObj.missionStatusName = MissionStaticFunction.initMissionStatusName(tplObj.status);
    tplObj.typeTitle = MissionStaticFunction.getTypeTitle(dataObj.type);
    tplObj.typeClass = MissionStaticFunction.getTypeTitle(dataObj.type, true);
    if (tplObj.detail.hasOwnProperty('internal')) {
      if (tplObj.detail.internal.length) {
        tplObj.detail.internal = this.initListForTemplate(tplObj.detail.internal);
      }
    }
    //开始点
    if (dataObj.fns && dataObj.fns.hasOwnProperty(parseInt(MissionConstant.MISSION_FUNCTION_IMPORTANCE))) {
      tplObj.importance = parseInt(dataObj.fns[parseInt(MissionConstant.MISSION_FUNCTION_IMPORTANCE)].value);
    }
    if (dataObj.last_update_info && dataObj.last_update_info.hasOwnProperty('time')) {
      tplObj.last_update_locale_time = this.dateFormatService.formatWithTimezone(dataObj.last_update_info.time);
    }

    if (tplObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
      let arr = tplObj.detail.internal;
      for (let k in arr) {
        if (arr.hasOwnProperty(k)) {
          Object.assign(arr[k], {
            typeTitle: MissionDetailAPIModel.getTypeTitle(arr[k].type)
          })
        }
      }
    }
    return tplObj;
  }


  /**
   *
   * @param event
   * @param missionObj
   */
  public redirectToDetail(event: any, missionObj: MissionDetailTplModel) {
    event.stopPropagation();
    this.router.navigate(['mission/detail', missionObj.typeTitle.toLowerCase(), missionObj.mid]);
  }

  /**
   * 点击关闭 project
   * @param event
   * @param missionObj
   */
  public clickCloseProject(event: MouseEvent, missionObj: MissionDetailTplModel): void {
    event.stopPropagation();
    missionObj.isCloseProject = !missionObj.isCloseProject;
  }

  /**
   * 加载分页数据
   */
  public initPagerData(pageType: string, data: Array<MissionDetailAPIModel>) {
    this.tplShownDataList = this.tplShownDataList.concat(this.initListForTemplate(data));
    // 允许加载其他分页数据
    this.isLoading = false;
    // 需要重新绑定事件
    this.bindPageEvent = false;
  }

  /**
   * 点击选中checkbox
   * @param event
   * @param missionObj
   */
  public clickChooseMission(event: any, missionObj: MissionDetailTplModel): void {
    event.stopPropagation();
    missionObj.isChooseToDraw = !missionObj.isChooseToDraw;
    let isDraw = this.tplShownDataList.some((value, index, array) => {
      return value.isChooseToDraw;
    });
    this.OutputIsDraw.emit(isDraw);
  }

  /**
   *点击选中所有
   * @param event
   */
  public clickChooseAll(event: MouseEvent): void {
    event.stopPropagation();
    this.isChooseAll = !this.isChooseAll;
    if (this.isChooseAll) {
      for (let obj of this.tplShownDataList) {
        obj.isChooseToDraw = true;
      }
      this.OutputIsDraw.emit(true);
    } else {
      for (let obj of this.tplShownDataList) {
        obj.isChooseToDraw = false;
      }
      this.OutputIsDraw.emit(false);
    }
  }

  /**
   * 得到所有选中的mission
   * @returns {Array}
   */
  public fetchChooseMission(): Array<MissionDetailTplModel> {
    let arr = [];
    this.tplShownDataList.forEach((value, index, array) => {
      if (value.isChooseToDraw) {
        arr.push(value);
      }
    });
    return arr;
  }

  /**
   *
   * @param event
   */
  public clickShowProgressMenu(event: any): void {
    event.stopPropagation();
    this.showProgressMenu = !this.showProgressMenu;
  }

  public clickFilterStatus(event: any, status: {key: string, name: string}): void {
    event.stopPropagation();
    this.showProgressMenu = false;
    this.currentMissionStatusKey = status.key;
    switch (status.key) {
      case MissionConstant.MISSION_STATUS_DELETE:
        break;
      case MissionConstant.MISSION_STATUS_TODO:
        break;
      case MissionConstant.MISSION_STATUS_PENDING:
        break;
      case MissionConstant.MISSION_STATUS_RESET:
        break;
      case MissionConstant.MISSION_STATUS_DOING:
        break;
      case MissionConstant.MISSION_STATUS_PAUSE:
        break;
      case MissionConstant.MISSION_STATUS_DONE:
        break;
      case MissionConstant.MISSION_STATUS_STORAGE:
        break;
    }
  }

  /**
   * 打开mission dialog
   */
  openMissionChatDialog(event: any, missionObj: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'mission-chat-dialog',
        options: missionObj
      }
    });
  }

}