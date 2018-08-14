import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

Injectable()
export class MeetingModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any) {
    super(api);
  }
  addMeetingRoom(data?: any, callback?: any): any{
    return this.getData('meetingRoom', data, callback);
  }
  getMeetingRoomList(data?: any, callback?: any){
    return this.getData('getMeetingRoomList', data, callback);
  }
  updateMeetingRoom(data?: any, callback?: any): any{
  return this.getData('updateMeetingRoom', data, callback);
}
  deleteMeetingRoom(data?: any, callback?: any): any{
    return this.getData('deleteMeetingRoom', data, callback);
  }

//预定会议室
  addMeetingPreserve(data?: any, callback?: any): any{
    return this.getData('addMeetingPresere', data, callback);
  }

  updateMeetingPreserve(data?: any, callback?: any): any{
    return this.getData('updateMeetingPresere', data, callback);
  }
  MeetingPreserve(data?: any, callback?: any): any{
    return this.getData('meetingPresere', data, callback);
  }
  //搜索
  searchMeeting(data?: any, callback?: any): any{
    return this.getData('searchMeeting', data, callback);
  }
}