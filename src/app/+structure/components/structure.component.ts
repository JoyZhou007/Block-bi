import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { StructureModelService } from "../../shared/services/index.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { StructureListComponent } from "./structure-list.component";
import { StructureFormEditPositionComponent } from "./structure-form-edit-position.component";
import { StructureFormEditDepartmentComponent } from "./structure-form-edit-department.component";
import { StructureFormEditPositionLevelComponent } from "./structure-form-edit-position-level.component";
import { StructureEntiretyComponent } from "./structure-entirety.component";
import { ContactModelService } from "../../shared/services/model/contact-model.service";
import {
  APIStructure,
  DEPARTMENT_MAIN_ID,
  DEPARTMENT_PENDING_ID,
  PositionStructureEntity,
  StructureDepartmentEntity,
  StructureStaffEntity
} from "../../shared/services/model/entity/structure-entity";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";


let introInit = require('intro.js');


@Component({
  selector: 'structure-info',
  templateUrl: '../template/structure.component.html',
  styleUrls: ['../../../assets/css/structure/company-structure.css'],
  encapsulation: ViewEncapsulation.None
})

export class StructureComponent implements OnInit, AfterViewInit, OnDestroy {
  // 所有Position数据集合
  // 结构为{部门id => 所有职位数组}
  // 其中main为特殊部门 部门id为0
  public hasInit: boolean = false;
  public allStructure: Array<PositionStructureEntity>;

  // 部门列表, 按照did分组
  public departmentListSet: { [key: string]: StructureDepartmentEntity };
  public staffList: Array<StructureStaffEntity>;
  // 画图用数据
  public structureInfo: {
    d: any,
    s: any
  };

  // did数组，循环模板用
  public deptKeyArr: Array<string>;
  // 左侧全列表, 按照did分组
  public staffByDeptList: { [key: string]: Array<StructureStaffEntity> };
  // 正在编辑的职位信息
  public editPositionInfo: PositionStructureEntity;
  // 正在编辑的部门信息
  public editDepartmentInfo:any;

  // CEO, 供help使用
  public CEOEntity: any;
  public marginLeft:string = '0';

  // 新建职位替代ID序号
  public newPositionStructureId: number = 1;
  // 新建position title替代ID序号
  public newPositionTitleId:number = 1;
  // 同时在线用户列表
  public concurrencyUserArr: Array<any> = [];


  public _structure: any;
  public _companyInfo: any;
  public _positionInfo: any;
  public _positionTitleInfo: any;
  public depName: string;
  private makeLevel: any;

  public newStructureId: number = 1;
  public newDepartmentId: number = 1;

  public editStructureInfo = {
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
    'admin': []
  };

  public companyId: any;
  public departmentId: any;

  // 用户在线同步相关变量
  public IMHasInit: any;
  public subscription: Subscription;
  public interval;


   /**
   * component
   */
  @ViewChild('structureList') public structureList: StructureListComponent;
  @ViewChild('structureFormEditPosition') public structureFormEditPosition: StructureFormEditPositionComponent;
  @ViewChild('structureFormEditDepartment') public structureFormEditDepartment: StructureFormEditDepartmentComponent;
  @ViewChild('structureFormEditPositionLevel') public structureFormEditPositionLevel: StructureFormEditPositionLevelComponent;
  @ViewChild('structureEntirety') public structureEntirety: StructureEntiretyComponent;

  constructor(public router: Router,
              public renderer: Renderer,
              public location: Location,
              public activatedRoute: ActivatedRoute,
              public structureService: StructureModelService,
              public contactModelService: ContactModelService,
              @Inject('structure-data.service') public structureDataService: any,
              @Inject('user.service') public userService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('app.config') public config: any,
              @Inject('im.service') public IMService: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('company-data.service') public companyService: any,
              @Inject('notification.service') public notificationService: any) {
    Observable.combineLatest(this.activatedRoute.params, this.activatedRoute.queryParams).subscribe(bothParams => {
      let params = bothParams[0];
      let queryParams = bothParams[1];
      if (params.hasOwnProperty('cid')) {
        let did = queryParams.hasOwnProperty('did') ? queryParams['did'] : null;
        this.initData(params['cid'], did);
      } else {
        this.dialogService.openNoAccess();
      }
    });
    this.IMHasInit = this.IMService.socketLoginStatus;
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      //IM登录后同步在线编辑人员
      if (message.act && message.act == this.notificationService.config.ACT_SYSTEM_IM_LOGIN) {
        this.IMHasInit = true;
        this.setHeartBeatOfConcurrency();
      }
      //在线用户变更通知
      if (message.act && message.act == this.notificationService.config.ACT_STRUCTURE_CONCURRENCY_ADD
        && (message.data.hasOwnProperty('sent') || message.data.hasOwnProperty('owner'))) {
        this.initConcurrencyUser(message.data);
      }
      if (message.act && message.act == this.notificationService.config.ACT_STRUCTURE_CONCURRENCY_DELETE
        && (message.data.hasOwnProperty('sent') || message.data.hasOwnProperty('owner'))) {
        this.initConcurrencyUser(message.data);
      }
    });
  }


  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setHeartBeatOfConcurrency();
    this.structureDataService.setUploadStructureFlag(0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.IMService.sendMessage({
      act: this.notificationService.config.ACT_STRUCTURE_CONCURRENCY_DELETE,
      data: {}
    });
    this.structureDataService.setUploadStructureFlag(0);
    clearInterval(this.interval);
  }

  /**
   * 初始化相关数据
   *
   * @param cid
   * @param did
   */
  initData(cid: any, did?: any) {
    this.companyId = cid;
    this.departmentId = did ? did : '0';
    //console.log('departmentID', did, 'this.hasInit', this.hasInit);
    if (!this.hasInit) {
      this.getAllStructureInfo(() => {this.prepareTemplateData()});
      this.getComInfo();
      this.getPositionInfo();
      this.getPositionTitleInfo();
    } else {
      this.prepareTemplateData();
    }
  }

  /**
   * 保持用户在线
   */
  setHeartBeatOfConcurrency(){
    if (this.IMHasInit) {
      this.IMService.sendMessage({
        act: this.notificationService.config.ACT_STRUCTURE_CONCURRENCY_ADD,
        data: {}
      });
      //定时器. 3分钟发送一次保持用户在线编辑装填
      this.interval = setInterval(() => {
        this.IMService.sendMessage({
          act: this.notificationService.config.ACT_STRUCTURE_CONCURRENCY_HEARTBEAT,
          data: {}
        });
      }, 120000)
    }
  }

  /**
   * 通知IM多人同时在线编辑
   */
  initConcurrencyUser(data: any){
    this.concurrencyUserArr = [];
    if (data.hasOwnProperty('psid')) {
      for (let k in data.psid) {
        this.userService.searchUserInfoInContactList(data.psid[k],(result: any) => {
          if (!result.isSelf && result.find) {
            this.concurrencyUserArr.push(result.find);
          }
        });
      }
    }
    console.log('this.concurrencyUserArr', this.concurrencyUserArr);
  }



  /**
   * 获取职位抬头相关数据
   */
  getPositionTitleInfo() {
    this.structureService.getStructurePositionTitle(
      {data: {keyword: ''}},
      (data: any) => {
        if (data.status === 1) {
          this._positionTitleInfo = this.typeService.getObjLength(data.data) > 0 ? data.data : []
          //this.structureMenu.positionTitleInfo = this.getLocalPositionTitleInfo();
        }
      }
    );
  }


  /**
   * v1旧接口，已合并到allStructure 获取员工相关数据
   */
  getStaffInfo() {
    // this.structureService.getStructureStaff(
    //   {cid: this.companyId},
    //   (data: any) => {
    //     if (data.status === 1) {
    //       this.setLocalStaffInfo(this.typeService.getObjLength(data.data) > 0 ? data.data : []);
    //       //this.structureList.staffInfo = this.getLocalStaffInfo();
    //       //this.structureMenu.staffInfo = this.getLocalStaffInfo();
    //     }
    //   }
    // );
  }

  /**
   * v1旧接口，已合并到allStructure  获取部门相关数据
   */
  getDeptInfo() {
    // this.structureService.getStructureDept(
    //   {id: this.companyId},
    //   (data: any) => {
    //     if (data.status === 1) {
    //       this.setLocalDepartmentInfo(this.typeService.getObjLength(data.data) > 0 ? data.data : []);
    //       // this.structureList.departmentInfo = this.getLocalDepartmentInfo();
    //       // if (this.departmentId && this.structureList.departmentInfo.length > 0) {
    //       //   for (let key in this.structureList.departmentInfo) {
    //       //     if (this.departmentId === parseInt(this.structureList.departmentInfo[key].did)) {
    //       //       this.depName = this.structureList.departmentInfo[key].name;
    //       //       break;
    //       //     }
    //       //   }
    //       // }
    //
    //       // this.editDepartment.departmentInfo = this.getLocalDepartmentInfo();
    //     }
    //   }
    // );
  }

  /**
   * 获取公司相关数据, 分公司/子公司/公司名等
   */
  getComInfo() {
    this.structureService.getStructureCompany(
      {cid: this.companyId},
      (data: any) => {
        if (data.status === 1) {
          this._companyInfo = this.typeService.getObjLength(data.data) > 0 ? data.data : [];
        }
      }
    )
  }

  /**
   * 获取职务相关数据
   */
  getPositionInfo() {
    this.structureService.getStructurePosition(
      {data: {cid: this.companyId}},
      (data: any) => {
        if (data.status === 1) {
          this.setLocalPositionInfo(this.typeService.getObjLength(data.data) > 0 ? data.data : []);
          // this.structureMenu.positionInfo = this.getLocalPositionInfo();
          // this.editPosition.positionInfo = this.getLocalPositionInfo();
        }
      }
    );
  }

  /**
   * Position Level & Name & staff 信息
   * @param data
   */
  public setLocalPositionInfo(data: any) {
    let level = 1;
    for (let key in data) {
      if (level < parseInt(data[key].p_level)) {
        level = parseInt(data[key].p_level);
      }
    }

    if (level != this.typeService.getObjLength(data)) {
      let newData: any = [];
      for (let i = 0; i < level; i++) {
        newData[i] = {
          'p_level': (i + 1).toString(),
          'position': []
        };
        for (let key in data) {
          if (data[key].p_level === newData[i].p_level) {
            newData[i] = data[key];
          }
        }
      }
      this._positionInfo = newData;
    } else {
      this._positionInfo = data;
    }
    //console.log('positionInfo', this._positionInfo);
  }

  /**
   * 获取全集团的组织架构数据
   */
  getAllStructureInfo(callback?: Function) {
    // 改版: 获取全部部门以及main的数据
    this.structureService.getAllStructure(
      {cid: this.companyId},
      (res: any) => {
        // 处理数据
        if (res.status == 1 && res.hasOwnProperty('data')) {
          let resArr = [];
          //TODO： 结构调整
          // position structure信息
          if (res.data.hasOwnProperty('structure')) {
            for (let key in res.data.structure) {
              let data = res.data.structure[key];
              // 初始值
              let obj: PositionStructureEntity = this.initPositionStructureEntity(data);
              //console.log('before push into all',this.typeService.clone(obj));
              // CEO标记
              if (obj.parent_id == '0' && obj.is_ass == '0') {
                this.CEOEntity = obj;
              }
              //赋值
              // if (!resArr.hasOwnProperty(obj.did)) {
              //   resArr[obj.did] = [];
              // }
              resArr.push(obj);
            }
          }
          // 部门信息
          let deptSet = {};
          if (res.data.hasOwnProperty('department')) {
            for (let key in res.data.department) {
              let data = res.data.department[key];
              let obj = this.initStructureDepartmentEntity(data);
              if (!deptSet.hasOwnProperty(obj.did)) {
                deptSet[obj.did] = obj;
              }
            }
          }
          // 员工列表
          let staffSet = [];
          if (res.data.hasOwnProperty('staff')) {
            for (let key in res.data.staff) {
              let data = res.data.staff[key];
              let obj = this.initPositionStaffEntity(data);
              staffSet.push(obj);
            }
          }

          this.allStructure = resArr;
          this.departmentListSet = deptSet;
          this.staffList = staffSet;
          if (callback) {
            callback();
          }
        } else {
          this.dialogService.openError({simpleContent: 'System Error, please try later'});
        }
      }
    );
  }


  /**
   * 准备绘图数据
   */
  prepareTemplateData() {
    // 先检查did是否存在，可能会有新建了did跳转后刷新页面路由仍然停留在新建的did信息上的情况
    if (this.departmentId != '0') {
      let find = false;
      for (let k in this.departmentListSet) {
        if (this.departmentListSet[k].did == this.departmentId) {
          find = true;
          this.depName = this.departmentListSet[k].name;
          break;
        }
      }
      if (!find) {
        this.router.navigate(['structure', this.companyId])
      }
    } else {
      this.depName = '';
    }

    let deptList: { [key: string]: Array<any> } = {};
    for (let key in this.departmentListSet) {
      deptList[key] = [];
    }
    // 根据staff添加额外部门
    for (let key in this.staffList) {
      if (this.staffList.hasOwnProperty(key)) {
        let staff = this.staffList[key];
        let deptId = staff.did;
        if (deptList.hasOwnProperty(deptId)) {
          deptList[deptId].push(staff);
        } else {
          deptList[deptId] = [staff];
        }
      }
    }
    // 部门id数组
    this.deptKeyArr = Object.keys(deptList).sort((a, b) => parseInt(a) - parseInt(b));
    this.staffByDeptList = deptList;
    // console.log(
    //   'this.allStructure', this.typeService.clone(this.allStructure),
    //   'this.departmentListSet', this.departmentListSet,
    //   'this.staffList', this.staffList,
    //   'this.deptKeyArr', this.deptKeyArr,
    //   'this.staffByDeptList', this.staffByDeptList
    // );
    this.hasInit = true;
    this.structureInfo = {d: this.departmentListSet, s: this.allStructure};
  }

  /**
   * 根据接口数据初始化对象
   * @param data
   * @return {PositionStructureEntity}
   */
  initPositionStructureEntity(data: any): PositionStructureEntity {
    this.newPositionStructureId++;
    let obj: PositionStructureEntity = {
      id: 'ps' + this.newPositionStructureId,
      suid: '0',
      uuid: '0',
      profile: '',
      work_name: '',
      parent_id: '',
      did: this.departmentId ? this.departmentId : DEPARTMENT_MAIN_ID,
      tid: '0',
      pid: '0',
      is_ass: '0',
      admin: {
        id: '0',
        company_id: '0',
      },
      company_id: '0',
      p_level: "1",
      p_name: "",
      s_type: "",
      title_name: ""
    };
    if (data.did == DEPARTMENT_PENDING_ID) {
      data.parent_id = '';
    }
    Object.assign(obj, data);
    return obj;
  }

  initStructureDepartmentEntity(data: any): StructureDepartmentEntity {
    let obj: StructureDepartmentEntity = {
      did: '0',
      cid: '',
      name: '',
      parent_id: '',
      num: 0
    };
    Object.assign(obj, data);
    return obj;
  }

  initPositionStaffEntity(data: any): StructureStaffEntity {
    let obj: StructureStaffEntity = {
      profile: '',
      profile_id: '0',
      status: '0',
      suid: '0',
      uuid: '0',
      did: DEPARTMENT_PENDING_ID, // 0与2状态下无部门
      psid: '0',
      work_name: ''
    };
    Object.assign(obj, data);
    return obj;
  }

  /**
   * 提交组织架构数据
   */
  uploadStructureInfo() {
    // 准备数据, 过滤CEO相关
    let updateLoadData: any = {
        cid: this.companyId
      };
    // structure
    let uploadStructure = [];
    for (let k in this.allStructure) {
      let toCheck = this.allStructure[k];
      if (toCheck.s_type == 'p' || toCheck.s_type == 'u') {
        let tmp = {
          id: toCheck.id,
          parent_id: toCheck.parent_id,
          pid: toCheck.pid,
          did: toCheck.did,
          company_id: this.companyId,
          suid: toCheck.suid,
          tid: toCheck.tid,
          is_ass: toCheck.is_ass,
        };
        uploadStructure.push(tmp);
      }
    }

    updateLoadData['structure'] = uploadStructure;

    // positions
    let uploadPositions:Array<any> = [];
    for (let k in this._positionInfo) {
      let toCheck = this._positionInfo[k];
      let tmp = this.typeService.clone(toCheck.position[0]);
      delete tmp.staff;
      // 精简staff字段
      uploadPositions.push(tmp);
    }
    updateLoadData['positions'] = uploadPositions;


    // position_title
    let uploadPositionTitle:Array<any> = [];
    for (let k in this._positionTitleInfo){
      let toCheck = this._positionTitleInfo[k];
      if (toCheck.tid != 0 && toCheck.tid.toString().substring(0, 1) == 't') {
        uploadPositionTitle.push({
          tid: toCheck.tid,
          title_name: toCheck.title_name
        });
      }
    }
    updateLoadData['position_title'] = uploadPositionTitle;
    // staff
    let uploadStaff = [];
    for (let k in this.staffList) {
      let toCheck = this.staffList[k];
      if (toCheck.suid == this.CEOEntity.suid) {
        continue;
      }
      uploadStaff.push({
        suid: toCheck.suid,
        //uuid: toCheck.uuid,
        status: toCheck.status
      });
    }
    updateLoadData['staff'] = uploadStaff;

    // department
    let uploadDepartment = [];
    for (let k in this.departmentListSet) {
      let toCheck = this.departmentListSet[k];
      uploadDepartment.push({
        cid: this.companyId,
        parent_id:  toCheck.parent_id,
        name: toCheck.name,
        did: toCheck.did
      });
    }
    updateLoadData['department'] = uploadDepartment;
    this.structureService.compareUploadStructure(
      {data: updateLoadData},
      (data: any) => {
        data.message = 'Structure upload failed';
        if (data.status == 1) {
          // //TODO 显示warning
          this.dialogService.openConfirm({
            simpleContent: 'Whether to confirm the submission data!'
          }, () => {
            let realUpload = {
              data : data.data,
              cid: this.companyId
            };
            this.structureService.uploadStructureInfoNew({data: realUpload}, (res: any) => {
              this.notificationService.postNotification({
                act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
                data: data
              });
              if (res.status == 1) {
                this.structureDataService.setUploadStructureFlag(0);
                this.dialogService.openSuccess({simpleContent: 'upload success!'});
              } else {
                this.dialogService.openError({simpleContent: 'upload failed!'});
              }
            })
          }, true);

        } else {
          this.dialogService.openError({
            simpleContent: 'Sorry, you can not save this change.'
          });
          //todo: display error msg;
        }
      }
    );
  }

  //离开组织架构
  quitStructure() {
    if (this.structureDataService.getUploadStructureFlag() === 1) {
      this.dialogService.openConfirm({
        simpleContent: 'You have data not upload, you cannot keep it if you drop out of the page !',
      }, () => {
        this.quit();
      });
    } else {
      this.quit();
    }
  }

  quit() {
    this.router.navigate(['user/index']);
  }


  drawStructureByFrom(data?: any) {
    this.structureEntirety.reDraw()
  }

  /**
   * 点击保存position
   * @param data
   */
  savePosition(data: any) {
    let editPosition = data[0];
    let oldSuid = data[1];
    let newSuid = data[2];
    let isNew = data[3];

    //position title
    if (editPosition.title_name != '') {
      //如果匹配, 使用已有tid
      let find = false;
      for (let k in this._positionTitleInfo) {
        if (this._positionTitleInfo[k].title_name == editPosition.title_name) {
          find = true;
          this._positionTitleInfo[k].tid = editPosition.tid;
        }
      }
      if (!find) {
        editPosition.tid = 't' + this.newPositionTitleId;
        this._positionTitleInfo.push({
          tid: 't' + this.newPositionTitleId,
          title_name: editPosition.title_name
        });
        console.log(' this._positionTitleInfo',  this._positionTitleInfo);
        this.newPositionTitleId++;
      }
    } else {
      editPosition.tid = '0';
    }
    console.log('保存position了', editPosition);
    if (isNew) {
      this.structureDataService.setUploadStructureFlag(1);
      // 1.新建
      this.allStructure.push(editPosition);
    } else {
      // 2.编辑
      // 1)替换现有职位人员 2)卸职 3)修改父级 4)修改title或者name
      this.structureDataService.setUploadStructureFlag(1);
      //console.log('替换');
      for (let k in this.allStructure) {
        if (this.allStructure[k].id == editPosition.id) {
          this.allStructure[k] = editPosition;
          break;
        }
      }
    }
    // TODO 修改部门人数？
    for (let k in this.staffList) {
      if (oldSuid && this.staffList[k].suid == oldSuid) {
        this.staffList[k].status = '2';
        this.staffList[k].did = DEPARTMENT_PENDING_ID;
        this.staffList[k].psid = '';
        //console.log('oldSuid in staffList', this.staffList[k]);
      }
      if (newSuid && newSuid !== '' && this.staffList[k].suid == newSuid) {
        this.staffList[k].status = '1';
        this.staffList[k].did = editPosition.did;
        this.staffList[k].psid = editPosition.id;
        //console.log('newSuid in staffList', this.staffList[k]);
      }
    }
    console.log(this.typeService.clone(this.allStructure));
    this.prepareTemplateData();
    delete this.editPositionInfo;

  }

  /**
   * 正在编辑的position
   * @param {Array<any>} data
   */
  dealPosition(data: Array<any>) {
    let did = data[0];
    let position = data[1];
    // 根据suid和did找到对应职位
    // console.log('根据suid和did找到对应职位', did, position);
    let obj;
    // pending, 新建职位
    if (did == DEPARTMENT_PENDING_ID) {
      //console.log('初始化对象信息');
      obj = this.initPositionStructureEntity(position);
    } else {
      for (let i in this.allStructure) {
        if (position.suid !== '' && this.allStructure[i].suid == position.suid) {
          obj = this.allStructure[i];
          //console.log('找到了该职位信息', this.typeService.clone(obj));
          break;
        }
      }
      if (!obj) {
        obj = this.initPositionStructureEntity(position);
        //console.log('无对应数据，新建职位对象', this.typeService.clone(obj))
      }
    }
    this.editPositionInfo = obj;
    this.openForm({type: 1, hide: false, data: data});
  }

  /**
   * 点击部门表单保存
   * @param data
   */
  outSaveDepartment(data: any){
    let action = data[0];
    let department = data[1];
    let leader = data[2];
    if (action == 'new') {
      let tmp = {};
      tmp[department.did] = department;
      this.departmentListSet = Object.assign({}, this.departmentListSet, tmp);
    } else if (action == 'edit') {
      let oldLeaderId = department.parent_id;
      let newLeaderId = leader.id;
      if (oldLeaderId != newLeaderId) {
        for (let k in this.allStructure) {
          if (this.allStructure[k].did == department.did && this.allStructure[k].parent_id == oldLeaderId) {
            this.allStructure[k].parent_id = newLeaderId;
          }
        }
      }
      department.parent_id = leader.id;
      this.departmentListSet[department.did] = department;
      //console.log('save 部门了', this.typeService.clone(this.departmentListSet));
    } else if (action == 'delete') {
      if ( this.departmentListSet.hasOwnProperty(department.did)) {
        delete this.departmentListSet[department.did];
      }
    }
    this.structureDataService.setUploadStructureFlag(1);
    delete this.editDepartmentInfo;
    this.prepareTemplateData();
  }

  /**
   * 点击编辑部门
   * @param did
   * @param new_parent_id
   */
  dealEditDepartment(did?: any, new_parent_id?: any) {
    //{leader: PositionStructureEntity, department: StructureDepartmentEntity, staff: Array<PositionStructureEntity>}
    let parent_id;
    delete this.editPositionInfo;
    if (did) {
      if (did != 0) {
        this.editDepartmentInfo = {};
        this.editDepartmentInfo['all'] = this.departmentListSet;

        for (let k in this.departmentListSet) {
          if (this.departmentListSet[k].did == did) {
            this.editDepartmentInfo['department'] = this.departmentListSet[k];
            parent_id =  this.departmentListSet[k].parent_id;
            break;
          }
        }
        if (parent_id) {
          let psArr = [];
          let topLevel = '99999';
          let currentLeader, otherLeader = [];
          //职员列表
          for (let k in this.allStructure) {
            if (this.allStructure[k].did == did) {
              psArr.push(this.allStructure[k]);
              if (parseInt(this.allStructure[k].p_level) < parseInt(topLevel)) {
                topLevel = this.allStructure[k].p_level;
              }
            }
          }
          this.editDepartmentInfo['staff'] = psArr;
          //找出所有可以替换为部门leader的职员
          //条件为在main域内，并且小于部门里的top level即可
          this.editDepartmentInfo['leader'] = [];
          for (let k in this.allStructure) {
            //console.log('topLevel', topLevel);
            //console.log('this.allStructure[k].did == DEPARTMENT_MAIN_ID', this.allStructure[k].did == DEPARTMENT_MAIN_ID);
            //console.log(' parseInt(this.allStructure[k].p_level) < parseInt(topLevel)',  parseInt(this.allStructure[k].p_level) < parseInt(topLevel));
            if (this.allStructure[k].id == parent_id) {
              currentLeader = this.allStructure[k];
            } else if (this.allStructure[k].is_ass != '1' && this.allStructure[k].did == DEPARTMENT_MAIN_ID &&
              parseInt(this.allStructure[k].p_level) < parseInt(topLevel)) {
              otherLeader.push(this.allStructure[k]);
            }
          }
          this.editDepartmentInfo['leader'] = [currentLeader].concat(otherLeader);

        }
      }
    } else {
      //console.log('新建部门');
      this.newDepartmentId++;
      this.editDepartmentInfo = {
        department: {
          did: 'd' + this.newDepartmentId,
          name: '',//部门名称
          cid: this.companyId,
          parent_id: new_parent_id, // 部门leader的psid
          num: 1 //成员数
        },
        staff: [],
        all: this.departmentListSet
      };
      // 新建部门
      for (let k in this.allStructure) {
        if (this.allStructure[k].id == new_parent_id) {
          this.editDepartmentInfo['leader'] = [this.allStructure[k]];
        }
      }
    }
    this.openForm({type: 2, hide: false});
    //this.editDepartmentInfo.staff = this.staffByDeptList[did];
    //console.log('this.editDepartmentInfo', this.editDepartmentInfo);
    if (did) {
      if (did != '0') {
        this.router.navigate(['/structure/' + this.companyId], {queryParams: {did: did}})
      } else {
        delete this.editDepartmentInfo;
        this.router.navigate(['/structure/' + this.companyId])
      }
    } else {
      // TODO 新建部门
    }
  }

  newPositionLevel(data?: any) {
    this.openForm({type: 3, hide: false, data: data});
    this.structureFormEditPositionLevel.openPositionLevelForm(data);
  }

  openForm(data?: any) {
    if (data.type === 1) {
      if (this.structureFormEditPosition) {
        this.structureFormEditPosition.formHide = data.hide;
        if (data.hide) {
          delete this.editPositionInfo;
        }
      }
      if (this.structureFormEditDepartment) {
        this.structureFormEditDepartment.formHide = true;
      }
      if (this.structureFormEditPositionLevel) {
        this.structureFormEditPositionLevel.formHide = true;
      }
    } else if (data.type === 2) {
      if (this.structureFormEditPosition) {
        this.structureFormEditPosition.formHide = true;
      }
      if (this.structureFormEditDepartment) {
        this.structureFormEditDepartment.formHide = data.hide;
      }
      if (this.structureFormEditPositionLevel) {
        this.structureFormEditPositionLevel.formHide = true;
      }
    } else if (data.type === 3) {
      if (this.structureFormEditPosition) {
        this.structureFormEditPosition.formHide = true;
      }
      if (this.structureFormEditDepartment) {
        this.structureFormEditDepartment.formHide = true;
      }
      if (this.structureFormEditPositionLevel) {
        this.structureFormEditPositionLevel.formHide = data.hide;
      }
    }
  }

  editStructure(data: any) {
    //console.log('从画图传来的数据', data);
    if (data.type === 'position' || data.type === 'subordinate' || data.type === 'assistance') {
      delete data.data.editType;
      let editStructure;
      if (data.type === 'subordinate') {
        if (data.data.is_ass === '1') {
          this.dialogService.openWarning({
            simpleContent: 'A new subordinates can\'t be added to an assistant position !'
          });
          return;
        } else {
          // 在部门建立下属所属部门, 助理则永远和上司一个部门
          data.data.did = this.departmentId;
        }
        editStructure = this.setSubordinate(data.data);
      } else if (data.type === 'assistance') {
        if (data.data.is_ass === '1') {
          this.dialogService.openWarning({
            simpleContent: 'The assistant position does not add new subordinates !'
          });
          return;
        }
        editStructure = this.setAssistance(data.data);
      } else {
        editStructure = data.data;
      }
      this.dealPosition([this.departmentId, editStructure]);
    } else if (data.type === 'department') {
      if (data.data.is_ass === '1') {
        this.dialogService.openWarning({
          simpleContent: 'An assistant position does not add to the new department'
        });
        return;
      }
      //console.log('editDepartment ', data);
      this.dealEditDepartment(null, data.data.id);
    } else if (data.type === 'remove') {
      this.removePosition(data.data);
    }
  }

  setSubordinate(data: any): any {
    this.newStructureId++;
    let editStructure: any = this.typeService.clone(this.editStructureInfo);
    editStructure.parent_id = data.id;
    editStructure.p_level = data.p_level;
    editStructure.id = 'ps' + this.newStructureId; // 临时id 提交给后端生成数据用
    editStructure.editType = 'sub';
    editStructure.did = data.did;
    editStructure.cid = data.cid;
    editStructure.company_id = data.company_id;
    return editStructure;
  }

  setAssistance(data: any): any {
    this.newStructureId++;
    let editStructure: any = this.typeService.clone(this.editStructureInfo);
    editStructure.pid = data.pid;
    editStructure.p_name = data.p_name;
    editStructure.p_level = data.p_level;
    editStructure.is_ass = '1';
    editStructure.parent_id = data.id;
    editStructure.id = 'ps' + this.newStructureId;
    editStructure.editType = 'ass';
    editStructure.did = data.did;
    editStructure.cid = data.cid;
    editStructure.company_id = data.company_id;
    return editStructure;
  }

  /**
   *
   * @param data
   */
  removePosition(data: any) {

    // 有助理时候不可以删除
    // TODO: 下个版本中将要求能够自动顺延等级，自动转交部门+助理+下属给上司
    if (data.nodes && data.nodes.length > 0) {
      for (let k in data.nodes) {
        if (data.nodes[k].is_ass == '1') {
          this.dialogService.openWarning({
            simpleContent: 'You could not remove a position who own assistant'
          });
          return;
        }
      }
    }
    // CEO不可以删除
    if (data.id == this.CEOEntity.id) {
      this.dialogService.openWarning({
        simpleContent: 'You could not remove CEO'
      });
      return;
    }
    this.dialogService.openConfirm({
      simpleContent: 'Do you agree to delete this position? that cannot be undone again!',
    }, () => {
      // 如果正常删除
      let toPending;
      for (let key in this.allStructure) {
        if (data.id === this.allStructure[key].id) {
          toPending = this.allStructure[key];
          this.allStructure.splice(parseInt(key), 1);
          break;
        }
      }
      // 所有直接父级是被删除id的, 转移给被删除的父级(祖父级)
      // console.log('被删掉的staff是', toPending);
      for (let k in this.allStructure) {
        if (this.allStructure[k].parent_id == toPending.id) {
          this.allStructure[k].parent_id = toPending.parent_id;
        }
      }
      // 包括部门
      for (let k in this.departmentListSet) {
        if (this.departmentListSet[k].parent_id == toPending.id) {
          this.departmentListSet[k].parent_id = toPending.parent_id;
        }
      }
      if (toPending.suid != '') {
        for (let k in this.staffList) {
          if (this.staffList[k].suid == toPending.suid) {
            this.staffList[k].psid = '';
            this.staffList[k].status = '2';
            this.staffList[k].did = '-1'
          }
        }
      }
      this.prepareTemplateData();
    });
  }

  /**
   * 刷新contact-lst
   */
  getContactList(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {
          this.userDataService.reloadContactList(response.data.staff);
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  /**
   * 新建level
   * @param event
   */
  newLevel(event: any) {
    this.makeLevel = {}
  }

  dealOutAddId(data: number) {
    this.newStructureId = data;
  }

  /**
   * 打开组织架构帮助信息
   */
  showStructureHelp() {
    // 初始化表单
    this.editPositionInfo = this.CEOEntity;
    // 给画图区设置margin-left
    this.marginLeft = '450px';
    //CEO block
    let CEOEleId = 'rec-ps-' + this.CEOEntity.id;
    let ceoEle = document.getElementById('#' + CEOEleId);
    if (ceoEle) {
      this.renderer.setElementStyle(ceoEle, 'display', 'block');
    }

    setTimeout(() => {
      let intro = introInit.introJs();
      if (this.translate.lan == 'zh-cn') {
        intro.setOptions({
          prevLabel: '<em class="icon1-help-arrow"></em><i class="base">上一步</i>',
          nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">下一步</i>',
          exitOnEsc: true,
          hidePrev: false,
          hideNext: true,
          exitOnOverlayClick: true,
          showProgress: true,
          showBullets: true,
          showStepNumbers: false,
          disableInteraction: true,
          tooltipClass: 'help-wrap help-no-padding show-btn',
          steps: [
            {
              element: '#step_str_1',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">这里表示当前的构架通道</div>'
            },
            {
              element: '#' + CEOEleId,
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">点击此+按钮可以编辑职位，增加新助理或增加下属等</div>'
            },
            {
              element: '#step_str_3',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">编辑职位的信息和相关上下级</div>'
            },
            {
              element: '#step_str_4',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">在此编辑和查看组织构架的职位等级</div>'
            },
            {
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">仍然困惑？你可以回放这个教程或联系xxxxxxxxxxxxx更多的帮助！</div>'
            },
          ]
        });
      } else {
        intro.setOptions({
          prevLabel: '<em class="icon1-help-arrow"></em><i class="base">Previous</i>',
          nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">Next</i>',
          exitOnEsc: true,
          hidePrev: false,
          hideNext: true,
          exitOnOverlayClick: true,
          showProgress: true,
          showBullets: true,
          showStepNumbers: false,
          disableInteraction: true,
          tooltipClass: 'help-wrap help-no-padding show-btn',
          steps: [
            {
              element: '#step_str_1',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Organization chart</div>'
            },
            {
              element: '#' + CEOEleId,
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Click + to edit position,add new assistants or subordinates, etc.</div>'
            },
            {
              element: '#step_str_3',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Edit position`s info and upper and lower levels.</div>'
            },
            {
              element: '#step_str_4',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Edit position`s level and review structure.</div>'
            },
            {
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Still confused? You can replay this tutorial or contact xxxxxxxxxxxxx for more help!</div>'
            },
          ]
        });
      }
      intro.start();
      intro.onchange((targetElement) => {
        let checkId = targetElement.getAttribute('id');
        //console.log('checkID', checkId, CEOEleId);
        if (checkId === null) {
          this.marginLeft = '0';
        } else {
          this.marginLeft = '450px';
        }
        //this.marginLeft = '0';
        this.structureFormEditPosition.formHide = (checkId != 'step_str_3' && checkId != CEOEleId);
        this.structureFormEditPositionLevel.formHide = checkId != 'step_str_4';
       // console.log('this.marginLeft', this.marginLeft);
      });
      intro.onafterchange((targetElement) => {
        if (!targetElement.getAttribute('data-step')) {
          intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
        } else {
          intro.setOption('tooltipClass', 'help-wrap help-no-padding')
        }
      });
      intro.onexit(() => {
        if (ceoEle) {
          this.renderer.setElementStyle(ceoEle, 'display', 'none');
        }
        delete this.editPositionInfo;
        this.marginLeft = '0';
        this.renderer.setElementClass(document.getElementsByTagName('body')[0], 'body-help', false);
      })
    }, 1000);
  }
}
