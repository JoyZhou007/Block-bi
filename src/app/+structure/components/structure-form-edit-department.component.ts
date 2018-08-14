/**
 * Created by simon on 2016/8/9.
 */
import {Component, OnInit, Inject, EventEmitter, Output, Renderer, Input} from '@angular/core';

import {Router} from '@angular/router';

import {StructureModelService} from '../../shared/services/index.service';
import {DropdownSettings} from "../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../dropdown/dropdown-element";
import {
  PositionStructureEntity,
  StructureDepartmentEntity
} from "../../shared/services/model/entity/structure-entity";
import { TextConst } from "../../shared/config/text-const.config";

@Component({
  selector: 'structure-form-edit-department',
  templateUrl: '../template/structure-form-edit-department.component.html'
})

export class StructureFormEditDepartmentComponent implements OnInit {

  public companyId: any = 0;
  public departmentId: any = 0;
  public isNew:boolean;

  public departmentListSet: { [key: string]: StructureDepartmentEntity };
  public localStructureInfo: any;
  public localDepartmentInfo: any;
  public formHide: boolean = false;

  /**
   * 成员列表
   * @type {DropdownSettings}
   */
  public teamSettings = new DropdownSettings();
  public teamSelectedOptions = [];
  public teamSelectedArr = [];
  public teamOptions: any = [];

  /**
   * leader列表
   * @type {DropdownSettings}
   */
  public headerSettings = new DropdownSettings();
  public headerSelectedOptions = [];
  public headerSelectedArr = [];
  public headerOptions: any = [];

  private POSITION_VACANCY: string = TextConst.JOB_VACANCY;

  /**
   * 通过父级初始化数据
   * @param  param
   */
  @Input() set setDepartmentInfo(param: {
    leader: PositionStructureEntity,
    department: StructureDepartmentEntity,
    staff: Array<PositionStructureEntity>,
    all: { [key: string]: StructureDepartmentEntity }
  }) {
    this.reset();
    this.localDepartmentInfo = param.department;
    this.departmentListSet = param.all;
    this.isNew = true;
    for (let k in this.departmentListSet) {
      if (this.departmentListSet[k].did == this.localDepartmentInfo.did) {
        this.isNew = false;
      }
    }
    this.setTeamMemberOptions(param.staff);
    this.setLeaderOptions(param.leader);
  }

  @Input() set setCompanyId(param: any) {
    this.companyId = param;
  }

  @Input() set setDepartmentId(param: any) {
    this.departmentId = param;
  }

  @Input() set setStructureUser(param: any) {
    this.localStructureInfo = param;
  }

  @Output() outOpenForm = new EventEmitter<any>();
  @Output() outEditDepartment = new EventEmitter<any>();

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
  ngOnInit() {
  }



  /**
   * Department leader
   * leader可改为main域中的任一成员
   */
  setLeaderOptions(data: any) {
    console.log('setLeaderOptions', data);
    for (let k in data) {
      this.headerOptions.push(this.setDepartmentMemberOptions(data[k]));
    }
    this.headerSelectedOptions = [this.setDepartmentMemberOptions(data[0])];
  }

  /**
   * Department member
   * @param {Array<any>} data
   */
  setTeamMemberOptions(data: Array<any>) {
    console.log('setTeamMemberOptions', data);
    for (let k in data) {
      let tmp = this.setDepartmentMemberOptions(data[k]);
      this.teamOptions.push(tmp);
      this.teamSelectedOptions.push(tmp);
    }
  }

  /**
   * 设置人员下拉选项
   * @param {PositionStructureEntity} data
   * @return {any}
   */
  setDepartmentMemberOptions(data: PositionStructureEntity): any {
    let tmpModel = new DropdownOptionModel();
    let model: any;
    if (data && data.profile) {
      model = {
        id: data.id,
        isCurrent: false,
        label: data.work_name,
        desc:  (data.title_name ? data.title_name  + ' ' : '') + data.p_name
        + (data.is_ass == '1'? ' assistant' : '')
        + ' Lv' + (parseInt(data.p_level)),
        imageLabel: data.profile ? this.config.resourceDomain + data.profile : 'NaN'
      };
    } else {
      model = {
        id: data.id,
        isCurrent: false,
        label: this.POSITION_VACANCY + ' ID:' + data.id,
        desc: (data.title_name ? data.title_name  + ' ' : '')
        + data.p_name
        + (data.is_ass == '1'? ' assistant' : '')
        + '  Lv' + (parseInt(data.p_level)),
        imageLabel: data.profile ? this.config.resourceDomain + data.profile : 'NaN'
      };
    }
    tmpModel.initData(model);
    return tmpModel;
  }


  headerChange(data: any) {
    this.headerSelectedArr = data[0];
    this.headerSelectedOptions = data[0];
  }

  teamChange(data: any) {
    this.teamSelectedArr = data[0];
  }


  /**
   * 下拉菜单
   */
  initDropDownSettings() {
    delete this.headerSettings;
    delete this.teamSettings;

    this.headerSettings = new DropdownSettings();
    this.teamSettings = new DropdownSettings();

    this.headerSettings.isMultiple = false;

    this.teamSettings.isMultiple = true;
    this.teamSettings.readonly = true;
  }

  /**
   * 点击保存部门
   */
  saveEditDepartment() {
    //console.log('this.localDepartmentInfo', this.localDepartmentInfo);
    if (this.localDepartmentInfo.name == '' || this.headerSelectedOptions.length == 0) {
      let settings = {
        simpleContent: 'Department names and department heads cannot be empty !'
      };
      this.dialogService.openWarning(settings);
      return;
    }
    // 部门名字不能重复
    for (let k in this.departmentListSet) {
      if (this.departmentListSet[k].did != this.localDepartmentInfo.did && this.departmentListSet[k].name == this.localDepartmentInfo.name) {
        this.dialogService.openWarning({simpleContent: 'Department names cannot be duplicated !'});
        return;
      }
    }
    // 初始化部门信息
    let leader;
    for (let key in this.localStructureInfo) {
      if (this.localStructureInfo[key].id == this.headerSelectedOptions[0].id) {
        leader = this.localStructureInfo[key];
        break;
      }
    }
    this.outEditDepartment.emit([this.isNew ? 'new' : 'edit', this.localDepartmentInfo, leader]);
  }

  deleteDepartment() {
    // 部门中有职位时候不可以删除
    console.log('localStructureInfo', this.localStructureInfo);
    // let settings = {
    //   simpleContent: `There are employees in the department. If you need to remove the department, please delete all employees in the department first !`
    // };
    // this.dialogService.openWarning(settings);
    this.dialogService.openConfirm({
      simpleContent: 'Delete current department ?',
    }, () => {
      // for (let key in this.localDepartmentInfo) {
      //   if (this.localDepartmentInfo[key].did === this._selectDepartment.did) {
      //     if (this.localDepartmentInfo[key].staff_num > 0) {
      //       let settings = {
      //         simpleContent: `There are employees in the department. If you need to remove the department, please delete all employees in the department first !`
      //       }
      //       this.dialogService.openWarning(settings);
      //       this.outOpenForm.emit({type: 1, hide: true});
      //       return false
      //     }
      //   }
      // }
      // this.structureDataService.setUploadStructureFlag(1);
      // for (let key in this.localStructureInfo) {
      //   if (this.localStructureInfo[key].did === this._selectDepartment.did) {
      //     this.localStructureInfo.splice(key, 1);
      //   }
      // }
      // for (let key in this.localDepartmentInfo) {
      //   if (this.localDepartmentInfo[key].did === this._selectDepartment.did) {
      //     this.localDepartmentInfo.splice(key, 1);
      //   }
      // }
      this.outEditDepartment.emit(['delete', this.localDepartmentInfo]);
      //this.outDrawStructure.emit({type: 'position'});
      //this.outOpenForm.emit({type: 1, hide: true});
    })


  }

  closeForm() {
    this.outOpenForm.emit({type: 2, hide: true});
  }

  /**
   * 设置前重置数据
   */
  reset() {
    this.headerSelectedOptions = [];
    this.headerSelectedArr = [];
    this.headerOptions = [];

    this.teamSelectedOptions = [];
    this.teamSelectedArr = [];
    this.teamOptions = [];
    this.initDropDownSettings();
  }


}
