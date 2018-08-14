import {Component, OnInit, ViewChild, Inject, Renderer} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';

@Component({
  selector: 'create-importance',
  templateUrl: '../../../template/create/function/mission-cretate-importance.component.html'
})

export class MissionCreateImportanceComponent {

  public importanceLevel: string;

  public missionConstant: any;

  public isStartMove: boolean = false;

  public dragPositionPercent: number;
  public displayData1: any;

  @ViewChild('dragTable') public dragTable: any;
  @ViewChild('dragBtn') public dragBtn: any;
  @ViewChild('dragBg') public dragBg: any;

  constructor(public renderer: Renderer,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any) {
    this.missionConstant = MissionConstant;
  }


  ngOnInit() {
    this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_FIRST;
    this.displayData1 = {
      perm: this.missionConstant.MISSION_PRIORITY_LEVEL_FIRST,
      start: true,       //数字
      data: [1, 2, 3],
      bgColor: ['red', 'rgb(152, 210, 235)', 'rgb(94, 102, 209)']
    };
  }

  /**
   * 获取等级
   * @param data
   */
  getToggleBtnEvent(data: any) {
    this.importanceLevel = data.currPerm + 1;
  }


  selectImportanceLevel(data: any) {
    this.importanceLevel = data;
  }

  /**
   * 点击准备拖拽
   */
  startMove(event: any) {
    this.isStartMove = true;
  }


  /**
   * 开始移动
   */
  moveTheDarg(event: any) {
    if (this.isStartMove) {
      this.importanceLevel = '';
      this.dragPositionPercent = parseInt((((event.pageX - 291) / this.dragTable.nativeElement.offsetWidth) * 100).toFixed(2));
      if (this.dragPositionPercent <= 100 && this.dragPositionPercent >= 0) {
        this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', this.dragPositionPercent + '%');
        this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', this.dragPositionPercent + '%');
      }
    }
  }


  /**
   * 鼠标离开了
   */
  stopTheDarg(event: any) {
    this.isStartMove = false;
    this.doJudgeLevel();
  }


  /**
   * 鼠标松开事件
   */
  upTheMouse(event: any) {
    this.isStartMove = false;
    this.doJudgeLevel();
  }

  /**
   * 判断当前等级
   */
  doJudgeLevel() {
    if (this.dragPositionPercent >= 0 && this.dragPositionPercent <= 25) {
      this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', '0%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', '0%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'background-color', '#98D2EB');
      this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_FIRST;
    } else if (this.dragPositionPercent > 25 && this.dragPositionPercent < 75) {
      this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', '50%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', '50%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'background-color', '#98D2EB');
      this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_SECOND;
    } else if (this.dragPositionPercent >= 75 && this.dragPositionPercent <= 100) {
      this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', '100%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', '100%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'background-color', '#5E66D1');
      this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_THIRD;
    }
  }

  /**
   * Project获取当前等级
   */
  getProjectLevel(data: any) {
    if (data === this.missionConstant.MISSION_PRIORITY_LEVEL_FIRST) {
      this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', '0%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', '0%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'background-color', '#98D2EB');
      this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_FIRST;
    } else if (data === this.missionConstant.MISSION_PRIORITY_LEVEL_SECOND) {
      this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', '50%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', '50%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'background-color', '#98D2EB');
      this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_SECOND;
    } else if (data === this.missionConstant.MISSION_PRIORITY_LEVEL_THIRD) {
      this.renderer.setElementStyle(this.dragBtn.nativeElement, 'left', '100%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', '100%');
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'background-color', '#5E66D1');
      this.importanceLevel = this.missionConstant.MISSION_PRIORITY_LEVEL_THIRD;
    }
  }


}

