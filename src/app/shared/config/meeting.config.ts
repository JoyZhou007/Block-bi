//meeting 常量 错误提示

export const MEETING_ROOM_ERROR: string = 'The room is required';
export const MEETING_QUANTITY_ERROR: string = 'Quantity is required';
export const MEETING_TITLE_ERROR: string = 'Title is required';
export const MEETING_TIME_ERROR: string = 'Start time and end time is required';
export const MEETING_SELECT_START: string = 'select start time';
export const MEETING_SELECT_END: string = 'select end time';
export const MEETING_NUMBER_ERROR: string = 'Enter numbers only';
export const MEETING_NOCID_ERROR: string = "Sorry, you don't have permission to view the meeting.";
export const MEETING_CREATEROOM_ERROR: string = "There is no permission to create a room.";
export const MEETING_CREATEMEETING_ERROR: string = "There is no permission to create a meeting.";
export const MEETING_DELETEROOM: string = "Do you consider to delete this room ? that can`t undo !";
export const MEETING_NODATA: string = "No Data";


/**
 * meeting 状态
 */
export const MEETING_STATUS_CANCEL: number = 0;
export const MEETING_STATUS_PENDING: number = 1;
export const MEETING_STATUS_ARRANGED: number = 2;
export const MEETING_STATUS_IN_PROCESS: number = 3;
export const MEETING_STATUS_DONE: number = 4;


