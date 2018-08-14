export class ChatConfig {

  public CHAT_MESSAGE_TYPE_AT_SYMBOL = '@';
  //message 文本类型
  public CHAT_MESSAGE_TYPE_TEXT: number = 1;
  //图片消息
  public CHAT_MESSAGE_TYPE_IMG: number = 2;
  //文件消息
  public CHAT_MESSAGE_TYPE_FILE: number = 3;
  //post消息
  public CHAT_MESSAGE_TYPE_POST: number = 4;
  //系统消息, 如用户加入，退出群，修改群名，群话题
  public CHAT_MESSAGE_TYPE_SYSTEM: number = 5;
  //share文件消息
  public CHAT_MESSAGE_TYPE_SHARE: number = 6;
  //转发消息
  public CHAT_MESSAGE_TYPE_FORWARD: number = 7;




  public MESSAGE_TYPE_FRIEND: number = 1;	  //人与人消息
  public MESSAGE_TYPE_GROUP: number = 2;	  //群组消息

  public MESSAGE_TYPE_PRIVATE: number = 1; // uuid相关
  public MESSAGE_TYPE_WORK: number = 2;    // psid相关

  //chat-post draft分页没有更多数据
  public CHATPOST_PAGER_ENDING: number = -1;

  //chat-post forward copy or update
  public CHAT_POST_FORWARD_COPY: string = '2';
  public CHAT_POST_FORWARD_UPDATE: string = '1';

  //chat-post draft分页没有更多数据
  public CHAT_POST_COMMENT_PAGER_ENDING: number = -1;

  //quill editor 字数限制
  public CHAT_POST_QUILL_EDITOR_LIMIT: number = 9000;

}



