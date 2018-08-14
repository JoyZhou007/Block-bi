import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {routes} from './recruit.routes';
import {CalendarModule} from '../calendar/calendar.module'

import {RecruitComponent} from './component/recruit.component';
import {OccupationComponent} from './component/occupation.component';
import {TranslateModule} from "@ngx-translate/core";
import {TooltipModule} from "../tooltip/tooltip.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import { StructureModelService } from '../shared/services/model/structure-model.service';

@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    CalendarModule,
    TranslateModule,
    TooltipModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule
  ],
  declarations: [
    RecruitComponent
  ],
  providers: [StructureModelService],
  bootstrap: []
})
export class RecruitModule {
  public static routes = routes;
}
