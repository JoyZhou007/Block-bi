import {Routes} from '@angular/router';
//company
import {CompanyGeneralComponent} from './components/company-general.component';
import {CompanyAnalysisComponent} from './components/company-analysis.component';

import {NewCompanyRegisterComponent} from './components/new-company-register.component';



export const routes: Routes = [
  {
    path: '',
    component: CompanyGeneralComponent,
  },
  {
    path: 'introduction',
    component: CompanyGeneralComponent
  },
  {
    path: 'analysis',
    component: CompanyAnalysisComponent
  },
  {
    path: 'register',
    component: NewCompanyRegisterComponent
  },
  {
    path: 'upgrade',
    component: NewCompanyRegisterComponent
  }
];
