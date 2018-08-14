/**
 * Created by joyz on 2017/5/9.
 */

import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {NotificationDataService} from "../shared/services/model/data/notification/notification-data.service";
import {UserModelService} from "../shared/services/model/user-model.service";
import {TipsComponent} from "./components/tips.component";
import {ContactsModule} from "../+contacts/contacts.module";
import {NotificationModule} from "../notification/notification.module";
import {CalendarModule} from "../calendar/calendar.module";
import {MissionModule} from "../+mission/mission.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {TooltipModule} from "../tooltip/tooltip.module";

@NgModule({
  imports:[
    FormsModule,
    SharedModule,
    FormsModule,
    SharedModule,
    ContactsModule,
    NotificationModule,
    CalendarModule,
    MissionModule,
    PerfectScrollbarModule,
    TooltipModule
  ],
  declarations:[
    TipsComponent,
  ],
  exports:[
    TipsComponent
  ],
  providers:[
    UserModelService,
    NotificationDataService
  ]
})

export class TipsModule {
}