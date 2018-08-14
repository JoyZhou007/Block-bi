import {    Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'urlFormat'
})
export class UrlFormatPipe implements PipeTransform {
    transform(str:any, format:string) {
        if(typeof (<any>this)[format] === 'function') {
            return (<any>this)[format](str);
        }
    }

    urlToLink(str : string) {
        let replacePattern : any;


        if(new RegExp( "(http|ftp|https):\/\/?").test(str)) {
            //URLs starting with http://, https://, or ftp://
            replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            str = str.replace(replacePattern, '<a href="$1" target="_blank">$1</a>');
        } else {
            //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            replacePattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            str = str.replace(replacePattern, '$1<a href="http://$2" target="_blank">$2</a>');
        }

        //Change email addresses to mailto:: links.
        replacePattern = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        str = str.replace(replacePattern, '<a href="mailto:$1">$1</a>');

        return str;

    }

}
