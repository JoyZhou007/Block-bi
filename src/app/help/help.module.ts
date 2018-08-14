import { ModuleWithProviders, NgModule } from "@angular/core";
import {FormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";
import {SharedModule} from '../shared/shared.module';
import { RouterModule } from '@angular/router';

import {TranslateModule} from "@ngx-translate/core";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {ChatHelpComponent} from "./component/chat-help.component";
import { routes }        from './help.route';
import {ChatPostHelpComponent} from "./component/post-help.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SharedModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule
  ],
  declarations: [
    ChatHelpComponent,
    ChatPostHelpComponent
  ],
  bootstrap: [ChatHelpComponent, ChatPostHelpComponent]
})
export class HelpModule {
  public static routes = routes;
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: HelpModule
    }
  }
}