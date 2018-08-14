import { Routes,RouterModule } from '@angular/router';
import { UserIndexComponent } from "./components/user-index.component";
export const userRoutes: Routes = [
  {
    path: 'index',
    component: UserIndexComponent
  }
];
export const routing = RouterModule.forChild(userRoutes);