/**
 * 文件列表实体
 */
export class FolderLists {
  static init() {
    return new FolderLists('', [], 0, 0, '', '', '', 0, 0, 0, '', '', '', 0, '', '', '', 0, '', '', '', 0, '', '', 0, '', 0, '', '', '', {}, 0, 0, '');
  }

  constructor(public assigned_uid: '',
              public assigned_user_info: Array<any>,
              public child: number,
              public chn: number,
              public created: string,
              public email: string,
              public ext_type: string,
              public id: number,
              public is_dir: number,
              public is_starred: number,
              public name: string,
              public op: string,
              public owner: string,
              public pdid: number,
              public path: string,
              public profile: string,
              public receiverd: string,
              public status: number,
              public size: string,
              public thumb_l: string,
              public thumb_s: string,
              public type: number,
              public updated: string,
              public work_name: string,
              public fid: number,
              public last: string,
              public rid: number,
              public parent_uid: string,
              public perm_created: string,
              public perm_updated: string,
              public parent_user_info: any,
              public is_my_share: number,
              public special_dir_top: number,
              public ext: string) {
  }
}

export class FolderInfo {
  static init() {
    return new FolderInfo(0, 0, 0, 0, '', ',', '', '', '');
  }

  constructor(public chn: number,
              public status: number,
              public type: number,
              public id: number,
              public created: string,
              public name: string,
              public owner: string,
              public path: string,
              public updated: string) {
  }
}


