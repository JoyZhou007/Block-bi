/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */
import {Routes} from '@angular/router';
import {MissionListComponent} from "./components/mission-list.component";
import {MissionCreateComponent} from "./components/mission-create.component";
import {MissionDetailComponent} from "./components/mission-detail.component";
import {AuthGuard} from "../_authGuard/auth.guard";

//mission
export const routes: Routes = [
  {
    path: 'list',
    component: MissionListComponent
  },
  {
    path: 'create',
    component: MissionCreateComponent
  },
  {
    path: 'create/:type',
    component: MissionCreateComponent
  },
  {
    path: 'create/:type/:mid',
    component: MissionCreateComponent
  },
  {
    path: 'detail/:type/:mid',
    component: MissionDetailComponent
  },
  {
    path: 'detail/:mid',
    component: MissionDetailComponent
  }
];