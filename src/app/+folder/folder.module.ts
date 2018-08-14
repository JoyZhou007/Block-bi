import { NgModule }       from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { TreeModule } from 'angular-tree-component';
import { SharedModule } from '../shared/shared.module';
import {DropdownModule} from "../dropdown/dropdown.module";

// Imports for loading & configuring the in-memory web api
import { HttpModule } from '@angular/http';

import { FolderComponent }   from './components/folder.component';
import { routes }        from './folder.routes';


import {FolderHeaderComponent} from './components/folder-header.component';
import {FolderLeftMenuComponent} from './components/folder-left-menu.component';
import {FolderContentComponent} from './components/folder-content.component';
// import {FolderMoveComponent} from './components/folder-move.component';

import {
  FolderModelService,DownloadService
}from '../shared/services/index.service';
import {TooltipModule} from "../tooltip/tooltip.module";
import {TranslateModule} from "@ngx-translate/core";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {ImportFileComponent} from "./components/import-file.component";
@NgModule({
  imports: [
    FormsModule,
    HttpModule,
    SharedModule,
    RouterModule.forChild(routes),
    TreeModule,
    DropdownModule,
    TooltipModule,
    TranslateModule,
    PerfectScrollbarModule
  ],
  declarations: [
    FolderComponent,
    FolderHeaderComponent,
    FolderLeftMenuComponent,
    FolderContentComponent,
  ],
  providers: [
    FolderModelService,
    DownloadService
  ],
  bootstrap: [ FolderComponent ]
})
export class FolderModule {
  public static routes = routes;
}
