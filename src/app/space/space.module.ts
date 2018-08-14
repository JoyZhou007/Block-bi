import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {routes} from './space.routes';

import {SpaceComponent} from './component/space.component';
import {FolderModelService} from "../shared/services/model/folder-model.service";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import { SpacePipeComponent } from './component/space-pipe.component';

@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule
  ],
  declarations: [
    SpaceComponent,
    SpacePipeComponent
  ],
  providers: [
  FolderModelService
],
  bootstrap: []
})
export class SpaceModule {
  public static routes = routes;
}
