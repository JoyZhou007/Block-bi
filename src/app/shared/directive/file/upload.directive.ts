import {
  Inject, Directive, ElementRef, Input, OnInit, EventEmitter, Output, ContentChild, AfterContentInit
} from '@angular/core';
import {UploadService} from '../../services/common/file/upload.service';

@Directive({
  providers: [UploadService],
  selector: '[uploadDirective]'
})

export class UploadDirective implements OnInit,AfterContentInit {
  public _fileId: Number;     //图片ID
  public _fileParam : any = {};     //图片数据
  public _doCropStatus: Number = 0;   //是否需要裁剪图片
  public _uploadInstance : any;  //上传组件实例

  public _base64File : any;      //截图base64文件

  @ContentChild('cropperForm') public cropperForm: any;
  @ContentChild('userInput') public userInput: any;

  @Output() public showFile : EventEmitter<any> = new EventEmitter();
  @Output() public uploadProgress : EventEmitter<any> = new EventEmitter();

  constructor(
      public el: ElementRef,
      public upload : UploadService,
      @Inject('api.service') public api : any,
      @Inject('page.element') public element : any,
      @Inject('store.service') public store : any,
      @Inject('app.config') public config : any,
      @Inject('user-data.service') public userDataService : any,
      @Inject('dialog.service') public dialogService: any
  ) {
  }
  @Input() set fileId(id : number) {
    this._fileId = id;
  }
  @Input() set fileType(type : number) {
    // this._fileParam = {};
    this._fileParam.type = type;
    this.setFileData(this._fileParam);
  }
  @Input() set fileParam(data : any) {
    this.setFileData(data);
  }

  @Input() set base64File(img : any) {
    if(img) {
      this._base64File = img;
      // this.doUpload();
    }
  }
  @Input() set isUpload(upload : any) {
      this.doUpload();
  }
  @Input() set setIsRegister(upload : any) {
    this._fileParam.register = true;
  }



  //初始化页面后
  ngOnInit() {

  }

  //初始化Content后
  ngAfterContentInit() {
    if(this.cropperForm) {
      this.el.nativeElement.addEventListener('click', (event : any) => {
         event.stopPropagation();
        this.cropperForm.doCropStatus(this.userInput);
      });
      this._doCropStatus = 1;
    } else  {
      this.initUploadInstance();
    }
  }

	/**
   * 初始化上传组件
   * @param file
   * @returns {boolean}
   */
	initUploadInstance() {
    let uploadAttr : any = {
      progressCallbacksInterval: 0,
      testChunks: false
    };
    if(this._fileParam.uploadUrl) {
      uploadAttr.uploadUrl = this._fileParam.uploadUrl;
    }

    this._uploadInstance = this.upload.newInstance(uploadAttr, this.el.nativeElement);

    this._uploadInstance.on('fileAdded', function(file : any) {
      //_this.doUpload();
    });

    this._uploadInstance.on('fileSuccess',(file : any, message : any) => {
      this.doUploadFileSuccess(file, message);
      this._uploadInstance.cancel();
    });

    this._uploadInstance.on('fileError', (file : any, message : any) => {
      this.doUploadFileError(file, message);
    });

    this._uploadInstance.on('fileProgress', (file : any, message : any) => {
      this.uploadProgress.emit(Math.floor(file.progress()*100));
    });


    this._uploadInstance.on('uploadStart', () => {
      this.doUploadStart();
    });

    this._uploadInstance.on('filesSubmitted', (file : any) => {
      let checkStatus = this.checkFileSize(file);
      if(checkStatus) {
         this.doFilesSubmitted();
      } else {
        //取消上传
        this._uploadInstance.cancel();
      }
    });

    this._uploadInstance.on('complete', () => {
    });

    this._uploadInstance.on('catchAll', () => {
    });
  }

  checkFileSize(file? : any) {
    var maxImgSize : number = this.config.uploadImgSize* 1024 * 1024;
    var fileSize : number;
    if (this._doCropStatus === 0) {
      fileSize = file[0] ? file[0].size : 0;
    } else {
      if(this._base64File){
        fileSize = this._base64File.length;
      }
    }

    if(fileSize > maxImgSize) {
      this.dialogService.open({
        type: 'error',
        title: 'error!',
        content: 'Uploaded image must be less than '+this.config.uploadImgSize+'M',
        closeEvent: () => {
          //this.router.navigate(['UserIndex']);
        }
      });
      return false;
    }
    return true;
  }

  setFileData(data : any) {
    data = data ? data : {};
    data['session_id'] = this.userDataService.getSessionId();
    //此处例外,用store原生方法获取session
    this._fileParam = data;

    if(this.upload) {
      //重新设置上传参数
      this.upload.setUploadData(this._fileParam);
    }
  }

  /**
   * 文件提交
   */
  doFilesSubmitted() {
    this.doUpload();
  }
  /**
   * 执行上传
   */
  doUpload() {
    let couldUpload = false;
    if (typeof this.cropperForm !== 'undefined' && this.cropperForm.isValid && this._doCropStatus === 1) {
      couldUpload = true;
    } else if (this._doCropStatus === 1){
      couldUpload = true;
    }
    if (couldUpload) {
      let checkStatus = this.checkFileSize();
      if(checkStatus) {
        //接到通知时上传。。。。
        if(this._base64File){
          this.upload.uploadBase64File(
            {base64_file:this._base64File}, this._fileParam).subscribe(
            (data : any)  => {
              if (data.status === 1) {  //上传成功
                this.showFile.emit(data.data.fileInfo);
              }else{
                if(data){
                  this.dialogService.openError({simpleContent:  data.message});
                }
              }
            });
        }
        this.upload.on('fileProgress', (progress :number) => {
          this.uploadProgress.emit(Math.floor(progress*100));
        });
        this._base64File = '';
      }

    } else {
      if(this._uploadInstance){
         this._uploadInstance.upload();
        if(this._uploadInstance.files.length > 1) {
          delete this._uploadInstance.files.splice(0, 1);
        }
      }

    }
  }

  /**
   * 开始上传
   */
  doUploadStart() {
  }


  
  /**
   * 上传成功
   */
  doUploadFileSuccess(file : any, message : any) {
    message = JSON.parse(message);
    if(message.status === 1) {
      if(message.data.fileInfo) {
        this.showFile.emit(message.data.fileInfo);
      }else {
        this.showFile.emit(message);
      }
    } else {
      this.dialogService.openError({ simpleContent:message.message});
    }
  }

  /**
   * 上传失败
   */
  doUploadFileError(file : any, message : any) {
  }

}

