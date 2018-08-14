import {Injectable, Inject} from '@angular/core';

interface Element {
	name : string;	//元素名
	id? : string;		//元素ID
	className ? : string;	//元素Class名称
	nameAttr? : string;			//元素name名称
	type? : string;			//表单input type类型
	dataAttr? : any;		//data类型可以是多个如: {area : 1, city : 2}
};

@Injectable()
export class ElementService {

	private mouseX : number = 0;
	private mouseY : number = 0;

	constructor(
		@Inject('type.service') private typeService:any,
		@Inject('d3.service') private D3:any
	) {
	}


	/**
	 * 根据元素ID获取元素对象
	 * @param id
	 * @returns {HTMLElement}
	 */
	getObjById(id : string) : any {

		return document.getElementById(id);

	}

	/**
	 * 获取元素值
	 * @param dom
	 * @param key
	 * 返回的是 小数 | 整数
   */
	getElementVal(dom: any, key: string): number {
		return parseFloat(getComputedStyle(dom, null)[key]);
	}

	/**
	 * 获取属性值
	 * @param dom
	 * @param attr
   */
	getElementAttrVal(dom: any, attr: string) {
		return dom.getAttribute(attr);
	}

	/**
	 * 设置元素属性值
	 * @param dom
	 * @param attr
	 * @param val
   */
	setElementAttrVal(dom: any, attr: string, val: string) {
		dom.setAttribute(attr, val);
	}

	/**
	 * 获取子节点
	 * @param element
	 * @param str  //不传默认获取 div
	 * @returns {any}
   */
	getElementChildTag(element: any, str?: string): any {
		let childArr: any[] = [];
		let tag: string = str ? str : 'div';
		element = element.childNodes;
		for(let key = 0; key < element.length; key++) {
			if(element[key].nodeName !== '#text' && element[key].nodeType === 1) {
				if(element[key].tagName.toLocaleLowerCase() === tag) {
					childArr.push(element[key]);
				}
			}
		}
		return childArr;
	}

	/**
	 * 获取子元素高度
	 * //默认获取高度
	 * @param data
	 * @param num
	 * @param attr
	 * attr = {
	 *   height: 'height',
	 *   width: 'width',
	 *   paddingTop: 'paddingTop',
	 *   paddingBottom: 'paddingBottom',
	 *   paddingRight: 'paddingRight',
	 *   paddingLeft: 'paddingLeft',
	 *   marginRight: 'marginRight',
	 *   marginLeft: 'marginLeft',
	 *   marginTop: 'marginTop',
	 *   marginBottom: 'marginBottom',
	 *   borderRightWidth: 'borderRight',
	 *   borderLeftWidth: 'borderLeft',
	 *   borderTopWidth: 'borderTop',
	 *   borderBottomWidth: 'borderBottom',
	 * }
   */
	getChildValue(data: any, num?: number, attr?: any): number {
		let val: number = 0;
		if(Object.prototype.toString.call(data) === '[object Array]') {
			for(let d in data) {
				if(attr) {
					for(let key in attr) {
						val += this.calcValue(data[d], attr[key]);
					}
				}else {
					this.getElementVal(data[d], 'height');
				}
			}
		}else {
			val = this.getElementVal(data, 'height');
		}
		return num ? val += num : val;
	}

	/**
	 * 计算
	 * @param element
	 * @param attr
	 * @returns {number}
   */
	calcValue(element: any, attr: string): number {
		return this.getElementVal(element, attr);
	}

	/**
	 * 动态创建元素
	 */
	create(attr : Element) : any {
		if(!attr.name) {
			return false;
		}
		var _element = document.createElement(attr.name);
		if(attr.type) {
			_element.setAttribute( 'type', attr.type);
		}

		if(attr.className) {
			_element.setAttribute( 'class', attr.className);
		}

		if(attr.id) {
			_element.setAttribute( 'id', attr.id);
		}
		if(attr.nameAttr) {
			_element.setAttribute( 'name', attr.nameAttr);
		}

		if(attr.dataAttr) {
			for(var perAttr in attr.dataAttr) {
				_element.setAttribute( 'data-'+perAttr, attr.dataAttr[perAttr]);
			}
		}

		return _element;
	}

	/**
	 * 获取元素相对浏览器的位置
	 * @param element
	 * @param isBool
	 * @returns {{x: number, y: number}}
	 */
	getPosition(element : any, isBool: boolean = false) {
		let xPosition = 0;
		let yPosition = 0;

		while(element) {
			xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;

			if(isBool) {
				if(element && /scroll-element/.test(element.className)) {
					break;
				}
			}
		}

		return { x: xPosition, y: yPosition };
	}

	/**
	 * 获取window 窗口的属性
	 */
	getWindowAttr() : any {
		return {
			innerWidth : window.innerWidth,
			innerHeight : window.innerHeight
		};
	}

	/**
	 * 设置鼠标位置
	 */
	setMousePosition(x : number, y: number) {
		this.mouseX = x;
		this.mouseY = y;
	}

	/**
	 * 获取鼠标X轴移动方向
	 * 0: 没有移动 1:左方向 2 : 右方向 3: 向上 4:向下
	 */
	getMouseXMoveDirection(x : number, y:number) : number {
		var direction : number = 0;
		if(x > this.mouseX) {
			direction = 2;
		} else if(x < this.mouseX) {
			direction = 1;
		}
		return direction;
	}

	/**
	 * 获取鼠标轴移动方向
	 * 0: 没有移动 1:左方向 2 : 右方向 3: 向上 4:向下 5:左上 6:右上 7:左下 8:右下
	 */
	getMouseMoveDirection(x : number, y:number) : number {
		var direction : number = this.getMouseXMoveDirection(x, y);
		if(y > this.mouseY) {
			if(direction === 2) {
				direction = 8;
			} else if(direction === 0) {
				direction = 4;
			} else if(direction === 1) {
				direction = 7;
			}
		} else if(y < this.mouseY) {
			if(direction === 2) {
				direction = 6;
			} else if(direction === 0) {
				direction = 3;
			} else if(direction === 1) {
				direction = 5;
			}
		}

		return direction;
	}

	/**
	 * 验证元素是否有Class
	 */
	hasClass(element : any, className : string) : boolean {
		if(element && element.tagName) {
			let elementClass = (' ' + element.getAttribute('class') + ' ').replace(/[\n\t]/g, '');

			if (elementClass !== null && elementClass.indexOf(className + ' ') !== -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	/**
	 * 添加元素class
	 */
	setClass(element : any, addClass : string, removeClass? : string) {
		if(element && element.tagName) {
			var elementClass = element.getAttribute('class');
			elementClass = elementClass ? elementClass+' ': '';
			if(removeClass) {
				elementClass = elementClass.replace(removeClass, '');
			}

			if(addClass !== '' && elementClass.indexOf(addClass) === -1) {
				elementClass += addClass;
			}
			element.setAttribute('class', elementClass);
		}
	}

	/**
	 * 添加子元素class
	 */
	setChildrenClass(elements : any, addClass : string, removeClass? : string) {
		if(elements.children) {
			let childrenCount = this.typeService.getDataLength(elements.children);
			for(let i:number = 0; i<childrenCount; i++) {
				this.setClass(elements.children[i], addClass, removeClass);
			}
		}
	}

	/**
	 * 设置当前操作的class,取消同级别元素的class
	 * @param parentSelector 关联元素父级的选择器
	 * @param targetElement 当前元素
	 * @param currentClass 需要设置的当前元素的class
	 */
	loopChildrenDoClass(parentSelector: any, targetElement: any, currentClass?: string)  {
		if(targetElement) {

			currentClass = currentClass ? currentClass : 'current';
			let tagName = targetElement.tagName.toLocaleLowerCase();
			this.D3.getInstance().selectAll(parentSelector+' '+tagName).classed(currentClass, false);

			this.D3.getInstance().select(targetElement).classed(currentClass, true);
		}
	}

	/**
	 * 选择元素,返回D3元素实例
	 * @param selector
	 */
	getElement(selector : string) : any {
		return this.D3.getInstance().select(selector);
	}

	/**
	 * 移除所有类
	 * @param parentSelector
	 * @param currentClass
   */
	removeAllClass(parentSelector: any, currentClass?: string) {
		if(parentSelector) {
			currentClass = currentClass ? currentClass : 'current';
			this.D3.getInstance().selectAll(parentSelector).classed(currentClass, false);
		}
	}

	/**
	 * 选择当前元素
	 * @param currParam
   */
	selectCurrentElement(currParam: any) {
		let currentClass: string = currParam.currClass ? currParam.currClass : 'current';

		if(this.hasClass(currParam.event, currentClass)) {
			this.setClass(currParam.event, '', currentClass);
			this.setClass(currParam.element, '', currentClass);
		}else {
			if(!this.hasClass(currParam.event, currParam.hasClass) || !currParam.hasClass) {
				this.setClass(currParam.event, currentClass);
			}
		}

		//返回函数 0 => 删除  1 => 添加
		if(typeof currParam.callBack === 'function') {
			if(this.hasClass(currParam.event, currentClass)) {
				currParam.callBack(1);
			}else {
				currParam.callBack(0);
			}
		}
	}

	/**
	 * 选择所有
	 * @param targetSelectElement
	 * @param unifyElement
	 * @param targetClass
	 * @param element
	 * @param callBack
   */
	doUnifyElementClass(
		targetSelectElement: any, unifyElement: any,
		targetClass?: string, callBack?: any
	) {

		targetClass = targetClass ? targetClass : 'current';

		if(this.hasClass(targetSelectElement, targetClass)) {
			this.setClass(targetSelectElement, '', targetClass);
			this.setChildrenClass(unifyElement, '', targetClass);
		} else {
			this.setClass(targetSelectElement, targetClass);
			this.setChildrenClass(unifyElement, targetClass);
		}

		//返回函数 0 => 删除  1 => 添加
		if(typeof callBack === 'function') {
			if(this.hasClass(targetSelectElement, targetClass)) {
				callBack(1);
			}else {
				callBack(0);
			}
		}
	}

	/**
	 * 滚动元素底部
	 */
	scrollBottom(element : any, time: number = 300) {
		//滚动条滚动到最底部
		setTimeout(() => {
			element.scrollTop = element.scrollHeight;
		}, time);
	}

	/**
	 * 获取元素位置
	 * @param el  当前元素
	 * @param elementHeight  元素高度
	 * @param isFixed  元素高度
	 * @param isParent  true => 父级元素  false => 当前元素
	 * @param leftSubtractValue
	 */
	getElementPosition(el: any, elementHeight: number | string, isFixed: boolean = false, isParent: boolean = true, leftSubtractValue: number = 0): any {
		let obj: any;
		let element: any = isParent ? el.target.parentElement : el;

		//当前元素信息
		let getBounding: any = element.getBoundingClientRect();
		let pos: any = this.getPosition(element, true);
		obj = {
			element: element,
			boundingClientRect: getBounding,
			pos: pos,
			isFixed: isFixed,
			leftSubtractValue: leftSubtractValue,
			elementHeight: !!elementHeight ? elementHeight : 0
		};
		return obj;
	}

	/**
	 * 计算元素显示位置
	 * @param param
	 * @param subtractValue
	 * @return
	 */
	calcElementPosition(param: any, subtractValue?: number): any {
		let element: any = param.element;
		let elementHeight: number = param.elementHeight;
		//浏览器宽高
		let win: any = this.getWindowAttr();
		let boundingClientRect = param.boundingClientRect;
		let borderTop: number = this.getElementVal(element, 'marginTop');
		let borderBottom: number = this.getElementVal(element, 'borderBottom');
		let obj: any = {
			isFixed: param.isFixed,
			pos:{
				left: (param.isFixed ? boundingClientRect.left : param.pos.x) - param.leftSubtractValue
			}
		};
		subtractValue = subtractValue ? subtractValue : 0;

		if(param.isFixed) {
			if (win.innerHeight - boundingClientRect.height - boundingClientRect.top - borderTop - borderBottom - 10 < elementHeight) {
				if(boundingClientRect.top - 10 < elementHeight) {
					obj.pos.top = win.innerHeight * 0.5 - elementHeight * 0.5;
				}else {
					obj.pos.top = boundingClientRect.top - elementHeight - 10;
				}
			} else {
				obj.pos.top = boundingClientRect.top + borderBottom + borderTop + boundingClientRect.height + 10 - subtractValue;
			}
		}else {
			//当前元素 bottom 小于 显示元素高度(不包含dialog)
			if (win.innerHeight - boundingClientRect.height - boundingClientRect.top - borderTop - borderBottom - 10 < elementHeight) {
				if(boundingClientRect.top - 10 - subtractValue < elementHeight) {
					obj.pos.top = (win.innerHeight - subtractValue) * 0.5 - elementHeight * 0.5;
				}else {
					obj.pos.top = param.pos.y - elementHeight - 15;
				}
			} else {
				obj.pos.top = param.pos.y + boundingClientRect.height + borderTop + borderBottom + 10;
			}
		}
		return obj;
	}

	/**
	 * 设置元素位置
	 * @param data
	 * @param renderer
	 */
	setElementPosition(data: any, renderer: any) {
		let pos: any = data.pos;
		let element: any = data.element;
		renderer.setElementAttribute(element, 'style', '');
		if(data.isFixed) {
			renderer.setElementClass(element, 'fixed', true);
			renderer.setElementClass(element, 'absolute', false);
		}else {
			renderer.setElementClass(element, 'fixed', false);
			renderer.setElementClass(element, 'absolute', true);
		}
		for(let key in pos) {
			renderer.setElementStyle(element, key, pos[key] + ((pos[key] === 'auto') ? 'auto' : 'px'));
		}
	}

	/**
	 * 计算元素显示位置
	 * @param param
	 * @param subtractValue
	 * @return
	 */
	calcElementPositionRight(param: any, subtractValue?: number): any {
		let element: any = param.element;
		let elementHeight: number = param.elementHeight;
		//浏览器宽高
		let win: any = this.getWindowAttr();
		let boundingClientRect = param.boundingClientRect;
		let borderTop: number = this.getElementVal(element, 'marginTop');
		let borderBottom: number = this.getElementVal(element, 'borderBottom');
		let obj: any = {
			isFixed: param.isFixed,
			pos:{
				right: (param.isFixed ? boundingClientRect.left : param.pos.x) - param.leftSubtractValue
			}
		};
		subtractValue = subtractValue ? subtractValue : 0;

		if(param.isFixed) {
			if (win.innerHeight - boundingClientRect.height - boundingClientRect.top - borderTop - borderBottom - 10 < elementHeight) {
				if(boundingClientRect.top - 10 < elementHeight) {
					obj.pos.top = win.innerHeight * 0.5 - elementHeight * 0.5;
				}else {
					obj.pos.top = boundingClientRect.top - elementHeight - 10;
				}
			} else {
				obj.pos.top = boundingClientRect.top + borderBottom + borderTop + boundingClientRect.height + 10 - subtractValue;
			}
		}else {
			//当前元素 bottom 小于 显示元素高度(不包含dialog)
			if (win.innerHeight - boundingClientRect.height - boundingClientRect.top - borderTop - borderBottom - 10 < elementHeight) {
				if(boundingClientRect.top - 10 - subtractValue < elementHeight) {
					obj.pos.top = (win.innerHeight - subtractValue) * 0.5 - elementHeight * 0.5;
				}else {
					obj.pos.top = param.pos.y - elementHeight - 15;
				}
			} else {
				obj.pos.top = param.pos.y + boundingClientRect.height + borderTop + borderBottom + 10;
			}
		}
		return obj;
	}

}


