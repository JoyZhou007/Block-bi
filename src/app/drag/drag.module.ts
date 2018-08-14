
import {NgModule} from "@angular/core";
import {FormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {SharedModule} from '../shared/shared.module';

import {DragComponent} from "./component/drag.component";
import {TranslateModule} from "@ngx-translate/core";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    PerfectScrollbarModule
  ],
  exports: [DragComponent],
  declarations: [
    DragComponent,
  ],
  bootstrap: [DragComponent]
})
export class DragModule {

}