///<reference path="../../../node_modules/angular-emojione/dist/emoji.module.d.ts"/>
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DropdownModule } from "../dropdown/dropdown.module";
//动态加载component框
import { DynamicComponent } from "./components/dynamic.component";
//全局加载框
import { DynamicGlobalComponent } from "./components/dynamic-global-component.component";
//弹出框
import { DialogNewComponent } from "./components/dialog-new.component";
//日期选择框
import { DateComponent } from "../shared/components/date/date.component";
import { CalendarModule } from "../calendar/calendar.module";

import { DealInviteComponent } from "../notification/components/message/deal-invite.component";
//新建工作群组
// import {CreateWorkGroupComponent} from '../chats/components/create-work-group.component';
//
// //新建私人群组
// import {CreatePrivateGroupComponent} from '../chats/components/create-private-group.component';
//
// //邀请人进群
// import {AddGroupPeopleComponent} from '../chats/components/add-group-people.component';
//
// //群主转让
// import {TransferGroupComponent} from '../chats/components/transfer-group.component';
//
// //转发消息
// import {ForwardMessageComponent} from '../chats/components/forward-message.component';
//好友推荐
import { ContactsRecommendationComponent } from "../+contacts/components/contacts-recommendation.component";
import { AddRecommContactDialogComponent } from "../+contacts/components/add-recomm-contact-dialog.component";
//接受好友推荐
import { AcceptRecommendationComponent } from "../+contacts/components/accept-recommendation.component";
//文件夹
import { FolderTransferComponent } from "../+folder/components/folder-transfer.component";
import { NewFolderComponent } from "../+folder/components/new-folder.component";
import { FolderMoveComponent } from "../+folder/components/folder-move.component";
import { FolderShareComponent } from "../+folder/components/folder-share.component";
import { FolderUploadComponent } from "../+folder/components/folder-upload.component";
import { ImportFileComponent } from "../+folder/components/import-file.component";

import { SharedModule } from "../shared/shared.module";
//mission
import { MissionTransferComponent } from "../+mission/components/mission-transfer.component";
import { DialogTitleComponent } from "./components/dialog/dialog-title.component";
import { DialogButtonsComponent } from "./components/dialog/dialog-buttons.component";
import { DialogContentComponent } from "./components/dialog/dialog-content.component";


import { MissionPinDialogComponent } from "../+mission/components/mission-pin.component";
//hire contact
import { HireContactComponent } from "../+contacts/components/hire-contact.component";
import { HireDialogComponent } from "../+contacts/components/hire-dialog.component";
//link to parent
import { LinkToParentComponent } from "../+company/components/link-to-parent.component";
import { LinkToParentDialogComponent } from "../+company/components/link-to-parent-dialog.component";
//添加联系人
import { NewContactComponent } from "../+contacts/components/new-contact.component";
import { NewContactDialogComponent } from "../+contacts/components/new-contact-dialog.component";
//edit core Organization
import { EditCoreOrgaComponent } from "../+company/components/edit-core-orga.component";
//group setting
import { ChatGroupSettingComponent } from "../chat-new/component/dialog/chat-group-setting.component";
//邀请好友入群
import { ChatInvitePeopleComponent } from "../chat-new/component/dialog/chat-invite-people.component";
import { ChatInvitePeopleDialogComponent } from "../chat-new/component/dialog/chat-invite-people-dialog.component";
//创建群组
import { ChatCreateGroupComponent } from "../chat-new/component/dialog/chat-create-group.component";
//群组转让
import { ChatGroupTransferComponent } from "../chat-new/component/dialog/chat-group-transfer.component";
//会议室
import { MeetingRoomDialog } from "../+meeting/component/meeting-room.component";
import { MeetingReserveDialog } from "../+meeting/component/meeting-reserve.component";
//目录树
import { TreeModule } from "angular-tree-component";
import { DragModule } from "../drag/drag.module";

import { ChatMiniDialogComponent } from "../chat-new/component/dialog/chat-mini-dialog.component";
import { ChatNewModule } from "../chat-new/chat.module";
//编辑公司owner
import { SetCompanyAdminDialogComponent } from "../+company/components/set-company-admin-dialog.component";
import { ChatContentMailMessageComponent } from "../chat-new/component/content/message/chat-content-mail-message.component";
import { ChatMemberGroupDialogComponent } from "../chat-new/component/dialog/chat-member-group-dialog.component";
import { UpdateCompanyCeoDialogComponent } from "../+company/components/update-company-ceo-dialog.component";


import { TipsDialogComponent } from "../tips/components/dialog/user-tips-dialog.component";
import { TipsUpdateOrReadDetailDialogComponent } from "../tips/components/dialog/tips-update-or-read-detail-dialog.component";
// Chat Share
import { ChatShareDialogComponent } from "../chat-new/component/dialog/chat-share-dialog.component";
// Chat forward
import { ChatForwardDialogComponent } from "../chat-new/component/dialog/chat-forward-dialog.component";
import { ChatSharePostDialogComponent } from "../chat-new/component/dialog/chat-share-post-dialog.component";
import { NewRecommendation } from "../notification/components/message/new-recommendation.component";
//chat history
import { ChatHistoryDialogComponent } from "../chat-new/component/dialog/chat-history-dialog.component";
import { UserAccountDialogComponent } from "../user/components/dialog/user-account-dialog.component";
import { RecruitModule } from "../recruit/recruit.module";
//create national holiday
import { AddNationalHolidayComponent } from "../attendance/component/add-national-holiday.component";
import { MultiVacationDialog } from "../vacation/component/dialog/multi-vacation-dialog.component";
import { SetVacationDialog } from "../vacation/component/dialog/set-vacation-dialog.component";
import { UserInvitePeopleDialogComponent } from "../user/components/dialog/user-invite-people-dialog";
import { OutOfficeApplicationComponent } from "../application/component/dialog/out-office-application.component";
import { VacationUsageDialogComponent } from "../application/component/dialog/vacation-usage-dialog.component";
import { OutOfficeReplyComponent } from "../application/component/dialog/out-office-reply.component";
import { VacationNotificationDialogComponent } from "../application/component/dialog/vacation-notification-dialog.component";
import { SetWorkTimeDialogComponent } from "../attendance/component/dialog/set-work-time-dialog.component";
import { MissionChatDialogComponent } from "../+mission/components/mission-chat-dialog.component";
import { ResignationApplicationDialogComponent } from "../application/component/dialog/resignation-application-dialog.component";
import { HelpDialogComponent } from "../help/component/help-dialog.component";
import { ResignationNotificationDialogComponent } from "../application/component/dialog/resignation-notification-dialog.component";
//滚动条
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { StructureImportDialog } from "../+structure/components/structure-import-dialog.component";
import { CompanyRegisterSuccessDialog } from "../+company/components/company-register-success-dialog.component";
import { TooltipModule } from "../tooltip/tooltip.module";
import { OccupationComponent } from "../recruit/component/occupation.component";
import {EmojiModule} from "angular-emojione";
import {SetCompanyCEODialogComponent} from "../+company/components/set-company-ceo-dialog.component";

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    DropdownModule,
    TreeModule,
    CalendarModule,
    DragModule,
    ChatNewModule,
    RecruitModule,
    PerfectScrollbarModule,
    TooltipModule,
    EmojiModule
  ],
  declarations: [
    DynamicComponent,
    DynamicGlobalComponent,
    DialogNewComponent,
    DateComponent,
    ChatMiniDialogComponent,

    ContactsRecommendationComponent,
    AddRecommContactDialogComponent,
    AcceptRecommendationComponent,
    DealInviteComponent,
    NewFolderComponent,
    FolderTransferComponent,
    FolderMoveComponent,
    FolderShareComponent,
    FolderUploadComponent,
    ImportFileComponent,
    MissionTransferComponent,
    HireContactComponent,
    HireDialogComponent,
    MissionPinDialogComponent,
    NewContactComponent,
    NewContactDialogComponent,
    LinkToParentComponent,
    LinkToParentDialogComponent,
    EditCoreOrgaComponent,
    MeetingRoomDialog,
    MeetingReserveDialog,
    MultiVacationDialog,
    SetVacationDialog,
    ChatGroupSettingComponent,
    ChatInvitePeopleComponent,
    ChatInvitePeopleDialogComponent,
    ChatCreateGroupComponent,
    ChatGroupTransferComponent,
    SetCompanyAdminDialogComponent,
    UpdateCompanyCeoDialogComponent,
    ChatContentMailMessageComponent,
    TipsDialogComponent,
    TipsUpdateOrReadDetailDialogComponent,
    ChatMemberGroupDialogComponent,
    ChatForwardDialogComponent,
    ChatShareDialogComponent,
    ChatHistoryDialogComponent,
    ChatSharePostDialogComponent,
    NewRecommendation,
    UserAccountDialogComponent,
    AddNationalHolidayComponent,
    UserInvitePeopleDialogComponent,
    OutOfficeApplicationComponent,
    VacationUsageDialogComponent,
    OutOfficeReplyComponent,
    VacationNotificationDialogComponent,
    SetWorkTimeDialogComponent,
    MissionChatDialogComponent,
    ResignationApplicationDialogComponent,
    ResignationNotificationDialogComponent,
    HelpDialogComponent,
    StructureImportDialog,
    CompanyRegisterSuccessDialog,
    OccupationComponent,
    SetCompanyCEODialogComponent
  ],
  exports: [
    DynamicComponent,
    DynamicGlobalComponent,
    DialogNewComponent,
    DateComponent,
  ],
  entryComponents: [
    OccupationComponent,
    SetCompanyCEODialogComponent,
    ChatMiniDialogComponent,
    UserAccountDialogComponent,
    ContactsRecommendationComponent,
    AddRecommContactDialogComponent,
    AcceptRecommendationComponent,
    DealInviteComponent,
    NewFolderComponent,
    FolderMoveComponent,
    FolderShareComponent,
    FolderTransferComponent,
    FolderUploadComponent,
    ImportFileComponent,
    MissionTransferComponent,
    MissionPinDialogComponent,
    HireContactComponent,
    HireDialogComponent,
    NewContactComponent,
    NewContactDialogComponent,
    LinkToParentComponent,
    LinkToParentDialogComponent,
    EditCoreOrgaComponent,
    MeetingRoomDialog,
    MultiVacationDialog,
    SetVacationDialog,
    ChatGroupSettingComponent,
    ChatInvitePeopleComponent,
    ChatInvitePeopleDialogComponent,
    ChatCreateGroupComponent,
    ChatShareDialogComponent,
    ChatHistoryDialogComponent,
    ChatGroupTransferComponent,
    SetCompanyAdminDialogComponent,
    UpdateCompanyCeoDialogComponent,
    ChatContentMailMessageComponent,
    TipsDialogComponent,
    TipsUpdateOrReadDetailDialogComponent,
    ChatMemberGroupDialogComponent,
    ChatForwardDialogComponent,
    ChatSharePostDialogComponent,
    NewRecommendation,
    AddNationalHolidayComponent,
    UserInvitePeopleDialogComponent,
    OutOfficeApplicationComponent,
    VacationUsageDialogComponent,
    OutOfficeReplyComponent,
    VacationNotificationDialogComponent,
    SetWorkTimeDialogComponent,
    MissionChatDialogComponent,
    ResignationApplicationDialogComponent,
    ResignationNotificationDialogComponent,
    HelpDialogComponent,
    StructureImportDialog,
    CompanyRegisterSuccessDialog
  ]
})
export class DynamicLoadModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DynamicLoadModule
    };
  }
}
