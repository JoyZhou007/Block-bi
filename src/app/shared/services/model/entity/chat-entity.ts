import {ChatConfig} from "../../../config/chat.config";
import {stratify} from "d3-hierarchy";
import {Inject} from "@angular/core";
export class GroupInfoList {
  static init() {
    return new GroupInfoList(0, 0, 0, '', '', '', '', 1);
  }

  constructor(public host: number,
              public online: number,
              public state: number,
              public uid: string,
              public user_profile_path: string,
              public uuid: string,
              public work_name: string,
              public status: number) {
  }
}

/**
 * 左侧列表实体
 */
export class ChatMenuList {
  // 是否是好友聊天，而非群组
  public isFriend: boolean = false;
  // 显示用分组'star'|'work'|'private'|'recent'|'mission'
  public group: string = '';
  // 0是Internal 分组，1是工作好友  2是私人好友
  // public type: number = 2;
  // 真实分组标识
  public _identity: string = '';
  // 好友聊天双向标识
  public friendIdentity: string = '';
  // 1 - 是mission群
  // 0 - 不是mission群
  public is_mission: string = '';
  public p_name: string = '';
  // 用户名
  public work_name: string = '';
  // 群名
  public name: string = '';
  // 1 - 私人性质(uuid相关)
  // 2 - 工作性质(psid相关)
  public form: any = 0;
  public uid: string = '';
  public gid: any = 0;
  public is_host: number = 0;
  //在线未读消息
  public online_message: string = '';
  // 距离上次登录IM期间的消息数量，最多为9，多余9应该显示9+
  public offline_message: number = 0;
  public clsName: string = '';
  public friendType: number = 0;
  private selfUUID: string = '';
  private selfPSID: string = '';


  static init(data?: any) {
    return new ChatMenuList(data);
  }

  get identity() {
    if (this._identity === '') {
      this.initIdentity();
    }
    return this._identity;
  }

  set identity(data: any) {
    if (this._identity === '') {
      this.initIdentity();
    }
  }

  /**
   * 生成人与人聊天标识
   * @param form 私人1
   * @param uid 对方的uuid或者psid
   * @param selfID 自己的uuid或者psid
   * @returns {{identity: string, friend_identity: string}}
   */
  static initFriendId(form: any, uid: any, selfID?: any) {
    if (form && uid) {
      return {
        identity: 'friend_' + 'form:' + form.toString() + 'id:' + uid.toString(),
        friend_identity: 'friend_' + 'form:' + form.toString() + 'id:' + selfID.toString()
      }
    }
  }

  /**
   * 如果是私人聊天 selfId传自己的psid或者uuid
   * @param selfID
   */
  initIdentity(selfID?: any) {
    if (this.isFriend) {
      let info = ChatMenuList.initFriendId(this.form, this.uid, selfID);
      if (!info) return;
      this._identity = info.identity;
      if (selfID) {
        this.friendIdentity = info.friend_identity;
      }
    } else {
      this._identity = 'group_' + 'form:' + this.form.toString()
        + 'id:' + this.gid.toString();
    }

  }

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
  }
}

/**
 * 群组列表实体
 */
export class GroupList {
  public fid: number = 0;
  public frid: number = 0;
  public email: string = '';
  public p_name: string = '';
  public work_name: string = '';
  public user_profile_path: string = '';
  public noReadCount: number = 0;
  public form: number = 0;
  public uid: string = '';
  public uuid: string = '';
  public gid: string = '';

  static init() {
    return new GroupList();
  }

  constructor() {
  }
}


/**
 * 群聊天
 */
export class GroupChat {
  static init() {
    return new GroupChat('', '', 0, 0);
  }

  constructor(public user: string,
              public gid: string,
              public form: number,
              public opt: number) {
  }
}

/**
 * 创建群组
 */
export class CreateGroup {
  static init() {
    return new CreateGroup('', '', '', '', [], 0, 0, 0);
  }

  constructor(public name: string,
              public uuid: string,
              public topic: string,
              public suid: string,
              public member: Array<any>,
              public opt: number,
              public form: number,
              public token: number) {
  }
}

/**
 * 重命名群组
 */
export class GroupRename {
  static init() {
    return new GroupRename('', '', '', '', 0);
  }

  constructor(public gid: string,
              public uuid: string,
              public name: string,
              public topic: string,
              public opt: number) {
  }
}

/**
 * 添加群组好友
 */
export class AddGroupFriend {
  static init() {
    return new AddGroupFriend('', '', '', [], 0, 0);
  }

  constructor(public uuid: string,
              public gid: string,
              public name: string,
              public suids: Array<any>,
              public opt: number,
              public form: number) {
  }
}

/**
 * 移除群组好友
 */
export class RemoveGroupFriend {
  static init() {
    return new RemoveGroupFriend('', '', '', [], 0);
  }

  constructor(public uuid: string,
              public gid: string,
              public name: string,
              public suids: Array<any>,
              public opt: number) {
  }
}

/**
 * 删除群组
 */
export class DropGroup {
  static init() {
    return new DropGroup('', '', '', 0);
  }

  constructor(public uuid: string,
              public gid: string,
              public name: string,
              public opt: number) {
  }
}

/**
 * 聊天图片评论
 */
export class ChatImgComments {
  static init() {
    return new ChatImgComments('', '', '', '');
  }

  constructor(public name: string,
              public user_profile_path: string,
              public descr: string,
              public time: string) {
  }
}

/**
 * 聊天图片添加ping
 */
export class ChatImgPings {
  static init() {
    return new ChatImgPings('', '', '', '', '', '', 0, 0, 0, 0);
  }

  constructor(public color: string,
              public creator_profile_path: string,
              public creator_name: string,
              public spec: string,
              public time: string,
              public url: string,
              public id: number,
              public pid: number,
              public height: number,
              public width: number) {
  }
}

export class SearchResultList {
  static init() {
    return new SearchResultList('', '', '', '');
  }

  constructor(public owner_name: string,
              public msg: string,
              public time: string,
              public owner_profile: string) {
  }
}
/**
 * 聊天消息类型对象
 * 前后端交互用
 */
export class ChatMessage {
  public chatConfig: ChatConfig = new ChatConfig();
  //类型 @see ChatConfig
  public type: number = 1;
  //UTC时间戳
  public time: string = '';
  //msg_id 唯一标识, 新消息为空
  public msg_id: string = '';
  //owner 消息拥有人, uuid或者psid(现在合并为uid)
  public owner: any = '';
  // 是否已读
  // 后期应该支持手动未读
  public hasReaded: boolean = true;
  // 消息文本
  public msg: string = '';
  // 消息状态 0 - 已删除, 1 - 正常
  public status: number = 1;
  public detail: any = {};
  //发送状态
  public send_status: boolean = false;
  //用于匹配是否成功发送的辨认id
  public token: string = '';
  //是否打pin
  public hasPin: boolean = false;
  //是否设置闹钟
  public hasAlarm: boolean = false;
  // 闹钟事件
  public effective_time: number = 0;
  public effective_time_display: string = '';
  //闹钟id
  public alarm_id: string = '';
  //模板用字段
  public showTime: string = '';
  public safeMsg: any = '';
  public userInfo: ChatUserInfo;

  public dayInfo: any = '';
  public minuteInfo: any = '';
  // 撤回人姓名
  public revoke_by: string = '';

   constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
          if (key === 'time') {
            this.initDateInfo();
          }
        }
      }
    }
    this.token = 'tmsg_' + this.makeToken();
  }

  initDateInfo() {
    if (!this.time) {
      return;
    }
    let date = new Date(this.time);
    let yearInfo = date.getFullYear();
    let monthInfo = date.getMonth() + 1;
    let dayInfo = date.getDate();
    let hourInfo = date.getHours();
    let minuteInfo = date.getMinutes();
    this.dayInfo = yearInfo + '-' + monthInfo + '-' + dayInfo;
    this.minuteInfo = this.dayInfo + '-' + hourInfo + '-' + minuteInfo;
  }

  initUserInfo(data: ChatUserInfo) {
    this.userInfo = data;
  }

  initPin(data: number) {
    this.hasPin = (typeof data === 'number' && !(data === 0));
  }

  initAlarm(data: number) {
    this.hasAlarm = (typeof data === 'number' && !(data === 0));
  }

  initImageData(data: any) {
    if (data && this.detail) {
      this.detail.file_name = data.file_name;
      this.detail.ext = data.ext;
      this.detail.fid = data.fid;
      this.detail.file_type = data.file_type;
      this.detail.file_path = data.file_path;
    }
  }

  initFileData(data: any) {
    if (data && this.detail) {
      this.detail.file_name = data.file_name;
      this.detail.ext = data.ext;
      this.detail.fid = data.fid;
      this.detail.file_type = data.file_type;
      this.detail.updated = data.updated;
    }
  }


  /**
   *
   * @returns {string}
   */
  makeToken() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 7; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }


  /**
   * 显示前分析文本中是否有特殊标签和html冲突 <>
   * - 高亮聊天人@ <@USER|uid>
   * - 转发 <@FORWARD|msg_id>
   * - emoji表情 ::EMOJI|#1::
   * - 换行"\n"
   * TODO: 是否有预定义符号
   */
  analyseMessageText(userInfoArr?: Array<ChatUserInfo>) {
    if (this.msg && !this.safeMsg) {
      //处理换行
      let messageText = this.msg;
      //处理html
      //messageText = this.escapeHtml(messageText);
      while (messageText.indexOf("\n") !== -1) {
        messageText = messageText.replace("\n", "<br />");
      }
      //处理用户高亮
      if (userInfoArr) {
        // 找到所有的<@USER|XXX>
        let findReg = new RegExp("(((&|&amp;)lt;)|<)@USER[|](\\S{0,})(((&amp;|&)gt;)|>)", "gm");

        messageText = messageText.replace(findReg, function (rs, $1, $2, $3, $4): string {
          let str = rs;
          userInfoArr.forEach((info: ChatUserInfo) => {
            if (info.uid == $4) {
              str = '<a class="mention"  data-user="' + info.uid + '">@' + info.work_name + '</a>';
            }
          });
          return str;
        });
      }
      // 2017.10.17 - 防止发送的消息有样式信息
      // messageText = this.escapeHtml(messageText);
      this.safeMsg = messageText;
    }
  }

  /**
   * 初始化消息对象
   * @param type
   * @param data
   * @param userInfo
   * @returns {any}
   */
  getMessageObjByType(type: number, data: any, userInfo?: any) {
    let newMessageObj = new ChatMessage(data);
    if (data.hasOwnProperty('detail')) {
      if (data.detail === null) {
        data.detail = {};
      }
      switch (type) {
        case this.chatConfig.CHAT_MESSAGE_TYPE_SHARE:
          newMessageObj.detail = new ChatMessageShare(data.detail);
          break;
        case this.chatConfig.CHAT_MESSAGE_TYPE_FORWARD:
          newMessageObj.detail = new ChatMessageForward(data.detail);
          break;
        case this.chatConfig.CHAT_MESSAGE_TYPE_POST:
          newMessageObj.detail = new ChatMessagePost(data.detail);
          break;
        case this.chatConfig.CHAT_MESSAGE_TYPE_FILE:
          newMessageObj.detail = new ChatMessageFile(data.detail);
          newMessageObj.initFileData(data.detail);
          break;
        case this.chatConfig.CHAT_MESSAGE_TYPE_IMG:
          newMessageObj.detail = new ChatMessageImage(data.detail);
          newMessageObj.initImageData(data.detail);
          break;
        case this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM:
          // 针对后端的不同格式初始化数据

          if (data.detail.hasOwnProperty('sub_type')) {
            data.detail['act_type'] = data.detail.sub_type;
            if (data.detail.sub_type === 2) {
              data.detail.topic = data.msg;
              newMessageObj.msg = 'New Topic';
            }
            if (data.detail.sub_type === 7) {
              newMessageObj.msg = data.detail.commentTxt;
            }
          }
          newMessageObj.detail = new ChatMessageSystem(data.detail);
          break;

        case this.chatConfig.CHAT_MESSAGE_TYPE_TEXT:
        default:
          newMessageObj.detail = {};
          break;
      }
    }
    newMessageObj.initPin(data.pinned);
    newMessageObj.initAlarm(data.has_alarm);
    if (userInfo) {
      newMessageObj.initUserInfo(userInfo);
    }
    if (data.effective_time) {
      newMessageObj.effective_time_display = this.formatAlarmDate(data.effective_time);
    }

    return newMessageObj;
  }

  /**
   * 针对后端API需要的字段做过滤
   * @param data
   * @returns {any}
   */
  buildDetailSendTOAPI(data: any) {
    let newData = data;
    let fileType;
    if (newData instanceof ChatMessageShare) {
      fileType = newData.share_file_type;
    }
    if (newData instanceof ChatMessageForward) {
      //fileType = newData.original_msg.type;
    }
    if (newData instanceof ChatMessageFile || fileType === this.chatConfig.CHAT_MESSAGE_TYPE_FILE) {
      delete newData.last;
      delete newData.owner;
    } else if (newData instanceof ChatMessageImage || fileType === this.chatConfig.CHAT_MESSAGE_TYPE_IMG) {
      delete newData.tag;
    } else if (newData instanceof ChatMessagePost || fileType === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
      /*      delete newData.first_attachment;
       delete newData.fid;
       delete newData.summary;*/
    }
    return newData;
  }

  formatAlarmDate(effective_time: any) {
    if (effective_time) {
      let newDate = new Date(effective_time * 1000);
      let str: string;
      if (newDate.getHours() > 11) {
        str = 'pm';
      } else {
        str = 'am';
      }
      return (newDate.getFullYear() + '-' + this.formatNUmber(newDate.getMonth() + 1) + "-" + this.formatNUmber(newDate.getDate())
      + " " + this.formatNUmber(newDate.getHours()) + ":" + this.formatNUmber(newDate.getMinutes()) + str);
    }
  }

  formatNUmber(number: number): string {
    if (number < 10) {
      return '0' + number;
    } else {
      return '' + number;
    }
  }

  /**
   * 过滤特殊字符串
   * &  < > " '
   * @param text
   * @returns {string}
   */
  escapeHtml(text: string) {
    let map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/([&]+(?![lt;]|[gt;]|[amp;]|[quot;]|[#039;]))|[<>"']/g, function (m) {
      return map[m];
    });
  }

  undoEscapeHtml(text: string) {
    let reservedMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };
    return text.replace(/(&amp;)|(&lt;)|(&gt;)|(&quot;)|(&#039;)/g, function (m) {
      return reservedMap[m];
    });
  }

}
/**
 * 前端用
 */
export class ChatMessageFile {
  public file_name: string = ' ';
  public file_type: string = ' ';
  public fid: string = ' ';
  public updated: string = ' ';
  public ext: string = '';

  constructor(data?: any) {

  }
}
/**
 * 前端用
 */
export class ChatMessagePost {
  public post_id: string = '';
  public post_name: string = '';
  public first_attachment: ChatPostFirstAttachment = ChatPostFirstAttachment.init();
  public summary: string = '';
  public fid: number = -1;
  public updated: number = 0;

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
  }
}

/**
 * 传给IM的第一个附件
 */
export class ChatPostFirstAttachment {
  public ext_type: string;
  public name: string;
  public path: string;

  static init() {
    let obj = new ChatPostFirstAttachment();
    obj.ext_type = '';
    obj.name = '';
    obj.path = '';
    return obj;
  }
}

/**
 * 后端用
 * summary 和 first_attachment字段由后端查，前端只要发送post_id和post_name
 */
export class ChatMessagePostInterface {
  public post_id: string = '';
  public post_name: string = '';

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
  }
}
/**
 * 前端用
 *     "pid" : "",
 "file_name" : "240390-13052416402467.jpg",
 "size" : "280.83 KB",
 "true_size" : "",
 "type" : "",
 "file_type" : "jpg",
 "link" : "assets/chat-file/file_
 */
export class ChatMessageImage {
  //图片信息
  public file_name: string = ' ';
  public file_type: string = ' ';
  public ext: string = ' ';
  public fid: string = ' ';
  public file_path: string = ' ';
  public tag: Array<any> = [];

  constructor(data?: any) {


  }
}

/**
 * 分享文件
 */

export class ChatMessageShare {
  public share_id: any;
  // 分享文件的类型
  public share_file_type: string;
  // 其他字段参考另外几个文件类

  constructor(data?: any) {
    if (data) {
      //强制赋值
      for (let key in data) {
        this[key] = data[key];
      }
    }

  }
}

/**
 * 前端用
 */
export class ChatMessageForward {

  public original_msg: any = {};

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
  }
}
/**
 * 前端用
 */
export class ChatMessageSystem {
  //系统行为
  //加入群 1
  //修改群名 3
  //修改topic 2
  //退出群，成员被删除 4
  //新消息提示 5
  //闹钟提示 6
  //评论某个文件 7
  public act_type: number = 0;
  public topic: string = '';
  public groupName: string = '';
  public file_info: any = {};
  public commentTxt: string = '';

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
  }
}

export class ChatUserInfo {
  // 是否是本人
  isMyself: boolean = false;
  // 是否是群主
  isHost: boolean = false;
  // 私人聊天 1
  // 工作聊天 2
  form: number = 0;
  // IM在线状态 0, 1, 2
  online: number = -1;
  // IM是否在线 0, 1
  // css用
  onlineStatusCls: string = '';
  state: number = -1;
  // PSID或者UUID
  uid: any = '';
  // 头像路径
  user_profile_path: string = '';
  // 用户名字
  work_name: string = '';
  //模板用，是否隐藏
  filtered: boolean = false;

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
  }
}

/**
 * chat post 后端用
 */
export class ChatPostUpload {
  public title: string;
  public content: string;
  public shared_to: Array<string>; // gid
  public attachment: Array<string>;
  public channel: string; //uid or gid
  public module_type: string; // 2:group 3: friend
  public form: string;
  public summary: string;

  static init(): ChatPostUpload {
    let obj = new ChatPostUpload();
    obj.title = '';
    obj.content = '';
    obj.shared_to = [];
    obj.attachment = [];
    obj.channel = '';
    obj.form = '';
    obj.summary = '';
    obj.module_type = '';
    return obj;
  }

}
/**
 * chat post 前端用
 */
export class ChatPost {
  public mode: string; //read || create
  public title: string;
  public content: string;
  public shared_to: Array<string>; // gid
  public attachment: Array<string>;
  public isFriend: boolean; //是个人 还是 群组
  public channel: string; //uid or gid
  public form: string;
  public inserted: string;
  public post_id: string;
  public shareIdentity: Array<any>;
  public currentPostIdentity: any;
  public summary: string;//用于显示post内容的文字
  public fid: number;
  public detail: ChatMessagePost; //chat content message detail

  static init(): ChatPost {
    let obj = new ChatPost();
    obj.mode = '';
    obj.title = '';
    obj.content = '';
    obj.shared_to = [];
    obj.attachment = [];
    obj.channel = '';
    obj.form = '';
    obj.inserted = '';
    obj.post_id = '';
    obj.shareIdentity = [];
    obj.summary = '';
    obj.detail = new ChatMessagePost();
    return obj;
  }

  /**
   * 人与人聊天id
   * @param form 私人
   * @param uid
   * @param selfID 自己的uuid或者psid
   * @returns {{identity: string, friend_identity: string}}
   */
  static initFriendId(form: any, uid: any, selfID: any) {
    return {
      identity: 'friend_' + 'form:' + form.toString() + 'id:' + uid.toString(),
      friend_identity: 'friend_' + 'form:' + form.toString() + 'id:' + selfID.toString()
    }
  }

  /**
   * 群组或人聊天id
   * @param form
   * @param id gid或者uid
   * @param name
   */
  static initIdentity(form: any, id: any, name: any) {
    return 'group_' + 'form:' + form.toString()
      // + 'name:' + name.toString()
      + 'id:' + id.toString();

  }
}

//comments 后台
export class ChatPostComments {
  constructor(public content: string,
              public inserted: string,
              public owner: string, //评论用户
              public _id: string) {
  }

  public static init() {
    return new ChatPostComments('', '', '', '');
  }
}


//comments 前端显示用
export class ChatPostCommentsDetail {
  constructor(public content: string,
              public inserted: string,
              public owner: string, //评论用户
              public _id: string, //评论唯一标识
              public user_profile_path: string,
              public time: string,
              public work_name: string) {
  }

  public static init() {
    return new ChatPostCommentsDetail('', '', '', '', '', '', '');
  }
}


//post attachment file  来自后端
export class ChatPostAttachment {
  public created: string;
  public ext: string;
  public ext_type: string;
  public fid: string;
  public is_dir: string;
  public last: string;
  public name: string;
  public owner: string;
  public rid: string;
  public size: string;
  public status: string;
  public updated: string;

  static init() {
    let obj = new ChatPostAttachment();
    obj.created = '';
    obj.ext = '';
    obj.ext_type = '';
    obj.fid = '';
    obj.is_dir = '';
    obj.last = '';
    obj.name = '';
    obj.owner = '';
    obj.rid = '';
    obj.size = '';
    obj.status = '';
    obj.updated = '';
    return obj;
  }
}

/**
 * 只读模式 post的接收setting实体
 */
//settings for mode is read  只读模式
export class PostReadSettings {
  constructor(public quillReadOnly: boolean,
              public quillCont: string,
              public mode: string, // read || create,
              public shared_to: Array<string>,
              public form: string,
              public fid: string,
              public title: string,
              public post_id: string,
              public owner: string,) {
  }

  public static init() {
    return new PostReadSettings(false, '', 'create', [], '', '', '', '', '');
  }

  public static initReadMode() {
    return new PostReadSettings(false, '', 'read', [], '', '', '', '', '');
  }
}
/**
 * 只读模式 post的发送setting实体
 */
export class PostSettings {
  constructor(public mode: string, //read || create
              public attachment: string,
              public content: string,
              public owner: string,
              public shared_to: string,
              public title: string,
              public fid: string,
              // public form: string, //private:1 || business:2,
              public post_id: string) {

  }

  public static init() {
    return new PostSettings('', '', '', '', '', '', '', '');
  }
}


//Draft的实体  前端用
export class Draft {
  public form: string; //个人还是公司
  public owner: string;
  public title: string;
  public content: string;
  public channel: string;
  public draft_id: string; //前台传post_id字段 后台返回draft_id字段
  public updated: string; //最后一次修改的时间
  public summary: string;
  public inserted: string;
  public draftCreateTime: string; //离最近一次修改的时间
  public shared_to: Array<string>; // 分享人
  public shareToDetailArr: Array<ChatPostContactUserInfoModel>; // 分享人详情
  public attachment: Array<string>; //附件列表id
  public attachmentFileList: Array<ChatPostAttachmentFile>; //附件详情列表 展示用

  init() {
    let obj = new Draft();
    obj.form = '';
    obj.owner = '';
    obj.title = '';
    obj.content = '';
    obj.channel = '';
    obj.draft_id = '';
    obj.updated = '';
    obj.summary = '';
    obj.inserted = '';
    obj.draftCreateTime = '';
    obj.shared_to = [];
    obj.shareToDetailArr = [];
    obj.attachment = [];
    obj.attachmentFileList = [];
    return obj;
  }

  /**
   * 深度克隆
   * @param obj
   * @returns {any}
   */
  static deepClone(obj: any): any {
    // return value is input is not an Object or Array.
    if (typeof(obj) !== 'object' || obj === null) {
      return obj;
    }

    let clone;

    if (Array.isArray(obj)) {
      clone = obj.slice();  // unlink Array reference.
    } else {
      clone = Object.assign({}, obj); // Unlink Object reference.
    }

    let keys = Object.keys(clone);

    for (let i = 0; i < keys.length; i++) {
      clone[keys[i]] = this.deepClone(clone[keys[i]]); // recursively unlink reference to nested objects.
    }

    return clone; // return unlinked clone.
  }

}
//Draft 新建 后端
export class DraftNewInterface {
  public form: string; //个人还是公司
  public title: string;
  public content: string;
  public channel: string;
  public summary: string;
  public shared_to: Array<string>; // 分享人
  public attachment: Array<string>; //附件列表

  static init() {
    let obj = new DraftNewInterface();
    obj.form = '';
    obj.title = '';
    obj.content = '';
    obj.channel = '';
    obj.summary = '';
    obj.shared_to = [];
    obj.attachment = [];
    return obj;
  }
}


//Draft_list filter
export class ChatPostDraftListFilter {
  public index: string; //分页的开始页数
  public page_size: string; //每页多少条

  init() {
    let obj = new ChatPostDraftListFilter();
    obj.index = '1';
    obj.page_size = '13';
    return obj;
  }
}


//user_info
export class ChatPostContactUserInfoModel {
  public email: string;
  public id: string;
  public phone: string;
  public profile_id: string;
  public uid: string;
  public user_profile_path: string;
  public work_name: string;

  static init() {
    let obj = new ChatPostContactUserInfoModel();
    obj.email = '';
    obj.id = '';
    obj.profile_id = '';
    obj.uid = '';
    obj.user_profile_path = '';
    obj.work_name = '';
    return obj;
  }
}

//comments_list filter
export class ChatPostCommentListFilter {
  public index: string; //分页的开始页数

  init() {
    let obj = new ChatPostCommentListFilter();
    obj.index = '1';
    return obj;
  }
}

//attachment 来自后端返回
export class ChatPostAttachmentFile {
  public created: string;
  public ext: string;
  public ext_type: string;
  public fid: string;
  public is_dir: number; //0 or 1
  public kb_size: string;
  public last: string;
  public name: string;
  public owner: string;
  public path: string;
  public size: string;
  public status: string;
  public thumb_l: string;
  public thumb_s: string;
  public type: string;
  public updated: string;

  static init() {
    let obj = new ChatPostAttachmentFile();
    obj.created = '';
    obj.ext = '';
    obj.ext_type = '';
    obj.fid = '';
    obj.is_dir = 0;
    obj.kb_size = '';
    obj.last = '';
    obj.name = '';
    obj.owner = '';
    obj.path = '';
    obj.size = '';
    obj.status = '';
    obj.thumb_l = '';
    obj.thumb_s = '';
    obj.type = '';
    obj.updated = '';
    return obj;
  }
}


//聊天搜索 后端用 后端返回
export class ChatMessageSearchMode {
  public detail: Array<any>;
  public gid: number;
  public msg: string;
  public msg_type: number;
  public owner: string;
  public owner_name: string;
  public owner_profile: string;
  public time: string;
  public msg_id: string;
  public form: number; // private or business
}

//聊天搜索 前端用
export class ChatMessageSearchTplMode extends ChatMessageSearchMode {
  public messageDetailTime: string;
  public isMission: boolean;

  constructor() {
    super();
  }

  static init() {
    let obj = new ChatMessageSearchTplMode();
    obj.detail = [];
    obj.gid = 0;
    obj.msg = '';
    obj.msg_type = 0; // 消息类型
    obj.owner = '';
    obj.owner_name = '';
    obj.owner_profile = '';
    obj.time = '';
    obj.messageDetailTime = '';
    obj.msg_id = '';
    obj.form = 0;
    obj.isMission = false;
    return obj;

  }

  static initDetail(data: any) {
    if (data.detail.hasOwnProperty('sub_type')) {
      data.detail['act_type'] = data.detail.sub_type;
      if (data.detail.sub_type === 2) {
        data.detail.topic = data.msg;
      }

    }
  }
}

//搜索消息接口的入参 后端用
export class ChatMessageSearchInterface {
  public keywords: string;
  public gid: number;
  public form: number; // 0/1/2 all your member
  public type: number;// 0/1/2/3/4
  public fuid: string;
  public start: string; // start time
  public end: string; // end time
  public page: number; //分页

  static init() {
    let obj = new ChatMessageSearchInterface();
    obj.keywords = '';
    obj.gid = 0;
    obj.form = 0;
    obj.type = 0;
    obj.fuid = '';
    obj.start = '';
    obj.end = '';
    obj.page = 0;
    return obj;
  }
}

//搜索消息的显示 前端用
export class ChatSearchMessage {
  public name: string;
  public id: string; // uid or gid
  public messageInfoList: Array<ChatMessageSearchTplMode>;
  public isClose: boolean;
  public isFriend: boolean;
  public form: number;
  public isMission: boolean;

  static init() {
    let obj = new ChatSearchMessage();
    obj.name = '';
    obj.id = '';
    obj.messageInfoList = [];
    obj.isClose = false;
    obj.isFriend = false;
    obj.form = 0;
    obj.isMission = false;
    return obj;
  }
}

//搜索消息的前后一条接口信息 后端用
export class ChatSearchGetFrontAndBackMessage {
  public msg_id: string;
  public gid?: number;
  public friend?: string;

  static init() {
    let obj = new ChatSearchGetFrontAndBackMessage();
    obj.msg_id = '';
    obj.gid = 0;
    obj.friend = '';
    return obj;
  }
}