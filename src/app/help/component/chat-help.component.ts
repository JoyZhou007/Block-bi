import {Component, Input, OnInit, Inject, ViewEncapsulation, ElementRef,} from "@angular/core";
let introInit = require('intro.js');
import {ActivatedRoute, Router} from '@angular/router';
import {Renderer} from "@angular/core";

@Component({
  selector: 'chat-help-dialog',
  templateUrl: '../template/chat-help.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class ChatHelpComponent {

  public isShowSearch: boolean;

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public renderer: Renderer,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('type.service') public typeService: any) {
  }


  ngOnInit(): void {
    this.showChatHelpIntro();
  }


  /**
   * 显示help
   */
  showChatHelpIntro() {
    let intro = introInit.introJs();
    const totalHelpStepCount: number = 10;
    let totalHelpStep: Array<any> = [];
    for (let i = 1; i < totalHelpStepCount + 1; i++) {
      let steps: any = {
        element: '#step_chat_' + i.toString(),
        intro: this.getHelpHtml('HELP_CHAT_' + i.toString())
      };
      totalHelpStep.push(steps);
    }
    intro.setOptions({
      prevLabel: '<em class="icon1-help-arrow"></em><i class="base">' + this.translateService.manualTranslate('Previous') + '</i>',
      nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">' + this.translateService.manualTranslate('Next1') + '</i>',
      exitOnEsc: true,
      hidePrev: false,
      hideNext: true,
      exitOnOverlayClick: true,
      showProgress: true,
      showBullets: true,
      showStepNumbers: false,
      disableInteraction: true,
      tooltipClass: 'help-wrap help-no-padding show-btn',
      steps: totalHelpStep
    });
    intro.start();
    intro.onchange((targetElement: any) => {
      if (targetElement.getAttribute('data-step') == 'step_chat_9') {
        this.isShowSearch = true
      } else {
        this.isShowSearch = false;
      }
      if (!targetElement.getAttribute('data-step')) {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
      } else {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding')
      }
    });

    intro.onexit(() => {
      let queryParams = this.activatedRoute['queryParams']['value']['path'];
      let a: number = queryParams.indexOf('?');
      if (a == -1) {
        this.router.navigate([queryParams]);
      } else {
        let param: string = queryParams.substring(0, a);
        let queryParam: string = queryParams.substring(a + 1, queryParams.length);
        let routerObj: any = {
          queryParams: {}
        };
        let b = queryParam.split('&');
        for (let i in b) {
          let c = b[i].split('=');
          routerObj.queryParams[c[0]] = c[1];
        }
        this.router.navigate([param], routerObj);
      }


      // this.router.navigate(['/user/index']);
      this.renderer.setElementClass(document.getElementsByTagName('body')[0], 'body-help', false);
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG,
      });
    })
  }


  /**
   * 获取帮助html
   */
  getHelpHtml(param: string) {
    let helpHtml = '<h3 class="f53-f help-title help-title2">' + this.translateService.manualTranslate("tutorial") +
      '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
      '<em>esc </em>' + this.translateService.manualTranslate('to cancel') + '</span></h3><div class="help-line"></div>' +
      '<div class="help-click">' + this.translateService.manualTranslate(param) + '</div>';
    return helpHtml;
  }


}