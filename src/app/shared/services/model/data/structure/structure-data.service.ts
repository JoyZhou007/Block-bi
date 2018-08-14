import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';
@Injectable()
export class StructureDataService extends UserDataBaseService {


  public WAY: any = {
    add: 'add',
    update: 'update',
    delete: 'delete',
  };

  public TYPE: any = {
    position_title: 'position_title',
    staff: 'staff',
    position: 'position',
    department: 'department',
    position_structure: 'position_structure',
    dept_structure: 'dept_structure',
    position_administration: 'position_administration'
  };

  public IDTYPE: any = {
    position_title: 'tid',
    position: 'pid',
    department: 'did',
    staff: 'suid',
    position_structure: 'id',
    position_administration: 'psid',
  };

  public NUMBERTYPE: any = {
    position_title: 't',
    position: 'p',
    department: 'd',
    position_structure: 'ps',
  };

  //upload数据
  /*public POSITION_ADD: string = 'position-add';
   public POSITION_UPDATE: string = 'position-update';
   public POSITION_DELETE: string = 'position-delete';
   public DEPT_ADD: string = 'dept-add';
   public DEPT_UPDATE: string = 'dept-update';
   public DEPT_DELETE: string = 'dept-delete';
   public STAFF_ADD: string = 'staff-add';
   public STAFF_UPDATE: string = 'staff-update';
   public STAFF_DELETE: string = 'staff-delete';
   public POSITION_STRUCTURE_ADD: string = 'position-structure-add';
   public POSITION_STRUCTURE_UPDATE: string = 'position-structure-update';
   public POSITION_STRUCTURE_DELETE: string = 'position-structure-delete';
   public DEPT_STRUCTURE_ADD: string = 'dept-structure-add';
   public DEPT_STRUCTURE_UPDATE: string = 'dept-structure-update';
   public DEPT_STRUCTURE_DELETE: string = 'dept-structure-delete';*/

  constructor(@Inject('store.service') public storeService: any) {
    super(storeService);
  }

  /**
   *
   * @param numberType        p | d | ps | ds
   * @returns {string}
   */
  getAutoNumber(numberType: string) {
    let returnInfo = this.getData(UserDataBaseService.storeDataKey.UPLOAD_AUTO_NUMBER);
    if (!returnInfo) {
      returnInfo = {
        t: 0,
        p: 0,
        d: 0,
        ps: 0,
        ds: 0
      }
    } else {
      returnInfo[numberType] = returnInfo[numberType] + 1;
    }
    this.setData(UserDataBaseService.storeDataKey.UPLOAD_AUTO_NUMBER, returnInfo);
    return numberType + returnInfo[numberType];
  }


  setUploadStructureInfo(uploadStructureInfo: any) {
    this.setData(UserDataBaseService.storeDataKey.UPLOAD_STRUCTURE_INFO, uploadStructureInfo);
    this.setData(UserDataBaseService.storeDataKey.UPLOAD_STRUCTURE_FLAG, 0);
  }


  setUploadStructureFlag(flag: number) {
    this.setData(UserDataBaseService.storeDataKey.UPLOAD_STRUCTURE_FLAG, flag);
  }

  getUploadStructureFlag() {
    return this.getData(UserDataBaseService.storeDataKey.UPLOAD_STRUCTURE_FLAG);
  }

  removeUploadStructureFlag(){
    this.removeData(UserDataBaseService.storeDataKey.UPLOAD_STRUCTURE_FLAG);
  }

}
