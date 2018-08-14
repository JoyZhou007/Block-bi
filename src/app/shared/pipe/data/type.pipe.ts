import {Pipe, PipeTransform, Inject} from '@angular/core';

@Pipe({
  name: 'dataLength'
})
export class DataLengthPipe implements PipeTransform {
  constructor(@Inject('type.service') private typeService: any) {
  }

  transform(val: any) {
    return this.typeService.getDataLength(val);
  }

}
