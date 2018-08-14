/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/6/22.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';
import {PositionService} from "./position.service";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [TooltipComponent,TooltipDirective ],
  providers: [PositionService],
  exports: [TooltipDirective],
  entryComponents: [TooltipComponent]
})

export class TooltipModule { }