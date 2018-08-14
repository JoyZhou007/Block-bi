import {NgModule}       from '@angular/core';
import {FormsModule}    from '@angular/forms';
import {RouterModule} from '@angular/router';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";

import {routes} from './company.routes';

import {NewCompanyRegisterComponent} from './components/new-company-register.component';

import {CompanyGeneralComponent} from './components/company-general.component';
import {EditCompanyGeneralComponent} from './components/edit-company-general.component';
import {ViewCompanyGeneralComponent} from './components/view-company-general.component';
import {CompanyAnalysisComponent} from './components/company-analysis.component';
import {CompanyAccountComponent} from './components/company-account.component';

import {CompanyShowComponent} from './components/company-show.component';
import {ComponentHeaderComponent} from './components/company-header.component';
import {CompanyModelService}from '../shared/services/index.service';

import {SharedModule} from '../shared/shared.module';
import {CompanyTabsComponent} from "./components/company-tabs.component";
import {TranslateModule} from "@ngx-translate/core";
import {TooltipModule} from "../tooltip/tooltip.module";



@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    TranslateModule,
    TooltipModule,
    RouterModule.forChild(routes),
    PerfectScrollbarModule
  ],
  declarations: [
    CompanyTabsComponent,
    CompanyShowComponent,
    CompanyGeneralComponent,
    EditCompanyGeneralComponent,
    ViewCompanyGeneralComponent,
    CompanyAnalysisComponent,
    CompanyAccountComponent,
    NewCompanyRegisterComponent,
    ComponentHeaderComponent,
  ],
  providers: [
    CompanyModelService
  ],
  bootstrap: []
})
export class CompanyModule {
  public static routes = routes;
}