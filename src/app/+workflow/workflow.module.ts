import { NgModule }       from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './workflow.routes';
import { SharedModule } from '../shared/shared.module';
import { NotificationModule } from '../notification/notification.module';
import { DropdownModule } from '../dropdown/dropdown.module';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {UserModelService, NotificationDataService, WorkflowModelService, TypeService}
  from '../shared/services/index.service';

import {WorkflowComponent} from './components/workflow.component';
import {WorkflowCreateComponent} from './components/workflow-create.component';
import {WorkflowEntiretyComponent} from './components/workflow-entirety.component';
import {WorkflowMenuComponent} from './components/workflow-menu.component';
import {WorkflowUserComponent} from './components/workflow-user.component';
import {TooltipModule} from "../tooltip/tooltip.module";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    DropdownModule,
    RouterModule.forChild(routes),
    NotificationModule,
    TooltipModule,
    TranslateModule,
    PerfectScrollbarModule
  ],
  declarations: [
    WorkflowComponent,
    WorkflowCreateComponent,
    WorkflowEntiretyComponent,
    WorkflowMenuComponent,
    WorkflowUserComponent
  ],
  providers: [
    UserModelService,
    NotificationDataService,
    WorkflowModelService,
    TypeService
  ],
  bootstrap: [WorkflowComponent]
})
export class WorkflowModule {
  public static routes = routes;
}