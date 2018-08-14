/**
 * Created by DanXia Yang on 2017/2/17 0017.
 */
import {
  Component,
  OnInit,
  ViewChild,
  Inject, Output, EventEmitter, ElementRef
} from '@angular/core';

import {ActivatedRoute, Router, Params} from '@angular/router';
import {MissionDetailAPIModel,MissionDetailTplModel} from "../../shared/services/model/entity/mission-entity";
import {Input} from "@angular/core/src/metadata/directives";
import * as MissionConstant from '../../shared/config/mission.config.ts';
import {normalizeSlashes} from "typedoc/dist/lib/ts-internal";

@Component({
  selector: 'mission-link',
  templateUrl: '../template/mission-link.component.html'
})

export class MissionLinkComponent {

  public missionDetailData: any;
  public missionConstant: any;
  public _linkInfo: any;
  public formatDate: any;
  public isListLinkShow: Boolean = false;
  public _CurrentMissionObj : MissionLinkComponent;

  constructor(@Inject('date.service') public dateService: any,
              @Inject('app.config') public config: any,
              public router: Router) {
    this.missionConstant = MissionConstant;

  }

  @ViewChild('missionLink') missionLink : any;

  ngAfterViewInit() {
    // child is set
  }

  @Input() set setMissionDetail(param: any) {
    if (param) {
      this.missionDetailData = param;
      this.linkInfo = param.link_info;
    }
  }

  set linkInfo(data: any) {
    this._linkInfo = data;
    this.doFormatDate(this._linkInfo);
  }

  get linkInfo() {
    return this._linkInfo;
  }

  set CurrentMissionObj(data : any){
    if (data){
      this._CurrentMissionObj = data;
    }
  }
  get CurrentMissionObj(){
    return this._CurrentMissionObj;
  }


  @Input() set showLinkTitle(param: String) {
    if (param === 'list') {
      this.isListLinkShow = true;
    } else {
      this.isListLinkShow = false;
    }
  }

  /**
   * 点击×关闭link
   */
  @Output() public showLink=new EventEmitter<Boolean>();


  ngOnInit() {
  }


  doFormatDate(param: any) {
    for (let i in param.before) {
      let data = param.before[i].creator_info.time;
      let startDayTime = this.dateService.formatWithTimezone(data, 'dd');
      let startMonthTime = this.dateService.formatWithTimezone(data, 'mmm');
      let startYearTime = this.dateService.formatWithTimezone(data, 'yyyy');
      let startWeekTime = this.dateService.formatWithTimezone(data, 'dddd');
      let startHourTime = this.dateService.formatWithTimezone(data, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(data, 'MM');
      param.before[i].formatDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
    }
    for (let i in param.after) {
      let data = param.after[i].creator_info.time;
      let startDayTime = this.dateService.formatWithTimezone(data, 'dd');
      let startMonthTime = this.dateService.formatWithTimezone(data, 'mmm');
      let startYearTime = this.dateService.formatWithTimezone(data, 'yyyy');
      let startWeekTime = this.dateService.formatWithTimezone(data, 'dddd');
      let startHourTime = this.dateService.formatWithTimezone(data, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(data, 'MM');
      param.after[i].formatDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
    }


  }


  /**
   * 点击×关闭link
   */
  closeLink(){
    this.showLink.emit(true);
  }


  /**
   *
   * @param event
   * @param missionObj
   */
  redirectToDetail(event: any, missionObj: MissionDetailTplModel) {
    event.stopPropagation();
    window.open('mission/detail/' + missionObj.mid);
  }

}