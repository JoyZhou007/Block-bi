import {Routes, RouterModule} from '@angular/router';

//personal
import {PersonalGeneralComponent} from './components/personal-general.component';
import {PersonalSkillComponent} from './components/personal-skill.component';
import {PersonalResumesComponent} from './components/personal-resumes.component';
import {PersonalAbilityComponent} from './components/personal-ability.component';

export const routes: Routes = [
  {path: '', component: PersonalGeneralComponent},
  //personal
  {
    path: 'general',
    component: PersonalGeneralComponent
  },
  {
    path: 'resume',
    component: PersonalResumesComponent
  },
  {
    path: 'analysis',
    component: PersonalAbilityComponent
  }
  //{path: 'skill',
  //  component: PersonalSkillComponent
  //},
];