/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/7.
 */

import {NgModule} from "@angular/core";
import {FormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";

import {SharedModule} from '../shared/shared.module';
import {DropdownComponent} from "./component/dropdown.component";
import {DropdownInputComponent} from "./component/dropdown-input.component";
import {DropdownSelectComponent} from "./component/dropdown-select.component";
import {TooltipModule} from "../tooltip/tooltip.module";
import {TranslateModule} from "@ngx-translate/core";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    TooltipModule,
    TranslateModule,
    PerfectScrollbarModule
  ],
  exports: [DropdownComponent],
  declarations: [
    DropdownComponent,
    DropdownInputComponent,
    DropdownSelectComponent
  ],
  bootstrap: [DropdownComponent]
})
export class DropdownModule {

}