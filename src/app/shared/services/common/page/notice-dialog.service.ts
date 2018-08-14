import {Inject} from '@angular/core';

export class NoticeDialogService {

  constructor(
    @Inject('dialog.service') public dialogService: any
  ) {}

  setNoticeDialog(data: any) {
    //data.type => 1 SUCCESS
    //data.type => 2 NOTICE
    //data.type !== 1 ERROR
    let title: string = '';
    switch(data.type) {
      case 1:
        title = 'SUCCESS!';
        break;
      case 2:
        title = 'WARNING!';
        break;
      default:
        title = 'ERROR!';
      break;
    }
    let settings = {
      mode: '3',
      title: title,
      isSimpleContent: true,
      simpleContent: data.content
    };
    this.dialogService.openNew(settings);
  }

}
