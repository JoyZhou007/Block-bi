import {Component, Input, OnInit, Inject, ViewEncapsulation, ElementRef,} from "@angular/core";
let introInit = require('intro.js');
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'help-post-dialog',
  templateUrl: '../template/post-help.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class ChatPostHelpComponent {

  public isShowSearch: boolean;

  constructor(public router: Router,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any) {
  }


  ngOnInit(): void {
    this.showPostHelpIntro();
  }


  /**
   * 显示help
   */
  showPostHelpIntro() {
    let intro = introInit.introJs();
    if (this.translateService.lan == 'zh-cn') {
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
        disableInteraction: false,
        tooltipClass: 'help-wrap help-no-padding show-btn',
        steps: [
          {
            element: '#step_post_1',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">设置邮件的名称</div>'
          },
          {
            element: '#step_post_2',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">邮件的基本信息包括发送的人员以及附件</div>'
          },
          {
            element: '#step_post_3',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">可以保存邮件或调用邮件</div>'
          },
          {
            element: '#step_post_4',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">从本地设备上传文件</div>'
          },
          {
            element: '#step_post_5',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">从bi 分享文件夹里导入</div>'
          },
          {
            element: '#step_post_6',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">设备邮件的分享人</div>'
          },
          {
            element: '#step_post_7',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">邮件的编写区域</div>'
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
        disableInteraction: false,
        tooltipClass: 'help-wrap help-no-padding show-btn',
        steps: [
          {
            element: '#step_post_1',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Subject</div>'
          },
          {
            element: '#step_post_2',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Including receiver & attachment</div>'
          },
          {
            element: '#step_post_3',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Save as a draft</div>'
          },
          {
            element: '#step_post_4',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Upload from local device</div>'
          },
          {
            element: '#step_post_5',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Import from BI`s folder</div>'
          },
          {
            element: '#step_post_6',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Share to</div>'
          },
          {
            element: '#step_post_7',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Input area</div>',
            position: 'right'
          },
          {
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Still confused? You can replay this tutorial or contact xxxxxxxxxxxxx for more help!</div>',
          },
        ]
      });
    }
    intro.start();
    intro.onchange((targetElement: any) => {
      if (targetElement.getAttribute('data-step') == 'step_post_7') {
       intro.setOption('disableInteraction', false);
      }else {
        intro.setOption('disableInteraction', true);
      }
      if (!targetElement.getAttribute('data-step')) {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
      } else  if(targetElement.getAttribute('data-step') == 'step_post_7'){
        intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-disable')
      }else {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding')
      }
    });

    intro.onexit(() => {
      this.router.navigate(['/user/index']);
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG,
      });

    })

  }


}