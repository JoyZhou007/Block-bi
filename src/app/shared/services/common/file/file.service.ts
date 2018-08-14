import {Injectable, Inject} from '@angular/core';


@Injectable()
export class FileService {

  private sizeConfig: any = [20, 36, 80, 230, 300, 380];

  private defaultSize = 80;

  constructor(@Inject('type.service') private typeService: any) {
  }

  getDefaultImagePath() {
    let random = Math.ceil(Math.random() * 3);
    return '/assets/images/Company-profile-photo-img' + random + '.png';
  }

  /**
   * 可用尺寸数组
   * @return {any}
   *
   */
  getAvailableSize(){
    return this.sizeConfig;
  }

  /**
   * 重新获取图片地址
   * @param size
   * @param imgPath
   * @returns {string}
   */
  getImagePath(size: number, imgPath: string) {
    let imgSize = this.defaultSize;
    if (size > 0) {
      if (this.typeService.inArray(size, this.sizeConfig)) {
        imgSize = size;
      }
    }
    let imgSizeStr = '_' + imgSize + '_' + imgSize;

    for (let perKey in this.sizeConfig) {
      let sizeStr = '_' + this.sizeConfig[perKey] + '_' + this.sizeConfig[perKey];
      if (imgPath && imgPath.indexOf(sizeStr) !== -1) {
        imgPath = imgPath.replace(sizeStr, imgSizeStr);
        break;
      }
    }
    return imgPath;
  }
}
