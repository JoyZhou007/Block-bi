import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'stringFormat'
})
export class StringFormatPipe implements PipeTransform {
    transform(str:any, format:string) {
        if(typeof str[format] === 'function') {
            return str[format]();
        } else if(typeof (<any>this)[format] === 'function') {
            return (<any>this)[format]();
        }
    }
}
