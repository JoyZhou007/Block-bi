/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/6.
 *
 * 绘制进度条模块
 */
import {
  Component,
  OnInit,
  ViewChild,
  Inject, Input, AfterViewChecked, Output, EventEmitter
} from '@angular/core';
import * as MissionConstant from '../../shared/config/mission.config';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MissionDetailTplModel } from "../../shared/services/model/entity/mission-entity";
import { DateService } from "../../shared/services/common/data/date.service";

@Component({
  selector: 'mission-progress',
  templateUrl: '../template/mission-progress.component.html'
})

export class MissionProgressComponent implements AfterViewChecked {
  @Input('eleData') eleData: MissionDetailTplModel;
  @Input('mode') mode: string = '1'; // 1 schedule  2 calendar
  //传输link信息
  @Output() transportLinkInfo = new EventEmitter<any>();
  //传输子mission
  // @Output() sendChildMission = new EventEmitter<Array<MissionDetailTplModel>>();
  @Output() sendChildMission = new EventEmitter<MissionDetailTplModel>();


  public hasInit: boolean = false;
  public d3: any;

  constructor(@Inject('d3.service') public D3Service: any,
              @Inject('date.service') public dateService: DateService) {
    this.d3 = this.D3Service.getInstance();
  }


  ngAfterViewChecked(): void {
    if (typeof this.eleData !== 'undefined' && !this.hasInit) {
      this.hasInit = true;
      if (this.mode === MissionConstant.MISSION_MODE_CALENDAR) {
        this.drawCalendarProgress();
      } else {
        this.drawScheduleProgress();
      }
    }
  }

  /**
   *
   * @param ele
   */
  drawCalendarProgress(ele?: any) {
    let painter = this.d3.select('#progress-svg-el' + this.eleData.mid);
    if (this.hasInit) {
      if (typeof ele !== 'undefined') {
        painter = this.d3.select(ele).select('.progress-svg-el');
      }
      let g = painter.insert('svg').append('g').attr('class', 'progress-canvas');
      // 未完成条
      let text = '';
      if (this.eleData.todoProgressTime !== '') {
        text = this.eleData.todoProgressTime;
        g.append('rect').attr('width', this.eleData.fillLengthTodo + '%').attr('height', '12').attr('rx', 7)
          .attr('style', 'fill:' + this.eleData.fillColorTodo);
      }
      // 进行条
      if (this.eleData.doingProgressTime !== '') {
        text = this.eleData.doingProgressTime;
        g.append('rect').attr('width', this.eleData.fillLengthDoing + '%').attr('height', '12').attr('rx', 7)
          .attr('style', 'fill:' + this.eleData.fillColorDoing);
      }
      // 完成条
      if (this.eleData.doneProgressTime !== '') {
        text = this.eleData.doneProgressTime;
        g.append('rect').attr('width', this.eleData.fillLengthDone + '%').attr('height', '12').attr('rx', 7)
          .attr('style', 'fill:' + this.eleData.fillColorDone);
      }
      // 同时存在进行中和未完成条
      let textPos = 50;
      if (this.eleData.doingProgressTime !== '' && this.eleData.todoProgressTime !== '') {
        // textPos = parseInt(this.eleData.fillLengthDoing) / 2 - 5.5;
        textPos = parseInt(this.eleData.fillLengthDoing) / 2;
      }
      let textNode = g.append('text').attr('x', textPos + '%')
        .attr('y', '10').text(text).attr('style', 'font-size:12px;fill:#fff;');

        textNode.attr('transform', `translate(${-textNode.node().getBBox().width/2},0)`);
      // 如果是Application, 同意人时间节点条
      this.eleData.hasDrawed = true;

    }
  }

  drawScheduleProgress(ele?: any) {
    let painter = this.d3.select('#progress-svg-el' + this.eleData.mid);
    if (this.hasInit) {
      if (typeof ele !== 'undefined') {
        painter = this.d3.select(ele).select('.progress-svg-el');
      }
      let svg = painter.insert('svg');

      let gLine = svg.append('g')
        .attr('width', '100%')
        .attr('height', '16px')
      gLine.append('rect')
        .style('fill', this.eleData.FillColorLine)
        .style('fill-rule', 'evenodd')
        .attr('x', 0)
        .attr('y', '67')
        .attr('width', '100%')
        .attr('height', '16')

      let g = svg.append('g').attr('class', 'progress-canvas');
      // 未完成条
      let text = '';

      let startX = this.eleData.svgPostion + '%', startY = '20', height = 24;
      let textStart = this.eleData.textPostion + '%';
      //link的位置
      let linkPos = this.eleData.linkPosition + '%';
      let trackingPos =
        this.eleData.showLink_info ? 39 : 0;
      //text的translate的位置
      let txtTranslate = this.eleData.textTranslate;

      //todo的宽度 Done doing
      let todoWidth = `${this.eleData.fillLengthTodo}%`;
      let doneWidth = `${this.eleData.fillLengthDone}%`;
      let doingWidth = `${this.eleData.fillLengthDoing}%`;

      //给定最小宽度
      /*      todoWidth =
       this.eleData.showDayMinWidth ||
       this.eleData.showWeekMinWidth ||
       this.eleData.showMonthMinWidth ? '24' : todoWidth;
       doneWidth =
       this.eleData.showDayMinWidth ||
       this.eleData.showWeekMinWidth ||
       this.eleData.showMonthMinWidth ? '24' : doneWidth;
       doingWidth =
       this.eleData.showDayMinWidth ||
       this.eleData.showWeekMinWidth ||
       this.eleData.showMonthMinWidth ? '24' : doingWidth;
       txtTranslate =
       this.eleData.showDayMinWidth ||
       this.eleData.showWeekMinWidth ||
       this.eleData.showMonthMinWidth ? 4 : txtTranslate;*/
      todoWidth =
        parseInt(this.eleData.fillLengthTodo) < 1.5 ? '24' : todoWidth;
      doneWidth =
        parseInt(this.eleData.fillLengthDone) < 1.5 ? '24' : doneWidth;
      doingWidth =
        parseInt(this.eleData.fillLengthDoing) < 1.5 ? '24' : doingWidth;
      txtTranslate =
        parseInt(this.eleData.fillLengthTodo) < 1.5 ||
        parseInt(this.eleData.fillLengthDone) < 1.5 ||
        parseInt(this.eleData.fillLengthDoing) < 1.5 ? 4 : txtTranslate;
      textStart =
        parseInt(this.eleData.fillLengthTodo) < 1.5 ||
        parseInt(this.eleData.fillLengthDone) < 1.5 ||
        parseInt(this.eleData.fillLengthDoing) < 1.5 ? startX : textStart;


      //如果是application 进度条width都为0
      if (this.eleData.typeIsApplication) {
        doneWidth = '0';
        todoWidth = '0';
        doingWidth = '0';
      }


      if (this.eleData.todoProgressTime !== '') {
        text = this.eleData.todoProgressTime;
        if (text === '?') {
          //toDo的问号圆
          g.append('rect').attr('class', 'm-simple-doing m-simple-doing-bg-bot')
            .attr('x', startX).attr('y', startY)
            .attr('width', 24).attr('height', 24).attr('rx', 12)
            .style('fill:' + this.eleData.fillColorTodo);
          g.append('text').attr('class', 'm-simple-text')
            .attr('x', startX)
            .attr('y', 37).text(text)
            .attr('transform', 'translate(7.5,0)')
            .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
              this.d3.select(capture[listener]).raise()
                .style('fill', 'red');
            })
            .on('mouseleave', (typenames: any, listener: any, capture: any) => {
              this.d3.select(capture[listener]).raise()
                .style('fill', this.eleData.fillColorWhite);
            });

        } else {
          // 同时存在进行中和未完成条
          if (this.eleData.doingProgressTime !== '' && this.eleData.todoProgressTime !== '') {
            //todo的文字要隐藏
            text = '';
          }
          if (this.eleData.type === MissionConstant.MISSION_TYPE_PROJECT) { //project类型要加点击事件
            g.append('rect').attr('class', 'm-simple-doing m-simple-doing-bg-bot')
              .attr('x', startX).attr('y', startY)
              .attr('width', todoWidth).attr('height', height).attr('rx', 12)
              .attr('style', 'fill:' + this.eleData.fillColorTodo)
              //project 加点击事件
              .on("click", () => {
                // this.sendChildMission.emit(this.eleData.detail.internal);
                this.sendChildMission.emit(this.eleData);
              }, false)
          } else {
            g.append('rect').attr('class', 'm-simple-doing m-simple-doing-bg-bot')
              .attr('x', startX).attr('y', startY)
              .attr('width', todoWidth).attr('height', height).attr('rx', 12)
              .attr('style', 'fill:' + this.eleData.fillColorTodo)
          }
          if (this.eleData.type !== MissionConstant.MISSION_TYPE_APPLICATION) {
            g.append('text').attr('class', 'm-simple-text')
              .attr('x', textStart)
              .attr('y', 37).text(text)
              .attr('transform', `translate(${txtTranslate},0)`)
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', 'red');
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', this.eleData.fillColorWhite);
              });
          }


          if (this.eleData.type === MissionConstant.MISSION_TYPE_MEETING) {
            let gMeeting = g.append('svg')
              .attr('x', startX).attr('y', startY);
            // gMeeting.append('rect')
            //     .attr('x', 0).attr('y', 0)
            //     .attr('width', 24).attr('height', 24)
            //     .attr('rx', 12)
            //     .style('fill', this.eleData.fillColorDoing)
            gMeeting.append('path')
              .attr('d',
                'M7.52255798,9.48586433 C8.50621606,9.48586433 9.30348176,8.70582057 9.30348176,7.74301969 C9.30348176,6.78039387 8.50621606,6 7.52255798,6 C6.53889989,6 5.74163419,6.78004376 5.74163419,7.74301969 C5.74163419,8.70582057 6.53943653,9.48586433 7.52255798,9.48586433 Z M11.3546924,14.4470897 C10.2672842,13.7645514 9.69612215,12.8518162 9.26001405,11.8636324 C9.04178113,10.7215755 8.383147,9.85645514 7.1524564,9.85645514 C5.76274197,9.85645514 5,10.9585996 5,12.3184245 L5,17.9991247 L9.30437616,17.9991247 L9.30437616,15.1175492 C9.61276433,15.4102407 9.96354692,15.6884026 10.3728231,15.9450328 C10.5248706,16.0407877 10.6944483,16.086302 10.8629528,16.086302 C11.1620392,16.086302 11.4555804,15.9417068 11.6289146,15.6764989 C11.9000958,15.2624945 11.7772056,14.7128228 11.3546924,14.4470897 Z M16.4781575,9.48586433 C17.4611001,9.48586433 18.2581869,8.70582057 18.2581869,7.74301969 C18.2581869,6.78039387 17.4611001,6 16.4781575,6 C15.4948572,6 14.6972338,6.78004376 14.6972338,7.74301969 C14.6963394,8.70582057 15.4943206,9.48586433 16.4781575,9.48586433 Z M16.848438,9.85680525 C15.6172108,9.85680525 14.9589344,10.7215755 14.7412381,11.8641575 C14.3044145,12.8523414 13.7327158,13.7643764 12.6458442,14.4472648 C12.2226155,14.713523 12.1000831,15.2635449 12.3703699,15.6773742 C12.5445985,15.9422319 12.8374241,16.0868271 13.1370472,16.0868271 C13.3057305,16.0868271 13.4751294,16.041488 13.6277135,15.9459081 C14.0355587,15.6891028 14.3870568,15.411116 14.6963394,15.1185996 L14.6963394,18 L19,18 L19,12.3192998 C19,10.9591247 18.2377947,9.85680525 16.848438,9.85680525 Z'
              )
              .style('fill', this.eleData.fillColorWhite)
          }

        }
        //绘制tracking
        if (this.eleData.showTracking) {
          let gTracking = g.append('svg')
            .attr('x', startX)
            .attr('y', 52)
            .style('cursor', 'pointer')
          let aTrackingG = gTracking.append('g')
            .attr('transform', `translate(${trackingPos},0)`)
          aTrackingG.append('rect')
            .attr('x', 0).attr('y', 0)
            .attr('width', 24).attr('height', 24)
            .attr('rx', 12)
            .style('fill', this.eleData.fillColorLink)
          aTrackingG.append('path')
            .attr('d',
              'M12,6 C9.24576271,6 7,8.20942928 7,10.9191067 C7,13.0868486 10.0932203,16.1240695 11.4067797,17.7081886 C11.5338983,17.874938 11.7881356,18 12,18 C12.2118644,18 12.4661017,17.9166253 12.5932203,17.7081886 C13.9067797,16.1240695 17,13.0868486 17,10.9191067 C17,8.20942928 14.7542373,6 12,6 Z M15.1446731,10.5439206 C15.1446731,12.2626964 13.7470406,13.6377171 12,13.6377171 C10.2529594,13.6377171 8.85532688,12.2626964 8.85532688,10.5439206 C8.85532688,8.82514475 10.2529594,7.45012407 12,7.45012407 C13.7470406,7.45012407 15.1446731,8.82514475 15.1446731,10.5439206 Z'
            )
            .style('fill', this.eleData.fillColorWhite)
        }
        // link图标
        if (this.eleData.showLink_info) {
          // link图标 使用svg包住
          let gLink = g.append('svg')
            .attr('x', linkPos)
            .attr('y', 52)
            .style('cursor', 'pointer')
            .on('click', () => {
              this.transportLinkInfo.emit(this.eleData)
            });
          gLink.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorLink);
          gLink.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M10.4077697,14.4115922 L9.1674501,15.602189 C8.79886596,15.9559971 8.19951097,15.9558554 7.83122194,15.6023306 L6.45618769,14.2824197 C6.08789865,13.9287533 6.08789865,13.353284 6.45618769,12.9996176 L9.57793891,10.0032966 C9.94608039,9.64963015 10.5454354,9.64991342 10.913872,10.0032966 L12.2889062,11.3232075 C12.5580405,11.5816942 12.639489,11.9675121 12.4963639,12.3060234 C12.3737484,12.5959534 12.5192344,12.9263915 12.8212727,13.0439498 C13.1227209,13.1616498 13.4674016,13.0219962 13.5900171,12.7320662 C13.9121224,11.9706281 13.7288632,11.1031043 13.1234586,10.5219696 L11.7484244,9.20191705 C10.9196265,8.40662788 9.57144664,8.40662788 8.74323897,9.20205869 L5.62148774,12.1985213 C4.79283742,12.9938105 4.79283742,14.2882268 5.62148774,15.083516 L6.996522,16.4034269 C7.41084716,16.8011423 7.95487026,17 8.49918847,17 C9.04350667,17 9.58767733,16.8011423 10.0020025,16.4034269 L11.242322,15.2126885 C11.4729453,14.9913106 11.4729453,14.6326869 11.242322,14.4115922 C11.0118463,14.190356 10.6380978,14.190356 10.4077697,14.4115922 Z M18.3785123,8.91637779 L17.003478,7.59646688 C16.1749752,6.80117771 14.8266478,6.80117771 13.9981451,7.59646688 L12.7578255,8.78720526 C12.5272022,9.00858317 12.5272022,9.36720689 12.7578255,9.58830153 C12.9884488,9.80967944 13.3621973,9.80967944 13.5923779,9.58830153 L14.8326975,8.39770478 C15.2012816,8.0438967 15.8006366,8.04403834 16.1689256,8.39756314 L17.5439599,9.71747405 C17.9122489,10.0711405 17.9122489,10.6466098 17.5439599,11.0002762 L14.4223562,13.9965972 C14.0540672,14.350122 13.4547122,14.350122 13.086128,13.9965972 L11.7110938,12.6766863 C11.4419595,12.4181996 11.360511,12.0323817 11.5036361,11.6938703 C11.6262516,11.4039403 11.4807656,11.0735023 11.1787273,10.955944 C10.8766889,10.8381024 10.5325984,10.977756 10.4099829,11.2678276 C10.0878776,12.0292656 10.2711368,12.8967895 10.8765414,13.4779242 L12.2515756,14.7979767 C12.6660484,15.1955505 13.2100715,15.3944082 13.7543897,15.3944082 C14.2987079,15.3944082 14.842731,15.1955505 15.2570561,14.7978351 L18.3785123,11.8015141 C19.2071626,11.0059417 19.2071626,9.71166696 18.3785123,8.91637779 Z'
            ).style('fill', this.eleData.fillColorWhite)
        }

      }
      // 进行条
      if (this.eleData.doingProgressTime !== '') {
        text = this.eleData.doingProgressTime;
        if (this.eleData.type === MissionConstant.MISSION_TYPE_APPLICATION) {
          g.append('rect').attr('class', 'm-simple-doing m-simple-doing-bg')
            .attr('x', startX).attr('y', startY)
            .attr('width', doingWidth).attr('height', height).attr('rx', 12)
            .attr('style', 'fill:' + this.eleData.fillColorDoing)
          /*g.append('text').attr('class', 'm-simple-text')
            .attr('x', textStart)
            .attr('y', '37').text(text)
            .attr('transform', `translate(${txtTranslate},0)`)
            .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
              this.d3.select(capture[listener]).raise()
                .style('fill', 'red');
            })
            .on('mouseleave', (typenames: any, listener: any, capture: any) => {
              this.d3.select(capture[listener]).raise()
                .style('fill', this.eleData.fillColorWhite);
            });*/
          // application图标
          this.eleData.applicationPos.forEach((value, index, array) => {
            let tipTextTime;
            let tipTextUser;
            let gApplication = g.append('svg')
            // .attr('transform', 'translate(50,52)')
              .attr('transform', 'translate(50,0)')
              .attr('x', `${value}%`)
              .attr('y', startY)
              .attr('style', 'cursor:pointer')
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                tipTextTime = g.append('text')
                  .attr('x', this.eleData.svgPostion + '%').attr('y', 9)
                  .attr('style', 'fill: #666')
                  .attr('transform', 'translate(50,0)')
                  .text(`approve time: ${this.dateService.formatWithTimezone(this.eleData.detail.approve_time[index].time)}`)
                tipTextUser = g.insert('text')
                  .attr('x', this.eleData.svgPostion + '%').attr('y', 20)
                  .attr('style', 'fill: #666')
                  .attr('transform', 'translate(50,0)')
                  .text(`approve user: ${this.eleData.detail.approve_time[index].user_info.psid == '0' ? 'System' : this.eleData.detail.approve_time[index].user_info.name}`)
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any, event: any) => {
                tipTextTime.remove();
                tipTextUser.remove();
              });
            gApplication.append('circle')
              .attr('cx', 12).attr('cy', 12)
              .attr('r', 12)
              .style('fill', this.eleData.fillColorDoing);
            gApplication.append('path')
              .attr('d',
                'M6,17.2223653 L18,17.2223653 L18,18 L6,18 L6,17.2223653 Z M13.125,11.5767373 L13.125,9.50822892 C13.125,8.88612114 13.35,8.29511876 13.74,7.81298524 C14.085,7.3775098 14.28,6.8176128 14.25,6.21105773 C14.19,5.02905296 13.245,4.06478591 12.105,4.00257514 C10.815,3.94036436 9.75,5.01350027 9.75,6.33547928 C9.75,6.91092897 9.96,7.45527327 10.305,7.85964332 C10.68,8.31067146 10.875,8.90167384 10.875,9.50822892 L10.875,11.5611846 C10.875,12.0277654 10.515,12.3854774 10.08,12.3854774 L7.755,12.3854774 C6.78,12.4010301 6,13.2097702 6,14.2051426 L6,17.0668383 L18,17.0668383 L18,14.2051426 C18,13.2097702 17.22,12.4010301 16.26,12.4010301 L13.92,12.4010301 C13.485,12.4010301 13.125,12.0277654 13.125,11.5767373 Z'
              ).style(
              'fill', this.eleData.fillColorWhite
            )
          })
        } else {
          if (this.eleData.type === MissionConstant.MISSION_TYPE_PROJECT) {
            g.append('rect').attr('class', 'm-simple-doing m-simple-doing-bg')
              .attr('x', startX).attr('y', startY)
              .attr('width', doingWidth).attr('height', height).attr('rx', 12)
              .attr('style', 'fill:' + this.eleData.fillColorDoing)
              .style('cursor', 'pointer')
              //project 加点击事件
              .on("click", () => {
                this.sendChildMission.emit(this.eleData);
                // this.sendChildMission.emit(this.eleData.detail.internal);
              }, false)
            g.append('text').attr('class', 'm-simple-text')
              .attr('x', textStart)
              .attr('y', '37').text(text)
              .attr('transform', `translate(${txtTranslate},0)`)
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', 'red');
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', this.eleData.fillColorWhite);
              });
          } else {
            g.append('rect').attr('class', 'm-simple-doing m-simple-doing-bg')
              .attr('x', startX).attr('y', startY)
              .attr('width', doingWidth).attr('height', height).attr('rx', 12)
              .attr('style', 'fill:' + this.eleData.fillColorDoing)
            g.append('text').attr('class', 'm-simple-text')
              .attr('x', textStart)
              .attr('y', '37').text(text)
              .attr('transform', `translate(${txtTranslate},0)`)
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', 'red');
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', this.eleData.fillColorWhite);
              });
          }

          if (this.eleData.type === MissionConstant.MISSION_TYPE_MEETING) {
            let gMeeting = g.append('svg')
              .attr('x', startX).attr('y', startY)
            // gMeeting.append('rect')
            //     .attr('x', 0).attr('y', 0)
            //     .attr('width', 24).attr('height', 24)
            //     .attr('rx', 12)
            //     .style('fill', this.eleData.fillColorDoing)
            gMeeting.append('path')
              .attr('d',
                'M7.52255798,9.48586433 C8.50621606,9.48586433 9.30348176,8.70582057 9.30348176,7.74301969 C9.30348176,6.78039387 8.50621606,6 7.52255798,6 C6.53889989,6 5.74163419,6.78004376 5.74163419,7.74301969 C5.74163419,8.70582057 6.53943653,9.48586433 7.52255798,9.48586433 Z M11.3546924,14.4470897 C10.2672842,13.7645514 9.69612215,12.8518162 9.26001405,11.8636324 C9.04178113,10.7215755 8.383147,9.85645514 7.1524564,9.85645514 C5.76274197,9.85645514 5,10.9585996 5,12.3184245 L5,17.9991247 L9.30437616,17.9991247 L9.30437616,15.1175492 C9.61276433,15.4102407 9.96354692,15.6884026 10.3728231,15.9450328 C10.5248706,16.0407877 10.6944483,16.086302 10.8629528,16.086302 C11.1620392,16.086302 11.4555804,15.9417068 11.6289146,15.6764989 C11.9000958,15.2624945 11.7772056,14.7128228 11.3546924,14.4470897 Z M16.4781575,9.48586433 C17.4611001,9.48586433 18.2581869,8.70582057 18.2581869,7.74301969 C18.2581869,6.78039387 17.4611001,6 16.4781575,6 C15.4948572,6 14.6972338,6.78004376 14.6972338,7.74301969 C14.6963394,8.70582057 15.4943206,9.48586433 16.4781575,9.48586433 Z M16.848438,9.85680525 C15.6172108,9.85680525 14.9589344,10.7215755 14.7412381,11.8641575 C14.3044145,12.8523414 13.7327158,13.7643764 12.6458442,14.4472648 C12.2226155,14.713523 12.1000831,15.2635449 12.3703699,15.6773742 C12.5445985,15.9422319 12.8374241,16.0868271 13.1370472,16.0868271 C13.3057305,16.0868271 13.4751294,16.041488 13.6277135,15.9459081 C14.0355587,15.6891028 14.3870568,15.411116 14.6963394,15.1185996 L14.6963394,18 L19,18 L19,12.3192998 C19,10.9591247 18.2377947,9.85680525 16.848438,9.85680525 Z'
              )
              .style('fill', this.eleData.fillColorWhite)
          }
          //绘制tracking
          if (this.eleData.showTracking) {
            let gTracking = g.append('svg')
              .attr('x', startX)
              .attr('y', 52)
              .style('cursor', 'pointer')
            let aTrackingG = gTracking.append('g')
              .attr('transform', `translate(${trackingPos},0)`)
            aTrackingG.append('rect')
              .attr('x', 0).attr('y', 0)
              .attr('width', 24).attr('height', 24)
              .attr('rx', 12)
              .style('fill', this.eleData.fillColorLink)
            aTrackingG.append('path')
              .attr('d',
                'M12,6 C9.24576271,6 7,8.20942928 7,10.9191067 C7,13.0868486 10.0932203,16.1240695 11.4067797,17.7081886 C11.5338983,17.874938 11.7881356,18 12,18 C12.2118644,18 12.4661017,17.9166253 12.5932203,17.7081886 C13.9067797,16.1240695 17,13.0868486 17,10.9191067 C17,8.20942928 14.7542373,6 12,6 Z M15.1446731,10.5439206 C15.1446731,12.2626964 13.7470406,13.6377171 12,13.6377171 C10.2529594,13.6377171 8.85532688,12.2626964 8.85532688,10.5439206 C8.85532688,8.82514475 10.2529594,7.45012407 12,7.45012407 C13.7470406,7.45012407 15.1446731,8.82514475 15.1446731,10.5439206 Z'
              )
              .style('fill', this.eleData.fillColorWhite)
          }


        }

        // link图标
        if (this.eleData.showLink_info) {
          // link图标 使用svg包住
          let gLink = g.append('svg')
            .attr('x', linkPos)
            .attr('y', 52)
            .style('cursor', 'pointer')
            .on('click', () => {
              this.transportLinkInfo.emit(this.eleData)
            })
          gLink.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorLink);
          gLink.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M10.4077697,14.4115922 L9.1674501,15.602189 C8.79886596,15.9559971 8.19951097,15.9558554 7.83122194,15.6023306 L6.45618769,14.2824197 C6.08789865,13.9287533 6.08789865,13.353284 6.45618769,12.9996176 L9.57793891,10.0032966 C9.94608039,9.64963015 10.5454354,9.64991342 10.913872,10.0032966 L12.2889062,11.3232075 C12.5580405,11.5816942 12.639489,11.9675121 12.4963639,12.3060234 C12.3737484,12.5959534 12.5192344,12.9263915 12.8212727,13.0439498 C13.1227209,13.1616498 13.4674016,13.0219962 13.5900171,12.7320662 C13.9121224,11.9706281 13.7288632,11.1031043 13.1234586,10.5219696 L11.7484244,9.20191705 C10.9196265,8.40662788 9.57144664,8.40662788 8.74323897,9.20205869 L5.62148774,12.1985213 C4.79283742,12.9938105 4.79283742,14.2882268 5.62148774,15.083516 L6.996522,16.4034269 C7.41084716,16.8011423 7.95487026,17 8.49918847,17 C9.04350667,17 9.58767733,16.8011423 10.0020025,16.4034269 L11.242322,15.2126885 C11.4729453,14.9913106 11.4729453,14.6326869 11.242322,14.4115922 C11.0118463,14.190356 10.6380978,14.190356 10.4077697,14.4115922 Z M18.3785123,8.91637779 L17.003478,7.59646688 C16.1749752,6.80117771 14.8266478,6.80117771 13.9981451,7.59646688 L12.7578255,8.78720526 C12.5272022,9.00858317 12.5272022,9.36720689 12.7578255,9.58830153 C12.9884488,9.80967944 13.3621973,9.80967944 13.5923779,9.58830153 L14.8326975,8.39770478 C15.2012816,8.0438967 15.8006366,8.04403834 16.1689256,8.39756314 L17.5439599,9.71747405 C17.9122489,10.0711405 17.9122489,10.6466098 17.5439599,11.0002762 L14.4223562,13.9965972 C14.0540672,14.350122 13.4547122,14.350122 13.086128,13.9965972 L11.7110938,12.6766863 C11.4419595,12.4181996 11.360511,12.0323817 11.5036361,11.6938703 C11.6262516,11.4039403 11.4807656,11.0735023 11.1787273,10.955944 C10.8766889,10.8381024 10.5325984,10.977756 10.4099829,11.2678276 C10.0878776,12.0292656 10.2711368,12.8967895 10.8765414,13.4779242 L12.2515756,14.7979767 C12.6660484,15.1955505 13.2100715,15.3944082 13.7543897,15.3944082 C14.2987079,15.3944082 14.842731,15.1955505 15.2570561,14.7978351 L18.3785123,11.8015141 C19.2071626,11.0059417 19.2071626,9.71166696 18.3785123,8.91637779 Z'
            ).style('fill', this.eleData.fillColorWhite)
        }

        //绘制project的图标
        //子appli
        this.eleData.appliPosInPro.forEach((value) => {
          // value =
          //   value === parseFloat(startX)? value+1 : value;
          //application
          let gAppliInPro = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gAppliInPro.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          gAppliInPro.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M14.0447552,7.20042111 L10.0447552,7.20042111 C9.64475524,7.20042111 9.37808858,6.96033689 9.37808858,6.60021056 C9.37808858,6.24008422 9.64475524,6 10.0447552,6 L14.0447552,6 C14.4447552,6 14.7114219,6.24008422 14.7114219,6.60021056 C14.7114219,6.96033689 14.4447552,7.20042111 14.0447552,7.20042111 Z M15.4666667,19 L8.53333333,19 C8.21333333,19 8,18.7599158 8,18.3997894 C8,18.0396631 8.21333333,17.7995789 8.53333333,17.7995789 L15.4666667,17.7995789 C15.7866667,17.7995789 16,18.0396631 16,18.3997894 C16,18.7599158 15.7866667,19 15.4666667,19 Z M15.4666667,16.2248506 L8.53333333,16.2248506 C8.21333333,16.2248506 8,15.9847664 8,15.6246401 C8,15.2645138 8.21333333,15.0244295 8.53333333,15.0244295 L15.4666667,15.0244295 C15.7866667,15.0244295 16,15.2645138 16,15.6246401 C16,15.9847664 15.7866667,16.2248506 15.4666667,16.2248506 Z M15.4666667,13.4497013 L8.53333333,13.4497013 C8.21333333,13.4497013 8,13.2096171 8,12.8494907 C8,12.4893644 8.21333333,12.2492802 8.53333333,12.2492802 L15.4666667,12.2492802 C15.7866667,12.2492802 16,12.4893644 16,12.8494907 C16,13.2096171 15.7866667,13.4497013 15.4666667,13.4497013 Z'
            ).style('fill', this.eleData.fillColorWhite)
        })
        //子meeting
        this.eleData.meetPosInPro.forEach((value) => {
          let gMeetInPro = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gMeetInPro.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          let gMeetInProG = gMeetInPro.append('g')
            .attr('transform', 'translate(7.000000, 5.000000)')
            .style('fill', this.eleData.fillColorWhite)
          gMeetInProG.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M1.99703014,3 C1.4463856,3 1,3.45163472 1,4.00089576 L1,9.88333333 C1,9.94773333 1.04370732,10 1.09756098,10 L8.90243902,10 C8.95629268,10 9,9.94773333 9,9.88333333 L9,4.00089576 C9,3.4481163 8.54696369,3 8.00296986,3 L1.99703014,3 Z M2.5,6 C2.77614237,6 3,5.77614237 3,5.5 C3,5.22385763 2.77614237,5 2.5,5 C2.22385763,5 2,5.22385763 2,5.5 C2,5.77614237 2.22385763,6 2.5,6 Z M7.64590164,6 L5.39344262,6 C5.15737705,6 5,5.8 5,5.5 C5,5.2 5.15737705,5 5.39344262,5 L7.60655738,5 C7.84262295,5 8,5.2 8,5.5 C8,5.8 7.84262295,6 7.64590164,6 Z M2.5,8 C2.77614237,8 3,7.77614237 3,7.5 C3,7.22385763 2.77614237,7 2.5,7 C2.22385763,7 2,7.22385763 2,7.5 C2,7.77614237 2.22385763,8 2.5,8 Z M7.64590164,8 L5.39344262,8 C5.15737705,8 5,7.8 5,7.5 C5,7.2 5.15737705,7 5.39344262,7 L7.60655738,7 C7.84262295,7 8,7.2 8,7.5 C8,7.8 7.84262295,8 7.64590164,8 Z'
            )
          gMeetInProG.append('path')
            .attr('d',
              'M5.75,1.75 L5,1.75 C4.58578644,1.75 4.25,1.41974068 4.25,1.00527382 L4.25,0.494726181 C4.25,0.0834252685 4.59182353,-0.25 5.00416924,-0.25 L5.72379913,-0.25 L5.75,1.75 Z'
            ).attr('transform', 'translate(5.000000, 0.750000) rotate(90.000000) translate(-5.000000, -0.750000)')
          gMeetInProG.append('path')
            .attr('d',
              'M9.68141593,1.86512181 L0.353982301,1.86512181 C0.14159292,1.86512181 -4.4408921e-15,1.69209745 -4.4408921e-15,1.4325609 C-4.4408921e-15,1.17302436 0.14159292,1 0.353982301,1 L9.6460177,1 C9.85840708,1 10,1.17302436 10,1.4325609 C10,1.69209745 9.85840708,1.86512181 9.68141593,1.86512181 Z'
            )
          gMeetInProG.append('path')
            .attr('d',
              'M10.1401257,12.0674065 L5.91828268,12.0674065 C5.6725489,12.0674065 5.50872637,11.8943821 5.50872637,11.6348456 C5.50872637,11.375309 5.6725489,11.2022847 5.91828268,11.2022847 L10.0991701,11.2022847 C10.3449038,11.2022847 10.5087264,11.375309 10.5087264,11.6348456 C10.5087264,11.8943821 10.3449038,12.0674065 10.1401257,12.0674065 Z'
            ).attr('transform', 'translate(8.008726, 11.702285) rotate(75.000000) translate(-8.008726, -11.702285)')
          gMeetInProG.append('path')
            .attr('d',
              'M4.14012569,12.0674065 L-0.0817173164,12.0674065 C-0.327451105,12.0674065 -0.49127363,11.8943821 -0.49127363,11.6348456 C-0.49127363,11.375309 -0.327451105,11.2022847 -0.0817173164,11.2022847 L4.09917006,11.2022847 C4.34490384,11.2022847 4.50872637,11.375309 4.50872637,11.6348456 C4.50872637,11.8943821 4.34490384,12.0674065 4.14012569,12.0674065 Z'
            ).attr('transform', 'translate(2.008726, 11.702285) scale(-1, 1) rotate(75.000000) translate(-2.008726, -11.702285)')
        })
        //子assignment
        this.eleData.assignPosInPro.forEach((value) => {
          let gAssign = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gAssign.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          gAssign.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M11.9997857,12.0427101 C13.222621,12.0427101 14.2027464,10.6030164 14.2027464,9.32112979 C14.2027464,8.03924322 13.2113355,7 11.9885002,7 C10.7656649,7 9.77425403,8.03924322 9.77425403,9.32112979 C9.77439689,10.6030164 10.7769504,12.0427101 11.9997857,12.0427101 Z M12.8194854,13.0689016 L11.1728005,13.0689016 C9.42054606,13.0689016 8,14.5416696 8,16.3585283 L8.00757129,16.7475586 C8.00757129,17.2550925 8.40442135,17.6666667 8.89412689,17.6666667 L15.1134444,17.6666667 C15.6030071,17.6666667 16,17.2550925 16,16.7475586 L15.9924287,16.3585283 C15.9922859,14.5416696 14.5718826,13.0689016 12.8194854,13.0689016 Z'
            ).style('fill', this.eleData.fillColorWhite)

        })
        //子task
        this.eleData.taskPosInPro.forEach((value) => {
          let gTask = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gTask.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          gTask.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M16.436649,7.14257955 C15.9044792,6.84267829 15.2302701,7.03127908 14.9306104,7.56388133 L10.6374655,14.3385098 L8.65575108,12.9843041 C8.12046502,12.6862029 7.44585381,12.9000038 7.1442842,13.4000059 C6.8427146,13.900008 7.02868252,14.603211 7.5640691,14.9012122 C7.5640691,14.9012122 10.3471545,16.8178203 10.4174202,16.8574204 C10.94959,17.1573217 11.6237992,16.9687209 11.9234588,16.4361187 L16.8575397,8.6497859 C17.1571994,8.11728366 16.9687184,7.44248081 16.436649,7.14257955 Z'
            ).style('fill', this.eleData.fillColorWhite)

        })

      }

      // 完成条
      if (this.eleData.doneProgressTime !== '') {

        text = this.eleData.doneProgressTime;
        if (this.eleData.type === MissionConstant.MISSION_TYPE_APPLICATION) { //application
          g.append('rect').attr('class', 'm-simple-end-bg')
            .attr('x', this.eleData.svgPostion + '%').attr('y', startY)
            .attr('width', doneWidth).attr('height', height).attr('rx', 12)
            .attr('style', 'fill:' + this.eleData.fillColorDone);
          /*g.append('text').attr('class', 'm-simple-text')
            .attr('x', textStart)
            .attr('y', '37').text(text)
            .attr('transform', `translate(${txtTranslate},0)`)
            .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
              this.d3.select(capture[listener]).raise()
                .style('fill', 'red');
            })
            .on('mouseleave', (typenames: any, listener: any, capture: any) => {
              this.d3.select(capture[listener]).raise()
                .style('fill', this.eleData.fillColorWhite);
            });*/
          // application图标
          this.eleData.applicationPos.forEach((value, index, array) => {
            let tipTextTime;
            let tipTextUser;
            let gApplication = g.append('svg')
            // .attr('transform', 'translate(50,52)')
              .attr('transform', 'translate(50,0)')
              .attr('x', `${value}%`)
              .attr('y', startY)
              .attr('style', 'cursor:pointer')
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                tipTextTime = g.append('text')
                  .attr('x', this.eleData.svgPostion + '%').attr('y', 9)
                  .attr('style', 'fill: #666')
                  .attr('transform', 'translate(100,0)')
                  .text(`approve time: ${this.dateService.formatWithTimezone(this.eleData.detail.approve_time[index].time)}`)
                tipTextUser = g.insert('text')
                  .attr('x', this.eleData.svgPostion + '%').attr('y', 20)
                  .attr('style', 'fill: #666')
                  .attr('transform', 'translate(100,0)')
                  .text(`approve user: ${this.eleData.detail.approve_time[index].user_info.psid == '0' ? 'System' : this.eleData.detail.approve_time[index].user_info.name}`)
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any, event: any) => {
                tipTextTime.remove();
                tipTextUser.remove();
              });
            gApplication.append('circle')
              .attr('cx', 12).attr('cy', 12)
              .attr('r', 12)
              .style('fill', this.eleData.fillColorDoneAppli);
            gApplication.append('path')
              .attr('d',
                'M6,17.2223653 L18,17.2223653 L18,18 L6,18 L6,17.2223653 Z M13.125,11.5767373 L13.125,9.50822892 C13.125,8.88612114 13.35,8.29511876 13.74,7.81298524 C14.085,7.3775098 14.28,6.8176128 14.25,6.21105773 C14.19,5.02905296 13.245,4.06478591 12.105,4.00257514 C10.815,3.94036436 9.75,5.01350027 9.75,6.33547928 C9.75,6.91092897 9.96,7.45527327 10.305,7.85964332 C10.68,8.31067146 10.875,8.90167384 10.875,9.50822892 L10.875,11.5611846 C10.875,12.0277654 10.515,12.3854774 10.08,12.3854774 L7.755,12.3854774 C6.78,12.4010301 6,13.2097702 6,14.2051426 L6,17.0668383 L18,17.0668383 L18,14.2051426 C18,13.2097702 17.22,12.4010301 16.26,12.4010301 L13.92,12.4010301 C13.485,12.4010301 13.125,12.0277654 13.125,11.5767373 Z'
              ).style(
              'fill', this.eleData.fillColorWhite
            )
          })
        } else {
          //project类型要加点击事件
          if (this.eleData.type === MissionConstant.MISSION_TYPE_PROJECT) {
            g.append('rect').attr('class', 'm-simple-end-bg')
              .attr('x', this.eleData.svgPostion + '%').attr('y', startY)
              .attr('width', doneWidth).attr('height', height).attr('rx', 12)
              .attr('style', 'fill:' + this.eleData.fillColorDone)
              .style('cursor', 'pointer')
              //project 加点击事件
              .on("click", () => {
                this.sendChildMission.emit(this.eleData);
                // this.sendChildMission.emit(this.eleData.detail.internal);
              }, false)
            g.append('text').attr('class', 'm-simple-text')
              .attr('x', textStart)
              .attr('y', '37').text(text)
              .attr('transform', `translate(${txtTranslate},0)`)
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', 'red');
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', this.eleData.fillColorWhite);
              });
          } else {
            g.append('rect').attr('class', 'm-simple-end-bg')
              .attr('x', this.eleData.svgPostion + '%').attr('y', startY)
              .attr('width', doneWidth).attr('height', height).attr('rx', 12)
              .attr('style', 'fill:' + this.eleData.fillColorDone)
            g.append('text').attr('class', 'm-simple-text')
              .attr('x', textStart)
              .attr('y', '37').text(text)
              .attr('transform', `translate(${txtTranslate},0)`)
              .on('mouseenter', (typenames: any, listener: any, capture: any, event: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', 'red')
              })
              .on('mouseleave', (typenames: any, listener: any, capture: any) => {
                this.d3.select(capture[listener]).raise()
                  .style('fill', this.eleData.fillColorWhite);
              });

          }

          if (this.eleData.type === MissionConstant.MISSION_TYPE_MEETING) {
            let gMeeting = g.append('svg')
              .attr('x', startX).attr('y', startY)
            gMeeting.append('path')
              .attr('d',
                'M7.52255798,9.48586433 C8.50621606,9.48586433 9.30348176,8.70582057 9.30348176,7.74301969 C9.30348176,6.78039387 8.50621606,6 7.52255798,6 C6.53889989,6 5.74163419,6.78004376 5.74163419,7.74301969 C5.74163419,8.70582057 6.53943653,9.48586433 7.52255798,9.48586433 Z M11.3546924,14.4470897 C10.2672842,13.7645514 9.69612215,12.8518162 9.26001405,11.8636324 C9.04178113,10.7215755 8.383147,9.85645514 7.1524564,9.85645514 C5.76274197,9.85645514 5,10.9585996 5,12.3184245 L5,17.9991247 L9.30437616,17.9991247 L9.30437616,15.1175492 C9.61276433,15.4102407 9.96354692,15.6884026 10.3728231,15.9450328 C10.5248706,16.0407877 10.6944483,16.086302 10.8629528,16.086302 C11.1620392,16.086302 11.4555804,15.9417068 11.6289146,15.6764989 C11.9000958,15.2624945 11.7772056,14.7128228 11.3546924,14.4470897 Z M16.4781575,9.48586433 C17.4611001,9.48586433 18.2581869,8.70582057 18.2581869,7.74301969 C18.2581869,6.78039387 17.4611001,6 16.4781575,6 C15.4948572,6 14.6972338,6.78004376 14.6972338,7.74301969 C14.6963394,8.70582057 15.4943206,9.48586433 16.4781575,9.48586433 Z M16.848438,9.85680525 C15.6172108,9.85680525 14.9589344,10.7215755 14.7412381,11.8641575 C14.3044145,12.8523414 13.7327158,13.7643764 12.6458442,14.4472648 C12.2226155,14.713523 12.1000831,15.2635449 12.3703699,15.6773742 C12.5445985,15.9422319 12.8374241,16.0868271 13.1370472,16.0868271 C13.3057305,16.0868271 13.4751294,16.041488 13.6277135,15.9459081 C14.0355587,15.6891028 14.3870568,15.411116 14.6963394,15.1185996 L14.6963394,18 L19,18 L19,12.3192998 C19,10.9591247 18.2377947,9.85680525 16.848438,9.85680525 Z'
              )
              .style('fill', this.eleData.fillColorWhite)
          }
        }
        //绘制tracking
        if (this.eleData.showTracking) {
          let gTracking = g.append('svg')
            .attr('x', startX)
            .attr('y', 52)
            .style('cursor', 'pointer')
          let aTrackingG = gTracking.append('g')
            .attr('transform', `translate(${trackingPos},0)`)
          aTrackingG.append('rect')
            .attr('x', 0).attr('y', 0)
            .attr('width', 24).attr('height', 24)
            .attr('rx', 12)
            .style('fill', this.eleData.fillColorLink)
          aTrackingG.append('path')
            .attr('d',
              'M12,6 C9.24576271,6 7,8.20942928 7,10.9191067 C7,13.0868486 10.0932203,16.1240695 11.4067797,17.7081886 C11.5338983,17.874938 11.7881356,18 12,18 C12.2118644,18 12.4661017,17.9166253 12.5932203,17.7081886 C13.9067797,16.1240695 17,13.0868486 17,10.9191067 C17,8.20942928 14.7542373,6 12,6 Z M15.1446731,10.5439206 C15.1446731,12.2626964 13.7470406,13.6377171 12,13.6377171 C10.2529594,13.6377171 8.85532688,12.2626964 8.85532688,10.5439206 C8.85532688,8.82514475 10.2529594,7.45012407 12,7.45012407 C13.7470406,7.45012407 15.1446731,8.82514475 15.1446731,10.5439206 Z'
            )
            .style('fill', this.eleData.fillColorWhite)
        }

        if (this.eleData.showLink_info) {
          // link图标 使用svg包住
          let gLink = g.append('svg')
            .attr('x', linkPos)
            .attr('y', 52)
            .style('cursor', 'pointer')
            .on('click', () => {
              this.transportLinkInfo.emit(this.eleData)
            });
          gLink.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorLink);
          gLink.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M10.4077697,14.4115922 L9.1674501,15.602189 C8.79886596,15.9559971 8.19951097,15.9558554 7.83122194,15.6023306 L6.45618769,14.2824197 C6.08789865,13.9287533 6.08789865,13.353284 6.45618769,12.9996176 L9.57793891,10.0032966 C9.94608039,9.64963015 10.5454354,9.64991342 10.913872,10.0032966 L12.2889062,11.3232075 C12.5580405,11.5816942 12.639489,11.9675121 12.4963639,12.3060234 C12.3737484,12.5959534 12.5192344,12.9263915 12.8212727,13.0439498 C13.1227209,13.1616498 13.4674016,13.0219962 13.5900171,12.7320662 C13.9121224,11.9706281 13.7288632,11.1031043 13.1234586,10.5219696 L11.7484244,9.20191705 C10.9196265,8.40662788 9.57144664,8.40662788 8.74323897,9.20205869 L5.62148774,12.1985213 C4.79283742,12.9938105 4.79283742,14.2882268 5.62148774,15.083516 L6.996522,16.4034269 C7.41084716,16.8011423 7.95487026,17 8.49918847,17 C9.04350667,17 9.58767733,16.8011423 10.0020025,16.4034269 L11.242322,15.2126885 C11.4729453,14.9913106 11.4729453,14.6326869 11.242322,14.4115922 C11.0118463,14.190356 10.6380978,14.190356 10.4077697,14.4115922 Z M18.3785123,8.91637779 L17.003478,7.59646688 C16.1749752,6.80117771 14.8266478,6.80117771 13.9981451,7.59646688 L12.7578255,8.78720526 C12.5272022,9.00858317 12.5272022,9.36720689 12.7578255,9.58830153 C12.9884488,9.80967944 13.3621973,9.80967944 13.5923779,9.58830153 L14.8326975,8.39770478 C15.2012816,8.0438967 15.8006366,8.04403834 16.1689256,8.39756314 L17.5439599,9.71747405 C17.9122489,10.0711405 17.9122489,10.6466098 17.5439599,11.0002762 L14.4223562,13.9965972 C14.0540672,14.350122 13.4547122,14.350122 13.086128,13.9965972 L11.7110938,12.6766863 C11.4419595,12.4181996 11.360511,12.0323817 11.5036361,11.6938703 C11.6262516,11.4039403 11.4807656,11.0735023 11.1787273,10.955944 C10.8766889,10.8381024 10.5325984,10.977756 10.4099829,11.2678276 C10.0878776,12.0292656 10.2711368,12.8967895 10.8765414,13.4779242 L12.2515756,14.7979767 C12.6660484,15.1955505 13.2100715,15.3944082 13.7543897,15.3944082 C14.2987079,15.3944082 14.842731,15.1955505 15.2570561,14.7978351 L18.3785123,11.8015141 C19.2071626,11.0059417 19.2071626,9.71166696 18.3785123,8.91637779 Z'
            ).style('fill', this.eleData.fillColorWhite)
        }

        //绘制project的图标
        //子appli
        this.eleData.appliPosInPro.forEach((value) => {
          // value =
          //   value === parseFloat(startX)? value+1 : value;
          //application
          let gAppliInPro = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gAppliInPro.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          gAppliInPro.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M14.0447552,7.20042111 L10.0447552,7.20042111 C9.64475524,7.20042111 9.37808858,6.96033689 9.37808858,6.60021056 C9.37808858,6.24008422 9.64475524,6 10.0447552,6 L14.0447552,6 C14.4447552,6 14.7114219,6.24008422 14.7114219,6.60021056 C14.7114219,6.96033689 14.4447552,7.20042111 14.0447552,7.20042111 Z M15.4666667,19 L8.53333333,19 C8.21333333,19 8,18.7599158 8,18.3997894 C8,18.0396631 8.21333333,17.7995789 8.53333333,17.7995789 L15.4666667,17.7995789 C15.7866667,17.7995789 16,18.0396631 16,18.3997894 C16,18.7599158 15.7866667,19 15.4666667,19 Z M15.4666667,16.2248506 L8.53333333,16.2248506 C8.21333333,16.2248506 8,15.9847664 8,15.6246401 C8,15.2645138 8.21333333,15.0244295 8.53333333,15.0244295 L15.4666667,15.0244295 C15.7866667,15.0244295 16,15.2645138 16,15.6246401 C16,15.9847664 15.7866667,16.2248506 15.4666667,16.2248506 Z M15.4666667,13.4497013 L8.53333333,13.4497013 C8.21333333,13.4497013 8,13.2096171 8,12.8494907 C8,12.4893644 8.21333333,12.2492802 8.53333333,12.2492802 L15.4666667,12.2492802 C15.7866667,12.2492802 16,12.4893644 16,12.8494907 C16,13.2096171 15.7866667,13.4497013 15.4666667,13.4497013 Z'
            ).style('fill', this.eleData.fillColorWhite)
        })
        //子meeting
        this.eleData.meetPosInPro.forEach((value) => {
          let gMeetInPro = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gMeetInPro.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          let gMeetInProG = gMeetInPro.append('g')
            .attr('transform', 'translate(7.000000, 5.000000)')
            .style('fill', this.eleData.fillColorWhite)
          gMeetInProG.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M1.99703014,3 C1.4463856,3 1,3.45163472 1,4.00089576 L1,9.88333333 C1,9.94773333 1.04370732,10 1.09756098,10 L8.90243902,10 C8.95629268,10 9,9.94773333 9,9.88333333 L9,4.00089576 C9,3.4481163 8.54696369,3 8.00296986,3 L1.99703014,3 Z M2.5,6 C2.77614237,6 3,5.77614237 3,5.5 C3,5.22385763 2.77614237,5 2.5,5 C2.22385763,5 2,5.22385763 2,5.5 C2,5.77614237 2.22385763,6 2.5,6 Z M7.64590164,6 L5.39344262,6 C5.15737705,6 5,5.8 5,5.5 C5,5.2 5.15737705,5 5.39344262,5 L7.60655738,5 C7.84262295,5 8,5.2 8,5.5 C8,5.8 7.84262295,6 7.64590164,6 Z M2.5,8 C2.77614237,8 3,7.77614237 3,7.5 C3,7.22385763 2.77614237,7 2.5,7 C2.22385763,7 2,7.22385763 2,7.5 C2,7.77614237 2.22385763,8 2.5,8 Z M7.64590164,8 L5.39344262,8 C5.15737705,8 5,7.8 5,7.5 C5,7.2 5.15737705,7 5.39344262,7 L7.60655738,7 C7.84262295,7 8,7.2 8,7.5 C8,7.8 7.84262295,8 7.64590164,8 Z'
            )
          gMeetInProG.append('path')
            .attr('d',
              'M5.75,1.75 L5,1.75 C4.58578644,1.75 4.25,1.41974068 4.25,1.00527382 L4.25,0.494726181 C4.25,0.0834252685 4.59182353,-0.25 5.00416924,-0.25 L5.72379913,-0.25 L5.75,1.75 Z'
            ).attr('transform', 'translate(5.000000, 0.750000) rotate(90.000000) translate(-5.000000, -0.750000)')
          gMeetInProG.append('path')
            .attr('d',
              'M9.68141593,1.86512181 L0.353982301,1.86512181 C0.14159292,1.86512181 -4.4408921e-15,1.69209745 -4.4408921e-15,1.4325609 C-4.4408921e-15,1.17302436 0.14159292,1 0.353982301,1 L9.6460177,1 C9.85840708,1 10,1.17302436 10,1.4325609 C10,1.69209745 9.85840708,1.86512181 9.68141593,1.86512181 Z'
            )
          gMeetInProG.append('path')
            .attr('d',
              'M10.1401257,12.0674065 L5.91828268,12.0674065 C5.6725489,12.0674065 5.50872637,11.8943821 5.50872637,11.6348456 C5.50872637,11.375309 5.6725489,11.2022847 5.91828268,11.2022847 L10.0991701,11.2022847 C10.3449038,11.2022847 10.5087264,11.375309 10.5087264,11.6348456 C10.5087264,11.8943821 10.3449038,12.0674065 10.1401257,12.0674065 Z'
            ).attr('transform', 'translate(8.008726, 11.702285) rotate(75.000000) translate(-8.008726, -11.702285)')
          gMeetInProG.append('path')
            .attr('d',
              'M4.14012569,12.0674065 L-0.0817173164,12.0674065 C-0.327451105,12.0674065 -0.49127363,11.8943821 -0.49127363,11.6348456 C-0.49127363,11.375309 -0.327451105,11.2022847 -0.0817173164,11.2022847 L4.09917006,11.2022847 C4.34490384,11.2022847 4.50872637,11.375309 4.50872637,11.6348456 C4.50872637,11.8943821 4.34490384,12.0674065 4.14012569,12.0674065 Z'
            ).attr('transform', 'translate(2.008726, 11.702285) scale(-1, 1) rotate(75.000000) translate(-2.008726, -11.702285)')
        })
        //子assignment
        this.eleData.assignPosInPro.forEach((value) => {
          let gAssign = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gAssign.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          gAssign.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M11.9997857,12.0427101 C13.222621,12.0427101 14.2027464,10.6030164 14.2027464,9.32112979 C14.2027464,8.03924322 13.2113355,7 11.9885002,7 C10.7656649,7 9.77425403,8.03924322 9.77425403,9.32112979 C9.77439689,10.6030164 10.7769504,12.0427101 11.9997857,12.0427101 Z M12.8194854,13.0689016 L11.1728005,13.0689016 C9.42054606,13.0689016 8,14.5416696 8,16.3585283 L8.00757129,16.7475586 C8.00757129,17.2550925 8.40442135,17.6666667 8.89412689,17.6666667 L15.1134444,17.6666667 C15.6030071,17.6666667 16,17.2550925 16,16.7475586 L15.9924287,16.3585283 C15.9922859,14.5416696 14.5718826,13.0689016 12.8194854,13.0689016 Z'
            ).style('fill', this.eleData.fillColorWhite)

        })
        //子task
        this.eleData.taskPosInPro.forEach((value) => {
          let gTask = g.append('svg')
            .attr('x', `${value}%`)
            .attr('y', 52)
          gTask.append('circle')
            .attr('cx', 12)
            .attr('cy', 12)
            .attr('r', 12).style('fill', this.eleData.fillColorProAppli)
            .style('stroke', this.eleData.fillColorWhite)
          gTask.append('path')
            .attr('x', 190).attr('y', 0)
            .attr('d',
              'M16.436649,7.14257955 C15.9044792,6.84267829 15.2302701,7.03127908 14.9306104,7.56388133 L10.6374655,14.3385098 L8.65575108,12.9843041 C8.12046502,12.6862029 7.44585381,12.9000038 7.1442842,13.4000059 C6.8427146,13.900008 7.02868252,14.603211 7.5640691,14.9012122 C7.5640691,14.9012122 10.3471545,16.8178203 10.4174202,16.8574204 C10.94959,17.1573217 11.6237992,16.9687209 11.9234588,16.4361187 L16.8575397,8.6497859 C17.1571994,8.11728366 16.9687184,7.44248081 16.436649,7.14257955 Z'
            ).style('fill', this.eleData.fillColorWhite)

        })

      }
      // 同时存在进行中和未完成条
      if (this.eleData.doingProgressTime !== '' && this.eleData.todoProgressTime !== '') {
        //todo的文字要隐藏

      }
      // g.append('text').attr('class', 'm-simple-text')
      //     .attr('x', '90')
      //     .attr('y', '37').text(text);
      // 如果是Application, 同意人时间节点条
      this.eleData.hasDrawed = true;
    }


  }
}
