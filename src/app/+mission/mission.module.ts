/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */
import {NgModule} from "@angular/core";
import {RouterModule} from '@angular/router';
import {FormsModule}    from '@angular/forms';
import {routes} from "./mission.routes";

import {MissionListComponent} from "./components/mission-list.component";
import {MissionListScheduleComponent} from "./components/mission-list-schedule.component";
import {MissionListCalendarComponent} from "./components/mission-list-calendar.component";
import {MissionProgressComponent} from "./components/mission-progress.component";
import {MissionCreateComponent} from "./components/mission-create.component.ts";
import {MissionDetailComponent} from "./components/mission-detail.component";
import {SharedModule} from "../shared/shared.module";
import {WorkflowModelService} from "../shared/services/index.service";
import {MissionModelService} from "../shared/services/model/mission-model.service";

//function 功能部分
import {MissionCreateParticipantComponent} from "./components/create/function/mission-create-participant.component.ts";
import {MissionCreateTrackComponent} from "./components/create/function/mission-create-track.component";
import {MissionCreateExpenseComponent} from "./components/create/function/mission-create-expense.component";
import {MissionCreateImportanceComponent} from "./components/create/function/mission-create-importance.component";
import {MissionCreateBiddingComponent} from "./components/create/function/mission-create-bidding.component";
import {MissionCreateRecorderComponent} from "./components/create/function/mission-create-recorder.component";
import {MissionCreateTargetComponent} from "./components/create/function/mission-create-target.component";
// Detail 人物显示
import {MissionPersonTaskComponent} from "./components/detail/mission-detail-person.component";
//左侧link
import {MissionLinkComponent} from "./components/mission-link.component";
//detail function
import {MissionDetailFunctionComponent} from "./components/detail/function/mission-detail-function.component.ts";
import {MissionDetailRecorderComponent} from "./components/detail/function/mission-detail-recorder.component.ts";
import {MissionDetailImportanceComponent} from "./components/detail/function/mission-detail-importance.component.ts";
import {MissionDetailTrackComponent} from "./components/detail/function/mission-detail-track.component.ts";
import {MissionDetailParticipantComponent} from "./components/detail/function/mission-detail-participant.component.ts";
import {MissionDetailExpenseComponent} from "./components/detail/function/mission-detail-expense.component.ts";
import {MissionDetailTargetComponent} from "./components/detail/function/mission-detail-target.component.ts";
import {MissionDetailBiddingComponent} from "./components/detail/function/mission-detail-bidding.component.ts";




//左侧日历
import {MissionCreateCalendarComponent} from "./components/create/mission-create-calendar.component.ts";
import {CalendarModule} from '../calendar/calendar.module';
//五种mission 创建类型
import {MissionCreateApplicationComponent} from "./components/create/mission-create-application.component.ts";
import {MissionCreateAssignmentComponent} from "./components/create/mission-create-assignment.component.ts";
import {MissionCreateMeetingComponent} from "./components/create/mission-create-meeting.component.ts";
import {MissionCreateTaskComponent} from "./components/create/mission-create-task.component.ts";
import {MissionCreateProjectComponent} from "./components/create/mission-create-project.component.ts";
//五种mission 处理模块
import {MissionDetailProjectComponent} from "./components/detail/mission-detail-project.component";
import {MissionDetailApplicationComponent} from "./components/detail/mission-detail-application.component";
import {MissionDetailTaskComponent} from "./components/detail/mission-detail-task.component";
import {MissionDetailAssignmentComponent} from "./components/detail/mission-detail-assignment.component";
import {MissionDetailMeetingComponent} from "./components/detail/mission-detail-meeting.component";
//右侧文件
import {MissionFolderComponent} from "./components/mission-folder.component";
//右侧地图
import {MissionMapComponent} from './components/mission-map.component';
import {BaiduMap} from "angular2-baidu-map";
import {DropdownModule} from "../dropdown/dropdown.module";
import {MissionListTableComponent} from "./components/mission-list-table.component";
import {TooltipModule} from "../tooltip/tooltip.module";
import {ScheduleDirective} from "./mission-schedule.directive";
import {TranslateModule} from "@ngx-translate/core";
//滚动条
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";



@NgModule({
  imports: [
    FormsModule,
    SharedModule,
    DropdownModule,
    CalendarModule,
    RouterModule.forChild(routes),
    TooltipModule,
    TranslateModule,
    PerfectScrollbarModule
  ],
  exports: [
    MissionListComponent,
    MissionProgressComponent,
  ],
  declarations: [
    MissionListComponent,
    MissionListScheduleComponent,
    MissionListCalendarComponent,
    MissionProgressComponent,
    MissionCreateComponent,
    MissionDetailComponent,
    MissionListTableComponent,
    // Detail 人物显示
    MissionPersonTaskComponent,
    //  右侧文件
    MissionFolderComponent,
    //右侧地图
    MissionMapComponent,
    BaiduMap,
    // 左侧link
    MissionLinkComponent,
    //  左侧日历
    MissionCreateCalendarComponent,
    //  五种type
    MissionCreateApplicationComponent,
    MissionCreateAssignmentComponent,
    MissionCreateMeetingComponent,
    MissionCreateTaskComponent,
    MissionCreateProjectComponent,
    // create的function功能部分
    MissionCreateParticipantComponent,
    MissionCreateTrackComponent,
    MissionCreateExpenseComponent,
    MissionCreateImportanceComponent,
    MissionCreateBiddingComponent,
    MissionCreateRecorderComponent,
    MissionCreateTargetComponent,
    // 详情
    MissionDetailProjectComponent,
    MissionDetailApplicationComponent,
    MissionDetailTaskComponent,
    MissionDetailAssignmentComponent,
    MissionDetailMeetingComponent,
    //详情functions
    MissionDetailFunctionComponent,
    MissionDetailRecorderComponent,
    MissionDetailImportanceComponent,
    MissionDetailTrackComponent,
    MissionDetailParticipantComponent,
    MissionDetailExpenseComponent,
    MissionDetailTargetComponent,
    MissionDetailBiddingComponent,
    ScheduleDirective,

  ],
  providers: [
    MissionModelService,
    WorkflowModelService
  ],
  bootstrap: [MissionListComponent],
  entryComponents: [MissionListScheduleComponent]
})
export class MissionModule {
  public static routes = routes;

  constructor() {
  }
}
