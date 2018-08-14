import {Inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";

/**
 * 组织架构画图逻辑
 */
@Injectable()
export class DrawService {

  private picW: number = 34;
  private picH: number = 34;

  public position: any = {x: 10, y: 20};
  public subordinate: any = {x: 10, y: 44};
  public assistance: any = {x: 10, y: 68};
  public department: any = {x: 10, y: 92};
  public remove: any = {x: 10, y: 125};

  //静态常量
  public publicCon: any = [];

  public structure: any = [];

  constructor(public router: Router,
              @Inject('app.config') private config: any,
              @Inject('file.service') public FileService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('structure-data.service') public structureDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') private typeService: any,) {

  }

  setStructure(structure: any) {
    this.structure = structure;
  }

  setPublicCon(publicCon: any) {
    this.publicCon = publicCon;
  }

  drawTopG() {
    this.publicCon.draw.append('g')
      .attr('id', 'menu-group');
    this.publicCon.draw.append('g')
      .attr('id', 'line-group');
  }

  drawAssLine(attr: any): any {
    let lineObj = this.publicCon.draw.select('#line-group');
    lineObj.lower();
    let startX: number = attr.x - 25;
    let startY: number = attr.y - this.publicCon.ass.assT - 15;
    let endX: number = startX;
    let endY: number = attr.y + 14;
    lineObj.append('line')
      .attr('x1', startX)
      .attr('x2', endX)
      .attr('y1', startY)
      .attr('y2', endY)
      .attr('stroke-width', 1)
      .attr('stroke', '#7078F7')
    lineObj.append('line')
      .attr('x1', startX)
      .attr('x2', attr.x + 2)
      .attr('y1', endY)
      .attr('y2', endY)
      .attr('stroke-width', 1)
      .attr('stroke', '#7078F7')
  }

  /**
   *  ps左侧的线
   * @param attr
   * @param {number} minLv
   * @return {any}
   */
  drawStartLine(attr: any, minLv: number): any {
    let lineObj = this.publicCon.draw.select('#line-group');
    lineObj.lower();
    let startX: number = 0;
    let href: number = 0;
    let endX: number = 0;

    if (attr.depth !== parseInt(attr.p_level)) {
      let parent_level = 1;
      for (let key in this.structure) {
        if (this.structure[key].id === attr.parent_id) {
          parent_level = parseInt(this.structure[key].p_level);
        }
      }
      href = (this.publicCon.local.perX - this.publicCon[attr.s_type].width) / 2;
      startX = attr.x -
        this.publicCon[attr.s_type].width * (parseInt(attr.p_level) - parent_level - 1) -
        href * ((parseInt(attr.p_level) - parent_level) * 2 - 1);
      endX = attr.x + 1;
    } else {
      startX = attr.x + 1;
      href = (this.publicCon.local.perX - this.publicCon[attr.s_type].width) / 2;
      endX = startX - href - 1;
    }
    let y: number = this.publicCon[attr.s_type].height / 2 + attr.y;
    if (attr.s_type == 'd') {
      y -= 1;
    }
    lineObj.append('line')
      .attr('x1', startX)
      .attr('x2', endX)
      .attr('y1', Math.floor(y))
      .attr('y2', Math.floor(y))
      .attr('stroke-width', 1)
      .attr('stroke', '#7078F7');
  }

  /**
   * ps 右侧的线
   * @param attr
   * @return {any}
   */
  drawEndLine(attr: any): any {
    if (attr.nodes.length > 0) {
      let lineObj = this.publicCon.draw.select('#line-group');
      let startX: number = this.publicCon[attr.s_type].width + attr.x;
      let startY: number = this.publicCon[attr.s_type].height / 2 + attr.y;
      let href: number = (this.publicCon.local.perX - this.publicCon[attr.s_type].width) / 2;
      let endX: number = startX + href;
      lineObj.append('line')
        .attr('x1', startX)
        .attr('x2', endX)
        .attr('y1', Math.floor(startY))
        .attr('y2', Math.floor(startY))
        .attr('stroke-width', 1)
        .attr('stroke', '#7078F7');
    }
  }

  drawVerticalLine(attr: any, lineHigh: any): any {
    let lineObj = this.publicCon.draw.select('#line-group');
    lineObj.lower();
    let href: number = (this.publicCon.local.perX - this.publicCon[attr.s_type].width) / 2;
    let startX: number = this.publicCon[attr.s_type].width + attr.x + href;
    let startY: number = lineHigh.min - 1;
    let endX: number = startX;
    let endY: number = lineHigh.max - 1;
    lineObj.append('line')
      .attr('class', 'vertical-line')
      .attr('x1', startX)
      .attr('x2', endX)
      .attr('y1', startY)
      .attr('y2', endY)
      .attr('stroke-width', 1)
      .attr('stroke', '#7078F7');
  }



  /**
   *
   * @param attr
   * @param lineHigh
   * @param minLv
   * @param outEditStructure
   * @param outEditDepartment
   * @returns {any|string}
   */
  drawRec(attr: any, lineHigh: any, minLv: number, outEditStructure: any, outEditDepartment: any): any {
    let obj = this.publicCon.draw;
    let tmpId, rectangle6Id;
    if (attr.s_type == 'd') {
      tmpId = attr.did;
      rectangle6Id = 'Rectangle-6-d-' + attr.did;
    } else {
      tmpId = attr.id;
      rectangle6Id = 'Rectangle-6-' + attr.id;
    }

    let group1 = obj.append('g')
      .attr('id', 'rec-ps-' + tmpId)
      .attr('stroke', 'none')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('fill-rule', 'evenodd')
      .on('mouseenter', () => {
        if (attr.s_type === 'd' && attr.profile) {
          for (let key in attr.profile) {
            group1.select('#profile-image-' + attr.did + '-' + key).raise();
          }
        }
        if (attr.s_type === 'u') {
          group1.select('#user-profile-' + attr.id).raise();
        }
        group1.select('#' + rectangle6Id).style('display', 'block');
        group1.select('#' + rectangle6Id).style('display', 'block');
        group1.select('#circle-' + attr.id).style('display', 'block');
        //obj.select('#menu-group').select('#menu-' +attr.id).style('display','block');
      })
      .on('mouseleave', () => {
        if (attr.s_type === 'd') {
          group1.selectAll('#' + rectangle6Id).style('display', 'none');
        } else {
          let menu = this.publicCon.draw.select('#menu-group').select('#menu-' + attr.id);
          let display = menu.attr('style');
          if (display.indexOf('none') !== -1) {
            group1.selectAll('#' + rectangle6Id).style('display', 'none');
            group1.selectAll('#circle-' + attr.id).style('display', 'none');
          }
        }
      });
    if (attr.s_type == 'd') {
      group1.on('click', () => {
        outEditDepartment.emit(attr.did);
      })
    }
    group1.lower();
    if (attr.s_type === 'u' || attr.s_type === 'p') {
      let defs = group1.append('defs');
      let pattern = defs.append('pattern')
        .attr('id', 'pattern-' + attr.id)
        .attr('patternUnits', 'objectBoundingBox')
        .attr('x', '-1.26882631e-14%')
        .attr('width', '100%')
        .attr('height', '100%');
      let use = pattern.append('use')
        .attr('xlink:href', this.router.url + '#image-' + attr.id)
        .attr('transform', 'scale(0.265625,0.265625)');
      //console.log('attr.id-attr.profile-attr.s_type', attr.id, attr.profile, attr.s_type);
      defs.append('image')
        .attr('id', 'image-' + attr.id)
        .attr('width', '128')
        .attr('height', '128')
        .attr('xlink:href', attr.profile ? this.config.resourceDomain + this.FileService.getImagePath(36, attr.profile) : '');
      defs.append('rect')
        .attr('id', 'path-3-' + attr.id)
        .attr('rx', 2)
        .attr('x', attr.x)
        .attr('y', attr.y)
        .attr('width', 140)
        .attr('height', 148);
      let filter = defs.append('filter')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
        .attr('filterUnits', 'objectBoundingBox')
        .attr('id', 'filter-4-' + attr.id);
      filter.append('feOffset')
        .attr('dx', 0)
        .attr('dy', 4)
        .attr('in', 'SourceAlpha')
        .attr('result', 'shadowOffsetOuter1');
      filter.append('feGaussianBlur')
        .attr('stdDeviation', 3)
        .attr('in', 'shadowOffsetOuter1')
        .attr('result', 'shadowBlurOuter1');
      filter.append('feGaussianBlur')
        .attr('values', '0 0 0 0 0.503082483   0 0 0 0 0.503082483   0 0 0 0 0.503082483  0 0 0 0.636435688 0')
        .attr('type', 'matrix')
        .attr('in', 'shadowBlurOuter1');
      let workflow = group1.append('g')
        .attr('transform', 'translate(-839.000000, -379.000000)');
      let group4 = workflow.append('g')
        .attr('transform', 'translate(800.000000, 101.000000)');
      let block = group4.append('g')
        .attr('transform', 'translate(40.000000, 279.000000)');
      let rect = block.append('rect')
        .attr('width', this.publicCon[attr.s_type].width)
        .attr('height', this.publicCon[attr.s_type].height)
        .attr('rx', 2)
        .attr('fill', '#7078F7')
        .attr('x', attr.x)
        .attr('y', attr.y);
      // 职位名
      let pNameText = block.append('text')
        .attr('fill', '#D2D5F7')
        .attr('font-size', '12px')
        .attr('font-family', 'LatoRegular')
        .attr('font-weight', 'normal')
        .attr('letter-spacing', -0.5);
      pNameText.append('tspan')
        .attr('x', attr.x + 38)
        .attr('y', attr.y + 31)
        .text(attr.is_ass === '0' ? (attr.title_name ? attr.title_name + ' ' + attr.p_name : attr.p_name) : ' Assistance');

      // 等级
      let levelText = block.append('text')
        .attr('fill', '#ABABAB')
        .attr('font-size', '12px')
        .attr('font-family', 'LatoLight')
        .attr('font-style', 'italic')
        .attr('font-weight', '300');
      levelText.append('tspan')
      // .attr('x', attr.x + 160)
        .attr('x', attr.x + 42 + pNameText.node().getBBox().width)
        .attr('y', attr.y + 31)
        .text('L' + (attr.is_ass === '1' ? attr.p_level + ' -1' : attr.p_level));

      if (attr.s_type === 'u') {
        // 人名
        let nameText = block.append('text')
          .attr('fill', '#FFFFFF')
          .attr('font-size', '12px')
          .attr('font-family', 'LatoBold')
          .attr('font-weight', 'bold')
          .attr('letter-spacing', -0.5);
        nameText.append('tspan')
          .attr('x', attr.x + 38)
          .attr('y', attr.y + 15)
          .text(attr.work_name);

        block.append('rect')
          .attr('id', 'user-profile-' + attr.id)
          .attr('stroke', '#979797')
          .attr('stroke-width', 0.2)
          .attr('fill', 'url(' + this.router.url + '#pattern-' + attr.id + ')')
          .attr('x', attr.x + 0)
          .attr('y', attr.y + 0)
          .attr('width', 34)
          .attr('height', 34)
          .attr('rx', 2)
          .attr('style', 'cursor:pointer')
          .on('click', () => {
            //psid 就是  attr.id
            //workname 就是 attr.work_name
            if (this.structureDataService.getUploadStructureFlag()) {
              this.dialogService.openWarning({
                simpleContent: `you can not chat on editing status, please upload first.`
              })
            } else {
              if (parseInt(attr.id) === parseInt(this.userDataService.getCurrentCompanyPSID())) {
                this.dialogService.openWarning({
                  simpleContent: 'you can not chat yourself.'
                })
              } else {
                let form = 2;
                //chat
                /*               let friendIdentity = ChatMenuList.initFriendId(form, attr.id, this.userDataService.getCurrentCompanyPSID());
                 let chatData = {
                 isFriend: true,
                 form: form,
                 work_name: attr.work_name,
                 friendType: friendIdentity,
                 uid: attr.id
                 };
                 //显示聊天框
                 this.notificationService.postNotification({
                 act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
                 data: chatData
                 });
                 */
                //mini chat
                let memberInfo = {
                  work_name: attr.work_name,
                  uid: attr.id,
                };
                if (memberInfo.uid === this.userDataService.getCurrentUUID()
                  || memberInfo.uid === this.userDataService.getCurrentCompanyPSID()) {
                } else {
                  this.notificationService.postNotification({
                    act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
                    data: {
                      selector: 'bi-mini-dialog',
                      options: {
                        member: memberInfo,
                        form: form
                      }
                    }
                  });
                }

              }
            }
          })
      } else {

        let gText: string = attr.p_name.substring(0, 1);
        let reg = /^[a-z]$/;
        let reg2 = /^[A-Z]$/;
        if (reg.test(gText) && !reg2.test(gText)) {
          gText = gText.toUpperCase();
        }
      }
    } else if (attr.s_type === 'd') {
      let workflow = group1.append('g')
        .attr('transform', 'translate(-963.000000, -301.000000)');
      let group4 = workflow.append('g')
        .attr('transform', 'translate(360.000000, 101.000000)');
      let block = group4.append('g')
        .attr('transform', 'translate(603.000000, 200.000000)');
      block.append('rect')
        .attr('fill', '#7078F7')
        .attr('x', attr.x)
        .attr('y', attr.y)
        .attr('width', this.publicCon[attr.s_type].width)
        .attr('height', this.publicCon[attr.s_type].height)
        .attr('rx', 2);
      // 部门成员数
      let staffNum = block.append('text')
        .attr('font-family', 'LatoRegular')
        .attr('font-size', 12)
        .attr('font-weight', 'normal')
        .attr('letter-spacing', -0.5)
        .attr('fill', '#D2D5F7');
      staffNum.append('tspan')
        .attr('x', attr.x + 12)
        .attr('y', attr.y + 30)
        .text((attr.num - 1)+ ' P');

      // 部门标题
      let name = block.append('text')
        .attr('font-family', 'LatoBold')
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', '#FFFFFF');
      name.append('tspan')
        .attr('x', attr.x + 12)
        .attr('y', attr.y + 16)
        .text(attr.name);
      if (this.typeService.getDataLength(attr.profile)) {
        let defs = obj.append('defs');
        for (let key in attr.profile) {
          let pattern = defs.append('pattern')
            .attr('id', 'pattern-' + attr.did + '-' + key)
            .attr('patternUnits', 'objectBoundingBox')
            .attr('x', '-1.26882631e-14%')
            .attr('width', '100%')
            .attr('height', '100%');
          let use = pattern.append('use')
            .attr('xlink:href', this.router.url + '#image-' + attr.did + '-' + key)
            .attr('transform', 'scale(0.1875, 0.1875)');
          defs.append('image')
            .attr('id', 'image-' + attr.did + '-' + key)
            .attr('width', '128')
            .attr('height', '128')
            .attr('xlink:href', this.config.resourceDomain + this.FileService.getImagePath(24, attr.profile[key]['profile']))

          let userName;
          block.append('rect')
            .attr('id', 'profile-image-' + attr.did + '-' + key)
            .attr('stroke', '#979797')
            .attr('stroke-width', 0.2)
            .attr('width', 24)
            .attr('height', 24)
            .attr('style', 'cursor:pointer')
            .attr('fill', 'url(' + this.router.url + '#pattern-' + attr.did + '-' + key + ')')
            .attr('rx', 2)
            .attr('x', () => {
              return attr.x + ((parseInt(key) === 0) ? 10 : (10 + (24 + 10) * parseInt(key)));
            })
            .attr('y', attr.y + 35)
            .on('click', () => {
              if (this.structureDataService.getUploadStructureFlag()) {
                this.dialogService.openWarning({
                  simpleContent: `you can not chat on editing status, please upload first.`
                })
              } else {
                if (parseInt(attr.profile[key].psid) === parseInt(this.userDataService.getCurrentCompanyPSID())) {
                  this.dialogService.openWarning({
                    simpleContent: 'you can not chat yourself.'
                  })
                } else {
                  let form = 2;
                  /*let friendIdentity = ChatMenuList.initFriendId(form, attr.profile[key].psid, this.userDataService.getCurrentCompanyPSID());
                   let chatData = {
                   isFriend: true,
                   form: form,
                   work_name: attr.profile[key].work_name,
                   friendType: friendIdentity,
                   uid: attr.profile[key].psid
                   };
                   //显示聊天框
                   this.notificationService.postNotification({
                   act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
                   data: chatData
                   });*/

                  //mini chat
                  let memberInfo = {
                    work_name: attr.profile[key].work_name,
                    uid: attr.profile[key].psid,
                  };
                  if (memberInfo.uid === this.userDataService.getCurrentUUID()
                    || memberInfo.uid === this.userDataService.getCurrentCompanyPSID()) {
                  } else {
                    this.notificationService.postNotification({
                      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
                      data: {
                        selector: 'bi-mini-dialog',
                        options: {
                          member: memberInfo,
                          form: form
                        }
                      }
                    });
                  }
                }
              }
            })

            // 由于有mini dialog 暂时移除名字提示
            // .on('mouseenter', () => {
            //   userName = block.append('text')
            //     .attr('x', () => {
            //       return attr.x + ((parseInt(key) === 0) ? 10 : (10 + (24 + 10) * parseInt(key)));
            //     })
            //     .attr('style', 'fill: #666')
            //     .attr('y', attr.y + 31)
            //     .text(`${attr.profile[key].work_name}`)
            // })
            // .on('mouseleave', () => {
            //   userName.remove()
            // })

        }
      }
    }


    if (parseInt(attr.is_ass) === 1) {
      this.drawAssLine(attr);
    } else {
      if (attr.depth != 1)
        this.drawStartLine(attr, minLv);
      this.drawEndLine(attr);
      if (lineHigh.hasOwnProperty(attr.id)) {
        this.drawVerticalLine(attr, lineHigh[attr.id]);
      }
    }
    //画出展开菜单的图标
    this.drawCircle(group1, attr);


    if (attr.s_type === 'u' || attr.s_type === 'p') {
      this.drawMenu(attr, outEditStructure);
    }
  }

  drawCircle(block: any, obj: any) {
    let workflow = block.select('g')
      .attr('transform', 'translate(-359.000000, -325.000000)')
      .raise();
    // .attr('width', publicCon[attr.s_type].width)
    // .attr('height', publicCon[attr.s_type].height)
    let group4 = workflow.select('g')
      .attr('transform', 'translate(360.000000, 101.000000)');
    let group9 = group4.select('g')
      .attr('transform', 'translate(0.000000, 225.000000)');

    let rectangle6Id = 'Rectangle-6-' + obj.id;
    if (obj.s_type == 'd') {
      rectangle6Id = 'Rectangle-6-d-' + obj.did;
    }
    group9.append('rect')
      .attr('id', rectangle6Id)
      .attr('width', this.publicCon[obj.s_type].width)
      .attr('height', this.publicCon[obj.s_type].height)
      .attr('rx', 2)
      .attr('fill', '#FFFFFF')
      .attr('x', obj.x)
      .attr('y', obj.y)
      .attr('opacity', '0.2')
      .style('display', 'none');
    if (obj.s_type !== 'd') {
      let circle = group9.append('g')
        .attr('transform', 'translate(' + (obj.x + 178) + ', ' + (obj.y + 5) + ')')
        .attr('id', 'circle-' + obj.id)
        .style('display', 'none')
        .on('click', () => {
          let menu = this.publicCon.draw.select('#menu-group').select('#menu-' + obj.id);
          let display = menu.attr('style');
          if (display.indexOf('none') === -1) {
            menu.style('display', 'none');
          } else {
            menu.style('display', 'block');
          }

        });
      circle.append('circle')
        .attr('fill', '#7078F7')
        .attr('x', obj.x)
        .attr('y', obj.y)
        .attr('width', this.picW)
        .attr('height', this.picH)
        .attr('cx', 12)
        .attr('cy', 12)
        .attr('r', 6);

      circle.append('path')
        .attr('d', 'M11.2,12.8 L11.2,15.2 C11.2,15.6424 11.5584,16 12,16 C12.4416,16 12.8,15.6424 12.8,15.2 L12.8,12.8 L15.2,12.8 C15.6424,12.8 16,12.4424 16,12 C16,11.5576 15.6424,11.2 15.2,11.2 L12.8,11.2 L12.8,8.8 C12.8,8.3584 12.4416,8 12,8 C11.5584,8 11.2,8.3584 11.2,8.8 L11.2,11.2 L8.8,11.2 C8.3584,11.2 8,11.5576 8,12 C8,12.4424 8.3584,12.8 8.8,12.8 L11.2,12.8 Z')
        .attr('stroke', 'none')
        .attr('fill', '#FFFFFF');
    }
  }

  drawMenu(obj: any, outEditStructure: any) {
    // <rect id="path-3" x="0" y="0" width="140" height="148" rx="2"></rect>
    let group9 = this.publicCon.draw.select('#menu-group');

    let rectangle6Id = 'Rectangle-6-' + obj.id;
    if (obj.s_type == 'd') {
      rectangle6Id = 'Rectangle-6-d-' + obj.did;
    }

    group9.raise();
    let group = group9.append('g')
      .attr('id', 'menu-' + obj.id)
      .attr('data-step', 'menu-' + obj.id)
      .attr('class', 'structure-help')
      .style('display', 'none')
      .attr('transform', 'translate(120.000000, 28.000000)')
      .on('mouseleave', () => {
        this.publicCon.draw.select('#menu-group').select('#menu-' + obj.id).style('display', 'none');
        this.publicCon.draw.selectAll('#' + rectangle6Id).style('display', 'none');
        this.publicCon.draw.selectAll('#circle-' + obj.id).style('display', 'none');
      });
    let rectangle = group.append('g');
    rectangle.append('use')
      .attr('fill', 'black')
      .attr('fill-opacity', 1)
      .attr('filter', 'url(#filter-4-' + obj.id + ')')
      .attr('xlink:href', this.router.url + '#path-3-' + obj.id);
    rectangle.append('use')
      .attr('fill', '#ffffff')
      .attr('fill-rule', 'evenodd')
      .attr('xlink:href', this.router.url + '#path-3-' + obj.id);

    group.append('rect')
      .attr('id', 'Rectangle-11')
      .attr('fill', '#FFFFFF')
      .attr('x', obj.x + 5)
      .attr('y', obj.y + 6)
      .attr('width', 130)
      .attr('height', 20)
      .attr('rx', 2);

    //编辑职位
    let editPosition = this.drawMenuList(group.append('g'), obj.x + 5, obj.y + 6, obj.x + 10, obj.y + 20, 'Edit-the-position', 'position', 'Edit the position');

    //新增下级
    let newSubordinate = this.drawMenuList(group.append('g'), obj.x + 5, obj.y + 30, obj.x + 10, obj.y + 44, 'New-subordinate', 'subordinate', 'New subordinate');

    //新增助理
    let newAssistance = this.drawMenuList(group.append('g'), obj.x + 5, obj.y + 54, obj.x + 10, obj.y + 68, 'New-assistance', 'assistance', 'New assistance');

    //新增部门
    let newDepartment = this.drawMenuList(group.append('g'), obj.x + 5, obj.y + 78, obj.x + 10, obj.y + 92, 'New-department', 'department', 'New department');

    //删除职位
    let removePosition = this.drawMenuList(group.append('g'), obj.x + 5, obj.y + 111, obj.x + 10, obj.y + 125, 'Remove-the-position', 'remove', 'Remove the position');


    //点击编辑职位方法
    editPosition.attr('id', 'Edit-the-position')
      .on('mouseenter', () => {
          this.drawEventMenu(obj, 'Edit-the-position');
        }).on('click', () => {
        outEditStructure.emit({'type': 'position', 'data': obj});
      });


    if (obj.is_ass !== '1') {
      //点击新建下级方法
      newSubordinate.on('mouseenter', () => {
        this.drawEventMenu(obj, 'New-subordinate');
      }).on('click', () => {
        outEditStructure.emit({'type': 'subordinate', 'data': obj});
      });

      //点击新建助理方法
      if (this.publicCon.departmentId == ''
        || (this.publicCon.departmentId == obj.did)) {
        newAssistance.on('mouseenter', () => {
          this.drawEventMenu(obj, 'New-assistance');
        }).on('click', () => {
          outEditStructure.emit({'type': 'assistance', 'data': obj});
        });
      } else {
        //设置半透明
        newAssistance.select('text')
          .attr('opacity', '.5')
          .attr('cursor','not-allowed');
      }

      //只有在main中可以新建部门
      if (this.publicCon.departmentId != '' && this.publicCon.departmentId != '0') {
        //设置半透明
        newDepartment.select('text')
          .attr('opacity', '.5')
          .attr('cursor','not-allowed');
      } else {
        //点击新建部门方法
        newDepartment.on('mouseenter', () => {
          this.drawEventMenu(obj, 'New-department');
        }).on('click', () => {
          outEditStructure.emit({'type': 'department', 'data': obj});
        });
      }
    } else {
      newDepartment.select('text')
        .attr('opacity', '.5');
      newAssistance.select('text')
        .attr('opacity', '.5');
      newSubordinate.select('text')
        .attr('opacity', '.5');
    }

    group.append('path')
      .attr('d', 'M' + (obj.x + 10) + ',' + (obj.y + 108) + ' L' + (obj.x + 130) + ',' + (obj.y + 108))
      .attr('id', 'line-' + obj.id)
      .attr('stroke', '#E2E2E9')
      .attr('stroke-width', 0.5)
      .attr('stroke-linecap', 'square');

    if(obj.p_level === '1' && obj.is_ass === '0') {
      removePosition.select('rect')
        .attr('opacity', '0.5')
        .attr('cursor','not-allowed');
      removePosition.select('text')
        .attr('fill', '#E2E2E9');
    } else {
      removePosition.select('text')
        .attr('fill', '#EE1919')
      removePosition.on('mouseenter', () => {
        this.drawEventMenu(obj, 'Remove-the-position');
      }).on('click', () => {
        outEditStructure.emit({'type': 'remove', 'data': obj});
      });
    }
    return group;
  }

  drawMenuList(g: any, rectX: number, rectY: number, textX: number, textY:number,  idName: string, type: string, showName: string)
  {

    g.attr('id', idName);
    g.append('rect')
      .attr('width', 130)
      .attr('height', 20)
      .attr('x', rectX)
      .attr('y', rectY)
      .attr('fill', 'transparent');
    g.append('text')
      .attr('font-family', 'LatoRegular')
      .attr('font-size', 12)
      .attr('font-weight', 'normal')
      .attr('fill', '#9193AB')
      .append('tspan')
      .attr('x', textX)
      .attr('y', textY)
      .text(this.translate.manualTranslate(showName));

    return g;
  }



  drawEventMenu(obj: any, id?: string) {
    let menu = this.publicCon.draw.select('#menu-group').select('#menu-' + obj.id);
    menu.select('#Edit-the-position').select('text').attr('fill', '#9193AB');
    menu.select('#New-subordinate').select('text').attr('fill', '#9193AB');
    menu.select('#New-assistance').select('text').attr('fill', '#9193AB');
    menu.select('#New-department').select('text').attr('fill', '#9193AB');
    if(obj.p_level === '1' && obj.is_ass === '0') {
      menu.select('#Remove-the-position').select('text').attr('fill', '#E2E2E9');
    }else {
      menu.select('#Remove-the-position').select('text').attr('fill', '#EE1919');
    }
    let x: number = 0;
    let y: number = 0;
    if (id === 'Edit-the-position') {
      x = obj.x + this.position.x;
      y = obj.y + this.position.y;
    } else if (id === 'New-subordinate') {
      x = obj.x + this.subordinate.x;
      y = obj.y + this.subordinate.y;
    } else if (id === 'New-assistance') {
      x = obj.x + this.assistance.x;
      y = obj.y + this.assistance.y;
    } else if (id === 'New-department') {
      x = obj.x + this.department.x;
      y = obj.y + this.department.y;
    } else if (id === 'Remove-the-position') {
      x = obj.x + this.remove.x;
      y = obj.y + this.remove.y;
    }
    if (id) {
      menu.select('#Rectangle-11')
        .attr('fill', '#7078F7')
        .attr('x', x - 5)
        .attr('y', y - 14);
      menu.select('#' + id).select('text')
        .attr('fill', '#FFFFFF')
    } else {
      menu.select('#Rectangle-11')
        .attr('fill', '#FFFFFF');
      menu.select('#' + id).select('text')
        .attr('fill', '#FFFFFF');
    }
  }
}
