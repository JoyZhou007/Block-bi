/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/5.
 */
import { Inject, Injectable } from "@angular/core";
import { BaseModelService } from "./base-model.service";
import * as MissionConstant from "../../config/mission.config";


Injectable()
export class MissionModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  /**
   * mission列表
   * @param data
   * @param callback
   * @returns {any}
   */
  getMissionList(data?: any, callback?: any): any {
    return this.getData('missionList', data, callback);
  }

  getMissionPagerList(data?: any, callback?: any): any {
    return this.getData('missionPagerList', data, callback);
  }

  missionUpload(data?: any, callback?: any): any {
    if (data.data.mission.detail.hasOwnProperty('conferee')) {
      for (let i in data.data.mission.detail.conferee) {
        delete data.data.mission.detail.conferee[i].name;
        delete data.data.mission.detail.conferee[i].user_profile_path
      }
    }
    if (data.data.mission.detail.hasOwnProperty('operator')) {
      for (let i in data.data.mission.detail.operator) {
        delete data.data.mission.detail.operator[i].name;
        delete data.data.mission.detail.operator[i].user_profile_path
      }
    }
    if (data.data.mission.detail.hasOwnProperty('approver')) {
      for (let i in data.data.mission.detail.approver) {
        delete data.data.mission.detail.approver[i].name;
        delete data.data.mission.detail.approver[i].user_profile_path
      }
    }
    if (data.data.mission.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_TRACKING)) {
      for (let i in data.data.mission.fns[MissionConstant.MISSION_FUNCTION_TRACKING].user_info) {
        delete  data.data.mission.fns[MissionConstant.MISSION_FUNCTION_TRACKING].user_info[i].name;
        delete  data.data.mission.fns[MissionConstant.MISSION_FUNCTION_TRACKING].user_info[i].user_profile_path
      }
    }
    if (data.data.mission.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_OBSERVER)) {
      for (let i in data.data.mission.fns[MissionConstant.MISSION_FUNCTION_OBSERVER].user_info) {
        delete data.data.mission.fns[MissionConstant.MISSION_FUNCTION_OBSERVER].user_info[i].name;
        delete data.data.mission.fns[MissionConstant.MISSION_FUNCTION_OBSERVER].user_info[i].user_profile_path
      }
    }
    if (data.data.mission.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
      for (let i in data.data.mission.fns[MissionConstant.MISSION_FUNCTION_BIDDING].user_info) {
        delete data.data.mission.fns[MissionConstant.MISSION_FUNCTION_BIDDING].user_info[i].name;
        delete data.data.mission.fns[MissionConstant.MISSION_FUNCTION_BIDDING].user_info[i].user_profile_path
      }
    }
    return this.getData('missionUpload', data, callback);
  }


  //missionCommonList
  missionUserInfoList(data?: any, callback?: any): any {
    return this.getData('missionUserInfoList', data, callback);
  }

  //missionFetchSubordinate
  missionFetchSubordinate(data?: any, callback?: any): any {
    return this.getData('missionFetchSubordinate', data, callback);
  }

  //missionExpenseList
  missionExpenseList(data?: any, callback?: any): any {
    return this.getData('missionExpenseList', data, callback);
  }

  //missionGetToken
  missionGetToken(data?: any, callback?: any): any {
    return this.getData('missionGetToken', data, callback);
  }

  //removeProjectChild
  removeProjectChild(data?: any, callback?: any): any {
    return this.getData('removeProjectChild', data, callback);
  }

  //removeProjectChild
  fetchLinkList(data?: any, callback?: any): any {
    return this.getData('fetchLinkList', data, callback);
  }

  missionMapPin(data?: any, callback?: any): any {
    return this.getData('missionMapPin', data, callback);
  }

  missionMapPinList(data?: any, callback?: any): any {
    return this.getData('missionMapPinList', data, callback);
  }

  removeMapPin(data?: any, callback?: any): any {
    return this.getData('removeMapPin', data, callback);
  }

  applicationWorkflowList(data?: any, callback?: any): any {
    return this.getData('applicationWorkflowList', data, callback);
  }

  biddingVote(data?: any, callback?: any): any {
    return this.getData('biddingVote', data, callback);
  }

  /**
   *
   * @param data
   * {mid:27}
   * @param callback
   * @returns {any}
   */
  projectScheduleDetail(data?: any, callback?: any): any {
    return this.getData('projectScheduleDetail', data, callback);
  }

  /**
   * Mission详情
   * @param data
   * @param callback
   */
  missionDetail(data?: any, callback?: any): any {
    return this.getData('missionDetail', data, callback);
  }

  /**
   * mission按钮的操作
   */
  missionCommonOperation(data?: any, callback?: any): any {
    return this.getData('missionCommonOperation', data, callback);
  }

  missionApplicationApprove(data?: any, callback?: any): any {
    return this.getData('missionApplicationApprove', data, callback);
  }

  missionComplete(data?: any, callback?: any): any {
    return this.getData('missionComplete', data, callback);
  }

  missionDelete(data?: any, callback?: any): any {
    return this.getData('missionDelete', data, callback);
  }

  missionTransfer(data?: any, callback?: any): any {
    return this.getData('missionTransfer', data, callback);
  }

  missionStatusChange(data?: any, callback?: any): any {
    return this.getData('missionStatusChange', data, callback);
  }

  targetUpload(data?: any, callback?: any): any {
    return this.getData('targetUpload', data, callback);
  }

  meetingRecord(data?: any, callback?: any): any {
    return this.getData('meetingRecord', data, callback);
  }

  missionCheck(data?: any, callback?: any): any {
    return this.getData('missionCheck', data, callback);
  }

  /**
   *
   * @param data
   * {
      identifier: "",
      general_token : "",
      mid:10,
      description : "test",
      shared : 1,
      pin_time : "2017-02-27 14:24:06"
     }
   * @param callback
   * @returns {any}
   */
  missionCalendarPinAdd(data?: any, callback?: any): any {
    return this.getData('missionCalendarPinAdd', data, callback);
  }

  /**
   *
   * @param data
   * {
      general_token: "",
      identifier: "02bd306501c94aea3727f040aec4296c"
     }
   * @param callback
   * @returns {any}
   */
  missionCalendarPinDelete(data?: any, callback?: any): any {
    return this.getData('missionCalendarPinDelete', data, callback);
  }


  /**
   *
   * @param data
   * {
      identifier: "",
      general_token : "",
      mid:10,
      description : "test",
      shared : 1,
      pin_time : "2017-02-27 14:24:06"
     }
   * @param callback
   * @returns {any}
   */
  missionCalendarPinUpdate(data?: any, callback?: any): any {
    return this.getData('missionCalendarPinUpdate', data, callback);
  }

  /**
   * mission搜索
   */
  missionSearchKeywords(data?: any, callback?: any): any {
    return this.getData('missionSearch', data, callback);
  }

  /**
   * 根据mission id得到对应聊天群组信息
   * @param data
   *  {
   *   mission_id: "1",
   *   type: "1"
   *  }
   *  关于type @see mission.config.ts
   * @param callback
   * @return {any}
   */
  missionGetChatGroup(data?: any, callback?: any): any {
    return this.getData('missionGetChatGroup', data, callback);
  }

}
