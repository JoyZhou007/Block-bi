import {NgModule}       from '@angular/core';
import {FormsModule}    from '@angular/forms';
import {routing} from './user.routing';
import {SharedModule} from '../shared/shared.module';
import {NotificationModule} from '../notification/notification.module';
import {CalendarModule} from '../calendar/calendar.module';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {UserModelService, NotificationDataService,CompanyModelService} from '../shared/services/index.service';
import {ContactsModule} from '../+contacts/contacts.module';
import {UserNavComponent}   from './components/user-nav.component';
import {globalSearchComponent} from './components/global-search.component';
// 导入验证器
import {EqualValidator} from '../shared/directive/element/input-vaild/equal-validator.directive';
import {MissionModule} from "../+mission/mission.module";
import {TipsModule} from "../tips/tips.module";
import {TooltipModule} from "../tooltip/tooltip.module";
import {ApplicationModule} from "../application/application.module";
import { UserIndexComponent } from "./components/user-index.component";


@NgModule({
  imports: [
    FormsModule,
    routing,
    SharedModule,
    ContactsModule,
    NotificationModule,
    CalendarModule,
    MissionModule,
    TipsModule,
    TooltipModule,
    ApplicationModule,
    PerfectScrollbarModule
  ],
  declarations: [
    UserIndexComponent,
    UserNavComponent,
    globalSearchComponent,
    EqualValidator,

  ],
  providers: [
    UserModelService,
    NotificationDataService,
    CompanyModelService
  ],
  bootstrap: [UserIndexComponent]
})
export class UserModule {
}