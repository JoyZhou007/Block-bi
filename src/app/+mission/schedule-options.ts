import {MissionDetailAPIModel} from "../shared/services/model/entity/mission-entity";
import {ElementRef} from "@angular/core";
/**
 * Created by joyz on 2017/7/14.
 */

export interface ScheduleOptions {
  content: Array<MissionDetailAPIModel>;
  trigger: {
    on: string;
    off?: string;
  };
  active: boolean;
  viewContainer: any;
}
