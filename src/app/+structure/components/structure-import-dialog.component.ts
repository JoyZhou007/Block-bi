import {Component, Input, Inject, OnInit, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'structure-import-dialog',
  templateUrl: '../template/structure-import-dialog.component.html',
})
export class StructureImportDialog implements OnInit {
  private ele: any;
  public getViewContainer: ViewContainerRef;
  public helpContent: string = `<div class="help-text-s-wrap help-text-b-wrap g-text-left">
        <span class="font-remove di-close-but"></span>
        <div class="help-text-title">
            <img src="${this.config.staticResourceDomain}assets/images/heads5.png" alt="">
            <span class="f23-f">关于职位等级</span>
        </div>
        <div class="help-text-content f25-f">
            <div>
                <div>
                    为了方便用户快速建立自己的组织构架，我们允许你用规范的excel文档导入，填写案例如下：
                </div>
                <div>
                    请注意部分重要必填信息
                </div>
                <div>1. 你将作为CEO,同时CEO是独立的不属于任何一个部门的</div>
                <div>2. 没有部门或独立操作的员工可以不必填写部门</div>
                <div>3. 员工的工作邮箱和个人手机号码是必填的，否则员工无法收到短信和邮件提示</div>
                <div>4. 某些员工可能已经注册过了，此时如你填写的个人手机和员工注册时相同，系统自己发送雇佣通知，员工只需接受便可</div>
                <div>5. studio只能导入小于20条数据</div>

            </div>

        </div>
    </div>`;
  private subscription: Subscription;
  //上传的文件
  private file: any;

  public isLoading: boolean = false;

  constructor(@Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_COMPONENT_STRUCTURE_IMPORT_FILE:
        if (data.hasOwnProperty('data') && data.data.hasOwnProperty('file')) {
          this.file = data.data.file;
        }
        break;
      case this.notificationService.config.ACT_COMPONENT_STRUCTURE_IMPORT_FILE_COMPLETE:
        this.isLoading = false;
        break;
      default:
        break;
    }
  }

  ngOnInit() {
  }

  @Input('setOption')
  public set setOption(data: any) {
    if (data) {
      this.ele = data.el;
      this.getViewContainer = data.viewContainer;
    }
  }

  /**
   * 点击input
   */
  onClickInput() {
    if (this.ele) {
      this.ele.click();
    }
  }

  public sendData(): void {
    this.isLoading = true;
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_STRUCTURE_IMPORT,
    })
  }
}
