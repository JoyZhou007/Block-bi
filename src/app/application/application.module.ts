import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {ApplicationComponent} from './component/application.component';
import {SharedModule} from "../shared/shared.module";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {TooltipModule} from "../tooltip/tooltip.module";
@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    PerfectScrollbarModule,
    TooltipModule
  ],
  exports: [
    ApplicationComponent
  ],
  declarations: [
    ApplicationComponent,
  ],
  bootstrap: [ApplicationComponent]
})

export class ApplicationModule {
}
