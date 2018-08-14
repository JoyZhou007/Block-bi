/**
 * Created by simon on 2016/8/9.
 */
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer,
  ViewChild
} from '@angular/core';

import { Router } from '@angular/router';

import { DropdownSettings } from "../../dropdown/dropdown-setting";
import { DropdownOptionModel } from "../../dropdown/dropdown-element";
import {
  DEPARTMENT_MAIN_ID,
  DEPARTMENT_PENDING_ID,
  PositionStructureEntity,
  StructureDepartmentEntity,
  StructureStaffEntity
} from "../../shared/services/model/entity/structure-entity";
import { TextConst } from "../../shared/config/text-const.config";

@Component({
  selector: 'structure-form-edit-position',
  templateUrl: '../template/structure-form-edit-position.component.html'
})

export class StructureFormEditPositionComponent implements OnInit, AfterViewInit, OnChanges {
  private POSITION_VACANCY: string = TextConst.JOB_VACANCY;
  /**
   * 由structure.component传入的数据
   */
  private _staffList: Array<StructureStaffEntity>;
  private _departmentList: { [key: string]: StructureDepartmentEntity };
  private _editPosition: PositionStructureEntity;
  private _allStructure: Array<PositionStructureEntity>;
  public companyId: string;
  public departmentId: string;
  public editPositionTitle: string = 'EDIT POSITION';
  public companyInfoArr:Array<{cid: string, name: string}>;

  @Input('staffList')
  set staffList(data: Array<StructureStaffEntity>) {
    this._staffList = data;
    this.initData();
  }

  get staffList() {
    return this._staffList;
  }

  @Input('departmentList')
  set departmentList(data: any) {
    this._departmentList = data;
    this.initData();
  }

  get departmentList() {
    return this._departmentList;
  }

  @Input('editPosition')
  set editPosition(data: PositionStructureEntity) {
    this._editPosition = data;
    if (this._editPosition.is_ass == '1') {
      this._editPosition.p_name = '';
    }
    //console.log('this._editPosition', this._editPosition);
    this.initData();
  }

  get editPosition() {
    return this._editPosition;
  }

  @Input('allStructure')
  set allStructure(data : any) {
    //console.log('all _allStructure 改啦', this.typeService.clone(data));
    this._allStructure = data;
    this.initData();
  }

  get allStructure(){
    return this._allStructure;
  }

  @Input()
  set setCompanyId(param: any) {
    this.companyId = param;
  }

  @Input()
  set setDepartmentId(param: any) {
    this.departmentId = param;
  }


  @Input()
  set setStructureUser(param: any) {
    this.localStructureInfo = param;
  }

  @Input()
  set setAdminUser(param: any) {
    this.localAllStructureInfo = param;
  }

  @Input('companyInfoArr') set setCompanyInfoArr(data: any) {
    this.companyInfoArr = data;
  }


  @Input()
  set setPositionName(param: any) {
    if (param) {
      this.localPositionNameInfo = param;
    }
  }


  @Input()
  set setPositionLevel(param: any) {
    this.localPositionLevelInfo = param;
    this.initData();
  }

  @Input()
  set setNewStructureId(data: number) {
    this.newPositionStructureId = data;
  }

  // out事件
  @Output() outEditPosition = new EventEmitter<any>();
  @Output() outOpenForm = new EventEmitter<any>();
  @Output() outDrawStructure = new EventEmitter<any>();
  @Output() outDeletePosition = new EventEmitter<any>();
  @Output() outNewLevel = new EventEmitter<any>();
  @Output() outAddId = new EventEmitter<any>();

  public isNew: boolean;
  public hasParent: boolean;
  public isAss: boolean;
  // 部门leader信息
  public departmentLeader: any;

  public positionTitleDisabled = false;
  public defaultPositionTitle: any = {
    'cid': '0',
    'tid': '0',
    'title_name': ''
  };

  public defaultPositionLevel: any = {
    'cid': '0',
    'is_ass': '0',
    'p_level': '0',
    'p_name': '',
    'pid': '0',
    'staff': []
  };


  public _editStructure: any = [];
  public isCeo: boolean = false;


  public getEditStructure() {
    return this._editPosition;
  }

  public positionLevelList: any = [];

  public localStaffInfo: any = [];
  // 画图对象
  public localStructureInfo: any = [];
  public localPositionNameInfo: any = [];
  public localPositionLevelInfo: any;
  public localAllStructureInfo: any = [];

  public newPositionStructureId: number = 1;
  public nowPositionTitleId: number = 1;


  public formHide: boolean = false;
  // staff列表下拉菜单
  // pending可选项
  public pendingSettings: DropdownSettings;
  public pendingSelectedOptions;
  public pendingSelectedArr;
  public pendingOptions;

  public functionSettings: DropdownSettings;
  public functionSelectedOptions;
  public functionSelectedPosition;
  public functionOptions;

  public adminSettings: DropdownSettings;
  public adminSelectedOptions;
  public adminSelectedArr;
  public adminOptions;

  public subordinatesSettings: DropdownSettings;
  public subordinatesSelectedOptions;
  public subordinatesSelectedArr;
  public subordinatesOptions;

  public toggleSelectElement: any;
  public levelContent: string = `<div class="help-text-s-wrap g-text-left">
        <span class="font-remove di-close-but"></span>
        <div class="help-text-title">
            <img src="${this.config.staticResourceDomain}assets/images/heads2.png" alt="">
            <span class="f23-f">关于职位等级</span>
        </div>
        <div class="help-text-content f25-f">
            职位等级表示职位在组织构架中所在的级别，在某个等级中可能存在多种职位名称。例如：等级2中，经理或高级工程师，它们代表了此职位在公司的构架领导位置。当职位也有职位名称，例如你的职位等级是经理（3级），名称是市场，那你就是市场经理。
        </div>
    </div>`;

  public saveStructureInfo: any = {};
  //  {
  //   'id': '0',
  //   'parent_id': '0',
  //   'pid': '0',
  //   'did': '0',
  //   'cid': '0',
  //   'company_id': '0',
  //   'suid': '',
  //   'status': '1',
  //   'uid': '0',
  //   'work_name': '',
  //   'profile': '',
  //   's_type': 'p',
  //   'p_level': '0',
  //   'p_name': '',
  //   'is_ass': '0',
  //   'tid': '0',
  //   'title_name': '',
  //   'admin': Array()
  // };

  @ViewChild('titleName') public titleName: any;
  @ViewChild('deleteBtn') public deleteBtn: any;


  constructor(public renderer: Renderer,
              public router: Router,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('page.element') public element: any,
              @Inject('structure-data.service') public structureDataService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {

  }


  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  ngOnChanges() {
  }

  /**
   * 根据组织架构id查找具体职位信息
   * @return {boolean | PositionStructureEntity}
   */
  getPositionStructureById(search: any, search_key?: string){
    let find;
    let key = search_key ? search_key : 'id';
    for (let k in this._allStructure) {
      if (this._allStructure[k][key] == search) {
        find = this._allStructure[k];
        break;
      }
    }
    return find ? find : false;
  }

  pendingChange(data: any) {
    // let action = data[2];
    // let model = data[1];
    //console.log('pending change', data);
    this.pendingSelectedOptions = data[0];
  }

  /**
   * 点击function manager下拉菜单选中项
   * @param data
   */
  functionChange(data: any) {
    let option = data[0];
    let model = data[1];
    // let action = data[2];
    if (option.length) {
      this.functionSelectedPosition =  this.getPositionStructureById(model.id);
      //console.log('this.functionSelectedPosition', this.functionSelectedPosition);
      // 检查是否当前p_level大, 如果不合适, 清除等级相关信息
      if (parseInt(this.functionSelectedPosition.p_level) >= parseInt(this._editPosition.p_level)) {
        this._editStructure.pid = '';
        this._editStructure.p_name = '';
        this._editStructure.p_level = '';
      }
      if (this._editPosition.did == DEPARTMENT_PENDING_ID && option.length > 0) {
        this._editPosition.did = this.departmentId ? this.departmentId : DEPARTMENT_MAIN_ID;
      }
      // TODO: level对应过滤
      this.setPositionLevelList(this.functionSelectedPosition.p_level);
      // let newLevel = [];
      // for (let k in this.positionLevelList) {
      //   if (this.positionLevelList[k].level > this.functionSelectedPosition.p_level) {
      //     newLevel.push(this.positionLevelList[k]);
      //   }
      // }
      // console.log('this.positionLevelList',  this.functionSelectedPosition , this.positionLevelList, newLevel);
      // this.subordinatesSelectedArr = [];
      // this.subordinatesSelectedOptions = [];
      // this.setSubordinatesByPositionStructure();
    } else {
      delete this.functionSelectedPosition;
      this.setPositionLevelList();
    }

  }

  adminChange(data: any) {
    this.adminSelectedArr = data[0][0];
  }

  subordinatesChange(data: any) {
    this.subordinatesSelectedArr = data[0];
  }

  /**
   * 从下拉列表种选择position title
   */
  choosePositionTitleByName(positionName: any) {
    this._editPosition.tid = positionName.tid;
    this._editPosition.title_name = positionName.title_name;
  }

  /**
   * 定义表单属性
   */
  initFormAttribute(){
    if (!this._editPosition) {return;}
    // 是否是CEO
    this.isCeo = this._editPosition.is_ass == '0' && this._editPosition.parent_id == '0' && this._editPosition.did == '0';

    // 是新建还是编辑
    if (this._editPosition.did != DEPARTMENT_PENDING_ID) {
      let find = false;
      for (let k in this._allStructure) {
        if (this._allStructure[k].id == this._editPosition.id) {
          find = true;
          break
        }
      }
      this.isNew = !find;
    } else {
      this.isNew = true;
    }

    // 是否有父级
    this.hasParent = this._editPosition.parent_id !== '';
    // 是否是助理
    this.isAss = this._editPosition.is_ass == '1';
    let parentId;
    if (this.departmentId != DEPARTMENT_MAIN_ID) {
      for (let k in this._departmentList) {
        if (this._departmentList[k].did == this.departmentId) {
          parentId = this._departmentList[k].parent_id;
          break;
        }
      }
      if (parentId) {
        this.departmentLeader = this.getPositionStructureById(parentId);
        //console.log('this.departmentLeader', this.departmentLeader);
      }
    } else {
      for (let k in this._allStructure) {
        if (this._allStructure[k].is_ass == '0' && this._allStructure[k].parent_id == '0' && this._allStructure[k].did == '0') {
          this.departmentLeader = this._allStructure[k];
          //console.log('this.departmentLeader', this.departmentLeader);
          break;
        }
      }
    }

    // console.log('this.isNew',  this.isNew);
    // console.log('this.isCEO',  this.isCeo);
    // console.log('this.hasParent',  this.hasParent);
    // console.log('this.isAss',  this.isAss);
  }

  /**
   * Position Title
   * @param data
   */
  setPositionNameByPositionStructure(data?: any) {
    if (this.titleName) {
      this.titleName.nativeElement.value = '';
    }

    this.defaultPositionTitle = {
      'cid': '0',
      'tid': '0',
      'title_name': ''
    };
    this.positionTitleDisabled = this.getEditStructure().hasOwnProperty('parent_id') && this.getEditStructure().parent_id === '0';
    if (data.tid && data.tid !== '0') {
      this.defaultPositionTitle.cid = data.company_id;
      this.defaultPositionTitle.tid = data.tid;
      this.defaultPositionTitle.title_name = data.title_name;
      if (this.titleName) {
        this.titleName.nativeElement.value = data.title_name;
      }
    }
  }


  // setPositionOptions(positionLevel: string) {
  //   // let positionLevelInfo: any = [];
  //   // // let positionLevelInfo: any = [];
  //   // if(this.typeService.getObjLength(this.functionSelectedArr)) {
  //   //     let functionInfo = this.getFunctionByOptionId(this.functionSelectedArr['id']);
  //   //     let level = parseInt(functionInfo['p_level']);
  //   //     for (let key in this.localPositionLevelInfo) {
  //   //         let position: any = this.localPositionLevelInfo[key];
  //   //         for (let k in position['position']) {
  //   //             if (parseInt(position['position'][k].p_level) > level) {
  //   //                 positionLevelInfo.push(this.setPositionLevelOptions(position['position'][k]));
  //   //             }
  //   //         }
  //   //     }
  //   // }
  //   // return positionLevelInfo;
  // }
  /**
   *  设置职位等级的下拉选项
   */
  setPositionLevelList(parentLevel?: number) {
    if (!this._editPosition) { return; }
    let positionLevelInfo: any = [];
    // console.log('setPositionLevelList >>>>> this._editPosition', this._editPosition);
    //
    // console.log('isNew', this.isNew);
    // console.log('hasParent', this.hasParent);
    // console.log('isAss', this.isAss);
    // 助理无p name
    if (this.isAss) {
      this.positionLevelList = positionLevelInfo;
      return;
    }
    for (let key in this.localPositionLevelInfo) {
      let levelNum: number = parseInt(this.localPositionLevelInfo[key].p_level);
      if (this.departmentLeader && this.departmentLeader.p_level >= levelNum) {continue;}
      let levelTitle: string;
      if (levelNum > 3 && levelNum < 21) {
        levelTitle = 'th';
      } else {
        switch (levelNum % 10) {
          case 1:
            levelTitle = 'st';
            break;
          case 2:
            levelTitle = 'nd';
            break;
          case 3:
            levelTitle = 'rd';
            break;
          default:
            levelTitle = 'th';
        }
      }
      levelTitle = this.localPositionLevelInfo[key].p_level + levelTitle;
      let levelGroup;
      // 根据条件判定
      // TODO 下个版本支持递推
      if (this.isNew && (!this.hasParent && !parentLevel)) {
        // 新增职位, 或pending人员时, 大于当前部门leader level
        // main大于0, 部门大于部门leader
        levelGroup = {
          title: levelTitle,
          level: levelNum,
          position: this.localPositionLevelInfo[key].position
        };
      } else if (this.isNew &&
        (
          (this.hasParent && parseInt(this.localPositionLevelInfo[key].p_level) > this.functionSelectedPosition.p_level)
        || (parentLevel && parseInt(this.localPositionLevelInfo[key].p_level) > parentLevel)
        )
      ) {
        // 在新建下属时, 必定有父级, 限制level必须大于父级的等级
        levelGroup = {
          title: levelTitle,
          level: levelNum,
          position: this.localPositionLevelInfo[key].position
        };
      } else if (!this.isNew && parseInt(this.localPositionLevelInfo[key].p_level) == parseInt(this._editPosition.p_level)){
        // 编辑已有psid且有人的职位时, 限制只显示同等级level的选项
        levelGroup = {
          title: levelTitle,
          level: levelNum,
          position: this.localPositionLevelInfo[key].position
        };
      }
      //console.log('levelGroup', levelGroup);
      if (levelGroup) {
        positionLevelInfo.push(levelGroup);
      }
    }
    this.positionLevelList = positionLevelInfo;
  }

  initData() {
    // console.log('this._allStructure', this._allStructure);
    // console.log('this._staffList', this._staffList);
    // console.log('this._departmentList', this._departmentList);
    // console.log('this._editPosition', this._editPosition);
    // console.log('this.localPositionLevelInfo', this.localPositionLevelInfo);
    if (typeof this._allStructure != 'undefined' &&  typeof this._staffList != 'undefined'
      && typeof this._departmentList != 'undefined' && typeof this._editPosition != 'undefined'
      && typeof this.localPositionLevelInfo != 'undefined') {
      this.initFormAttribute();
      this.reset();
      //console.log('初始化编辑职位表单');
      this.initDropdown();
      this.initFormData();
      this.setPositionLevelList();
      this.formHide = false;
    }
  }

  /**
   * 下拉菜单相关设置
   */
  initDropdown(){
    this.setDropDownSettings();
    // 下拉选项设置开始
    this.setDropdownOptions();
  }

  /**
   * 根据在编辑的职位信息初始化对应下拉菜单
   */
  setDropDownSettings() {
    let data: PositionStructureEntity = this._editPosition;
    delete this.pendingSettings;
    delete this.functionSettings;
    delete this.adminSettings;
    delete this.subordinatesSettings;
    // settings设置开始
    this.pendingSettings = new DropdownSettings();
    this.functionSettings = new DropdownSettings();
    this.adminSettings = new DropdownSettings();
    this.subordinatesSettings = new DropdownSettings();
    this.pendingSettings.isMultiple = false;
    this.functionSettings.isMultiple = false;
    this.adminSettings.isMultiple = false;
    this.subordinatesSettings.isMultiple = true;
    this.subordinatesSettings.readonly = true;
    //编辑已有职位且上面有职员时不允许变更
    if (this.isCeo) {
      this.pendingSettings.readonly = true;
    }
    if (data.did != '-1') {
      if (this.isCeo) {
        // CEO无法在组织架构中编辑以及变动
        this.functionSettings.readonly = true;
      } else if (data.is_ass == '1') {
        // 助手不能有下属, 直属上级无法变更
        this.functionSettings.readonly = true;
      }
    }
  }

  /**
   * 设置选中植
   */
  setDropdownOptions() {
    this.setPendingByPositionStructure();
    this.setFunctionByPositionStructure();
    this.setAdminByPositionStructure();
    this.setSubordinatesByPositionStructure();
    // this.setPositionNameByPositionStructure(data);
  }

  /**
   * 设置pending职位下拉菜单以及已选中成员
   */
  setPendingByPositionStructure() {
    if (!this._editPosition) {
      return;
    }
    //所有did -1的staff或者在编辑职位的人
    let tmpPendingArr = [];
    for (let k in this._staffList) {
      if (this._staffList[k].did == '-1' || this._staffList[k].suid == this._editPosition.suid) {
        let tmp = this.setPendingOptions(this._staffList[k]);
        tmpPendingArr.push(tmp);
      }
    }
    this.pendingOptions = tmpPendingArr;
    if (this._editPosition.suid) {
      let selected = this.setPendingOptions(this._editPosition);
      this.pendingSelectedOptions.push(selected);
      //this.pendingSelectedArr = [selected];
    }
  }

  /**
   * 设置function manager下拉以及选中值
   * @param filter_p_level 可选项，筛选用指定等级, 如果有值, 比该等级小的职级才会出现
   */
  setFunctionByPositionStructure(filter_p_level?: string) {
    if (!this._editPosition) {
      return;
    }
    let tmpFunctionArr = [];
    let selectedFunction = this.functionSelectedOptions ? this.functionSelectedOptions : [];
    let selectionPosition = this.functionSelectedPosition ? this.functionSelectedPosition : null;
    // function manager 直属上司，又称 line manager
    // 对于pending的人员来说可以挑选任意职位(非助理)，且属于当前查看部门的作为直属上司
    if (this._editPosition.did == DEPARTMENT_PENDING_ID) {
      for (let k in this._allStructure) {
        if (this._allStructure[k].id && this._allStructure[k].is_ass == '0') {
          if ((!filter_p_level && this._allStructure[k].did == this.departmentId)
            || this.departmentLeader && this._allStructure[k].id == this.departmentLeader.id
            || (filter_p_level && this._allStructure[k].p_level < filter_p_level && this._allStructure[k].did == this.departmentId)) {
            let tmp = this.setFunctionOrAdminOrSubOptions(this._allStructure[k]);
            tmpFunctionArr.push(tmp);
          }
        }
      }
    } else {
      // 已有职位上司列表
      // @see https://zentao.blockbi.com/index.php?m=task&f=view&id=331
      // 允许平移条件: 1. 职位无下级、助手 2. 仅限同部门同辈父级节点
      // CEO的上司为自身
      // console.log('他的上司是？', this._editPosition.parent_id);
      // console.log('他的上司所属部门是？', this._editPosition.did);
      // console.log('他的下属有？', this._editPosition['nodes']);
      let subordinate = this._editPosition.hasOwnProperty('nodes') && this._editPosition['nodes'].length > 0;
      let parent_id = this._editPosition.parent_id;
      let parent;
      for (let k in this._allStructure) {
        let toCheck = this._allStructure[k];
        if (toCheck.id == parent_id) {
          parent = toCheck;
          tmpFunctionArr.push(this.setFunctionOrAdminOrSubOptions(parent));
          break;
        }
      }
      if (parent) {
        selectionPosition = parent;
        if (selectedFunction.length) {
          selectedFunction = [this.setFunctionOrAdminOrSubOptions(parent)]
        } else {
          selectedFunction.push(this.setFunctionOrAdminOrSubOptions(parent));
        }
        // 无下属和附属部门时候可以选其他同一个父节点的子级节点
        if (!subordinate && parseInt(this._editPosition.p_level) - parseInt(parent.p_level) > 1) {
          //console.log(' parent.p_level ',  parent.p_level );
          //console.log(' current p_level', this._editPosition.p_level);
          for (let k in this._allStructure) {
            let toCheck = this._allStructure[k];
            if (toCheck.id != parent.id &&
              (toCheck.is_ass == '0' && toCheck.did == parent.did
                && parseInt(toCheck.p_level) < parseInt(this._editPosition.p_level)
                && toCheck.parent_id == parent.id)) {
              let tmp = this.setFunctionOrAdminOrSubOptions(toCheck);
              tmpFunctionArr.push(tmp);
            }
          }
        }
      }
    }

    this.functionOptions = tmpFunctionArr;
    this.functionSelectedOptions = selectedFunction;
    this.functionSelectedPosition = selectionPosition;
  }

  /**
   * 设置admin manager下拉以及选中值
   */
  setAdminByPositionStructure() {
    // TODO: 包含子公司之后需要显示其他公司人员
    if (this.companyInfoArr && this.companyInfoArr.length > 1) {
      for (let key in this.companyInfoArr) {
        let company = {
          'key': this.companyInfoArr[key].cid,
          'title': this.companyInfoArr[key].name
        };
        this.adminSettings.group.push(company);
      }
    }

    let adminInfo: any = [];
    for (let k in this._allStructure) {
      let toCheck = this._allStructure[k];
      // 除了自身都可成为自己的admin manager
      if (toCheck.id != this._editPosition.id) {
        adminInfo.push(this.setFunctionOrAdminOrSubOptions(toCheck));
      }
    }
    let selectedOptionsArr = [];
    if (this._editPosition.admin.id && this._editPosition.admin.company_id != '0') {
      let tmp = this.setFunctionOrAdminOrSubOptions(this._editPosition);
      //this.adminSelectedArr = adminArr;
      selectedOptionsArr.push(tmp);
    }
    this.adminOptions = adminInfo;
    this.adminSelectedOptions = selectedOptionsArr;
  }

  /**
   * 设置可选下属列表
   */
  setSubordinatesByPositionStructure() {
    if (!this._editPosition) {return;}
    let subordinatesArr: any = [];

    let selectedArr = [];
    for (let key in this._allStructure) {
      let toCheck = this._allStructure[key];
      // 下属选择规则等同于psid平移规则
      // 即只可以选择在同部门内的比自身level + 1的下属
      if (toCheck.parent_id == this._editPosition.id && toCheck.is_ass == '0' && toCheck.did == this.departmentId) {
        let tmp = this.setFunctionOrAdminOrSubOptions(toCheck);
        subordinatesArr.push(tmp);
        selectedArr.push(tmp);
      } else if (
        toCheck.p_level == this._editPosition.p_level + 1 && toCheck.did == this.departmentId && toCheck.is_ass == '0') {
        subordinatesArr.push(this.setFunctionOrAdminOrSubOptions(toCheck));
      }
    }
    this.subordinatesOptions = subordinatesArr;
    this.subordinatesSelectedOptions = selectedArr;
  }

  /**
   * 表单相关字段
   */
  initFormData() {
    let data: PositionStructureEntity = this._editPosition;
    // 关于表单title
    if (data.did == DEPARTMENT_PENDING_ID) {
      this.editPositionTitle = 'NEW POSITION';
    } else {
      //TODO NEW SUBORDINATE
      if (this.hasParent && this.isNew && !this.isAss) {
        this.editPositionTitle = 'NEW SUBORDINATE'
      } else if (this.hasParent && this.isAss && this.isNew) {
        this.editPositionTitle = 'NEW ASSISTANCE';
      } else {
        this.editPositionTitle = 'EDIT POSITION';
      }
    }
    //TODO
    this._editStructure = data;
    if (this.isCeo) {
      this.deleteBtn.nativeElement.style.opacity = 0.5;
      this.deleteBtn.nativeElement.style.cursor = ' not-allowed';
    } else {
      this.deleteBtn.nativeElement.style.opacity = 1;
      this.deleteBtn.nativeElement.style.cursor = 'pointer';
    }
  }

  closePositionForm() {
    this.outOpenForm.emit({type: 1, hide: true});
  }


  /**
   * toggle-select-direct callBackData触发
   * @param element
   */
  showPositionList(element?: any) {
    this.toggleSelectElement = element.toggleSelectElement;
    this.renderer.setElementClass(this.toggleSelectElement, 'hide', false);
  }

  /**
   * 通过下拉菜单选择等级
   * @param data
   */
  choosePositionLevel(data: any) {
    this._editPosition.p_name = data.p_name;
    this._editPosition.pid = data.pid;
    this._editPosition.p_level = data.p_level;
    if (this.toggleSelectElement) {
      this.renderer.setElementClass(this.toggleSelectElement, 'hide', true);
      this.toggleSelectService.emptyElement();
    }
  }

  /**
   * 删除 position
   * @param event
   */
  deletePositionStructure(event: any) {
    if (event) {
      event.stopPropagation();
    }
    if (!this.isCeo) {
      this.outDeletePosition.emit(this._editStructure);
    }
  }

  /**
   * 根据数据初始化下拉菜单选项
   * @param data
   * @return {DropdownOptionModel}
   */
  setPendingOptions(data: PositionStructureEntity | StructureStaffEntity): DropdownOptionModel {
    let tmpModel = new DropdownOptionModel();
    let model = {
      id: data.suid,
      isCurrent: false,
      label: data.work_name,
      key: data.work_name,
      imageLabel: data.profile ? this.config.resourceDomain + data.profile : '',
    };
    tmpModel.initData(model);
    return tmpModel;
  }

  /**
   * 根据数据初始化下拉菜单选项
   * @param {PositionStructureEntity} data
   * @return {DropdownOptionModel}
   */
  setFunctionOrAdminOrSubOptions(data: PositionStructureEntity): DropdownOptionModel {
    let tmpModel = new DropdownOptionModel();
    let model: any;
    if (data && data.profile) {
      model = {
        id: data.id,
        isCurrent: false,
        label: data.work_name,
        desc: (data.title_name ? data.title_name  + ' ' : '') + data.p_name
          + (data.is_ass == '1'? ' assistant' : '')
          + ' Lv' + (parseInt(data.p_level)),
        key: data.work_name,
        imageLabel: data.profile ? this.config.resourceDomain + data.profile : 'NaN'
      };
    } else {
      model = {
        id: data.id,
        isCurrent: false,
        label: this.POSITION_VACANCY + ' ID:' + data.id,
        key: data.p_name + '(' + data.id + ')',
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

  /**
   * 寻找 pending职员信息
   * @param {string} id
   * @return {StructureStaffEntity|boolean}
   */
  getPendingByOptionId(id: string): StructureStaffEntity {
    let res;
    console.log('to search', id);
    for (let key in this._staffList) {
      if (id == this._staffList[key].suid) {
        res = this._staffList[key];
        break;
      }
    }
    // 如果不在员工列表里，那么可能是pending用户，在pending列表中找
    return res ? res: false;
  }

  getFunctionByOptionId(id: string) {
    let res = Array();
    // for (let key in this.localStructureInfo) {
    //   if (id === this.localStructureInfo[key].id) {
    //     res = this.localStructureInfo[key];
    //   }
    // }
    for (let key in this.localAllStructureInfo) {
      for (let k in this.localAllStructureInfo[key].structure) {
        let structure = this.localAllStructureInfo[key].structure[k];

        if (id == structure.id) {
          res = structure
          break;
        }
      }
    }
    return res;
  }

  getAdminByOptionId(data: any) {
    let res = Array();
    for (let key in this.localAllStructureInfo) {
      if (data['group'] === this.localAllStructureInfo[key]['cid']) {
        let company = this.localAllStructureInfo[key]['structure'];
        for (let k in company) {
          if (company[k]['id'] === data['id']) {
            res = company[k];
          }
        }
      }
    }
    return res;
  }

  /**
   * 点击保存
   * 常规验证
   */
  savePositionInfo() {
    if (this.isNew) {
      this.newPositionStructureId++;
      this.outAddId.emit(this.newPositionStructureId);
      this.getEditStructure().id = 'ps' + this.newPositionStructureId;
    }
    //console.log('保存前？？', this._editPosition, this.isNew, this.isAss, this.hasParent);
    //return;
    // 职位level不能为空
    if (!this.isAss && (this._editPosition.pid == '0' || !this._editPosition.pid)) {
      let settings = {
        simpleContent: 'The position level cannot be empty!'
      };
      this.dialogService.openWarning(settings);
      return;
    }

    // 助理和上级不能为空
    if (!this.functionSelectedPosition && !this.isAss && !this.isCeo) {
      let settings = {
        simpleContent: 'The superior cannot be empty!'
      };
      this.dialogService.openWarning(settings);
      return;
    }
    if (this.functionSelectedPosition) {
      this._editPosition.parent_id = this.functionSelectedPosition.id;
    }

    // 整合信息
    // 如果是撤职，将人从psid上移除, 在staff列表中将用户状态将变为2, psid应该为空
    // 如果是替换，等同于前任职务的人变为pending状态,
    // 新上任的根据实际情况

    //console.log('save this._editPosition', this._editPosition, this.typeService.clone(this._allStructure));
    let oldSuid: string;
    let newSuid: string;
    let oldPending =  this.typeService.clone(this._editPosition);
    console.log('oldPending', oldPending);

    oldSuid = oldPending.suid;
    if (this.typeService.getObjLength(this.pendingSelectedOptions)) {
      // 必须clone数据不然会产生引用更改
      let currentPending: any = this.getPendingByOptionId(this.pendingSelectedOptions[0].id);
      if (currentPending) {
        currentPending = this.typeService.clone(currentPending);
        console.log('currentPending', currentPending);
      }

      //console.log('pending的人？', currentPending);
      newSuid = currentPending.suid;
      this._editPosition.suid = currentPending.suid;
      this._editPosition.uuid = currentPending.uuid;
      this._editPosition.work_name = currentPending.work_name;
      this._editPosition.profile = currentPending.profile;
      this._editPosition.s_type = 'u';
    } else {
      this._editPosition.suid = '';
      this._editPosition.uuid = '0';
      this._editPosition.work_name = '';
      this._editPosition.profile = '';
      this._editPosition.s_type = 'p';
    }
    // //TODO 父级修改allStructure和staffList
    this.outEditPosition.emit([this._editPosition, oldSuid, newSuid, this.isNew]);
  }

  reset() {
    this.saveStructureInfo = {
      'id': '0',
      'parent_id': '0',
      'pid': '0',
      'did': '0',
      'cid': '0',
      'company_id': '0',
      'suid': '',
      'status': '1',
      'uid': '0',
      'work_name': '',
      'profile': '',
      's_type': 'p',
      'p_level': '0',
      'p_name': '',
      'is_ass': '0',
      'tid': '0',
      'title_name': '',
      'admin': Array()
    };
    this.defaultPositionLevel = {
      'cid': this.companyId,
      'is_ass': this._editPosition.is_ass,
      'p_level': this._editPosition.p_level,
      'p_name': this._editPosition.p_name,
      'pid': this._editPosition.pid,
      'staff': []
    };
    this._editStructure = [];

    this.pendingSelectedOptions = [];
    this.pendingSelectedArr = [];
    this.pendingOptions = [];

    this.functionSelectedOptions = [];
    delete this.functionSelectedPosition;
    this.functionOptions = [];

    this.adminSelectedOptions = [];
    this.adminSelectedArr = [];
    this.adminOptions = [];

    this.subordinatesSelectedOptions = [];
    this.subordinatesSelectedArr = [];
    this.subordinatesOptions = [];
  }

  /**
   * 下拉菜单新建level
   * @param event
   */
  newLevel(event: any) {
    if (event) {
      event.stopPropagation();
    }
    let flag = true;
    this.outNewLevel.emit(flag);
  }

}
