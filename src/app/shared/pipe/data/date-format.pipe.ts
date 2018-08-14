import {Pipe, PipeTransform, Inject} from '@angular/core';
//import {DateService} from '../../services/index.service';

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
    constructor(
        @Inject('date.service') private dateService : any
    ) {
    }
    transform(timestamp : any, format : string) {
        timestamp = parseInt(timestamp);
        return this.dateService.formatWithTimezone(timestamp, format);
    }

}
