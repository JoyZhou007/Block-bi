import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {routes} from './vacation.routes';

import {VacationComponent} from './component/vacation.component';
import {SharedModule} from "../shared/shared.module";
import {CalendarModule} from '../calendar/calendar.module';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {TooltipModule} from "../tooltip/tooltip.module";
@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    CalendarModule,
    PerfectScrollbarModule,
    TooltipModule
  ],
  exports: [
    VacationComponent
  ],
  declarations: [
    VacationComponent,
  ],
  bootstrap: [VacationComponent]
})

export class VacationModule {
  public static routes = routes;
}
