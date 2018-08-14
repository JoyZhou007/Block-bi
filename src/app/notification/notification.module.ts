import { NgModule,ModuleWithProviders } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import {NotificationDialogComponent} from './components/notification-dialog.component';
import {NotificationSettingComponent} from './components/notification-settting.component';
import {UserNotificationComponent} from './components/user-notification.component';
import {NotificationMessageComponent} from './components/notification-message.component';
import {SendNotificationMessageComponent} from './components/send-notification-message.component';

//好友请求提示
import {NewContactMessageComponent} from './components/message/new-contact-message.component';
//邀请加群提示
import {NewGroupInviteComponent} from './components/message/new-group-invite.component';
//好友推荐提示
//import {NewRecommendation} from './components/message/new-recommendation.component';
import {NewRecommendationRequestComponent} from './components/message/new-recommendation-request.component';
import {AddRecommContactComponent} from '../+contacts/components/add-recomm-contact.component';
//hire请求提示
import {NewHireComponent} from './components/message/new-hire.component';
//删除好友
import {DeleteFriendsComponents} from './components/message/delete-friends.component';
//公司申请
import {JoinCompanyComponent} from './components/message/join-company.component';

import {MissionRequestMessageComponent} from './components/message/mission-request-message.component';

//公用信息模块
import {NewNoticeComponent} from './components/message/new-notice.component';

import {NotificationDataService} from '../shared/services/index.service';

//邀请好友进群
import {ChatInviteGroupMessageComponent} from './components/message/chat-invite-group-message.component';
import {ChatCreateGroupMessageComponent} from "./components/message/chat-create-group-message.component";
import {NotificationModelService} from "../shared/services/model/notification-model.service";

//设置公司owner
import {SetCompanyAdminComponent} from './components/message/set-company-admin.component';
import {UpdateCompanyCeoComponent} from './components/message/update-company-ceo.component';
import {TipsModule} from "../tips/tips.module";
import {TipsComponent} from "../tips/components/tips.component";
import {ChatMemberGroupviteComponent} from './components/message/chat-member-group-invite.component';
import {OutOfficeApplicationMessageComponent} from "./components/message/out-office-application-message.component";
import {VacationApplyComponent} from "./components/message/vacation-apply.component";
import { ResignationApplyComponent } from './components/message/resignation-apply.component';
import { SetCompanyCEOComponent } from './components/message/set-company-ceo.component';
import { CompanyAdminChangeComponent } from './components/message/company-admin-change.component';


//滚动条
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    PerfectScrollbarModule
    // TipsModule
  ],
  declarations: [
    UserNotificationComponent,
    NotificationDialogComponent,
    NotificationSettingComponent,
    NotificationMessageComponent,
    SendNotificationMessageComponent,
    //message
    NewNoticeComponent,
    NewContactMessageComponent,
    NewGroupInviteComponent,
    //NewRecommendation,
    NewRecommendationRequestComponent,
    AddRecommContactComponent,
    NewHireComponent,
    DeleteFriendsComponents,
    MissionRequestMessageComponent,

    JoinCompanyComponent,
    ChatInviteGroupMessageComponent,
    ChatCreateGroupMessageComponent,

    SetCompanyAdminComponent,
    SetCompanyCEOComponent,
    CompanyAdminChangeComponent,
    UpdateCompanyCeoComponent,
    ChatMemberGroupviteComponent,
    OutOfficeApplicationMessageComponent,
    VacationApplyComponent,
    ResignationApplyComponent
  ],
  exports: [
    UserNotificationComponent,
    NotificationDialogComponent,
    NotificationSettingComponent,
    NotificationMessageComponent,
    SendNotificationMessageComponent,

    //message
    NewNoticeComponent,
    NewContactMessageComponent,
    NewGroupInviteComponent,
    //NewRecommendation,
    NewRecommendationRequestComponent,
    AddRecommContactComponent,
    NewHireComponent,
    DeleteFriendsComponents,
    MissionRequestMessageComponent,

    JoinCompanyComponent,
    ChatInviteGroupMessageComponent,
    ChatCreateGroupMessageComponent,

    SetCompanyAdminComponent,
    SetCompanyCEOComponent,
    CompanyAdminChangeComponent,
    UpdateCompanyCeoComponent,
    ChatMemberGroupviteComponent,
    OutOfficeApplicationMessageComponent,
    VacationApplyComponent,
    ResignationApplyComponent
  ],
  providers : [NotificationDataService, NotificationModelService],
  bootstrap: []
})
export class NotificationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NotificationModule
    };
  }
}
