import { NgModule}       from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './contacts.routes';
import { SharedModule } from '../shared/shared.module';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {ContactModelService} from '../shared/services/index.service';

import {ContactsHeaderComponent} from './components/contacts-header.component';
import {ContactsListComponent} from './components/contacts-list.component';
import {ContactsMemberComponent} from './components/contacts-member.component';

import {ContactsGeneralComponent} from './components/contacts-general.component';
import {ContactsResumesComponent} from './components/contacts-resumes.component';
import {ContactsAbilityComponent} from './components/contacts-ability.component';
import {ContactIntroductionComponent} from './components/contacts-introduction.component';
import {ContactsCompanyAbilityComponent} from './components/contacts-company-ability.component';
import {NotEntryComponent} from './components/not-entry.component';
import {ContactsComponent} from "./components/contacts.component";
import {TranslateModule} from "@ngx-translate/core";
import {TooltipModule} from "../tooltip/tooltip.module";


@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    TranslateModule,
    TooltipModule,
    PerfectScrollbarModule
  ],
  exports: [ContactsListComponent, NotEntryComponent],
  declarations: [
    ContactsComponent,
    ContactsHeaderComponent,
    ContactsListComponent,
    ContactsMemberComponent,
    ContactsGeneralComponent,
    ContactsResumesComponent,
    ContactsAbilityComponent,
    ContactIntroductionComponent,
    ContactsCompanyAbilityComponent,
    NotEntryComponent
  ],
  providers : [ContactModelService],
  bootstrap: [ContactsComponent, NotEntryComponent]
})
export class ContactsModule {
  public static routes = routes;
}
