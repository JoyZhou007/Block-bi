/**
 * Created by simon on 2016/8/9.
 */
import {
  Component, OnInit, AfterViewInit, Inject, EventEmitter, Output, Renderer, Input,
  HostListener
} from '@angular/core';

import {Router} from '@angular/router';

import {StructureModelService} from '../../shared/services/index.service';


@Component({
  selector: 'structure-form-edit-position-level',
  templateUrl: '../template/structure-form-edit-position-level.component.html'
})

export class StructureFormEditPositionLevelComponent implements OnInit, AfterViewInit {

  public positionLevelList: any = [];

  public newPositionId = 1;

  public formHide: boolean = true;

  public companyId: number;
  public departmentId: number;
  public pendingInfo: any;

  public editStructure: any;

  public localStructureInfo: any;

  public showNewPosition: any = [];

  public positionName: string = '';
  public currentEditInput: any;
  public hasSelected: boolean = false;
  private isNewLevel: boolean = false;

  constructor(public renderer: Renderer,
              public router: Router,
              public structureService: StructureModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('page.element') public element: any,
              @Inject('structure-data.service') public structureDataService: any) {

  }

  @Output() outOpenForm = new EventEmitter<any>();
  @Output() outDrawStructure = new EventEmitter<any>();

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  @Input() set setPositionLevel(param: any) {

    let levelList: any = param;
    for (let key in levelList) {
      if (levelList[key].p_level === '1') {
        levelList[key].level = levelList[key].p_level + 'st';
      } else if (levelList[key].p_level === '2') {
        levelList[key].level = levelList[key].p_level + 'nd';
      } else if (levelList[key].p_level === '3') {
        levelList[key].level = levelList[key].p_level + 'rd';
      } else {
        levelList[key].level = levelList[key].p_level + 'th';
      }
    }
    this.positionLevelList = levelList;
    //console.log('this.positionLevelList', this.positionLevelList);
  }

  @Input() set makeLevel(param: any) {
      if(param){
        this.isNewLevel = true;
        this.formHide = false;
      }

  }


  @Input() set setStructureInfo(param: any) {

    this.localStructureInfo = param;
  }

  @Input() set setCompanyId(param: any) {
    this.companyId = param;
  }

  @Input() set setDepartmentId(param: any) {
    this.departmentId = param;
  }


  openPositionLevelForm(data: any) {
    for (let key in this.positionLevelList) {
      this.showNewPosition[this.positionLevelList[key].p_level] = true;
    }
    this.outOpenForm.emit({type: 3, hide: false});
  }


  isShowNewPosition(level: string) {
    if (this.showNewPosition.hasOwnProperty(level)) {
      return this.showNewPosition[level];
    }
    return true;
  }

  closeForm() {
    if(this.isNewLevel){
      this.formHide = true;
      this.isNewLevel = false;
    }else{
      this.outOpenForm.emit({type: 3, hide: true});
    }
  }

  newPositionLevel() {
    let level = 0;
    for (let key in this.positionLevelList) {
      if (parseInt(this.positionLevelList[key].p_level) > level) {
        level = parseInt(this.positionLevelList[key].p_level);
      }
    }
    level = level + 1;
    let newPosition = {
      'p_level': level.toString(),
      'position': Array(),
      'level': '',
    };
    if (newPosition.p_level === '1') {
      newPosition.level = newPosition.p_level + 'st';
    } else if (newPosition.p_level === '2') {
      newPosition.level = newPosition.p_level + 'nd';
    } else if (newPosition.p_level === '3') {
      newPosition.level = newPosition.p_level + 'rd';
    } else {
      newPosition.level = newPosition.p_level + 'th';
    }
    this.positionLevelList.push(newPosition);
  }

  /**
   * 编辑
   * @param event
   * @param position
   * @param ipt
   */
  editPosition(event: any, i: any, ipt: any) {
    event.stopPropagation();
    ipt.readOnly = false;
    ipt.focus();
    this.hasSelected = true;
    this.currentEditInput = ipt;
  }

  deletePosition(position: any) {
    if (position.p_name === 'CEO' && position.p_level === '1') {
      let settings = {
        simpleContent: 'Can not delete CEO'
      };
      this.dialogService.openWarning(settings);
      return;
    }
    this.dialogService.openConfirm({
      simpleContent: 'Delete current position ?',
    },() => {
      this.structureService.checkPosition(
        {pid: position.pid},
        (data: any) => {
          if (data.status === 0) {
            let settings = {
              simpleContent: data.message
            };
            this.dialogService.openWarning(settings);
          } else {
            for (let key in this.positionLevelList) {
              let positionInfo = this.positionLevelList[key];
              if (positionInfo.p_level === position.p_level) {
                let positionKey = positionInfo.position.indexOf(position);
                positionInfo.position.splice(positionKey, 1);
              }
            }
            for (let key in this.localStructureInfo) {
              if (position.p_name === this.localStructureInfo[key].p_name
                && position.p_level === this.localStructureInfo[key].p_level) {
                this.localStructureInfo.splice(key, 1);
              }
            }
            this.structureDataService.setUploadStructureFlag(1);
            this.outDrawStructure.emit({type: 'position'});
          }
        }
      );
    });
  }

  newPosition(data: any) {
    if (data.p_level === '1') {
      let settings = {
        simpleContent: 'Add position in Level 1 class is forbidden'
      };
      this.dialogService.openWarning(settings);
      return;
    } else {
      for (let key in this.showNewPosition) {
        this.showNewPosition[key] = true;
      }
      this.showNewPosition[data.p_level] = false;

      this.isShowNewPosition(data.p_level);
    }

  }

  /**
   * 点击document
   */
  @HostListener('body:click', ['$event'])
  onClick(event: any) {
    // this.showNewPositionByEdit();
  }

  /**
   * 添加level
   * @param event
   * @param data
   * @param positionName
   */
  showNewPositionByEdit(event: any, data: any, positionName: any) {
    event.stopPropagation();
    if (!positionName.value) {
      let settings = {
        simpleContent: 'Position name cannot be empty'
      }
      this.dialogService.openWarning(settings);
      return;
    }
    for (let key in data.position) {
      if (data.position[key].p_name === positionName.value) {
        let settings = {
          simpleContent: 'The same level cannot appear the same position'
        }
        this.dialogService.openWarning(settings);
        return;
      }
    }
    let newPosition = {
      'cid': this.companyId,
      'is_ass': '0',
      'p_level': data.p_level,
      'pid': 'p' + this.newPositionId,
      'p_name': positionName.value
    };
    this.newPositionId = this.newPositionId + 1;
    data.position.push(newPosition);
    this.showNewPosition[data.p_level] = true;
    positionName.value = '';
  }

  /**
   * ESC 关闭增加level
   * @param event
   * @param data
   */

  closeNewPositionByEdit(event: any, data: any) {
    if (event.keyCode === 27) {
      this.showNewPosition[data.p_level] = true;
    }
  }

  /**
   *
   * @param event
   * @param i
   * @param ipt
   */
  isShowEditPosition(event: any, i: any, ipt: any): void {
    if (event.keyCode === 27) {//esc
      ipt.blur();
      this.dialogService.openConfirm({
        simpleContent: 'Are you sure to cancel the changes ?',
      }, () => {
        ipt.value = i.p_name;
        ipt.readOnly = true;
        this.hasSelected = false;
      })
    } else if (event.keyCode === 13) { //enter
      this.confirmEditPosition(i, ipt);
    }
  }

  confirmEditPosition(i: any, ipt: any) {
    this.hasSelected = false;
    ipt.readOnly = true;
    if (!ipt.value) {
      ipt.value = i.p_name;
      let settings = {
        simpleContent: 'Position name cannot be empty'
      };
      this.dialogService.openWarning(settings);
    } else {
      for (let key in this.positionLevelList) {
        if (this.positionLevelList[key].p_level === i.p_level) {
          let position = this.positionLevelList[key].position;
          for (let k in position) {
            if (position[k].pid !== i.pid && position[k].p_name === ipt.value) {
              ipt.value = i.p_name;
              ipt.readOnly = true;
              let settings = {
                simpleContent: 'The same level cannot appear the same position'
              };
              this.dialogService.openWarning(settings);
            }
          }
        }
      }
      for (let key in this.localStructureInfo) {
        if (this.localStructureInfo[key].pid === i.pid) {
          this.localStructureInfo[key].p_name = ipt.value;
        }
      }
    }
    i.p_name = ipt.value;

    this.structureDataService.setUploadStructureFlag(1);
    this.outDrawStructure.emit({type: 'position'});
  }

  /**
   * 文本框鼠标经过自动聚焦
   * @param event
   */
  autoFocus(event: any): void {
    event.target.focus();
  }

  /**
   * 点击 图标确定 修改position name
   * @param event
   * @param i
   * @param ipt
   */
  clickConfirmEditPosition(event: any, i: any, ipt: any): void {
    event.stopPropagation();
    this.confirmEditPosition(i, ipt);
  }

}
