import {
  Component, ComponentFactoryResolver, ComponentRef, ElementRef,
  EventEmitter, Inject, Injector, Input,
  OnDestroy,
  Output, ReflectiveInjector,
  Renderer,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { DialogSettings } from "./dialog/dialog-settings";
import { ChatMiniDialogComponent } from "../../chat-new/component/dialog/chat-mini-dialog.component";
import { ContactsRecommendationComponent } from "../../+contacts/components/contacts-recommendation.component";
import { AddRecommContactDialogComponent } from "../../+contacts/components/add-recomm-contact-dialog.component";
import { AcceptRecommendationComponent } from "../../+contacts/components/accept-recommendation.component";
import { DealInviteComponent } from "../../notification/components/message/deal-invite.component";
import { NewFolderComponent } from "../../+folder/components/new-folder.component";
import { FolderMoveComponent } from "../../+folder/components/folder-move.component";
import { FolderShareComponent } from "../../+folder/components/folder-share.component";
import { FolderTransferComponent } from "../../+folder/components/folder-transfer.component";
import { FolderUploadComponent } from "../../+folder/components/folder-upload.component";
import { MissionTransferComponent } from "../../+mission/components/mission-transfer.component";
import { MissionPinDialogComponent } from "../../+mission/components/mission-pin.component";
import { HireContactComponent } from "../../+contacts/components/hire-contact.component";
import { HireDialogComponent } from "../../+contacts/components/hire-dialog.component";
import { NewContactComponent } from "../../+contacts/components/new-contact.component";
import { NewContactDialogComponent } from "../../+contacts/components/new-contact-dialog.component";
import { LinkToParentComponent } from "../../+company/components/link-to-parent.component";
import { LinkToParentDialogComponent } from "../../+company/components/link-to-parent-dialog.component";
import { EditCoreOrgaComponent } from "../../+company/components/edit-core-orga.component";
import { MeetingRoomDialog } from "../../+meeting/component/meeting-room.component";
import { MultiVacationDialog } from "../../vacation/component/dialog/multi-vacation-dialog.component";
import { SetVacationDialog } from "../../vacation/component/dialog/set-vacation-dialog.component";
import { ChatGroupSettingComponent } from "../../chat-new/component/dialog/chat-group-setting.component";
import { ChatInvitePeopleComponent } from "../../chat-new/component/dialog/chat-invite-people.component";
import { ChatInvitePeopleDialogComponent } from "../../chat-new/component/dialog/chat-invite-people-dialog.component";
import { ChatCreateGroupComponent } from "../../chat-new/component/dialog/chat-create-group.component";
import { ChatShareDialogComponent } from "../../chat-new/component/dialog/chat-share-dialog.component";
import { ChatHistoryDialogComponent } from "../../chat-new/component/dialog/chat-history-dialog.component";
import { ChatGroupTransferComponent } from "../../chat-new/component/dialog/chat-group-transfer.component";
import { SetCompanyAdminDialogComponent } from "../../+company/components/set-company-admin-dialog.component";
import { UpdateCompanyCeoDialogComponent } from "../../+company/components/update-company-ceo-dialog.component";
import { ChatContentMailMessageComponent } from "../../chat-new/component/content/message/chat-content-mail-message.component";
import { TipsDialogComponent } from "../../tips/components/dialog/user-tips-dialog.component";
import { TipsUpdateOrReadDetailDialogComponent } from "../../tips/components/dialog/tips-update-or-read-detail-dialog.component";
import { ChatMemberGroupDialogComponent } from "../../chat-new/component/dialog/chat-member-group-dialog.component";
import { ChatForwardDialogComponent } from "../../chat-new/component/dialog/chat-forward-dialog.component";
import { ChatSharePostDialogComponent } from "../../chat-new/component/dialog/chat-share-post-dialog.component";
import { NewRecommendation } from "../../notification/components/message/new-recommendation.component";
import { AddNationalHolidayComponent } from "../../attendance/component/add-national-holiday.component";
import { UserInvitePeopleDialogComponent } from "../../user/components/dialog/user-invite-people-dialog";
import { OutOfficeApplicationComponent } from "../../application/component/dialog/out-office-application.component";
import { VacationUsageDialogComponent } from "../../application/component/dialog/vacation-usage-dialog.component";
import { OutOfficeReplyComponent } from "../../application/component/dialog/out-office-reply.component";
import { VacationNotificationDialogComponent } from "../../application/component/dialog/vacation-notification-dialog.component";
import { SetWorkTimeDialogComponent } from "../../attendance/component/dialog/set-work-time-dialog.component";
import { MissionChatDialogComponent } from "../../+mission/components/mission-chat-dialog.component";
import { ResignationApplicationDialogComponent } from "../../application/component/dialog/resignation-application-dialog.component";
import { ResignationNotificationDialogComponent } from "../../application/component/dialog/resignation-notification-dialog.component";
import { HelpDialogComponent } from "../../help/component/help-dialog.component";
import { StructureImportDialog } from "../../+structure/components/structure-import-dialog.component";
import { CompanyRegisterSuccessDialog } from "../../+company/components/company-register-success-dialog.component";
import { UserAccountDialogComponent } from "../../user/components/dialog/user-account-dialog.component";
import {OccupationComponent} from "../../recruit/component/occupation.component";
import {ImportFileComponent} from "../../+folder/components/import-file.component";
import {SetCompanyCEODialogComponent} from "../../+company/components/set-company-ceo-dialog.component";

@Component({
  selector: 'dynamic-component',
  templateUrl: '../template/dynamic.component.html'
})
export class DynamicComponent implements OnDestroy {
  @ViewChild("componentContainer", { read: ViewContainerRef }) container;
  private componentRef: ComponentRef<any>;
  public selector:string;
  public setData:any;
  private _settings: DialogSettings;

  @Output('outViewInit') outViewInit = new EventEmitter<any>();
  constructor(
    private componentResolver: ComponentFactoryResolver,
    private injector: Injector,
    public elementRef: ElementRef,
    public renderer: Renderer,
    @Inject('notification.service') public notificationService : any
  ) {
  }

  @Input('settings') public set settings(data: DialogSettings) {
    if (this._settings && data.componentSelector && this._settings.componentSelector == data.componentSelector) {
    } else {
      this._settings = data;
      let component = this.fetchComponentByName(data.componentSelector);
      this.generateComponent(data.componentFactoryResolver, component, data.componentData, data.injector);
    }
  }

  getComponentName(){
    return this._settings ? this._settings.componentSelector : '';
  }

  /**
   *
   * @param name
   * @return {any}
   */
  fetchComponentByName(name: string){
    let list = {
      'chat-mini-dialog': ChatMiniDialogComponent,
      'contacts-recommendation': ContactsRecommendationComponent,
      'add-recomm-contact-dialog': AddRecommContactDialogComponent,
      'accept-recommendation': AcceptRecommendationComponent,
      'deal-invite': DealInviteComponent,
      'new-folder': NewFolderComponent,
      'folder-move': FolderMoveComponent,
      'folder-share': FolderShareComponent,
      'folder-transfer': FolderTransferComponent,
      'folder-upload': FolderUploadComponent,
      'import-file':ImportFileComponent,
      'mission-transfer': MissionTransferComponent,
      'mission-pin-dialog': MissionPinDialogComponent,
      'hire-contact': HireContactComponent,
      'hire-dialog': HireDialogComponent,
      'new-contact': NewContactComponent,
      'add-contact-dialog': NewContactDialogComponent,
      'link-to-parent': LinkToParentComponent,
      'link-to-parent-dialog': LinkToParentDialogComponent,
      'edit-core-orga': EditCoreOrgaComponent,
      'meeting-room-dialog': MeetingRoomDialog,
      'multi-vacation-dialog': MultiVacationDialog,
      'set-vacation-dialog': SetVacationDialog,
      'chat-group-setting': ChatGroupSettingComponent,
      'chat-invite-people': ChatInvitePeopleComponent,
      'chat-invite-people-dialog': ChatInvitePeopleDialogComponent,
      'chat-create-group': ChatCreateGroupComponent,
      'chat-share-dialog': ChatShareDialogComponent,
      'chat-history-dialog': ChatHistoryDialogComponent,
      'chat-group-transfer': ChatGroupTransferComponent,
      'set-company-admin-dialog': SetCompanyAdminDialogComponent,
      'update-company-ceo-dialog': UpdateCompanyCeoDialogComponent,
      'chat-content-mail-message': ChatContentMailMessageComponent,
      'user-tips-dialog': TipsDialogComponent,
      'update-or-read-detail-tips': TipsUpdateOrReadDetailDialogComponent,
      'chat-member-group-dialog': ChatMemberGroupDialogComponent,
      'chat-forward-dialog': ChatForwardDialogComponent,
      'chat-share-post-dialog': ChatSharePostDialogComponent,
      'new-recommendation': NewRecommendation,
      'add-national-holiday': AddNationalHolidayComponent,
      'invite-people': UserInvitePeopleDialogComponent,
      'out-office-application': OutOfficeApplicationComponent,
      'vacation-usage-dialog': VacationUsageDialogComponent,
      'out-office-reply': OutOfficeReplyComponent,
      'vacation-notification-dialog': VacationNotificationDialogComponent,
      'set-work-time-dialog': SetWorkTimeDialogComponent,
      'mission-chat-dialog': MissionChatDialogComponent,
      'resignation-application-dialog': ResignationApplicationDialogComponent,
      'resignation-notification-dialog': ResignationNotificationDialogComponent,
      'help-dialog': HelpDialogComponent,
      'structure-import-dialog': StructureImportDialog,
      'company-register-success-dialog': CompanyRegisterSuccessDialog,
      'user-account-dialog': UserAccountDialogComponent,
      'occupation': OccupationComponent,
      'set-company-ceo-dialog': SetCompanyCEODialogComponent
    };
    return list.hasOwnProperty(name) ? list[name] : name;
  }


  public get settings(){
    return this._settings;
  }


  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(){
    if (this.componentRef) {
      delete this._settings;
      this.componentRef.destroy();
      this.outViewInit.emit(false);
    }
  }


  /**
   * 动态创建Component
   * @param factoryResolver 需要生成的所在的component构造函数提供的ComponentFactoryResolver
   * @param component 需要生成的Component
   * @param componentData 需要生成的初始化数据 {key[string]: value[any]}
   * @param injector
   * @param viewContainer
   */
  generateComponent(factoryResolver:ComponentFactoryResolver, component: any, componentData?: any, injector?:Injector, viewContainer?: any){
    try {
      let fr = factoryResolver ? factoryResolver: this.componentResolver;
      let ij = injector ? injector : this.injector;
      let vc = viewContainer? viewContainer : this.container;
      let componentFactory = fr.resolveComponentFactory(component);
      // 如果有指定的目标viewContainer 则生成在目标container中
      let refInjector = ReflectiveInjector.resolveAndCreate([
        {provide: component, useFactory: component}], ij
      );
      if (typeof this.componentRef !== 'undefined') {
        this.componentRef.destroy();
      }
      if (vc && typeof vc.createComponent === 'function') {
        this.componentRef = vc.createComponent(componentFactory, 0, refInjector);
      } else {
        this.componentRef = this.container.createComponent(componentFactory, 0, refInjector);
      }
      // position param init
      if (componentData) {
        this.componentRef.instance.setOption = componentData;
      }
      this.componentRef.changeDetectorRef.detectChanges();
      // 通知父元素初始化完毕
      this.outViewInit.emit(true);
    } catch (err) {
      return
    }
  }


  /**
   * 执行component自定义事件
   * @param eventName
   * @param param
   */
  excComponentEvent(eventName:string, param?: any) {
    if (!eventName || !this.componentRef) {return;}
    if (typeof this.componentRef.instance[eventName.toString()] === 'function') {
     return this.componentRef.instance[eventName.toString()](param);
    }
  }
}
