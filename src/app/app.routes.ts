import { RouterModule } from "@angular/router";


import { AuthGuard } from "./_authGuard/index";
import { UserLoginComponent } from "./home/component/user-login.component";

//import { ContactsComponent } from "./+contacts/components/contacts.component";
import { UserResetPsdComponent } from "./user/components/user-reset-psd.component";

export const appRoutes: any = [
  {
    path: '',
    component: UserLoginComponent
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    loadChildren: 'app/user/user.module#UserModule'
  },
  {path: 'company', canActivate: [AuthGuard], loadChildren: './+company#CompanyModule'},
  {path: 'personal', canActivate: [AuthGuard], loadChildren: './+personal#PersonalModule'},
  {path: 'contacts', canActivate: [AuthGuard], loadChildren: './+contacts#ContactsModule'},
  {path: 'folder', canActivate: [AuthGuard], loadChildren: './+folder#FolderModule'},
  {path: 'structure', canActivate: [AuthGuard], loadChildren: './+structure#StructureModule'},
  {path: 'workflow', canActivate: [AuthGuard], loadChildren: './+workflow#WorkflowModule'},
  {path: 'meeting', canActivate: [AuthGuard], loadChildren: './+meeting#MeetingModule'},
  {path: 'mission', canActivate: [AuthGuard], loadChildren: './+mission#MissionModule'}, // component: MissionListComponent
  {path: 'staff-management', canActivate: [AuthGuard], loadChildren: './recruit#RecruitModule'},//component: RecruitComponent
  {path: 'space', canActivate: [AuthGuard], loadChildren: './space#SpaceModule'}, //component: SpaceComponent
  {path: 'vacation', canActivate: [AuthGuard], loadChildren: './vacation#VacationModule'},
  {path: 'attendance', canActivate: [AuthGuard], loadChildren: './attendance#AttendanceModule'},
  {path: 'help', canActivate: [AuthGuard], loadChildren: './help#HelpModule'},
  {path: '**', redirectTo: ''}
];

export const routing = RouterModule.forRoot(appRoutes);