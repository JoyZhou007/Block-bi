import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class ChatModelService extends BaseModelService {
  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  /**
   * 获取用户消息 (离线/历史消息)
   * @param data
   * @param callback
   */
  getUserMessage(data: any, callback?: any) {
    this.getData('userMessage', data, callback);
  }

  /**
   * 获取用户群组消息 (离线/历史消息)
   * @param data
   * {"gid":19,"min_time":"","max_time":"","sort":"1","form":2}
   * @param callback
   */
  getUserGroupMessage(data: any, callback?: any) {
    this.getData('userGroupMessage', data, callback);
  }

  /**
   * 获取一个消息所在包的所有消息
   * @param callback
   */
  getPackageMsg(data:any,callback?:any){ //getPackageMsg
    this.getData('getPackageMsg', data, callback);
  }



  //群组列表
  getGroupList(callback?: any) {
    this.getData('groupList', null, callback);
  }

  //群聊天
  groupChat(data: any, callback?: any) {
    this.getData('groupChat', data, callback);
  }

  fetchGroupInfo(data: any, callback?: any) {
    this.getData('fetchGroupInfo', data, callback);
  }

  //创建群组
  createGroup(data: any, callback?: any) {
    this.getData('groupCreate', data, callback);
  }

  //群组重命名
  groupRename(data: any, callback?: any) {
    this.getData('groupRename', data, callback);
  }

  //添加群组好友
  addGroupFriend(data: any, callback?: any) {
    this.getData('groupAddFriend', data, callback);
  }

  //移除群组好友
  removeGroupFriend(data: any, callback?: any) {
    this.getData('groupRemoveFriend', data, callback);
  }

  //删除群组
  dropGroup(data: any, callback?: any) {
    this.getData('groupDrop', data, callback);
  }

  //收藏
  getEnshrineInfo(data: any, callback?: any) {
    this.post('enshrineInfo', data, callback);
  }

  //取消收藏
  cancelTheEnshrine(data: any, callback?: any) {
    this.post('cancelEnshrine', data, callback);
  }

  //图片加tag
  chatImgTag(data: any, callback?: any) {
    this.post('chatImgTag', data, callback);
  }


  //图片点赞/取消点赞
  imageLikeUpdate(data: any, callback?: any) {
    this.post('imageLikeUpdate', data, callback);
  }

  //查看图片点赞数量
  fetchImageLike(data: any, callback?: any) {
    this.post('fetchImageLike', data, callback);
  }

  // fetchImageComment removeImageComment imageLikeUpdate

  //获取图片评论
  fetchImageComment(data: any, callback?: any) {
    this.post('fetchImageComment', data, callback);
  }
  //获取图片评论
  addImageComment(data: any, callback?: any) {
    this.post('addImageComment', data, callback);
  }

  //删除图片评论
  removeImageComment(data: any, callback?: any) {
    this.post('removeImageComment', data, callback);
  }

  //获取图片tags
  fetchChatImgTags(data: any, callback?: any) {
    this.post('fetchChatImgTags', data, callback);
  }

  //删除图片的tag
  deleteImgTag(data: any, callback?: any) {
    this.post('deleteImgTag', data, callback);
  }

  //删除图片的tag
  updateImgTag(data: any, callback?: any) {
    this.post('updateImgTag', data, callback);
  }

  //updateImgTag

  //聊天图片评论
  chatImgcomments(data: any, callback?: any) {
    this.post('chatImgcomments', data, callback);
  }

  //获取聊天图片评论
  fetchImageComments(data: any, callback?: any) {
    this.post('fetchImageComments', data, callback);
  }

  //图片文件上传
  //新接口
  fileImageSave(data: any, callback?: any) {
    this.post('fileImageSave', data, callback);
  }

  //聊天图片评论收藏
  imagePoint(data: any, callback?: any) {
    this.post('imagePoint', data, callback);
  }

  //聊天图片评论收藏人数
  imageEnshrine(data: any, callback?: any) {
    this.post('imageEnshrine', data, callback);
  }

  //聊天内容搜索接口
  searchChatRecords(data: any, callback?: any) {
    this.post('searchChatRecords', data, callback);
  }

  //获取离线数量
  getOfflineCount(callback?: any) {
    this.post('getOfflineCount', null, callback);
  }

  //聊天加pin
  setInsertMsgPin(data: any, callback?: any) {
    this.post('insertMsgPin', data, callback);
  }

  /**
   * 删除pin消息
   * @param data
   * {
   *  data: {
        msg_id: string,
        form: number,
        friend?: any, //好友传
        gid?: any, //群组传
      }
   * }
   * 或者单纯根据pin_id删除
   * {
   *  data: {
        pin_id: any
      }
   * }
   * @param callback
   */
  setDeleteMsgPin(data: any, callback?: any) {
    this.post('deleteMsgPin', data, callback);
  }

  //获取pin消息列表
  getMsgPinList(data: any, callback?: any) {
    this.post('getMsgPinList', data, callback);
  }

  //创建post
  createPost(data: any, callback?: any) {
    this.post('createPost', data, callback);
  }

  //查看post的信息
  postDetails(data: any, callback?: any) {
    this.post('postDetails', data, callback);
  }

  //post新建草稿箱 addDraft
  addPostDraftInfo(data: any, callback?: any){
    this.post('addPostDraft', data, callback);
  }

  //post 查看模式
  getDetailPost(data: any, callback?: any){
    this.post('getDetailPostContent', data, callback);
  }

  //请求draft_list
  requestDraftList(data: any, callback?: any){
    this.post('fetchDraftList', data, callback);
  }

  //更新draft
  updateDraft(data: any, callback?: any){
    this.post('updateDraftDetail', data, callback);
  }

  //upload chat-post 直接上传
  uploadChatPost(data: any, callback?: any){
    this.post('uploadChatPostMsg', data, callback);
  }
  //upload chat-post 草稿箱上传
  uploadChatPostByDraft(data: any, callback?: any){
    this.post('uploadChatPostMsgByDraft', data, callback);
  }
  //draft delete
  deleteDraft(data: any, callback?: any){
    this.post('removeDraft', data, callback);
  }

  //chatPost comments
  addChatPostComment(data: any, callback?: any){
    this.post('appendChatComment', data, callback);
  }

  //delete post comments
  removeChatPostComment(data: any, callback?: any){
    this.post('deletePostComment', data, callback);
  }

  //show chatPost comments list
  showChatCommentsList(data: any, callback?: any){
    this.post('displayComments', data, callback);
  }
  //draft-attachment-info
  getDraftAttachmentInfo(data: any, callback?: any){
    this.post('draftAttachmentInfo', data, callback);
  }


  //inMailSend
  inMailSend(data: any, callback?: any) {
    this.post('inMailSend', data, callback);
  }

//  fetchInMailChannel
  fetchInMailChannel(data: any, callback?: any) {
    this.post('fetchInMailChannel', data, callback);
  }

  /**
   * 共享文件前生成share id
   * data
    {
      "resource_id":2048,
      "form":1
    }
   */
  generateShareId(data: any, callback?: any){
    this.getData('generateShareId', data, callback);
  }

  //chat search message
  chatSearchMessage(data: any, callback?: any){
    this.getData('chatSearchInfo', data, callback);
  }

  //chat search message
  getFrontAndBackMsg(data: any, callback?: any){
    this.getData('getFrontAndBackMessage', data, callback);
  }

  //查询图片的前后5条信息
  findBeforeAndAfterImg(data: any, callback?: any){
    this.getData('queryBeforeAndAfterImg', data, callback);
  }
  //查询图片前10条或者后10条信息
  queryBeforeOrAfterImg(data: any, callback?: any){
    this.getData('findBeforeOrAfterImg', data, callback);
  }
  //查询某一个组的post
  getPostByChatGroup(data: any, callback?: any){
    this.getData('fetchPostByChatGroup', data, callback);
  }

}
