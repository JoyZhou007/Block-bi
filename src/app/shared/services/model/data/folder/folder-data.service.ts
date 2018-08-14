import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';

@Injectable()
export class FolderDataService extends UserDataBaseService {

  private folderData: any;

  constructor(@Inject('store.service') public storeService: any) {
    super(storeService);

    this.getFolderData();
  }

  /**
   * 获取用户文件数据
   */
  getFolderData() {
    this.folderData = this.getData(UserDataBaseService.storeDataKey.FOLDER_DATA);
    this.folderData = this.folderData ? this.folderData : {};
  }

  /**
   * 根据用户文件key,设置行为数据
   * @param FolderKey
   * @param data
   */
  setFolderDataByKey(folderKey: string, data: any) {
    this.folderData[folderKey] = data;
    this.setFolderData();
  }

  /**
   * 根据用户文件key,获取行为数据
   * @param FolderKey
   * @param data
   */
  getFolderDataByKey(folderKey: string): any {
    return this.folderData[folderKey];
  }

  /**
   * 设置用户文件数据
   */
  setFolderData() {
    this.setData(UserDataBaseService.storeDataKey.FOLDER_DATA, this.folderData);
  }

}
