import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { routes } from "./structure.routes";
import { SharedModule } from "../shared/shared.module";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";

import { StructureComponent } from "./components/structure.component";
import { StructureListComponent } from "./components/structure-list.component";
import { StructureFormEditPositionComponent } from "./components/structure-form-edit-position.component";
import { StructureFormEditDepartmentComponent } from "./components/structure-form-edit-department.component";
import { StructureFormEditPositionLevelComponent } from "./components/structure-form-edit-position-level.component";
import { StructureEntiretyComponent } from "./components/structure-entirety.component";

import { DropdownModule } from "../dropdown/dropdown.module";
import { DrawService, StructureModelService } from "../shared/services/index.service";
import { TooltipModule } from "../tooltip/tooltip.module";

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    DropdownModule,
    TooltipModule,
    PerfectScrollbarModule
  ],
  declarations: [
    StructureComponent,
    StructureListComponent,
    StructureFormEditPositionComponent,
    StructureFormEditDepartmentComponent,
    StructureFormEditPositionLevelComponent,
    StructureEntiretyComponent
  ],
  providers: [
    DrawService,
    StructureModelService
  ]
})
export class StructureModule {
  public static routes = routes;
}