import {
  Inject, Component, ElementRef, OnInit,
  Input, EventEmitter, ViewChild, ViewEncapsulation, Output, ContentChild
} from '@angular/core';
import {parse} from "parse5";

//裁剪文件
const CropperClass = require('cropperjs/dist/cropper');

//const MAX_CROPPER_IMAGE = 1000000;

@Component({
  selector: 'cropper',
  templateUrl: '../../../../app/shared/template/image/cropper.component.html',
  styleUrls: ['../../../../assets/css/out/cropper.css'],
  encapsulation: ViewEncapsulation.None
})

export class CropperComponent implements OnInit {
  public _cropperInstance: any = null;        //裁剪对象
  public cropperOption: any;  //裁剪图片属性

  public cropImage: any;       //裁剪的图片

  public showCropper: boolean = false;//显示切图层
  public showFileError: string = 'THE PHOTO SIZE MUST BE BIGGER THAN';


  public _validOptions: any = {
    minHeight: 400,
    minWidth: 400
  };
  public formatError: boolean = false;

  @Output() public afterCropFile: EventEmitter<any> = new EventEmitter();
  @Output() public imageIsInvalid: EventEmitter<any> = new EventEmitter();
  public fileInput: any;

  @ViewChild('curImage') public curImage: any;
  @ViewChild('uploadPrompt') public uploadPrompt: any;

  @Input('validOptions') set validOptions(data: any) {
    this._validOptions = data;
  }

  get validOptions() {
    return this._validOptions;
  }

  constructor(public el: ElementRef,
              @Inject('page.element') public element: any,
              @Inject('dialog.service') public dialogService: any) {

  }

  ngOnInit() {
    this.el.nativeElement.addEventListener('click', (event: any) => {
      event.stopPropagation();
    });
    this.cropperOption = {
      option: {width: 400, height: 400},      //{ width: 320, height: 180 }
      secondOption: null
    };
    this.fileInput = null;
  }

  doCropStatus(input: any) {
    if (this._cropperInstance === null) {
      this.setCrop();
    }
    this.selectImage(input);
  }

  doCropper(show: boolean) {
    this.showCropper = show;
  }

  /*关闭按钮关闭图片*/
  closeImage() {
    this._cropperInstance.reset();
  }

  /**
   * 初始化裁剪对象
   */
  setCrop() {
    let self = this;
      var options = {
        aspectRatio: 1,
        minCropBoxWidth: 400,
        minCropBoxHeight: 400,
        preview: '.img-preview',
        viewMode: 2,
        autoCropArea: 1,
      };
      self._cropperInstance = new CropperClass.default(this.curImage.nativeElement, options);
  }


  /**
   * 设置输出图像属性
   * @param option
   * @param secondOption
   */
  setOption(option: any, secondOption: any) {
    this.cropperOption = {
      option: option,
      secondOption: secondOption
    };
  }


  getImage() {
    var setIn = this._cropperInstance.getCroppedCanvas(this.cropperOption.option, this.cropperOption.secondOption);
    if (setIn) {
      this.cropImage = setIn.toDataURL('image/png');
    }
    if (this.validOptions) {
      let originalData = this._cropperInstance.getImageData();
    }
  }

  /**
   * 输出裁剪图像
   */
  showImage(): any {
    if (!this.formatError) {
      this.showCropper = true;
    } else {
      this.getImage();
      this.showCropper = false;
      this.afterCropFile.emit(this.cropImage);
    }
  }

  /**
   * 输入裁剪图像
   */
  setImage(input: any): any {
    if (this.fileInput === null) {
      //创建元素
      this.fileInput = this.element.create({
        name: 'input',
        type: 'file',
        id: 'crop_file'
      });
      if (input) {
        this.fileInput = input.nativeElement;
      } else {
        return false;
      }

      let URL = window.URL;
      let blobURL: any;
      let self = this;
      this.fileInput.onchange = function () {
        let fileObj = this;
        if(this.files[0]) {
          self.curImage.src = this.files[0].name;
          let img = new Image();
          img.src = URL.createObjectURL(this.files[0]);
          img.onload = function () {
            if (img.width < self.validOptions.minWidth) {
              self.showCropper = true;
              self.formatError = false;
              self.showFileError = "THE PHOTO SIZE MUST BE BIGGER THAN";
            } else {
              if (img.height < self.validOptions.minHeight) {
                self.showCropper = true;
                self.formatError = false;
                self.showFileError = "THE PHOTO SIZE MUST BE BIGGER THAN";
              } else {
                if (fileObj.files && fileObj.files.length) {
                  let reg = /.(jpg|png|JPG|PNG|jpeg|JPEG)$/i;
                  if (reg.test(fileObj.files[0].name)) {//如果格式正确
                    self.formatError = true;
                    self.showCropper = true;
                    blobURL = URL.createObjectURL(fileObj.files[0]);
                    self._cropperInstance.reset().replace(blobURL);
                    self.fileInput.value = null;
                  } else {
                    self.fileInput.value = null;
                    self.showFileError = "Picture format is not correct";
                    self.showCropper = true;
                    self.formatError = false;
                  }
                }
              }
            }
          }
        }
      };
    }
  }


  /**
   * 打开图片文件
   */
  selectImage(input: any): any {
    this.setImage(input);
    this.fileInput.click();
  }


  /**
   * 压缩cavans图片
   * scales the canvas by (float) scale < 1
   * returns a new canvas containing the scaled image.
   */
  downScaleCanvas(cv: any, scale: any) {
    if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
    var sqScale = scale * scale; // square scale = area of source pixel within target
    var sw = cv.width; // source image width
    var sh = cv.height; // source image height
    var tw = Math.floor(sw * scale); // target image width
    var th = Math.floor(sh * scale); // target image height
    var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
    var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
    var tX = 0, tY = 0; // rounded tx, ty
    var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
    // weight is weight of current source point within target.
    // next weight is weight of current source point within next target's point.
    var crossX = false; // does scaled px cross its current px right border ?
    var crossY = false; // does scaled px cross its current px bottom border ?
    var sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
    var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
    var sR = 0, sG = 0, sB = 0; // source's current point r,g,b
    /* untested !
     var sA = 0;  //source alpha  */

    for (sy = 0; sy < sh; sy++) {
      ty = sy * scale; // y src position within target
      tY = 0 | ty;     // rounded : target pixel's y
      yIndex = 3 * tY * tw;  // line index within target array
      crossY = (tY !== (0 | ty + scale));
      if (crossY) { // if pixel is crossing botton target pixel
        wy = (tY + 1 - ty); // weight of point within target pixel
        nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
      }
      for (sx = 0; sx < sw; sx++, sIndex += 4) {
        tx = sx * scale; // x src position within target
        tX = 0 | tx;    // rounded : target pixel's x
        tIndex = yIndex + tX * 3; // target pixel index within target array
        crossX = (tX !== (0 | tx + scale));
        if (crossX) { // if pixel is crossing target pixel's right
          wx = (tX + 1 - tx); // weight of point within target pixel
          nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
        }
        sR = sBuffer[sIndex];   // retrieving r,g,b for curr src px.
        sG = sBuffer[sIndex + 1];
        sB = sBuffer[sIndex + 2];

        /* !! untested : handling alpha !!
         sA = sBuffer[sIndex + 3];
         if (!sA) continue;
         if (sA != 0xFF) {
         sR = (sR * sA) >> 8;  // or use /256 instead ??
         sG = (sG * sA) >> 8;
         sB = (sB * sA) >> 8;
         }
         */
        if (!crossX && !crossY) { // pixel does not cross
          // just add components weighted by squared scale.
          tBuffer[tIndex] += sR * sqScale;
          tBuffer[tIndex + 1] += sG * sqScale;
          tBuffer[tIndex + 2] += sB * sqScale;
        } else if (crossX && !crossY) { // cross on X only
          w = wx * scale;
          // add weighted component for current px
          tBuffer[tIndex] += sR * w;
          tBuffer[tIndex + 1] += sG * w;
          tBuffer[tIndex + 2] += sB * w;
          // add weighted component for next (tX+1) px
          nw = nwx * scale;
          tBuffer[tIndex + 3] += sR * nw;
          tBuffer[tIndex + 4] += sG * nw;
          tBuffer[tIndex + 5] += sB * nw;
        } else if (crossY && !crossX) { // cross on Y only
          w = wy * scale;
          // add weighted component for current px
          tBuffer[tIndex] += sR * w;
          tBuffer[tIndex + 1] += sG * w;
          tBuffer[tIndex + 2] += sB * w;
          // add weighted component for next (tY+1) px
          nw = nwy * scale;
          tBuffer[tIndex + 3 * tw] += sR * nw;
          tBuffer[tIndex + 3 * tw + 1] += sG * nw;
          tBuffer[tIndex + 3 * tw + 2] += sB * nw;
        } else { // crosses both x and y : four target points involved
          // add weighted component for current px
          w = wx * wy;
          tBuffer[tIndex] += sR * w;
          tBuffer[tIndex + 1] += sG * w;
          tBuffer[tIndex + 2] += sB * w;
          // for tX + 1; tY px
          nw = nwx * wy;
          tBuffer[tIndex + 3] += sR * nw;
          tBuffer[tIndex + 4] += sG * nw;
          tBuffer[tIndex + 5] += sB * nw;
          // for tX ; tY + 1 px
          nw = wx * nwy;
          tBuffer[tIndex + 3 * tw] += sR * nw;
          tBuffer[tIndex + 3 * tw + 1] += sG * nw;
          tBuffer[tIndex + 3 * tw + 2] += sB * nw;
          // for tX + 1 ; tY +1 px
          nw = nwx * nwy;
          tBuffer[tIndex + 3 * tw + 3] += sR * nw;
          tBuffer[tIndex + 3 * tw + 4] += sG * nw;
          tBuffer[tIndex + 3 * tw + 5] += sB * nw;
        }
      } // end for sx
    } // end for sy

    // create result canvas
    var resCV = document.createElement('canvas');
    resCV.width = tw;
    resCV.height = th;
    var resCtx = resCV.getContext('2d');
    var imgRes = resCtx.getImageData(0, 0, tw, th);
    var tByteBuffer = imgRes.data;
    // convert float32 array into a UInt8Clamped Array
    var pxIndex = 0; //
    for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
      tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
      tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
      tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
      tByteBuffer[tIndex + 3] = 255;
    }
    // writing result to canvas.
    resCtx.putImageData(imgRes, 0, 0);
    return resCV;
  }
}

