import {
  Component,
  OnInit,
  Inject, Output, EventEmitter, OnDestroy, ViewChild, Input
} from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import {
  UserModelService,
  WorkflowList,
  Workflow,
  WorkflowModelService
} from '../../shared/services/index.service';
import { Subscription } from "rxjs/Subscription";
import { SearchListComponent } from '../../shared/components/search/search-list.component';

//import * as _ from 'lodash';

@Component({
  selector: 'workflow-menu',
  templateUrl: '../template/workflow-menu.component.html',
  providers: []
})


export class WorkflowMenuComponent implements OnInit, OnDestroy {

  public toggleIn: any = {
    removeToggleClass: 'wo-left-top-hide',
    toggleClass: 'wo-left-top-hide'
  };

  public searchParam: any;

  public _currentId: string;
  public _currentIds: string;
  public workflowListData: WorkflowList[] = [];


  @Output() outCurrentId = new EventEmitter<any>();
  @Output() outCreateNew = new EventEmitter<any>();


  @Input() set currentId(data: any) {
    this._currentId = data;
  }

  get currentId() {
    return this._currentId;
  }

  @Input() set currentIds(data: any) {
    this._currentIds = data;
  }

  get currentIds() {
    return this._currentIds;
  }

  @ViewChild('searchList') searchListComponent: SearchListComponent;

  constructor(@Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              public workflowModelService: WorkflowModelService,
              public router: Router,
              public activatedRoute: ActivatedRoute) {

    this.workflowModelService.getWorkflowList(null, (response: any) => {
      this.workflowListData = this.workflowModelService.dealResult(response);
      this.searchParam = {
        name: 'name',
        val: '',
        data: response.data,
        callBack: (data: any) => {
          delete data.val;
          this.workflowListData = this.workflowModelService.dealResult({data: data});
        }
      };
    });
  }

  ngOnDestroy(): void {

  }

  ngOnInit() {
  }

  isCurrent(element: Workflow) {
    element.isCurrent = this.currentId === element.cid;
    return element.isCurrent;
  }

  /**
   * 点击创建按钮
   * @param event
   */
  createWorkflow(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.outCreateNew.emit();
  }

  /**
   * 点击删除按钮
   */
  deleteWorkflow(event: any, data: any) {
    event.stopPropagation();
    this.dialogService.openConfirm({simpleContent: 'Confirm to delete this workflow?'}, () => {
      this.workflowModelService.deleteWorkflow({id: data.cid}, (response: any) => {
        if (response.status === 1) {
          this.refreshMenu();
          if (data.cid === this.currentId) {
            this.dialogService.openSuccess({
              simpleContent: 'Success to delete the workflow',
            }, () => {
              this.router.navigate(['workflow']);
            })
          } else {
            this.dialogService.openSuccess({
              simpleContent: 'Success to delete the workflow',
            })
          }
        }
      });
    })
  }

  /**
   *
   * @param event
   * @param wk
   */
  showWorkflowDetail(event: any, wk: Workflow) {
    event.stopPropagation();
    this.outCurrentId.emit(wk.cid);
  }

  dealMessage(message: any) {
  }

  refreshMenu() {
    this.workflowModelService.getWorkflowList(null, (response: any) => {
      this.workflowListData = this.workflowModelService.dealResult(response);
      //主动搜索，解决刷新后无结果的情况
      this.searchListComponent.searchContactsImport(this.searchListComponent.searchContacts.nativeElement.value);
    });
  }


}
