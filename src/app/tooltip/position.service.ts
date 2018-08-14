import {
  Injectable,
  ElementRef
} from "@angular/core";
import {PositionDescription} from "./tooltip-options";

@Injectable()
export class PositionService {
  static getWindowSize() {
    let viewportwidth;
    let viewportheight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
      viewportwidth = window.innerWidth;
      viewportheight = window.innerHeight;
    }
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
      && typeof document.documentElement.clientWidth !=
      'undefined' && document.documentElement.clientWidth != 0) {
      viewportwidth = document.documentElement.clientWidth;
      viewportheight = document.documentElement.clientHeight;
    }
    // older versions of IE
    else {
      viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
      viewportheight = document.getElementsByTagName('body')[0].clientHeight;
    }
    return {width: viewportwidth, height: viewportheight};
  }

  /**
   * Provides coordinates for the targetEl in relation to hostEl
   */
  public positionElements(hostEl: any,
                          targetEl: any,
                          positionStr: string = "top",
                          bufferDistance: number = 0): { top: number, left: number , width: number} {
    let windowSize = PositionService.getWindowSize();
    let position = this.breakPositionString(positionStr);
    let hostElInfo = hostEl.getBoundingClientRect();
    let targetElInfo = targetEl.getBoundingClientRect();
    let shiftWidth: { [key: string]: any } = {
      center: function () {
        return hostElInfo.left + hostEl.offsetWidth / 2 - Math.ceil(targetElInfo.width / 2);
      },
      left: function () {
        return hostElInfo.left - targetEl.clientWidth - bufferDistance;
      },
      right: function () {
        return hostElInfo.left + hostEl.offsetWidth + bufferDistance;
      }
    };

    let shiftHeight: { [key: string]: any } = {
      center: function (): number {

        return hostElInfo.top + (hostEl.offsetHeight / 2) - (targetEl.offsetHeight / 2);
      },
      top: function (): number {
        return hostElInfo.top - targetEl.offsetHeight - bufferDistance;
      },
      bottom: function (): number {
        return hostElInfo.top + hostEl.offsetHeight + bufferDistance;
      }
    };
    return {
      top: shiftHeight[position.vertical](),
      left: shiftWidth[position.horizontal](),
      width: targetEl.offsetWidth,
    };
  }

  private breakPositionString(positionStr: string): PositionDescription {
    let positionStrParts = positionStr.split("-");

    if (positionStrParts.length > 1) {
      return {
        horizontal: positionStrParts[0],
        vertical: positionStrParts[1]
      };
    }
    else if (positionStr === "top" || positionStr === "bottom") {
      return {
        horizontal: "center",
        vertical: positionStr
      };
    }
    else if (positionStr === "left" || positionStr === "right") {
      return {
        horizontal: positionStr,
        vertical: "center"
      };
    }
    return {
      horizontal: "center",
      vertical: "center"
    };
  }
}