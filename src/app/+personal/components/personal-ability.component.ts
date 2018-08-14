import {Component, OnInit, Inject, ViewEncapsulation, Renderer} from '@angular/core';
import {PersonalModelService, SkillInfo} from '../../shared/services/index.service';
const SKILL_LEVEL: Array<string> = ['Elementary level', 'Limited working level', 'Professional level', 'Native level'];
const SKILL_LEVEL_ZH: Array<string> = ['基础等级', '限于工作', '专业等级', '国家级别'];

@Component({
  selector: 'personal-ability',
  styleUrls: ['../../../assets/css/account/account.css'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: '../template/personal-ability.component.html'
})

export class PersonalAbilityComponent implements OnInit {
  public workName: string;
  public userLoginData: any;
  public personalData: any;
  public skillLevel: Array<string> = [];
  public showAddSkill: boolean = true;
  private defaultSkillLevelNum: number = 1;
  public defaultSkillLevel: string = ''; //SKILL_LEVEL[0]
  public defaultSkillName: string = '';
  private defaultSkillNum: number = 1;
  public skillList: Array<any> = [];
  private skillInfo: SkillInfo;
  public getSkillList: Array<any>;
  private cloneSkill: any;
  public currentSkillObj: any;
  public isZhLan: boolean;
  public abilityData: any;
  private newArr: Array<any>;
  public btnFail: any;

  constructor(private renderer: Renderer,
              public personalModelService: PersonalModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any) {
  }

  ngOnInit() {
    if (this.translate.lan == 'zh-cn') {
      this.skillLevel = SKILL_LEVEL_ZH;
      this.isZhLan = true;
    } else {
      this.skillLevel = SKILL_LEVEL;
      this.isZhLan = false;
    }
    this.skillInfo = SkillInfo.init();
    this.userLoginData = this.userDataService.getUserIn();

    //技能请求(json文件列表)
    this.doSkillList();
    //this.json();
  }

  /**
   * 请求技能列表
   */
  doSkillList() {
    this.personalModelService.queryJson(
      'GET',
      this.config.staticResourceDomain + 'assets/json/skill.json',
      '',
      (data: any) => {
        this.skillList = data;
        this.newArr= this.getNewArray(this.skillList);
               this.abilityData = {
               data: this.newArr,
               type: 'ability',
               defaultValue: this.defaultSkillName,
               };
        //初始化数据
        this.getAbilityInfo();
      }
    );
  }

  /**
   * 返回数组['value','value]格式
   * @param data
   * @returns {Array}
   */
  getNewArray(data:Array<any>):Array<any>{

      let newIndustry = [];
    if(data) {
      for (let i = 0; i < data.length; i++) {
        let item = this.typeService.clone(data[i]);
        item = this.isZhLan ? item['name'] : item['name_en'];
        newIndustry.push(item);
      }
    }
      return newIndustry;

  }

  /**
   * 选择技能等级
   * @param name
   * @param i
   * @param element
   */
  selectSkillLevelName(name: string, i: number, element: any) {
    this.defaultSkillLevel = name;
    this.defaultSkillLevelNum = i + 1;
    this.renderer.setElementClass(element, 'hide', true);
  }

  /**
   * 显示增加技能选项
   * @param event
   */
  doAddSkill(event: any) {
    event.stopPropagation();
    this.showAddSkill = false;
    if (this.currentSkillObj) {
      this.currentSkillObj.isShow = true;
      this.currentSkillObj = {};
    }
    this.defaultSkillLevel = '';
    this.defaultSkillName = '';
  }

  /**
   * 隐藏技能选项
   */
  cancelSkill() {
    this.showAddSkill = true;
    this.defaultSkillName = '';
    this.defaultSkillLevel = '';
  }

  /**
   * 编辑当前技能
   * @param skill
   */
  doSkillEdit(skill: any) {
    this.defaultSkillName = '';
    this.defaultSkillLevel = '';
    if (this.currentSkillObj) {
      this.currentSkillObj.isShow = true;
    }
    this.cloneSkill = this.typeService.clone(skill);
    this.currentSkillObj = skill;
    skill.isShow = false;
    this.showAddSkill = true;
  }

  /**
   * 修改技能等级
   * @param list
   * @param id
   * @param element
   */
  updateLevel(list: any, id: number, element: any) {
    list.level = id + 1;
    this.renderer.setElementClass(element, 'hide', true);
  }

  /**
   * 取消修改
   * @param list
   */
  cancelUpdateSkill(list: any) {
    list.level = this.cloneSkill.level;
    list.skill_name = this.cloneSkill.skill_name;
    list.isShow = true;
    this.currentSkillObj = {};
  }

  /**
   * 保存技能选择
   * @param list
   */
  acceptUpdateSkill(list: any) {
    let i: number = 0;
    for (let key in this.getSkillList) {
      if (this.getSkillList[key].skill_name === list.skill_name) {
        i++;
        if (i >= 2) {
          this.dialogService.openWarning({simpleContent: 'Skill already exists!'});
          return false;
        }
      }
    }
    list.isShow = true;
  }

  /**
   * 删除当前技能
   * @param list
   * @param i
   */
  doSkillDelete(list: any, i: number) {
    if (list.isDel && list.isDel === 1) {
      this.getSkillList.splice(i, 1);
    } else {
      list.operation = -1;
    }
  }

  /**
   * 选中选择的技能
   */
  acceptSkill(): boolean {
    if(this.defaultSkillName == '' || this.defaultSkillLevel == '') return false;
    for (let list in this.getSkillList) {
      if (this.getSkillList[list].skill_name == this.defaultSkillNum) {
        this.dialogService.openWarning({simpleContent: 'Skill already exists!'});
        return false;
      }
    }
    this.showAddSkill = true;
    this.getSkillList.push(this.typeService.clone(this.skillInfo));
    this.getSkillList[this.getSkillList.length - 1].level = this.defaultSkillLevelNum;
    this.getSkillList[this.getSkillList.length - 1].skill_name = this.defaultSkillNum;
    this.getSkillList[this.getSkillList.length - 1].isShow = true;
    this.getSkillList[this.getSkillList.length - 1].isDel = 1;

    this.defaultSkillName = '';
    this.defaultSkillLevel = '';
    this.abilityData = {
      data: this.newArr,
      type: 'ability',
      defaultValue: this.defaultSkillName
    };
  }

  /**
   * 请求初始化数据
   */
  getAbilityInfo() {
    this.personalModelService.getUserInfo(
      {personal_module: 'user_analysis'},
      (data: any) => {
        if (data.status === 1) {
          this.getSkillList = this.typeService.bindDataList(this.skillInfo, data.data.skills);
          for (let key in this.getSkillList) {
            this.getSkillList[key].isShow = true;
          }
        } else if (data.status === 0) {
          this.dialogService.openError({simpleContent: 'fetch user ability failed!'});
        }
      })
  }


  /**
   * 数据保存
   */
  doUploadInfo(element: any): boolean {
    for (let key in this.getSkillList) {
      if (!this.getSkillList[key].isShow) {
        this.dialogService.openWarning({simpleContent: 'Skill already exists!'});
        this.renderer.setElementClass(element, this.config.btnProgress, false);
        return false;
      }
    }
    this.personalModelService.saveSkill({data: this.getSkillList}, (data: any) => {
      if (data.status === 1) {
        //成功，按钮添加对号，1秒后消失
        this.renderer.setElementClass(element, 'but-success', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-success', false);
        },this.config.btnSuccessTime);
      } else {
        this.dialogService.openError({simpleContent: 'upload info failed!'});

        //失败，按钮添加叉号，错误提示，3秒后消失，
        this.renderer.setElementClass(element, 'but-fail', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-fail', false);
        },this.config.btnFailTime);
        this.btnFail = this.translate.manualTranslate('upload info failed!');
      }
      this.renderer.setElementClass(element, this.config.btnProgress, false);
    })
  }

  /**
   * 接收当前选择值
   * @param data
   */
  getCurrentValue(data: any) {
    if(data.type === 'update'){
      this.getSkillList[data.id].skill_name = this.skillList[data.index].id;
    }
    if(data.type === 'ability') {
      this.defaultSkillName = this.isZhLan ? this.skillList[data.index].name : this.skillList[data.index].name_en;
      this.defaultSkillNum = this.skillList[data.index].id;
    }
  }
}
