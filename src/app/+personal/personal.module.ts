import { NgModule}       from '@angular/core';
import { FormsModule }    from '@angular/forms';
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
//import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './personal.routes';
import { SharedModule } from '../shared/shared.module';

import {PersonalPhotoComponent} from './components/personal-photo.component';
import {ComponentHeaderComponent} from './components/personal-header.component';

import {PersonalEducationsComponent} from './components/personal-educations.component';
import {PersonalExperienceComponent} from './components/personal-experience.component';
//import {PersonalLanguageListComponent} from './components/personal-language-list.component';
//import {PersonalSkillListComponent} from './components/personal-skill-list.component';
//import {PersonalSkillComponent} from './components/personal-skill.component';


import {PersonalGeneralComponent} from './components/personal-general.component';
import {PersonalResumesComponent} from './components/personal-resumes.component';
import {PersonalAbilityComponent} from './components/personal-ability.component';


import {PersonalModelService} from '../shared/services/index.service';
import {CalendarModule} from "../calendar/calendar.module";
import {TranslateModule} from "@ngx-translate/core";
import {TooltipModule} from "../tooltip/tooltip.module";


@NgModule({
  declarations: [
    //PersonalSkillComponent,
    //PersonalSkillListComponent,
    //PersonalLanguageListComponent,

    PersonalGeneralComponent,
    PersonalResumesComponent,
    PersonalAbilityComponent,

    PersonalPhotoComponent,
    ComponentHeaderComponent,
    PersonalEducationsComponent,
    PersonalExperienceComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes),
    CalendarModule,
    TranslateModule,
    TooltipModule,
    PerfectScrollbarModule
  ],
  providers : [PersonalModelService]
})
export class PersonalModule {
  public static routes = routes;
}