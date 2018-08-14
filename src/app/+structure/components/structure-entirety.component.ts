import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { DrawService } from "../../shared/services/index.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import {
  PositionStructureEntity,
  StructureDepartmentEntity
} from "../../shared/services/model/entity/structure-entity";

@Component({
  selector: 'structure-entirety',
  templateUrl: '../template/structure-entirety.component.html',
  styleUrls: ['../../../assets/css/structure/company-structure.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DrawService]
})

export class StructureEntiretyComponent implements OnInit, AfterViewInit {


  public structureType = 'Company';
  public companyId: string;
  public departmentId: string;

  @Input()
  set setCompanyId(param: any) {
    this.companyId = param;
  }

  @Input()
  set setDepartmentId(param: any) {
    this.departmentId = param;
  }

  @Input()
  set setStructureInfo(param: { s: Array<PositionStructureEntity>, d: { [key: string]: StructureDepartmentEntity } }) {
    let data = [];
    let s = this.typeService.clone(param.s); // s 所有position structure信息
    let d = this.typeService.clone(param.d); // d 所有部门信息
    //console.log('初始化画图信息', s, d);
    // 先筛选出同一个部门的数据
    let parent_psid ;
    let isMain = this.departmentId == '0' || typeof this.departmentId == 'undefined';
    //console.log('isMain', isMain, this.departmentId);
    if (!isMain) {
      for (let k in d) {
        if (d[k].did == this.departmentId) {
          //部门领导psid
          parent_psid = d[k].parent_id;
          break;
        }
      }
      // 将领导放入绘制数组, 因为领导did不等于部门id
      for (let i in s) {
        if (s[i].id == parent_psid) {
          this.topParent = s[i];
          data.push(s[i]);
          break;
        }
      }
    } else {
      parent_psid = '0';
      // 寻找CEO
      for (let i in s) {
        if (s[i].parent_id == parent_psid) {
          this.topParent = s[i]; //CEO
          break;
        }
      }
    }

    // 筛选所有部门内数据
    for (let i in s) {
      if (s[i].did == this.departmentId) {
        data.push(s[i]);
      }
    }
    //console.log('当前部门的数据是', '领导', this.topParent, '部门id', this.departmentId, this.typeService.clone(data));
    // 将部门作为main画图的一部分初始化数据
    if (isMain) {
      for (let k in d) {
        let dObj = d[k];
        // 循环根据 parent_id找出对应等级
        check:
          for (let i in data) {
            if (data[i].id !== '' && data[i].id == dObj.parent_id) {
              let dInfo = d[k];
              //console.log('s[i].p_level', data[i].p_level);
              dInfo['p_level'] = (parseInt(data[i].p_level) + 1).toString();
              dInfo['s_type'] = 'd';
              // console.log('dInfo', dInfo);
              data.push(dInfo);
              break check;
            }
          }
      }
    }
    //data = data.concat(param.s);
    console.log('画图数组....', data);
    if (this.topParent) {
      this.allObj = data;
      this.initD3Configuration();
      this.setSvg();
      this.drawing();
    }

  }

  //当前公司信息
  public marginLeft: string = '0';
  @Input()
  set setMarginLeft(data: string){
    this.marginLeft = data;
  }
  //深度组
  public depthGroup: Array<any> = [];
  //块
  public node: Array<any> = [];

  public departmentHeaderInfo: Array<any> = [];
  public moveDiff: number;

  public d3: any;

  @ViewChild('moveElement') public moveElement: any;
  @ViewChild('moveLeftBut') public moveLeftBut: any;
  @ViewChild('moveRightBut') public moveRightBut: any;
  @ViewChild('drawingH') public drawingH: any;

  public allObj: any = {};

  //静态常量
  public publicCon2: any = {
    departmentId: '',
    draw: {},          //画图对象
    winW: 0,           //浏览器宽度
    winH: 0,           //浏览器高度
    u: {
      width: 202,               //人的宽度
      userLineW: 60,           //人线宽度
      height: 34              //人的高度
    },
    d: {
      width: 202,            //部门宽度
      height: 65,            //部门高度
      comW: 50
    },
    p: {
      width: 202,               //人的宽度
      userLineW: 60,           //人线宽度
      height: 34
    },
    ass: {
      assT: 26,               //助理线距离顶部度
      assL: 40                //助理左边距离
    },
    local: {
      betweenY: 22,          //同级之间的最少距离
      perX: 302,             //上下级之间的距离
      //perX: 220,             //上下级之间的距离
      cPosX: 0,                //当前对象 x坐标
      cPosY: 150,                //当前对象 y坐标
      otherX: 100,            //其他公司对象的x坐标
      otherY: 20,               //其他对象公司的Y坐标
      leftButtonY: 0           //每个块元素的左下角坐标
    }
  };

  //最大等级 | 最大深度
  public maxLv: number = 0;
  public minLv: number = 1000;

  //等级下Y轴线的高度
  public lvLineHigh: any = [];
  //最终完成的平铺数据
  public structure: any = [];
  public topParent: any;

  @Output() outEditStructure = new EventEmitter<any>();
  @Output() outEditDepartment = new EventEmitter<any>();


  constructor(public router: Router,
              public renderer: Renderer,
              public location: Location,
              public activatedRoute: ActivatedRoute,
              public draw: DrawService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('company-data.service') public companyService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('structure-data.service') public structureDataService: any,
              @Inject('d3.service') public D3Service: any) {
  }

  /**
   *初始化D3
   */
  initD3Configuration() {
    this.d3 = this.D3Service.getInstance();
  }

  ngOnInit() {

  }


  ngAfterViewInit() {
    if (this.typeService.getObjLength(this.allObj)) {
      //this.drawing();
    }
  }


  /**
   * 画图函数
   */
  drawing() {
    //清空画布
    this.publicCon2.departmentId = this.departmentId;
    this.publicCon2.draw.selectAll('*').remove();
    this.publicCon2.winH = parseInt(this.moveElement.nativeElement.offsetHeight);
    this.publicCon2.winW = parseInt(this.moveElement.nativeElement.offsetWidth);

    this.structure = [];
    this.depthGroup = [];
    this.node = [];
    this.maxLv = 0;
    this.minLv = 1000;
    //console.log('drawing开始', this.typeService.clone(this.allObj));
    for (let key in this.allObj) {
      let obj = this.allObj[key];
      obj.x = this.publicCon2.local.perX * (parseInt(obj.p_level) - 1);
      obj.y = this.publicCon2.local.cPosY;
      obj.nodes = [];
      obj.ass = [];
      obj.depth = 0;
      obj.width = parseInt(this.publicCon2[obj.s_type].height);
      this.structure[key] = obj;
      // minLv 深度
      if (this.minLv > parseInt(obj.p_level)) {
        this.minLv = parseInt(obj.p_level);
      }
    }

    // let parent_id = '0';
    // for (let key in this.structure) {
    //   if (this.typeService.isSetKey('is_top', this.structure[key])) {
    //     parent_id = this.structure[key].parent_id;
    //   }
    // }
    this.setDepthAndNodes(this.topParent.parent_id);
    this.setNodesDepth(this.node);
    this.setStructure();
    this.setAllBlock();
    this.drawStructure();
  }

  // //重新绘制
  reDraw() {
    this.publicCon2.draw.selectAll('*').remove();
    this.drawing();
  }


  setDepthAndNodes(parent_id?: string) {
    if (!parent_id) {
      parent_id = '0';
    }
    for (let key in this.structure) {
      let structure: any = this.structure[key];
      if (structure.parent_id == parent_id) {
        if (parent_id == this.topParent.parent_id) {
          structure.depth = 1;
          structure.x = this.publicCon2.local.perX * (parseInt(structure.depth) - 1);
          this.node = this.structure[key];
        } else {
          if (this.structure[key].is_ass == '1') {
            for (let k in this.structure) {
              if (parent_id === this.structure[k].id) {
                structure.depth = this.structure[k].depth;
                structure.x = this.publicCon2.local.perX * (parseInt(structure.p_level) - this.minLv);
                this.structure[k].ass.push(this.structure[key]);
              }
            }
          } else {
            for (let k in this.structure) {
              if (parent_id === this.structure[k].id) {
                structure.depth = this.structure[k].depth + 1;
                //structure.depth = (parseInt(structure.p_level) - (parseInt(this.structure[k].p_level) - this.structure[k].depth));
                structure.x = this.publicCon2.local.perX * (parseInt(structure.p_level) - this.minLv);
                this.structure[k].nodes.push(this.structure[key]);
              }
            }
          }
        }
        if (this.maxLv < structure.depth) {
          this.maxLv = structure.depth;
        }
        if (structure.s_type === 'u' || structure.s_type === 'p') {
          this.setDepthAndNodes(structure.id);
        }
      }
    }
  }

  keysrt(key: any) {
    return (object1: any, object2: any) => {
      let value1 = parseInt(object1[key]);
      let value2 = parseInt(object2[key]);
      if (value2 < value1) {
        return 1;
      }
      else if (value2 > value1) {
        return -1;
      }
      else {
        return 0;
      }
    }
  }

  /**
   *
   */
  setStructure() {
    this.structure = [];
    for (let key in this.depthGroup) {
      let data = this.depthGroup[key].nodes;
      for (let k in data) {
        this.structure.push(data[k]);
        if (data[k].ass && data[k].ass.length > 0) {
          for (let kk in data[k].ass) {
            this.structure.push(data[k].ass[kk]);
          }
        }
      }
    }
  }

  setNodesDepth(data: any) {
    if (typeof this.depthGroup[data.depth] !== 'object') {
      this.depthGroup[data.depth] = [];
      this.depthGroup[data.depth].nodes = [];
      this.depthGroup[data.depth].nodeGroups = [];
    }
    this.depthGroup[data.depth].nodes[this.depthGroup[data.depth].nodes.length] = data;
    if (data.depth === 1) {
      this.depthGroup[data.depth].nodeGroups[0] = [];
      this.depthGroup[data.depth].nodeGroups[0][0] = data;
      data.nodeGroupId = 0;
      data.nodeOrderId = 0;
    } else {
      if (this.depthGroup[data.depth].nodeGroups.length === 0) {
        this.depthGroup[data.depth].nodeGroups[0] = [];
        this.depthGroup[data.depth].nodeGroups[0][0] = data;
        data.nodeGroupId = 0;
        data.nodeOrderId = 0;
      } else {
        let groupsLength: number = this.depthGroup[data.depth].nodeGroups.length;
        let groupNodesLength = this.depthGroup[data.depth].nodeGroups[groupsLength - 1].length;
        if (data.parent_id == this.depthGroup[data.depth].nodeGroups[groupsLength - 1][groupNodesLength - 1].parent_id) {
          this.depthGroup[data.depth].nodeGroups[groupsLength - 1][groupNodesLength] = data;
          data.nodeGroupId = groupsLength - 1;
          data.nodeOrderId = groupNodesLength;
        } else {
          if (typeof this.depthGroup[data.depth].nodeGroups[groupsLength] !== 'object') {
            this.depthGroup[data.depth].nodeGroups[groupsLength] = [];
          }
          groupNodesLength = this.depthGroup[data.depth].nodeGroups[groupsLength].length;
          this.depthGroup[data.depth].nodeGroups[groupsLength][groupNodesLength] = data;
          data.nodeGroupId = groupsLength;
          data.nodeOrderId = groupNodesLength;
        }
      }
    }
    if (data.nodes && data.nodes.length != 0) {
      for (let n = 0; n < data.nodes.length; n++) {
        this.setNodesDepth(data.nodes[n]);
      }
    }
  }


  setAssBlock(data: any) {
    let height: number = 0;
    for (let i = 0; i < data.ass.length; i++) {
      if (i === 0) {
        data.ass[i].y = data.y + this.publicCon2.local.betweenY + this.publicCon2[data.s_type].height;
      } else {
        data.ass[i].y = data.ass[i - 1].y + data.ass[i - 1].width + this.publicCon2.local.betweenY;
      }
      if (data.ass[i].y > height) {
        height = data.ass[i].y;
      }
      data.ass[i].x = data.x + this.publicCon2.ass.assL;
    }
    if (data.width < height - data.y + this.publicCon2[data.s_type].height) {
      data.width = height - data.y + this.publicCon2[data.s_type].height;
    }
    return data;
  }

  /**
   * 反推逻辑，计算高度
   * @param data
   * @param lv
   * @return {any}
   */
  setNodeBlock(data: any, lv: number) {
    let height: number = 0;
    for (let i = 0; i < data.nodes.length; i++) {
      if (data.nodes[i].y > height) {
        height = data.nodes[i].y;
      }
    }
    if (data.width < (height - data.y + this.publicCon2[data.s_type].height * (data.nodes.length - 1)) && this.depthGroup[lv].nodes.length > 1) {
      data.width = height - data.y + this.publicCon2[data.s_type].height;
    }
    return data;
  }


  setAllBlock() {
    for (let i = this.maxLv; i >= 1; i--) {
      let depthNodes = this.depthGroup[i].nodes;
      depthNodes.sort(this.keysrt('p_level'));
      if (i === this.maxLv) {
        for (let m = 0; m < depthNodes.length; m++) {
          if (m == 0) {
            depthNodes[m].y = 150;
          }
          else {
            depthNodes[m].y = depthNodes[m - 1].y + depthNodes[m - 1].width + this.publicCon2.local.betweenY;
          }
          if (depthNodes[m].ass.length > 0) {
            depthNodes[m] = this.setAssBlock(depthNodes[m]);
          }
          if (depthNodes[m].nodes.length > 1) {
            depthNodes[m] = this.setNodeBlock(depthNodes[m], i);
          }

        }
      } else {
        for (let m = 0; m < depthNodes.length; m++) {
          if (depthNodes[m].nodes.length !== 0) {
            depthNodes[m].nodes.sort(this.keysrt('y'));
            let tempNodeLeft: number = depthNodes[m].nodes[0].y + this.getGroupWidthByNode(depthNodes[m].nodes[0]) / 2;
            tempNodeLeft -= (depthNodes[m].width / 2);
            if (depthNodes[m].nodes.length === 1) {
              depthNodes[m].y = depthNodes[m].nodes[0].y;
              depthNodes[m].width = depthNodes[m].nodes[0].width;
            } else {
              depthNodes[m].y = tempNodeLeft;
            }
          }
        }
        for (let m = 0; m < depthNodes.length; m++) {
          if (!depthNodes[m].hasOwnProperty('y')) {
            this.setLeftByDepthNode(depthNodes, m, "LTR");
          }
          if (depthNodes[m].ass.length > 0) {
            depthNodes[m] = this.setAssBlock(depthNodes[m]);
          }
          if (depthNodes[m].nodes.length > 1) {
            depthNodes[m] = this.setNodeBlock(depthNodes[m], i);
          }
        }
        for (let m = 1; m < depthNodes.length; m++) {
          let ErrDistance = this.publicCon2.local.betweenY - (depthNodes[m].y - depthNodes[m - 1].y - depthNodes[m - 1].width);
          if (ErrDistance > 0) {
            for (let u = m; u < depthNodes.length; u++) {
              this.amendNodeLeft(depthNodes[u], ErrDistance);
            }
          }
          if (depthNodes[m].ass.length > 0) {
            depthNodes[m] = this.setAssBlock(depthNodes[m]);
          }
          if (depthNodes[m].nodes.length > 1) {
            depthNodes[m] = this.setNodeBlock(depthNodes[m], i);
          }
        }
      }
    }
    this.setDepthGroupWidth();
  }

  amendNodeLeft(node: any, errDistance: number) {
    node.y = node.y + errDistance;
    if (node.ass.length != 0) {
      for (let n = 0; n < node.ass.length; n++) {
        node.ass[n].y = node.ass[n].y + errDistance;
      }
    }
    if (node.nodes.length !== 0) {
      for (let n = 0; n < node.nodes.length; n++) {
        this.amendNodeLeft(node.nodes[n], errDistance);
      }
    }
  }

  setLeftByDepthNode(data: any, nodeId: number, type: string) {
    if (type === "LTR" && nodeId === data.length - 1) {
      this.setLeftByDepthNode(data, nodeId, "RTL");
      return;
    }
    if (type === "RTL" && nodeId === 0) {
      this.setLeftByDepthNode(data, nodeId, "LTR");
      return;
    }
    let findIndex: number = 0;
    if (type === 'LTR') {
      for (let i = nodeId + 1; i < data.length; i++) {
        if (data[i].y !== 0) {
          findIndex = i;
          break;
        }
      }
      if (findIndex === 0) {
        this.setLeftByDepthNode(data, nodeId, 'RTL');
        return;
      } else {
        for (let n = findIndex - 1; n >= nodeId; n--) {
          data[n].y = data[n + 1].y - this.publicCon2.local.betweenY - this.publicCon2[data[n].s_type].height;
        }
      }
    }
    if (type === 'RTL') {
      for (let i = nodeId - 1; i >= 0; i--) {
        if (data[i].y !== 0) {
          findIndex = i;
          break;
        }
      }
      if (findIndex === 0) {
        this.setLeftByDepthNode(data, nodeId, 'LTR');
        return;
      } else {
        for (let n = findIndex + 1; n <= nodeId; n--) {
          data[n].y = data[n - 1].y + this.publicCon2.local.betweenY + this.publicCon2[data[n - 1].s_type].height;
        }
      }
    }
  }

  getGroupWidthByNode(data: any) {

    let tempNodesGroup = this.depthGroup[data.depth].nodeGroups[data.nodeGroupId];
    tempNodesGroup.sort(this.keysrt('y'));
    let tempGroupWith = (tempNodesGroup[tempNodesGroup.length - 1].y - tempNodesGroup[0].y);
    tempGroupWith += tempNodesGroup[tempNodesGroup.length - 1].width;
    return tempGroupWith;
  }

  setDepthGroupWidth() {
    for (let n = 1; n <= this.maxLv; n++) {
      let tempNodeGroups = this.depthGroup[n].nodeGroups;
      for (let m_ = 0; m_ < tempNodeGroups.length; m_++) {
        tempNodeGroups[m_].width = this.getGroupWidthByNode(tempNodeGroups[m_][0]);
      }
    }
  }


  drawStructure() {
    let high: Array<any> = [];
    let linH: Array<any> = [];
    let down: Array<any> = [];
    let lvLine: any = {
      min: 0,
      max: 0
    };
    let highestType: string;
    let highestPos: number = 0;

    for (let key in this.structure) {
      let downY = this.structure[key].y + this.publicCon2[this.structure[key].s_type].height;

      if (this.structure[key].s_type == 'c' || this.structure[key].s_type == 'd') {
        this.structure[key].y = this.structure[key].y - 14;
        downY = downY - 14;
      }
      this.structure[key].downY = downY;
    }


    //将做表等常量设置到draw service中
    this.draw.setPublicCon(this.publicCon2);
    //将structure常量设置到draw service中
    this.draw.setStructure(this.structure);

    this.draw.drawTopG();

    this.lvLineHigh = [];
    for (let key in this.structure) {
      for (let k in this.structure) {
        //将同一个父级元素下的所有子元素的上y坐标和下y坐标赋值到一个变量中
        if (this.structure[k].parent_id === this.structure[key].id && this.structure[k].is_ass !== '1') {
          //将每个元素的上Y坐标赋给high
          high.push(this.structure[k].y);
          //将每个元素的中间坐标赋给linH
          linH.push(this.structure[k].y + this.publicCon2[this.structure[k].s_type].height / 2);
          //将每个元素的下Y坐标赋给down
          down.push(this.structure[k].downY);
        }
      }
      let maxY: number = 0;
      let minY: number = 0;
      //若存在有下级的情况
      if (high.length > 0) {
        //获取最大下Y坐标
        maxY = Math.max.apply(0, down);
        //获取最小上Y坐标
        minY = Math.min.apply(0, high);
        //获取最大元素中间坐标
        lvLine.max = Math.max.apply(0, linH);
        //获取最小元素中间坐标
        lvLine.min = Math.min.apply(0, linH);
        //如果下级大于一个
        if (high.length > 1) {
          if (this.structure[key].y > minY) {
            let reLineH: Array<any> = [];
            for (let k in this.structure) {
              if (this.structure[k].parent_id === this.structure[key].id && this.structure[k].is_ass !== '1') {
                reLineH.push(this.structure[k].y + this.publicCon2[this.structure[k].s_type].height / 2);
              }
            }
            //获取最大元素中间坐标
            lvLine.max = Math.max.apply(0, reLineH);
            //获取最小元素中间坐标
            lvLine.min = Math.min.apply(0, reLineH);
          }
        }
        this.lvLineHigh[this.structure[key].id] = this.typeService.clone(lvLine);
      }
      high = [];
      down = [];
      linH = [];
      lvLine = {};
    }
    let drawObj: any;

    let maxVal: number = 0;
    let drawWidth: number;
    for (let val in this.structure) {
      if (this.structure[val].x >= maxVal) {
        maxVal = this.structure[val].x;
        drawObj = this.structure[val];
      }
    }

    if (drawObj && drawObj.type) {
      drawWidth = drawObj.x + this.publicCon2[drawObj.s_type].width;
    } else {
      drawWidth = drawObj.x + this.publicCon2[drawObj.s_type].width;
    }
    if (drawWidth < 1000) {
      drawWidth = 1000;
    } else {
      drawWidth = (drawWidth + (this.publicCon2.winW - 1000) / 2);
    }
    for (let key in this.structure) {
      if (this.structure[key].y > highestPos) {
        highestPos = this.structure[key].y;
        highestType = this.structure[key].s_type;
      }

      //console.log('this.structure[key]', this.structure[key]);
      this.draw.drawRec(this.structure[key], this.lvLineHigh, this.minLv, this.outEditStructure, this.outEditDepartment);
    }
    highestPos = highestPos + this.publicCon2[highestType].height;
    let menuHeight = 148;
    let menuWidth = 140;

    this.drawingH.nativeElement.style.width = drawWidth + menuWidth +  'px';
    this.drawingH.nativeElement.style.height = highestPos + menuHeight + 'px';
  }

  //离开组织架构
  quitStructure() {
    if (this.structureDataService.getUploadStructureFlag() == 1) {
      this.dialogService.openConfirm({
        content: `You have no upload data, you can't keep it if you drop out of the page !`,
      }, () => {
        this.quit();
      });
    } else {
      this.quit();
    }

  }

  quit() {
    this.structureDataService.setUploadStructureFlag(0);
    this.router.navigate(['user/index']);
  }

  setSvg() {
    this.d3.select('#drawing').selectAll('*').remove();
    this.publicCon2.draw = this.d3.select('#drawing').append('svg')
      .attr('width', '120%')
      .attr('height', '120%')
      .attr('x', 0)
      .attr('y', 0);
  }
}
