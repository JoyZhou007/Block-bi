/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/11/28.
 */
import { Directive, ElementRef, EventEmitter, Output } from "@angular/core";

@Directive({
  selector: '[DragDropDirective]'
})


export class DragDropDirective {
  @Output() outDrop = new EventEmitter<any>();
  constructor(
    public el: ElementRef) {
    el.nativeElement.addEventListener('drop', (event: any) => {
      console.log('ondrop', event);
      event.preventDefault();
      let dt = event.dataTransfer;
      let fileArray = [];
      if (dt.items) {
        // Use DataTransferItemList interface to access the file(s)

        for (let i=0; i < dt.items.length; i++) {
          if (dt.items[i].kind == "file") {
            let f = dt.items[i].getAsFile();
            fileArray.push(f);
            //console.log("... file[" + i + "].name = " + f.name);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        fileArray = dt.files;
        for (let i=0; i < dt.files.length; i++) {
          //console.log("... file[" + i + "].name = " + dt.files[i].name);
        }
      }
      if (fileArray.length > 0) {
        //console.log('fileArray', fileArray);
        this.outDrop.emit({files: fileArray});
      }
    });
    el.nativeElement.addEventListener('dragover', (event: any) => {
      event.preventDefault();
    })
  }
}
