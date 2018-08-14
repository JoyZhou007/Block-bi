/**
 * Created by christine Guo on 2017/4/18.
 */
import {Routes} from '@angular/router';
import {MeetingComponent} from './component/meeting.component';

export const routes: Routes = [
  {
    path: 'index',
    component: MeetingComponent
  },
  {
    path: 'search',
    component: MeetingComponent
  }
];