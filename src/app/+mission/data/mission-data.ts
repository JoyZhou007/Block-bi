/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */
export const simpleMission = {
  "mode": "2", // 1是图表, 2是三列列表
  "filter": {
    "type": ["-1"], //-1是all, 1~5
    "date_start": '2017-01-04 00:00:01',
    "date_end": '2017-01-17 23:59:59',
    "is_self": "-1", // -1-all, 0-Yours, 1-Others,
  },
  "last_update_time": "2017-01-17 23:59:59",
  "missions": {
    "todo": [{
      "mid": 1, // mission分表的主键
      "id": 1, //mission的主键
      "type": 1, //1~5
      "name": "Test", //mission的名字,
      "description": "111adasda",
      "start": "2016-12-22 12:22:30", //mission的开始时间,
      "end": "2016-12-23 12:22:30",   //mission的结束时间"
      "start_timestamp": "12313213213", //UTC
      "end_timestamp": "12313213213",
      "fns": {
        "1": {
          "user_info": [{"psid": "147"}]
        },
        "2": {
          "user_info": [{"psid": "147"}]
        },
        "3": {
          "value": "3"
        },
        "4": {
          "user_info": [{"psid": "147"}]
        },
        "7": {
          "type": "2",
          "payee": "昆仑山",
          "payee_account": "10000",
          "account_type": "ICBC",
          "contract_amount": "10000",
          "contract_type": "1",
          "times": "4",
          "pc": "2500",
          "pc_type": "1",
          "pct": "25",
          "pc_to_type": "1",
          "pc_to_mid": "3"
        }
      },
      "detail": {
        "app_type": [
          {
            "wid": 1
          }
        ]
      },
      "link_info": {
        "before": [],
        "after": []
      }
    }],
    "doing": [],
    "done": [],
    "storage": [],
  },
  "missions_schedule": [
    /* {
     "mid": 1, // mission分表的主键
     "id": 1, //mission的主键
     "type": '5', //1~5
     "name": "aeeeeeeeeec", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 12:22:30", //mission的开始时间,
     "end": "2017-3-20 18:10:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-29 4:02:30",
     "real_end": "2017-3-29 12:22:30",
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "ccccc", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "abc2", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-29 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "test", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 1

     },
     {
     "mid": 3, // mission分表的主键
     "id": 3, //mission的主键
     "type": '2', //1~5
     "name": "abc2", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-29 5:30:30", //mission的开始时间,
     "end": "2017-3-29 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {},
     "mission_status": 1

     },
     {
     "mid": 4, // mission分表的主键
     "id": 4, //mission的主键
     "type": 1, //1~5
     "name": "application", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 1:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     "real_start": "2017-3-29 0:22:30",
     "real_end": "2017-3-29 10:22:30",
     // 五种类型
     "detail": {
     "app_type": {"wid": ""},
     "approve_time": ["2017-3-29 0:22:30", "2017-3-29 1:22:30", "2017-3-29 2:22:30", "2017-3-29 10:22:30"],
     "current_step_info": 1,
     "workflow_desc": "咿呀咿呀@！！！"
     },
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "ccccc", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 4

     },
     {
     "mid": 5, // mission分表的主键
     "id": 5, //mission的主键
     "type": 1, //1~5
     "name": "application", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 1:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     "real_start": "2017-3-29 0:30:30",
     "real_end": "2017-3-29 8:22:30",
     // 五种类型
     "detail": {
     "app_type": {"wid": ""},
     "approve_time": ["2017-3-29 0:30:30", "2017-3-29 1:22:30", "2017-3-29 2:22:30", "2017-3-29 8:22:30"],
     "current_step_info": 1,
     "workflow_desc": "咿呀咿呀@！！！"
     },
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "ccccc", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 6, // mission分表的主键
     "id": 6, //mission的主键
     "type": 3, //1~5
     "name": "abc2", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 12:22:30", //mission的开始时间,
     "end": "", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1

     },
     {
     "mid": 7, // mission分表的主键
     "id": 7, //mission的主键
     "type": '4', //1~5
     "name": "project", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {
     "internal": [
     {
     available_btns: {},
     creator_info: {},
     date_period: "",
     delayed: "",
     "status" : "7",
     description: "111adasda",
     detail: {},
     end: "2017-3-29 12:10:30",
     end_timestamp: "12313213213",
     fns: {},
     folder_id: "",
     id: "1",
     isReset: false,
     last_update_info: {},
     link_info: {},
     mid: "2",
     mission_status: "1",
     name: "aeeeeeeeeec",
     pending_issue: "",
     pin_list: [],
     promoted: "0",
     real_end: "2017-3-29 12:22:30",
     real_end_timestamp: "",
     real_start: "2017-3-29 0:02:30",
     real_start_timestamp: "",
     roles: [],
     start: "2017-3-29 0:22:30",
     start_timestamp: "12313213213",
     type: "5",
     },
     ]
     },
     "real_start": "2017-3-29 0:22:30",
     "real_end": "2017-3-29 12:22:30",
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 4

     },
     {
     "mid": 8, // mission分表的主键
     "id": 8, //mission的主键
     "type": '4', //1~5
     "name": "project", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {
     "internal": [
     {
     available_btns: {},
     creator_info: {},
     date_period: "",
     delayed: "",
     "status" : "7",
     description: "111adasda",
     detail: {},
     end: "2017-3-20 18:10:30",
     end_timestamp: "12313213213",
     fns: Object,
     folder_id: "",
     id: "1",
     isReset: false,
     last_update_info: {},
     link_info: {},
     mid: "1",
     mission_status: "7",
     name: "aeeeeeeeeec",
     pending_issue: "",
     pin_list: [],
     promoted: "0",
     real_end: "2017-3-29 12:22:30",
     real_end_timestamp: "",
     real_start: "2017-3-29 4:02:30",
     real_start_timestamp: "",
     roles: [],
     start: "2017-3-20 12:22:30",
     start_timestamp: "12313213213",
     type: "5",
     },
     {
     available_btns: {},
     creator_info: {},
     date_period: "",
     delayed: "",
     "status" : "7",
     description: "111adasda",
     detail: {},
     end: "2017-3-20 18:10:30",
     end_timestamp: "12313213213",
     "fns": {
     '4': {
     'value': 4
     }
     },
     folder_id: "",
     id: "2",
     isReset: false,
     last_update_info: {},
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "www", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     mid: "2",
     mission_status: "4",
     name: "aeeeeeeeeec",
     pending_issue: "",
     pin_list: [],
     promoted: "0",
     real_end_timestamp: "",
     real_start: "2017-3-29 3:22:30",
     real_end: "2017-3-29 9:22:30",
     real_start_timestamp: "",
     roles: [],
     start: "2017-3-20 12:22:30",
     start_timestamp: "12313213213",
     type: "3",
     },
     {
     available_btns: {},
     creator_info: {},
     date_period: "",
     delayed: "",
     "status" : "7",
     description: "111adasda",
     detail: {},
     end: "2017-3-20 18:10:30",
     end_timestamp: "12313213213",
     "fns": {
     '4': {
     'value': 4
     }
     },
     folder_id: "",
     id: "2",
     isReset: false,
     last_update_info: {},
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "www", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     mid: "2",
     mission_status: "1",
     name: "aeeeeeeeeec",
     pending_issue: "",
     pin_list: [],
     promoted: "0",
     real_end_timestamp: "",
     real_start: "2017-3-29 3:22:30",
     real_end: "2017-3-29 9:22:30",
     real_start_timestamp: "",
     roles: [],
     start: "2017-3-20 12:22:30",
     start_timestamp: "12313213213",
     type: "3",
     },
     ]
     },
     "real_start": "2017-3-29 0:22:30",
     "real_end": "2017-3-29 12:22:30",
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 9, // mission分表的主键
     "id": 9, //mission的主键
     "type": 3, //1~5
     "name": "aeeeeeeeeec", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 12:22:30", //mission的开始时间,
     "end": "2017-3-20 18:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-29 3:22:30",
     "real_end": "2017-3-29 8:22:30",
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "abc2", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 10, // mission分表的主键
     "id": 10, //mission的主键
     "type": 3, //1~5
     "name": "aerer", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-29 3:22:30",
     "real_end": "2017-3-29 12:22:30",
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "www", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 4

     },
     {
     "mid": 11, // mission分表的主键
     "id": 11, //mission的主键
     "type": '4', //1~5
     "name": "zzzzz", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-29 3:00:30",
     "real_end": "2017-3-29 12:22:30",
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1

     },
     {
     "mid": 12, // mission分表的主键
     "id": 12, //mission的主键
     "type": 3, //1~5
     "name": "aerer", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-31 5:30:30",
     "real_end": "2017-3-29 12:30:30",
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "www", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 4

     },
     {
     "mid": 13, // mission分表的主键
     "id": 13, //mission的主键
     "type": 1, //1~5
     "name": "application", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 1:22:30", //mission的开始时间,
     "end": "2017-3-31 8:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     "real_start": "2017-3-31 0:22:30",
     "real_end": "2017-3-31 10:22:30",
     // 五种类型
     "detail": {
     "app_type": {"wid": ""},
     "approve_time": [
     {
     'time' : '2017-3-31 0:22:30'
     },
     {
     'time' : '2017-3-31 5:22:30'
     },
     ],
     "current_step_info": 1,
     "workflow_desc": "咿呀咿呀@！！！"
     },
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "ccccc", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 4

     },*/
    {
      "mid": 14, // mission分表的主键
      "id": 14, //mission的主键
      "type": 1, //1~5
      "name": "application", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 1:22:30", //mission的开始时间,
      "end": "", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      "real_start": "2017-4-1 0:22:30",
      "real_end": "2017-3-31 10:22:30",
      // 五种类型
      "detail": {
        "app_type": {"wid": ""},
        "approve_time": [
          {
            'time': '2017-4-1 0:22:30'
          },
          {
            'time': '2017-4-1 2:27:30'
          },
        ],
        "current_step_info": 1,
        "workflow_desc": "咿呀咿呀@！！！"
      },
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 4

    },
    /*  {
     "mid": 15, // mission分表的主键
     "id": 15, //mission的主键
     "type": 1, //1~5
     "name": "application", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 1:22:30", //mission的开始时间,
     "end": "", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     "real_start": "2017-4-1 0:22:30",
     "real_end": "2017-4-1 10:22:30",
     // 五种类型
     "detail": {
     "app_type": {"wid": ""},
     "approve_time": [
     {
     'time' : '2017-4-1 0:22:30'
     },
     {
     'time' : '2017-4-1 2:27:30'
     },
     ],
     "current_step_info": 1,
     "workflow_desc": "咿呀咿呀@！！！"
     },
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "ccccc", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 16, // mission分表的主键
     "id": 16, //mission的主键
     "type": 1, //1~5
     "name": "application", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 1:22:30", //mission的开始时间,
     "end": "", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     "real_start": "2017-3-31 0:22:30",
     "real_end": "2017-3-31 10:22:30",
     // 五种类型
     "detail": {
     "app_type": {"wid": ""},
     "approve_time": [
     {
     'time' : '2017-3-31 0:22:30'
     },
     {
     'time' : '2017-4-1 2:27:30'
     },
     ],
     "current_step_info": 1,
     "workflow_desc": "咿呀咿呀@！！！"
     },
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '1', //1~5
     "name": "ccccc", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 4

     },*/
  ],
};

export const simpleMissionMonth = {
  "mode": "2", // 1是图表, 2是三列列表
  "filter": {
    "type": ["-1"], //-1是all, 1~5
    "date_start": '2017-01-04 00:00:01',
    "date_end": '2017-01-17 23:59:59',
    "is_self": "-1", // -1-all, 0-Yours, 1-Others,
  },
  "last_update_time": "2017-01-17 23:59:59",
  "missions": {
    "todo": [{
      "mid": 1, // mission分表的主键
      "id": 1, //mission的主键
      "type": 1, //1~5
      "name": "Test", //mission的名字,
      "description": "111adasda",
      "start": "2016-12-22 12:22:30", //mission的开始时间,
      "end": "2016-12-23 12:22:30",   //mission的结束时间"
      "start_timestamp": "12313213213", //UTC
      "end_timestamp": "12313213213",
      "fns": {
        "1": {
          "user_info": [{"psid": "147"}]
        },
        "2": {
          "user_info": [{"psid": "147"}]
        },
        "3": {
          "value": "3"
        },
        "4": {
          "user_info": [{"psid": "147"}]
        },
        "7": {
          "type": "2",
          "payee": "昆仑山",
          "payee_account": "10000",
          "account_type": "ICBC",
          "contract_amount": "10000",
          "contract_type": "1",
          "times": "4",
          "pc": "2500",
          "pc_type": "1",
          "pct": "25",
          "pc_to_type": "1",
          "pc_to_mid": "3"
        }
      },
      "detail": {
        "app_type": [
          {
            "wid": 1
          }
        ]
      },
      "link_info": {
        "before": [],
        "after": []
      }
    }],
    "doing": [],
    "done": [],
    "storage": [],
  },
  "missions_schedule": [
/*    {
      "mid": 1, // mission分表的主键
      "id": 1, //mission的主键
      "type": '5', //1~5
      "name": "aeeeeeeeeec", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-26 12:22:30", //mission的开始时间,
      "end": "2017-3-29 18:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "2017-3-26 3:22:30",
      "real_end": "2017-3-29 3:22:30",
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 7

    },

    {
      "mid": 2, // mission分表的主键
      "id": 2, //mission的主键
      "type": '1', //1~5
      "name": "abc2", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-10 5:22:30", //mission的开始时间,
      "end": "2017-3-20 15:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "test", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 1

    },
    {
      "mid": 3, // mission分表的主键
      "id": 3, //mission的主键
      "type": '2', //1~5
      "name": "abc2", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-1 0:22:30", //mission的开始时间,
      "end": "2017-3-20 0:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "link_info": {},
      "mission_status": 1

    },*/
    {
      "mid": 4, // mission分表的主键
      "id": 4, //mission的主键
      "type": "1", //1~5
      "name": "application", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 1:22:30", //mission的开始时间,
      "end": "2017-3-20 15:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      "real_start": "2017-5-16 1:22:30",
      "real_end": "2017-5-18 1:22:30",
      // 五种类型
      "detail": {
        "app_type": {"wid": ""},
        "approve_time": [
          {
            "time": "2017-5-18 1:22:30"
          },
          {
            "time": "2017-5-18 1:27:30"
          },
        ],
        "current_step_info": 1,
        "workflow_desc": "咿呀咿呀@！！！"
      },
      "link_info": {
/*        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []*/
      },
      "mission_status": "4"

    },
    {
      "mid": 5, // mission分表的主键
      "id": 5, //mission的主键
      "type": '1', //1~5
      "name": "application", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 1:22:30", //mission的开始时间,
      "end": "2017-3-20 15:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      "real_start": "2017-5-18 1:22:30",
      "real_end": "2017-5-18 12:22:30",
      // 五种类型
      "detail": {
        "app_type": {"wid": ""},
        "approve_time": [
          {
            "time": "2017-5-18 1:22:30"
          },
          {
            "time": "2017-5-18 2:22:30"
          },
        ],
        "current_step_info": 1,
        "workflow_desc": "咿呀咿呀@！！！"
      },
      "link_info": {
        "before": [
          /*{
           "mid": 2, // mission分表的主键
           "id": 2, //mission的主键
           "type": '1', //1~5
           "name": "ccccc", //mission的名字,
           "description": "111adasda",
           "start": "2017-3-20 5:22:30", //mission的开始时间,
           "end": "2017-3-20 15:22:30", //mission的结束时间"
           "start_timestamp": "12313213213",
           "end_timestamp": "12313213213",
           // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
           "fns": {},
           "creator_info": {
           "time": "2017-03-16 06:47:37",
           "time_str": 1489646857,
           "user_info": {
           "name": "lili2",
           "p_name": "CEO",
           "psid": "143",
           "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
           }
           },
           // 五种类型
           "detail": {},
           "link_info": {
           "before": [],
           "after": []
           },
           "mission_status": 1
           }*/
        ],
        "after": []
      },
      "mission_status": 7

    },
        {
     "mid": 6, // mission分表的主键
     "id": 6, //mission的主键
     "type": 3, //1~5
     "name": "abc2", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 12:22:30", //mission的开始时间,
     "end": "", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1

     },
     {
     "mid": 7, // mission分表的主键
     "id": 7, //mission的主键
     "type": '4', //1~5
     "name": "project", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {
     "internal": [
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "215",
     "mid": "218",
     "name": "3.16 子mission  applictaion!",
     "start": "2017-03-16 11:54:02",
     "start_timestamp": "1489665242",
     "type": "1",
     "status": "7",
     "real_end": "2017-03-2 12:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "215",
     "mid": "218",
     "name": "3.16 子mission  applictaion!",
     "start": "2017-03-16 11:54:02",
     "start_timestamp": "1489665242",
     "type": "1",
     "status": "7",
     "real_end": "2017-03-2 18:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "216",
     "mid": "218",
     "name": "子的meeting!!!",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "3",
     "status": "7",
     "real_end": "2017-03-13 8:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "216",
     "mid": "218",
     "name": "子的meeting!!!",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "3",
     "status": "7",
     "real_end": "2017-03-20 3:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "217",
     "mid": "218",
     "name": "222222222",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "2",
     "status": "7",
     "real_end": "2017-03-23 4:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "217",
     "mid": "218",
     "name": "222222222",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "2",
     "status": "4",
     "real_end": "2017-03-22 8:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "217",
     "mid": "218",
     "name": "222222222",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "5",
     "status": "7",
     "real_end": "2017-3-29 14:22:30"
     },
     ]
     },
     "real_start": "2017-3-2 0:22:30",
     "real_end": "2017-3-29 14:22:30",
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 4

     },
     {
     "mid": 8, // mission分表的主键
     "id": 8, //mission的主键
     "type": '4', //1~5
     "name": "project", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {
     "internal": [
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "215",
     "mid": "218",
     "name": "3.16 子mission  applictaion!",
     "start": "2017-03-16 11:54:02",
     "start_timestamp": "1489665242",
     "type": "1",
     "status": "7",
     "real_end": "2017-03-1 1:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "215",
     "mid": "218",
     "name": "3.16 子mission  applictaion!",
     "start": "2017-03-16 11:54:02",
     "start_timestamp": "1489665242",
     "type": "1",
     "status": "7",
     "real_end": "2017-03-13 6:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "216",
     "mid": "218",
     "name": "子的meeting!!!",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "3",
     "status": "7",
     "real_end": "2017-03-14 8:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "216",
     "mid": "218",
     "name": "子的meeting!!!",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "3",
     "status": "7",
     "real_end": "2017-03-26 3:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "217",
     "mid": "218",
     "name": "222222222",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "2",
     "status": "7",
     "real_end": "2017-03-18 4:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "217",
     "mid": "218",
     "name": "222222222",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "2",
     "status": "4",
     "real_end": "2017-03-19 9:00:00"
     },
     {
     "end": "2017-03-18 12:00:00",
     "end_timestamp": "1489838400",
     "id": "217",
     "mid": "218",
     "name": "222222222",
     "start": "2017-03-10 12:00:00",
     "start_timestamp": "1489147200",
     "type": "5",
     "status": "7",
     "real_end": "2017-03-17 12:00:00"
     },
     ]
     },
     "real_start": "2017-3-4 0:22:30",
     "real_end": "2017-3-30 0:22:30",
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 9, // mission分表的主键
     "id": 9, //mission的主键
     "type": 3, //1~5
     "name": "aeeeeeeeeec", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 12:22:30", //mission的开始时间,
     "end": "2017-3-20 18:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-5 8:22:30",
     "real_end": "2017-3-22 8:22:30",
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "abc2", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 7

     },
     {
     "mid": 10, // mission分表的主键
     "id": 10, //mission的主键
     "type": 3, //1~5
     "name": "aerer", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-19 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-15 12:22:30",
     "real_end": "2017-3-23 12:22:30",
     "link_info": {
     "before": [
     {
     "mid": 2, // mission分表的主键
     "id": 2, //mission的主键
     "type": '3', //1~5
     "name": "www", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-20 5:22:30", //mission的开始时间,
     "end": "2017-3-20 15:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {},
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 五种类型
     "detail": {},
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1
     }
     ],
     "after": []
     },
     "mission_status": 4

     },
     {
     "mid": 11, // mission分表的主键
     "id": 11, //mission的主键
     "type": '4', //1~5
     "name": "zzzzz", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-2 16:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-16 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "",
     "real_end": "",
     "link_info": {
     "before": [],
     "after": []
     },
     "mission_status": 1

     },
     {
     "mid": 12, // mission分表的主键
     "id": 12, //mission的主键
     "type": 3, //1~5
     "name": "aerer", //mission的名字,
     "description": "111adasda",
     "start": "2017-3-19 4:22:30", //mission的开始时间,
     "end": "2017-3-20 16:22:30", //mission的结束时间"
     "start_timestamp": "12313213213",
     "end_timestamp": "12313213213",
     "creator_info": {
     "time": "2017-03-23 06:47:37",
     "time_str": 1489646857,
     "user_info": {
     "name": "lili2",
     "p_name": "CEO",
     "psid": "143",
     "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
     }
     },
     // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
     "fns": {
     '4': {
     'value': 4
     }
     },
     // 五种类型
     "detail": {},
     "real_start": "2017-3-15 12:22:30",
     "real_end": "2017-3-23 12:22:30",
     "link_info": {
     "before": [
     ],
     "after": []
     },
     "mission_status": 1

     },
  ],
}

export const simpleMissionWeek = {
  "mode": "2", // 1是图表, 2是三列列表
  "filter": {
    "type": ["-1"], //-1是all, 1~5
    "date_start": '2017-01-04 00:00:01',
    "date_end": '2017-01-17 23:59:59',
    "is_self": "-1", // -1-all, 0-Yours, 1-Others,
  },
  "last_update_time": "2017-01-17 23:59:59",
  "missions": {
    "todo": [{
      "mid": 1, // mission分表的主键
      "id": 1, //mission的主键
      "type": 1, //1~5
      "name": "Test", //mission的名字,
      "description": "111adasda",
      "start": "2016-12-22 12:22:30", //mission的开始时间,
      "end": "2016-12-23 12:22:30",   //mission的结束时间"
      "start_timestamp": "12313213213", //UTC
      "end_timestamp": "12313213213",
      "fns": {
        "1": {
          "user_info": [{"psid": "147"}]
        },
        "2": {
          "user_info": [{"psid": "147"}]
        },
        "3": {
          "value": "3"
        },
        "4": {
          "user_info": [{"psid": "147"}]
        },
        "7": {
          "type": "2",
          "payee": "昆仑山",
          "payee_account": "10000",
          "account_type": "ICBC",
          "contract_amount": "10000",
          "contract_type": "1",
          "times": "4",
          "pc": "2500",
          "pc_type": "1",
          "pct": "25",
          "pc_to_type": "1",
          "pc_to_mid": "3"
        }
      },
      "detail": {
        "app_type": [
          {
            "wid": 1
          }
        ]
      },
      "link_info": {
        "before": [],
        "after": []
      }
    }],
    "doing": [],
    "done": [],
    "storage": [],
  },
  "missions_schedule": [
    {
      "mid": 1, // mission分表的主键
      "id": 1, //mission的主键
      "type": '5', //1~5
      "name": "aeeeeeeeeec", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-26 12:22:30", //mission的开始时间,
      "end": "2017-3-29 18:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "2017-3-26 3:22:30",
      "real_end": "2017-3-29 4:00:30",
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 7

    },

    {
      "mid": 2, // mission分表的主键
      "id": 2, //mission的主键
      "type": '1', //1~5
      "name": "abc2", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-27 15:22:30", //mission的开始时间,
      "end": "2017-3-30 15:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "test", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 1

    },
    {
      "mid": 3, // mission分表的主键
      "id": 3, //mission的主键
      "type": '2', //1~5
      "name": "abc2", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-27 0:22:30", //mission的开始时间,
      "end": "2017-3-30 0:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "link_info": {},
      "mission_status": 1

    },
    {
      "mid": 4, // mission分表的主键
      "id": 4, //mission的主键
      "type": 1, //1~5
      "name": "application", //mission的名字,
      "description": "111adasda",
      "start": "2017-5-17 0:22:30", //mission的开始时间,
      "end": "2017-5-17 12:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      "real_start": "2017-5-17 0:22:30",
      "real_end": "2017-5-17 12:22:30",
      // 五种类型
      "detail": {
        "app_type": {"wid": ""},
        "approve_time": [{
          "time": "2017-5-17 1:22:30"
        },
          {
            "time": "2017-5-17 2:22:30"
          },
        ],
        "current_step_info": 1,
        "workflow_desc": "咿呀咿呀@！！！"
      },
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 4

    },
    {
      "mid": 5, // mission分表的主键
      "id": 5, //mission的主键
      "type": '1', //1~5
      "name": "application", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 1:22:30", //mission的开始时间,
      "end": "2017-3-20 15:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      "real_start": "2017-3-27 12:22:30",
      "real_end": "2017-4-1 12:22:30",
      // 五种类型
      "detail": {
        "app_type": {"wid": ""},
        "approve_time": [{
          "time": "2017-3-27 12:22:30"
        },
          {
            "time": "2017-3-29 0:22:30"
          },
        ],
        "current_step_info": 1,
        "workflow_desc": "咿呀咿呀@！！！"
      },
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 7

    },
    {
      "mid": 6, // mission分表的主键
      "id": 6, //mission的主键
      "type": 3, //1~5
      "name": "abc2", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-26 12:22:30", //mission的开始时间,
      "end": "", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "link_info": {
        "before": [],
        "after": []
      },
      "mission_status": 1

    },
    {
      "mid": 7, // mission分表的主键
      "id": 7, //mission的主键
      "type": '4', //1~5
      "name": "project", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 4:22:30", //mission的开始时间,
      "end": "2017-3-20 16:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      "creator_info": {
        "time": "2017-03-16 06:47:37",
        "time_str": 1489646857,
        "user_info": {
          "name": "lili2",
          "p_name": "CEO",
          "psid": "143",
          "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
        }
      },
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {
        "internal": [
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            detail: {},
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            fns: Object,
            folder_id: "",
            id: "1",
            isReset: false,
            last_update_info: {},
            link_info: {},
            mid: "1",
            mission_status: "7",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end: "2017-3-29 12:22:30",
            real_end_timestamp: "",
            real_start: "2017-3-26 4:02:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "5",
          },
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            detail: {},
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            "fns": {
              '4': {
                'value': 4
              }
            },
            folder_id: "",
            id: "2",
            isReset: false,
            last_update_info: {},
            "link_info": {
              "before": [
                {
                  "mid": 2, // mission分表的主键
                  "id": 2, //mission的主键
                  "type": '3', //1~5
                  "name": "www", //mission的名字,
                  "description": "111adasda",
                  "start": "2017-3-20 5:22:30", //mission的开始时间,
                  "end": "2017-3-20 15:22:30", //mission的结束时间"
                  "start_timestamp": "12313213213",
                  "end_timestamp": "12313213213",
                  // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
                  "fns": {},
                  "creator_info": {
                    "time": "2017-03-23 06:47:37",
                    "time_str": 1489646857,
                    "user_info": {
                      "name": "lili2",
                      "p_name": "CEO",
                      "psid": "143",
                      "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
                    }
                  },
                  // 五种类型
                  "detail": {},
                  "link_info": {
                    "before": [],
                    "after": []
                  },
                  "mission_status": 1
                }
              ],
              "after": []
            },
            mid: "2",
            mission_status: "4",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end_timestamp: "",
            real_start: "2017-3-27 3:22:30",
            real_end: "2017-3-30 9:22:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "3",
          },
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            detail: {},
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            "fns": {
              '4': {
                'value': 4
              }
            },
            folder_id: "",
            id: "2",
            isReset: false,
            last_update_info: {},
            "link_info": {
              "before": [
                {
                  "mid": 2, // mission分表的主键
                  "id": 2, //mission的主键
                  "type": '3', //1~5
                  "name": "www", //mission的名字,
                  "description": "111adasda",
                  "start": "2017-3-20 5:22:30", //mission的开始时间,
                  "end": "2017-3-20 15:22:30", //mission的结束时间"
                  "start_timestamp": "12313213213",
                  "end_timestamp": "12313213213",
                  // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
                  "fns": {},
                  "creator_info": {
                    "time": "2017-03-23 06:47:37",
                    "time_str": 1489646857,
                    "user_info": {
                      "name": "lili2",
                      "p_name": "CEO",
                      "psid": "143",
                      "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
                    }
                  },
                  // 五种类型
                  "detail": {},
                  "link_info": {
                    "before": [],
                    "after": []
                  },
                  "mission_status": 1
                }
              ],
              "after": []
            },
            mid: "2",
            mission_status: "1",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end_timestamp: "",
            real_start: "2017-3-28 3:22:30",
            real_end: "2017-3-30 9:22:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "3",
          },
        ]
      },
      "real_start": "2017-3-25 2:22:30",
      "real_end": "2017-3-30 23:22:30",
      "link_info": {
        "before": [],
        "after": []
      },
      "mission_status": 4

    },
    {
      "mid": 8, // mission分表的主键
      "id": 8, //mission的主键
      "type": '4', //1~5
      "name": "project", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 4:22:30", //mission的开始时间,
      "end": "2017-3-20 16:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      "creator_info": {
        "time": "2017-03-16 06:47:37",
        "time_str": 1489646857,
        "user_info": {
          "name": "lili2",
          "p_name": "CEO",
          "psid": "143",
          "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
        }
      },
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {
        "internal": [
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            detail: {},
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            fns: Object,
            folder_id: "",
            id: "1",
            isReset: false,
            last_update_info: {},
            link_info: {},
            mid: "1",
            mission_status: "7",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end: "2017-3-29 12:22:30",
            real_end_timestamp: "",
            real_start: "2017-3-26 4:02:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "5",
          },
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            detail: {},
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            "fns": {
              '4': {
                'value': 4
              }
            },
            folder_id: "",
            id: "2",
            isReset: false,
            last_update_info: {},
            "link_info": {
              "before": [
                {
                  "mid": 2, // mission分表的主键
                  "id": 2, //mission的主键
                  "type": '3', //1~5
                  "name": "www", //mission的名字,
                  "description": "111adasda",
                  "start": "2017-3-20 5:22:30", //mission的开始时间,
                  "end": "2017-3-20 15:22:30", //mission的结束时间"
                  "start_timestamp": "12313213213",
                  "end_timestamp": "12313213213",
                  // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
                  "fns": {},
                  "creator_info": {
                    "time": "2017-03-23 06:47:37",
                    "time_str": 1489646857,
                    "user_info": {
                      "name": "lili2",
                      "p_name": "CEO",
                      "psid": "143",
                      "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
                    }
                  },
                  // 五种类型
                  "detail": {},
                  "link_info": {
                    "before": [],
                    "after": []
                  },
                  "mission_status": 1
                }
              ],
              "after": []
            },
            mid: "2",
            mission_status: "4",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end_timestamp: "",
            real_start: "2017-3-27 3:22:30",
            real_end: "2017-3-30 9:22:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "3",
          },
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            detail: {},
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            "fns": {
              '4': {
                'value': 4
              }
            },
            folder_id: "",
            id: "2",
            isReset: false,
            last_update_info: {},
            "link_info": {
              "before": [
                {
                  "mid": 2, // mission分表的主键
                  "id": 2, //mission的主键
                  "type": '3', //1~5
                  "name": "www", //mission的名字,
                  "description": "111adasda",
                  "start": "2017-3-20 5:22:30", //mission的开始时间,
                  "end": "2017-3-20 15:22:30", //mission的结束时间"
                  "start_timestamp": "12313213213",
                  "end_timestamp": "12313213213",
                  // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
                  "fns": {},
                  "creator_info": {
                    "time": "2017-03-23 06:47:37",
                    "time_str": 1489646857,
                    "user_info": {
                      "name": "lili2",
                      "p_name": "CEO",
                      "psid": "143",
                      "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
                    }
                  },
                  // 五种类型
                  "detail": {},
                  "link_info": {
                    "before": [],
                    "after": []
                  },
                  "mission_status": 1
                }
              ],
              "after": []
            },
            mid: "2",
            mission_status: "1",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end_timestamp: "",
            real_start: "2017-3-28 3:22:30",
            real_end: "2017-3-30 9:22:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "3",
          },
          {
            available_btns: {},
            creator_info: {},
            date_period: "",
            delayed: "",
            "status": "7",
            description: "111adasda",
            "detail": {
              "internal": [
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "215",
                  "mid": "218",
                  "name": "3.16 子mission  applictaion!",
                  "start": "2017-03-16 11:54:02",
                  "start_timestamp": "1489665242",
                  "type": "1",
                  "status": "7",
                  "real_end": "2017-03-28 13:00:00"
                },
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "215",
                  "mid": "218",
                  "name": "3.16 子mission  applictaion!",
                  "start": "2017-03-16 11:54:02",
                  "start_timestamp": "1489665242",
                  "type": "1",
                  "status": "7",
                  "real_end": "2017-03-29 6:00:00"
                },
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "216",
                  "mid": "218",
                  "name": "子的meeting!!!",
                  "start": "2017-03-10 12:00:00",
                  "start_timestamp": "1489147200",
                  "type": "3",
                  "status": "7",
                  "real_end": "2017-03-28 8:00:00"
                },
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "216",
                  "mid": "218",
                  "name": "子的meeting!!!",
                  "start": "2017-03-10 12:00:00",
                  "start_timestamp": "1489147200",
                  "type": "3",
                  "status": "7",
                  "real_end": "2017-03-30 3:00:00"
                },
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "217",
                  "mid": "218",
                  "name": "222222222",
                  "start": "2017-03-10 12:00:00",
                  "start_timestamp": "1489147200",
                  "type": "2",
                  "status": "7",
                  "real_end": "2017-03-29 4:00:00"
                },
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "217",
                  "mid": "218",
                  "name": "222222222",
                  "start": "2017-03-10 12:00:00",
                  "start_timestamp": "1489147200",
                  "type": "2",
                  "status": "4",
                  "real_end": "2017-03-29 9:00:00"
                },
                {
                  "end": "2017-03-18 12:00:00",
                  "end_timestamp": "1489838400",
                  "id": "217",
                  "mid": "218",
                  "name": "222222222",
                  "start": "2017-03-10 12:00:00",
                  "start_timestamp": "1489147200",
                  "type": "5",
                  "status": "7",
                  "real_end": "2017-03-29 12:00:00"
                },
              ]
            },
            end: "2017-3-20 18:10:30",
            end_timestamp: "12313213213",
            "fns": {
              '4': {
                'value': 4
              }
            },
            folder_id: "",
            id: "2",
            isReset: false,
            last_update_info: {},
            "link_info": {
              "before": [
                {
                  "mid": 2, // mission分表的主键
                  "id": 2, //mission的主键
                  "type": '3', //1~5
                  "name": "www", //mission的名字,
                  "description": "111adasda",
                  "start": "2017-3-20 5:22:30", //mission的开始时间,
                  "end": "2017-3-20 15:22:30", //mission的结束时间"
                  "start_timestamp": "12313213213",
                  "end_timestamp": "12313213213",
                  // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
                  "fns": {},
                  "creator_info": {
                    "time": "2017-03-23 06:47:37",
                    "time_str": 1489646857,
                    "user_info": {
                      "name": "lili2",
                      "p_name": "CEO",
                      "psid": "143",
                      "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
                    }
                  },
                  // 五种类型
                  "detail": {},
                  "link_info": {
                    "before": [],
                    "after": []
                  },
                  "mission_status": 1
                }
              ],
              "after": []
            },
            mid: "2",
            mission_status: "4",
            name: "aeeeeeeeeec",
            pending_issue: "",
            pin_list: [],
            promoted: "0",
            real_end_timestamp: "",
            real_start: "2017-3-28 3:22:30",
            real_end: "2017-3-30 9:22:30",
            real_start_timestamp: "",
            roles: [],
            start: "2017-3-20 12:22:30",
            start_timestamp: "12313213213",
            type: "4",
          },
        ]
      },
      "real_start": "2017-3-25 12:22:30",
      "real_end": "2017-3-30 19:22:30",
      "link_info": {
        "before": [],
        "after": []
      },
      "mission_status": 7

    },
    {
      "mid": 9, // mission分表的主键
      "id": 9, //mission的主键
      "type": 3, //1~5
      "name": "aeeeeeeeeec", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 12:22:30", //mission的开始时间,
      "end": "2017-3-20 18:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "2017-3-25 8:22:30",
      "real_end": "2017-3-29 8:22:30",
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '3', //1~5
            "name": "abc2", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 7

    },
    {
      "mid": 10, // mission分表的主键
      "id": 10, //mission的主键
      "type": 3, //1~5
      "name": "aerer", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 4:22:30", //mission的开始时间,
      "end": "2017-3-31 16:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      "creator_info": {
        "time": "2017-03-23 06:47:37",
        "time_str": 1489646857,
        "user_info": {
          "name": "lili2",
          "p_name": "CEO",
          "psid": "143",
          "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
        }
      },
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "2017-3-26 22:22:30",
      "real_end": "2017-3-29 12:22:30",
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '3', //1~5
            "name": "www", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-23 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 4

    },
    {
      "mid": 12, // mission分表的主键
      "id": 12, //mission的主键
      "type": 3, //1~5
      "name": "aerer", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-20 4:22:30", //mission的开始时间,
      "end": "", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      "creator_info": {
        "time": "2017-03-23 06:47:37",
        "time_str": 1489646857,
        "user_info": {
          "name": "lili2",
          "p_name": "CEO",
          "psid": "143",
          "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
        }
      },
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "2017-3-26 22:22:30",
      "real_end": "2017-3-29 12:22:30",
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '3', //1~5
            "name": "www", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-23 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 4

    },
    {
      "mid": 11, // mission分表的主键
      "id": 11, //mission的主键
      "type": '4', //1~5
      "name": "zzzzz", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-25 16:22:30", //mission的开始时间,
      "end": "2017-3-30 16:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      "creator_info": {
        "time": "2017-03-16 06:47:37",
        "time_str": 1489646857,
        "user_info": {
          "name": "lili2",
          "p_name": "CEO",
          "psid": "143",
          "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
        }
      },
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "",
      "real_end": "",
      "link_info": {
        "before": [],
        "after": []
      },
      "mission_status": 1

    },
    {
      "mid": 13, // mission分表的主键
      "id": 13, //mission的主键
      "type": '2', //1~5
      "name": "abc2", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-27 0:22:30", //mission的开始时间,
      "end": "2017-3-27 0:50:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "link_info": {},
      "mission_status": 1

    },
    {
      "mid": 14, // mission分表的主键
      "id": 14, //mission的主键
      "type": '5', //1~5
      "name": "aeeeeeeeeec", //mission的名字,
      "description": "111adasda",
      "start": "2017-3-26 12:22:30", //mission的开始时间,
      "end": "2017-3-29 18:22:30", //mission的结束时间"
      "start_timestamp": "12313213213",
      "end_timestamp": "12313213213",
      // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
      "fns": {
        '4': {
          'value': 4
        }
      },
      // 五种类型
      "detail": {},
      "real_start": "2017-3-30 3:22:30",
      "real_end": "2017-3-30 4:00:30",
      "link_info": {
        "before": [
          {
            "mid": 2, // mission分表的主键
            "id": 2, //mission的主键
            "type": '1', //1~5
            "name": "ccccc", //mission的名字,
            "description": "111adasda",
            "start": "2017-3-20 5:22:30", //mission的开始时间,
            "end": "2017-3-20 15:22:30", //mission的结束时间"
            "start_timestamp": "12313213213",
            "end_timestamp": "12313213213",
            // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
            "fns": {},
            "creator_info": {
              "time": "2017-03-16 06:47:37",
              "time_str": 1489646857,
              "user_info": {
                "name": "lili2",
                "p_name": "CEO",
                "psid": "143",
                "user_profile_path": "assets/user-profile/20-20/profile_58cfaaa020f460.27311669.png"
              }
            },
            // 五种类型
            "detail": {},
            "link_info": {
              "before": [],
              "after": []
            },
            "mission_status": 1
          }
        ],
        "after": []
      },
      "mission_status": 7

    },
  ],
}

//列表接口数据
export const MissionListAPIData = {
  "mode": "1", // 1是图表, 2是三列列表
  "filter": {
    "type": ["-1"], //-1是all, 1~5
    "date_start": '2017-01-04 00:00:01',
    "date_end": '2017-01-17 23:59:59',
    "is_self": "-1", // -1-all, 0-Yours, 1-Others,
  },
  "last_update_time": "2017-01-17 23:59:59",
  "missions": {
    "todo": [{
      "mid": 1, // mission分表的主键
      "id": 1, //mission的主键
      "type": 1, //1~5
      "name": "Test", //mission的名字,
      "description": "111adasda",
      "start": "2016-12-22 12:22:30", //mission的开始时间,
      "end": "2016-12-23 12:22:30",   //mission的结束时间"
      "start_timestamp": "12313213213", //UTC
      "end_timestamp": "12313213213",
      "fns": {
        "1": {
          "user_info": [{"psid": "147"}]
        },
        "2": {
          "user_info": [{"psid": "147"}]
        },
        "3": {
          "value": "3"
        },
        "4": {
          "user_info": [{"psid": "147"}]
        },
        "7": {
          "type": "2",
          "payee": "昆仑山",
          "payee_account": "10000",
          "account_type": "ICBC",
          "contract_amount": "10000",
          "contract_type": "1",
          "times": "4",
          "pc": "2500",
          "pc_type": "1",
          "pct": "25",
          "pc_to_type": "1",
          "pc_to_mid": "3"
        }
      },
      "detail": {
        "app_type": [
          {
            "wid": 1
          }
        ]
      }
    }],
    "doing": [],
    "done": [],
    "storage": [],
  },
  "missions_schedule": [{
    "mid": 1, // mission分表的主键
    "id": 1, //mission的主键
    "type": 2, //1~5
    "name": "abc", //mission的名字,
    "description": "111adasda",
    "start": "2016-12-22 12:22:30", //mission的开始时间,
    "end": "2016-12-23 12:22:30", //mission的结束时间"
    "start_timestamp": "12313213213",
    "end_timestamp": "12313213213",
    // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
    "fns": {},
    // 五种类型
    "detail": {},
    "link_info": {
      "before": [],
      "after": []
    }

  }]
};


//编辑与新增接口数据
export const MissionDetailAPIData = {
  "mid": 1, // mission分表的主键
  "id": 1, //mission的主键
  "type": 1, //1~5
  "name": "abc", //mission的名字,
  "description": "111adasda",
  "start": "2016-12-22 12:22:30", //mission的开始时间,
  "end": "2016-12-23 12:22:30", //mission的结束时间"
  "start_timestamp": "12313213213",
  "end_timestamp": "12313213213",
  // 8种功能 @see src/client/app/mission/model/MissionModel.ts:13
  "fns": {},
  // 五种类型
  "detail": {},
};



