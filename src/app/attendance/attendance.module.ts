import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {routes} from './attendance.routes';
import {CalendarModule} from "../calendar/calendar.module";
import {SharedModule} from '../shared/shared.module';

import {AttendanceComponent} from './component/attendance.component';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {TooltipModule} from "../tooltip/tooltip.module";
import {FormsModule} from "@angular/forms";
@NgModule({
  imports: [
    SharedModule,
    CalendarModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule,
    TooltipModule,
    FormsModule
    // SetWorkTimeDialogComponent
  ],
  declarations: [
    AttendanceComponent,
  ],
  exports: [],
  providers: [],
  bootstrap: []

})
export class AttendanceModule {
  public static routes = routes;
}