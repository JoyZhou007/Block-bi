import {Injectable, Inject} from '@angular/core';


@Injectable()
export class ImgService {

  constructor(@Inject('type.service') private typeService: any) {
  }

  readyImg(src: string, ready: any, load?: any, error?: any): any {
    let intervalId: any;
    let list: Array<any> = [];

    let stop = () => {
      clearInterval(intervalId);
      intervalId = null
    };

    let tick = () => {
      for (let i = 0; i < list.length; i++) {
        list[i].end ? list.splice(i--, 1) : list[i]()
      }

      !list.length && stop()
    };

    let excImgEvent = () => {
      let onReady: any;
      let width: any;
      let height: any;
      let newWidth: any;
      let newHeight: any;

      let img: any = new Image();
      img.src = src;
      if (img.complete) {
        typeof ready === 'function' && ready(img);
        typeof load === 'function' && load(img);
        return;
      }
      ;

      width = img.width;
      height = img.height;
      img.onError = () => {
        error && error.call(img);
        onReady.end = true;
        img = img.onload = img.onError = null
      };
      onReady = () => {
        newWidth = img.width;
        newHeight = img.height;
        if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
          typeof ready === 'function' && ready(img);
          onReady.end = true;
        }
      };
      onReady();
      img.onload = () => {
        !onReady.end && onReady();
        typeof load === 'function' && load.call(img);
        img = img.onload = img.onError = null
      };
      if (!onReady.end) {
        list.push(onReady);
        if (intervalId === null) intervalId = setInterval(tick, 40)
      }
    }
    excImgEvent();
  }

}
