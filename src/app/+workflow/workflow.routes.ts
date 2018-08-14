import {Routes, RouterModule} from '@angular/router';

//workflow
import {WorkflowComponent} from './components/workflow.component';

export const routes: Routes = [
  {
    path: '',
    component: WorkflowComponent
  },
  {
    path: 'detail/:id',
    component: WorkflowComponent,
  }
];