import {
  Component,
  OnInit,
  ViewEncapsulation, Renderer,
  Inject, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import {UserModelService} from '../../shared/services/index.service';
import {WorkflowCreateComponent} from "./workflow-create.component";
import {WorkflowMenuComponent} from "./workflow-menu.component";
import {WorkflowEntiretyComponent} from "./workflow-entirety.component";
import {WorkflowUserComponent} from "./workflow-user.component";
import {ActivatedRoute, Router, Params} from "@angular/router";
import { Subscription } from "rxjs/Subscription";
let introInit = require('intro.js');
//import {WorkflowContactComponent} from "./workflow-contact.component";


@Component({
  selector: 'workflow',
  templateUrl: '../template/workflow.component.html',
  styleUrls: [
    '../../../assets/css/workflow/workflow.css'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [UserModelService]
})

export class WorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  //@ViewChild('inputDate') inputDate : any;
  @ViewChild('workflowMenu') public workflowMenu: WorkflowMenuComponent;
  @ViewChild('workflowCreate') public workflowCreate: WorkflowCreateComponent;
  @ViewChild('workflowEntirety') public workflowEntirety: WorkflowEntiretyComponent;
  @ViewChild('workflowUser') public workflowUser: WorkflowUserComponent;
  //@ViewChild('workflowContact') public workflowContact: WorkflowContactComponent;
  public _currentId: any;
  public _currentIds: any;
  public subscription: Subscription;
  public interval;
  public IMHasInit: any;
  public concurrencyUserArr: Array<any> = [];

  constructor(@Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('im.service') public IMService: any,
              @Inject('user.service') public userService: any,
              public activatedRoute: ActivatedRoute,
              public renderer: Renderer,
              public router: Router) {
    //绑定路由，绘制详情
    this.activatedRoute.params.subscribe((param: Params) => {
      if (param.hasOwnProperty('id')) {

        let ids = param['id'] ? param['id'].split('-') : '';
        let id = '';
        if (ids.length > 1) {
          id = ids.shift();
        } else {
          id = param['id'];
        }
        this._currentId = id;
        this._currentIds = param['id'];
        this.setHeartBeatOfConcurrency();
      }
    });
    if (!this.userDataService.getCurrentCompanyPSID()) {
      this.dialogService.openNoAccess();
    }

    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      //IM登录后同步在线编辑人员
      if (message.act && message.act == this.notificationService.config.ACT_SYSTEM_IM_LOGIN) {
        this.setHeartBeatOfConcurrency();
      }
      //在线用户变更通知
      if (message.act && message.act == this.notificationService.config.ACT_WORKFLOW_CONCURRENCY_ADD
        && (message.data.hasOwnProperty('sent') || message.data.hasOwnProperty('owner'))) {
        this.initConcurrencyUser(message.data);
      }
      if (message.act && message.act == this.notificationService.config.ACT_WORKFLOW_CONCURRENCY_DELETE
        && (message.data.hasOwnProperty('sent') || message.data.hasOwnProperty('owner'))) {
        this.initConcurrencyUser(message.data);
      }
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy(): void {
    if (this._currentId) {
      console.log('workflow ngOnDestroy', this._currentId);
      this.IMService.sendMessage({
        act: this.notificationService.config.ACT_WORKFLOW_CONCURRENCY_DELETE,
        data: {wid: this._currentId}
      });
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  /**
   * 保持用户在线
   */
  setHeartBeatOfConcurrency(){
    this.IMHasInit = this.IMService.socketLoginStatus;
    if (this.IMHasInit && this._currentId) {
      this.IMService.sendMessage({
        act: this.notificationService.config.ACT_WORKFLOW_CONCURRENCY_ADD,
        data: {wid: this._currentId}
      });
      //定时器. 3分钟发送一次保持用户在线编辑装填
      this.interval = setInterval(() => {
        this.IMService.sendMessage({
          act: this.notificationService.config.ACT_WORKFLOW_CONCURRENCY_HEARTBEAT,
          data: {wid: this._currentId}
        });
      }, 120000)
    }
  }

  /**
   * 通知IM多人同时在线编辑
   */
  initConcurrencyUser(data: any){
    this.concurrencyUserArr = [];
    if (this._currentId) {
      if (data.hasOwnProperty('wid') && data.wid == this._currentId) {
        if (data.hasOwnProperty('psid')) {
          for (let k in data.psid) {
            this.userService.searchUserInfoInContactList(data.psid[k],(result: any) => {
              if (!result.isSelf && result.find) {
                this.concurrencyUserArr.push(result.find);
              }
            });
          }
        }
      }
    }
  }

  /**
   * 确认是否放弃修改
   * @param callback
   */
  confirmDialog(callback: any) {
    this.workflowCreate.confirmLeaveDialog(callback);
  }

  /**
   * 切换
   * @param data
   */
  setCurrentId(data: any) {
    if (typeof data !== 'undefined') {
      let func = () => {
        console.log('old current',  this._currentId);
        console.log('new current', data);
        if (this._currentId) {
          this.IMService.sendMessage({
            act: this.notificationService.config.ACT_WORKFLOW_CONCURRENCY_DELETE,
            data: {wid: this._currentId}
          });
        }
        if (this.interval) {
          clearInterval(this.interval);
        }
        this.router.navigate(['workflow/detail', data]);
      };
      if (this.workflowCreate.hasUnsavedData && data !== this._currentId) {
        this.confirmDialog(func);
      } else {
        func();
      }
    }
  }

  editWorkflow(data: any) {
    this.workflowCreate.openWorkflowForm(data);
  }

  createWorkflow(data: any) {
    this.workflowCreate.openWorkflowForm(data);
  }


  refreshWorkflow(data: any) {
    this.workflowMenu.refreshMenu();
    this.setCurrentId(data[0]);
  }

  redirectToNewWorkflow(data: any) {
    if (data.hasOwnProperty(1) && data[1]) {
      this.workflowMenu.refreshMenu();
    }
    this.setCurrentId(data[0]);
  }

  closeWorkflow() {
    this.router.navigate(['user/index']);
  }

  ngOnInit() {
  }

  dealMessage(message: any) {
  }


  /**
   * showWorkflowHelp
   */
  showWorkflowHelp(event: any) {
    event.stopPropagation();
    this.workflowCreate.isActive = true;
    this.workflowCreate.initCreateData();
    setTimeout(() => {
      this.renderer.setElementClass(document.getElementById('d-select-add'), 'show', true);
    }, 300);
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
              element: '#step_wk_1',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">这里表示当前的流程通道以及流程名称</div>'
            },
            {
              element: '#step_wk_2',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">点击此按钮可以创建新的流程</div>'
            },
            {
              element: '#step_wk_3',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">在点击新建流程后首先需要选择是全新的流程还是作为子流程链接到某个已存在的母流程</div>'
            },
            {
              element: '#step_wk_4',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">建立流程的基本必要信息，流程名称，可申请人和描述等</div>'
            },
            {
              element: '#step-detail-1',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">编辑流程的步骤，增加批复人或部门，设置自动回复的时间以及拒绝后回到的步骤等</div>'
            },
            {
              element: '#d-select-add',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">这插入步骤或删除步骤</div>'
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
              element: '#step_wk_1',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Workflow and specific directory names</div>'
            },
            {
              element: '#step_wk_2',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Click for a new workflow</div>'
            },
            {
              element: '#step_wk_3',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Define this is a new workflow or a sub workflow</div>'
            },
            {
              element: '#step_wk_4',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Required info,name,available approver and description, etc.</div>'
            },
            {
              element: '#step-detail-1',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Define the procedure of workflow,such as add approver, set autoreply and the solution when rejected.</div>'
            },
            {
              element: '#d-select-add',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Insert or delete a procedure</div>'
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
      });
      intro.onafterchange((targetElement) => {
        if (!targetElement.getAttribute('data-step')) {
          intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
        } else {
          intro.setOption('tooltipClass', 'help-wrap help-no-padding')
        }
      });
      intro.onexit(() => {
        // this.workflowCreate.isActive = false;
        this.workflowCreate.resetStatus();
        this.renderer.setElementClass(document.getElementById('d-select-add'), 'show', false);
      })
    }, 1000);
  }


}
