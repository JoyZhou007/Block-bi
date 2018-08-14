/**
 * Created by DanXia Yang on 2017/2/16 0016.
 */
import {NgModule} from "@angular/core";
import {FormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {SharedModule} from '../shared/shared.module';
import {CalendarComponent} from "./calendar.component";
import {CalendarMultiSelectComponent} from "./calendar-multiselect.component";
import {CalendarRepeatComponent} from "./calendar-repeat.component";
import {CalendarFixComponent} from "./calendar-fix.component";
import {CalendarProfileComponent} from "./calendar-profile.component";
import {CalendarSelectComponent} from "./calendar-select.component";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    PerfectScrollbarModule
  ],
  exports: [
    CalendarComponent,
    CalendarMultiSelectComponent,
    CalendarRepeatComponent,
    CalendarFixComponent,
    CalendarProfileComponent,
    CalendarSelectComponent,
  ],
  declarations: [
    CalendarComponent,
    CalendarMultiSelectComponent,
    CalendarRepeatComponent,
    CalendarFixComponent,
    CalendarProfileComponent,
    CalendarSelectComponent,
  ],
  bootstrap: [CalendarComponent],
})
export class CalendarModule {

}