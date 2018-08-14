import { Routes } from "@angular/router";
//structure
import { StructureComponent } from "./components/structure.component";

export const routes: Routes = [
  //structure
  {
    path: ':cid',
    component: StructureComponent
  },
  // {
  //   path: ':cid/:did',
  //   component: StructureComponent
  // },
  // 没有cid的情况下跳转回首页
  {path: '', redirectTo: '/user/index', pathMatch: 'full'}
];
