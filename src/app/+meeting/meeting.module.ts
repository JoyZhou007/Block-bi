/**
 * Created by christine Guo on 2017/4/18.
 */
import {NgModule} from "@angular/core";
import {FormsModule} from '@angular/forms';
import { routes } from './meeting.routes';
import {CommonModule} from "@angular/common";
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import {MeetingComponent} from './component/meeting.component';
import {CalendarModule} from "../calendar/calendar.module";
import {TranslateModule} from "@ngx-translate/core";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {TooltipModule} from "../tooltip/tooltip.module";
@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    RouterModule.forChild(routes),
    CalendarModule,
    PerfectScrollbarModule,
    TooltipModule

  ],
  exports: [
    MeetingComponent,
  ],
  declarations: [
    MeetingComponent,
  ],
  bootstrap: [MeetingComponent],
})
export class MeetingModule {
  public static routes = routes;
}
