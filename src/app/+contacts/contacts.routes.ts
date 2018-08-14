import { Routes,RouterModule } from '@angular/router';

//contacts
import {ContactsComponent} from './components/contacts.component';

//personal
import {ContactsGeneralComponent} from './components/contacts-general.component';
import {ContactsResumesComponent} from './components/contacts-resumes.component';
import {ContactsAbilityComponent} from './components/contacts-ability.component';
import {ContactsPermissionComponent} from './components/contacts-permission.component';

//company
import {ContactIntroductionComponent} from './components/contacts-introduction.component';
import {ContactsCompanyAbilityComponent} from './components/contacts-companyAbility.component';

//import {ContactsSkillComponent} from './components/contacts-skill.component';

export const routes: Routes = [
    // general/resume/ability/occupation/permission/intro
    {
        path: 'info/:type/:uid',
        component: ContactsComponent
    },
    // //company
    // {path: 'introduction/:uid',
    //     component: ContactIntroductionComponent
    // },
    // {path: 'companyAbility/:uid',
    //     component: ContactsCompanyAbilityComponent
    // }

    //personal
    //{path: 'skill/:uid',
    //    component: ContactsSkillComponent
    //},

];
