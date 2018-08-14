import {Routes, RouterModule} from '@angular/router';

//home
import {FolderComponent} from './components/folder.component';


export const routes: Routes = [
  {
    path: ':folderForm',
    component: FolderComponent,
    children: [
      {
        path:'default',
        component: FolderComponent
      },
      {
        path: 'personal',
        component: FolderComponent
      },
      {
        path: 'business',
        component: FolderComponent
      },
      {
        path: 'searchResult',
        component: FolderComponent
      },
      {
        path: 'share',
        component: FolderComponent
      },
    ]
  },
  {path: '**', redirectTo: 'personal?path=/'}
];
