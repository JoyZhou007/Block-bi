/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2016/10/28.
 */
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2016/10/28.
 *
 * @Class WorkflowStepData  步数相关信息类
 * @Const WorkflowSVGConfig 一些高宽数值常量定义
 * @Class WorkflowSVGEle    关于坐标计算的类，用于绘制SVG元素和连接线
 */

export class WorkflowStepData {
  totalSteps: number;
  stepDetails: any;
  currentStep: number;
  x: any;
  y: any;
  nextSubStepCount: number;       //下一步是否有子步骤
  refuseStepSubStepCount: number; //拒绝线回到的这一步是否有子步骤
  subStepDetails?: any;
  currentSubStep?: number;

  constructor(totalSteps: number, stepDetails: any, x: any, y: any, currentStep: number,
              nextSubStepCount: number, refuseStepSubStepCount: number,
              subStepDetails?: any, currentSubStep?: number) {

    this.totalSteps = totalSteps;
    this.stepDetails = stepDetails;
    this.currentStep = currentStep;
    this.x = x;
    this.y = y;
    this.nextSubStepCount = nextSubStepCount;
    this.refuseStepSubStepCount = refuseStepSubStepCount;
    this.subStepDetails = subStepDetails;
    this.currentSubStep = currentSubStep;

  }

}

export const WorkflowSVGConfig = {
  groupLines: 'lines-group',
  groupAcceptBtn: 'accept-btn-group',
  groupRefuseBtn: 'refuse-btn-group',
  groupAcceptLines: 'approve-lines-group',
  groupRefuseLines: 'refuse-lines-group',
  highlightRefuseColor: 'red',
  highlightApproveColor: 'red',
  defaultX: 30,
  defaultY: 30,
  topCanvas: '#the-image-box',
  painter: '#top-painter',
  width: 252,
  widthInner: 250,
  height: 143,
  imgSize: 24,
  heightInner: 130,
  marginY: 48,
  marginX: 69,
  btnHeight: 20,
  approveColor: '#7078F7',
  strokeColor: '#000000',
  refuseColor: '#1f2532',
  strokeWidth: 1,
  fillOpacity: 1,
  strokeOpacity: 1,
  cursor: 'pointer',
  applicantIcon: 'assets/images/workflow-svg-bg1.png',
  approverIcon: 'assets/images/workflow-svg-bg2.png',
  acceptBtnClass: 'accept-button',
  refuseBtnClass: 'refuse-button',
  refuseStrokeDashArray: '30, 20',
  titleMaxLength: 200,
  userImageMax: 6
};

export class WorkflowSVGEle {
  public steps: any;    // 主步骤
  public children: any; // 子步骤
  private config: any;  // SVG相关样式设置

  constructor(data: any,
              config?: any,) {
    this.steps = data;
    if (!config) {
      this.config = WorkflowSVGConfig;
    }
  }

  /**
   *
   * @param step
   * @param subStep
   * @returns {string}
   */
  static getDataStep(step: number, subStep?: number) {
    let id = step.toString();
    if (typeof subStep !== 'undefined') {
      id += '-' + subStep.toString();
    } else {
      id += '-1';
    }
    return id;
  }

  /**
   *
   * @returns {string}
   */
  static getSVGClass() {
    return 'step-element';
  }

  static getLinesClass(type: string) {
    let typeStr = '';
    switch (type) {
      case 'refuse':
        typeStr = 'refuse-lines';
        break;
      case 'refuse-display':
        typeStr = 'refuse-display-lines';
        break;
      case 'approve':
        typeStr = 'approve-lines';
        break;
      case 'approve-display':
        typeStr = 'approve-display-lines';
        break;
      default:
        break;
    }
    return typeStr;
  }

  /**
   * 横坐标
   * @param i 步骤数，从0开始计数
   * @param subId 子步骤数，从1开始计数
   * @returns {number}
   */
  static calculateX(i: number, subId?: number) {
    if (subId > 1) {
      return WorkflowSVGConfig.defaultX + (WorkflowSVGConfig.marginX  + WorkflowSVGConfig.width) * (subId - 1);
    }
    return WorkflowSVGConfig.defaultX;
  }

  /**
   * 纵坐标 如果有子步骤，纵坐标应该相同
   * @param i 子步骤数，从0开始计数
   * @param subId 子步骤数，从1开始计数
   * @returns {number}
   */
  static calculateY(i: number, subId?: number) {
    if (i > 0) {
      return (WorkflowSVGConfig.marginY + WorkflowSVGConfig.height) * i + WorkflowSVGConfig.defaultY
    }
    return WorkflowSVGConfig.defaultY;
  }

  /**
   * 拒绝线交汇点的固定横坐标
   * @returns {number}
   */
  static refuseLineXFixed() {
    return WorkflowSVGConfig.defaultX + WorkflowSVGConfig.width + WorkflowSVGConfig.marginX / 2;
  }

  /**
   * 同意线交汇点的固定横坐标
   */
  static approveLineXFixed(x?: number) {
    if (typeof x === 'undefined') {
      x = WorkflowSVGConfig.defaultX;
    }
    return x + WorkflowSVGConfig.width / 2 - 1;
  }

  /**
   * 拒绝线的顶端Y点
   * @param y
   * @param stepGap
   * @returns {number}
   */
  static refuseLineBackToY(y: number, stepGap: number) {
    let data = y - WorkflowSVGConfig.marginY / 2 + 5 - (WorkflowSVGConfig.height + WorkflowSVGConfig.marginY) * stepGap;
    if (data < 0) {
      data = 0;
    }
    return data;
  }

  /**
   *
   * @param data
   * @returns {{approve: (null|any), refuse: (null|any)}}
   */
  static calculateLines(data: WorkflowStepData) {
    return {
      approve: this.approveLines(data),
      refuse: this.refuseLine(data),
    };
  }

  /**
   *
   * @param data
   * @returns {any}
   */
  static approveLines(data: WorkflowStepData) {
    if (data.totalSteps === (data.currentStep + 1)) {
      return null;
    }
    // 下一步是否还有子步骤
    let nextSubStep = data.nextSubStepCount;
    // 非第一个的子步骤
    let stepInto = this.getDataStep(data.currentStep + 1, data.currentSubStep);
    let stepType = '';
    if ('subStepDetails' in data && data.subStepDetails) {
      if (data.currentSubStep !== 1) {
        stepType = 'subLineNext';
      } else {
        stepType = 'simpleNext';
      }
      // 普通以及子步骤的第一个元素
    } else {
      stepType = 'simpleNext';
    }

    let rd = <any>[];
    switch (stepType) {
      case 'simpleNext':
        let lines = <any>[];
        let displayLines = <any>[];
        displayLines.push([
          {x: data.x + WorkflowSVGConfig.width / 4, y: data.y + WorkflowSVGConfig.height - 2},
          {
            x: data.x + WorkflowSVGConfig.width / 4,
            y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
          },
          {
            x: this.approveLineXFixed(data.x),
            y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
          },
          {x: this.approveLineXFixed(data.x), y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY}
        ]);
        lines.push([
          {x: data.x + WorkflowSVGConfig.width / 4, y: data.y + WorkflowSVGConfig.height - 2},
          {
            x: data.x + WorkflowSVGConfig.width / 4,
            y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
          },
          {
            x: this.approveLineXFixed(data.x),
            y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
          },
          {x: this.approveLineXFixed(data.x), y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY}
        ]);
        if (nextSubStep > 0) {
          // 下一步内容有子步骤，需要画共子步骤个横向
          for (let i = 2; i <= nextSubStep; i++) {
            let tmpX = this.calculateX(data.currentStep, i) + WorkflowSVGConfig.width / 2 - 1;
            let tmp = [
              {x: data.x + WorkflowSVGConfig.width / 4  , y: data.y + WorkflowSVGConfig.height - 2},
              {
                x: data.x + WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
              },
              {
                x: tmpX,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
              },
              {
                x: tmpX,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY
              }
            ];
            let displayTmp = [
              {
                x: this.calculateX(data.currentStep, i) - WorkflowSVGConfig.marginX - WorkflowSVGConfig.width / 2 - 1,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
              },
              {
                x: tmpX,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
              },
              {
                x: tmpX,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY
              }
            ];
            lines.push(tmp);
            displayLines.push(displayTmp);
          }
        }
        rd = [
          {
            'stepInto': stepInto,
            'displayLines': displayLines,
            'lines': lines,
            //'triangles': triangles
          }
        ];

        break;
      case 'subLineNext':
        let subStep = data.currentSubStep - 1;
        let length = (WorkflowSVGConfig.width * 3 / 8 + 2 + WorkflowSVGConfig.marginX)
          + (WorkflowSVGConfig.width + WorkflowSVGConfig.marginX) * (subStep - 1) + WorkflowSVGConfig.width / 8;
        let displayLength = 0;
        if (subStep === 1) {
          displayLength = (WorkflowSVGConfig.width / 2 + WorkflowSVGConfig.marginX) + 1;
        } else {
          displayLength = (WorkflowSVGConfig.width / 2 + WorkflowSVGConfig.marginX) + WorkflowSVGConfig.width / 4;
        }
        let tmpY = data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7;
        rd = [
          {
            'stepInto': stepInto,
            'displayLines': [
              [
                {x: data.x + WorkflowSVGConfig.width / 4, y: data.y + WorkflowSVGConfig.height - 2},
                {x: data.x + WorkflowSVGConfig.width / 4, y: tmpY},
                {
                  x: data.x - displayLength,
                  y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 2 - 2 + 7
                },
              ]
            ],
            'lines': [
              [
                {x: data.x + WorkflowSVGConfig.width / 4, y: data.y + WorkflowSVGConfig.height - 2},
                {x: data.x + WorkflowSVGConfig.width / 4, y: tmpY},
                {x: data.x - length, y: tmpY},
                {x: data.x - length, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY}
              ]
            ]
          }
        ];
        break;
      default:
        rd = [
          {
            'stepInto': stepInto,
            'displayLines': [],
            'lines': [],
            //'triangles': []
          }
        ];
        break;
    }

    return rd;
  }


  /**
   * 拒绝线路径
   * @param data
   * @returns {any}
   */
  static refuseLine(data: WorkflowStepData) {
    let rd = <any>[];
    // 第一步无拒绝线
    if (data.currentStep === 0) {
      return rd;
    }
    // TODO: 子步骤如果回到不同步骤，数据结构需要调整
    // 目前不管一票通过还是一票否决全部回到第一个子步骤
    let stepInto = this.getDataStep(data.stepDetails.refuse.after, data.currentSubStep);
    let stepType = '';
    // 除第一个子步骤之外的拒绝线
    if ('subStepDetails' in data && data.subStepDetails && data.currentSubStep !== 1) {
      stepType = 'subLineRefuse';
    } else {
      // 回到第一步
      if (parseInt(data.stepDetails.refuse.after) === 0) {
        stepType = 'refuseToFirst'
      } else {
        stepType = 'refuseNotToFirst';
      }
    }

    // 开始点
    let fixedX = this.refuseLineXFixed();
    let refuseStep = data.stepDetails.refuse.after;
    let refusedStepCount = data.currentStep - refuseStep;
    switch (stepType) {
      case 'refuseToFirst':
        rd = [
          {
            'stepInto': stepInto,
            // 用于默认显示，规避重复路径，高亮时候隐藏
            'displayLines': [
              [
                {
                  x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                  y: data.y + WorkflowSVGConfig.height - 2
                },
                {
                  x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                  y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
                },
                {x: fixedX, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4}
              ],
              [
                {x: fixedX, y: this.refuseLineBackToY(data.y, refusedStepCount)},
                {x: this.approveLineXFixed(data.x), y: this.refuseLineBackToY(data.y, refusedStepCount)},
                {x: this.approveLineXFixed(data.x), y: WorkflowSVGConfig.defaultY}
              ],
            ],
            // 鼠标移进元素时候高亮显示的完整线
            'lines': [
              {
                x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height - 2
              },
              {
                x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
              },
              {x: fixedX, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4},
              {
                x: fixedX,
                y: this.refuseLineBackToY(data.y, refusedStepCount),
              },
              {
                x: this.approveLineXFixed(data.x),
                y: this.refuseLineBackToY(data.y, refusedStepCount),
              },
              {
                x: this.approveLineXFixed(data.x),
                y: WorkflowSVGConfig.defaultY,
              },
            ],
            // 'triangles': [
            //   {x: this.approveLineXFixed(data.x), y: WorkflowSVGConfig.defaultY},
            //   {x: data.x + WorkflowSVGConfig.width / 2 - 5, y: WorkflowSVGConfig.defaultY - 4.5},
            //   {x: data.x + WorkflowSVGConfig.width / 2 + 3, y: WorkflowSVGConfig.defaultY - 4.5},
            // ]
          }
        ];
        break;
      case 'subLineRefuse':
        let subStep = data.currentSubStep - 1;
        let length = 0;
        if (subStep === 1) {
          length = WorkflowSVGConfig.marginX / 2;
        } else {
          length = WorkflowSVGConfig.width / 4 + WorkflowSVGConfig.marginX;
        }
        rd = [
          {
            'stepInto': stepInto,
            'displayLines': [
              [
                {
                  x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                  y: data.y + WorkflowSVGConfig.height - 2,
                  'style': {}
                },
                {
                  x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                  y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
                },
                {x:  data.x - length, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4},
              ]
            ],
            'lines': [
              {
                x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height - 2
              },
              {
                x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
              },
              {x: fixedX, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4},
              {x: fixedX, y: this.refuseLineBackToY(data.y, refusedStepCount)},
              {
                x: fixedX - WorkflowSVGConfig.marginX / 2 - WorkflowSVGConfig.width / 2 - 1,
                y: this.refuseLineBackToY(data.y, refusedStepCount)
              },
              {
                x: fixedX - WorkflowSVGConfig.marginX / 2 - WorkflowSVGConfig.width / 2 - 1,
                y: this.refuseLineBackToY(data.y, refusedStepCount) + WorkflowSVGConfig.marginY / 4 + 8
              }
            ]
          }
        ];
        break;
      case 'refuseNotToFirst':
        let strokeDashFlag = false;
        let styleObj = {};
        if (data.refuseStepSubStepCount > 0) {
          strokeDashFlag = true;
          styleObj = {'stroke-dasharray': WorkflowSVGConfig.refuseStrokeDashArray};
        }
        rd = [
          {
            'stepInto': stepInto,
            'displayLines': [
              [
                {
                  x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                  y: data.y + WorkflowSVGConfig.height - 2
                },
                {
                  x: data.x + WorkflowSVGConfig.width  - WorkflowSVGConfig.width / 4,
                  y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
                },
                {x: fixedX, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4},
              ],
              // 横向线若和子步骤的同意线重叠，则需要加粗
              [
                {
                  x: fixedX,
                  y: this.refuseLineBackToY(data.y, refusedStepCount),
                  'style': styleObj
                },
                {
                  x: this.approveLineXFixed(data.x),
                  y: this.refuseLineBackToY(data.y, refusedStepCount),
                },
                {
                  x: this.approveLineXFixed(data.x),
                  y: this.refuseLineBackToY(data.y, refusedStepCount) + WorkflowSVGConfig.marginY / 2,
                },
              ],
            ],
            'lines': [
              {
                x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height - 2
              },
              {
                x: data.x + WorkflowSVGConfig.width - WorkflowSVGConfig.width / 4,
                y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
              },
              {x: fixedX, y: data.y + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4},
              {
                x: fixedX, y: this.refuseLineBackToY(data.y, refusedStepCount)
              },
              {
                x: this.approveLineXFixed(data.x),
                y: this.refuseLineBackToY(data.y, refusedStepCount)
              },
              {
                x: this.approveLineXFixed(data.x),
                y: this.refuseLineBackToY(data.y, refusedStepCount) + WorkflowSVGConfig.marginY / 2
              },
            ]
          }
        ];
        break;
      default:
        rd = [];
        break;
    }
    return rd;
  }

}

