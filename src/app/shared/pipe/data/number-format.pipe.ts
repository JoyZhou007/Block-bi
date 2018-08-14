import {Pipe, PipeTransform, Inject} from '@angular/core';

@Pipe({
    name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {
    constructor(
        @Inject('type.service') private typeService : any
    ) {
    }
    transform(num:any, length:number) {
        let numberLength : number = this.typeService.getDataLength(num);
        let fillLength = length - numberLength;
        var fillNumber : string = '';
        if(fillLength > 0) {
            for(let n=0; n< fillLength; n++) {
                fillNumber += '0';
            }
        }
        return fillNumber+num;
    }

}
