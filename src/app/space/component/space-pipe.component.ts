import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'space-pipe',
  templateUrl: '../template/space-pipe.component.html',
})

export class SpacePipeComponent implements OnInit,OnDestroy {

  private d3: any;

  public totalColor: Array<string> = ["#dbe6a2", "#88bfb1"];
  public fiveColor: Array<string> = ["#78478b", "#b65070", "#e5574f", "#f08664", "#fccb87","#88bfb1"];
  public showFivePie: boolean = false;

  @Input()
  public set pipeFiveData(data: any) {
    if (data) {
      if (data.length) {
        this.showFivePie = true;
        this.drawPipe(data, 'five');
      } else {
        this.showFivePie = false;
      }

    }
  }

  @Input()
  public set pipeTotalData(data: any) {
    if (data) {
      this.drawPipe(data, 'total');
    }
  }

  constructor(@Inject('d3.service') public D3Service: any,
              @Inject('bi-translate.service') public translateService: any,) {
    this.d3 = this.D3Service.getInstance();
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.d3.select('.tooltip').style("opacity", 0);
  }

  /**
   * 画total
   * @param data
   * @param id
   */
  private drawPipe(data: any, id: string): void {
    if (id === 'five') {
      data.forEach((value, i) => {
        value.push(this.fiveColor[i]);
      })
    } else {
      data.forEach((value, i) => {
        value.push(this.totalColor[i]);
      })
    }

    let dataset = data;
    let pie = this.d3.pie()
      .value(function (d) {
        return d[1];
      });//值访问器 ;
    let piedata = pie(dataset);


    //为了根据转换后的数据 piedata 来作图，还需要一样工具：生成器。
    // SVG 有一个元素，叫做路径 path，是 SVG 中功能最强的元素，
    // 它可以表示其它任意的图形。顾名思义，路径元素就是通过定义一个段"路径"，来绘制出各种图形。
    // 但是，路径是很难计算的，通过布局转换后的数据 piedata 仍然很难手动计算得到路径值。为我们完成这项任务的，就是生成器。
    // 这里要用到的叫做弧生成器，能够生成弧的路径，因为饼图的每一部分都是一段弧。

    let outerRadius = 124;           // 外半径
    let innerRadius = 0;             // 内半径
    let arc = this.d3.arc()           // 弧生成器
      .innerRadius(innerRadius)    // 设置内半径
      .outerRadius(outerRadius)  // 设置外半径


    // 弧生成器返回的结果赋值给 arc。此时，arc 可以当做一个函数使用，
    // 把 piedata 作为参数传入，即可得到路径值。
    // 接下来，可以在 SVG 中添加图形元素了。
    // 先在 svg 里添加足够数量（5个）个分组元素（g），每一个分组用于存放一段弧的相关元素。

    let svg = this.d3.select("#" + id),
      width = 248,
      height = 268;
    let arcs = svg.selectAll("g")
      .data(piedata)
      .enter()
      .append("g")
      .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");
    // var color=d3.scale.category20();

    let color;
    if (id === 'total') {
      color = this.d3.scaleOrdinal(this.totalColor);
    } else {
      color = this.d3.scaleOrdinal(this.fiveColor);
    }

    //接下来对每个g元素，添加 path。
    arcs.append("path")
      .attr("fill", function (d, i) {
        return color(i);
      })
      .attr("d", function (d) {
        return arc(d);   //调用弧生成器，得到路径值
      });


    //然后在每一个弧线中心添加文本
    // arcs.append("text")
    //   .attr("transform", function (d) {
    //     return "translate(" + arc.centroid(d) + ")";
    //   })
    //   .attr("text-anchor", "middle")
    //   .text(function (d) {
    //     return d.data + 'M';
    //   });


    //添加一个提示框
    let tooltip = this.d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    let _self = this;
    arcs
      .on("mouseover", function (d, i) {
        /*
        鼠标移入时，
        （1）通过 selection.html() 来更改提示框的文字
        （2）通过更改样式 left 和 top 来设定提示框的位置
        （3）设定提示框的透明度为1.0（完全不透明）
        */
        tooltip.html(d.data[0] + ":" + _self.getSize(d.data[1]).size + _self.getSize(d.data[1]).unit)
          .style("left", (_self.d3.event.pageX) + "px")
          .style("top", (_self.d3.event.pageY + 20) + "px")
          .style("opacity", 1.0);
        //在提示框后添加阴影
        tooltip.style("box-shadow", "-10px 0px 0px" + color(i));
      })
      .on("mousemove", function (d) {
        /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */
        tooltip.style("left", (_self.d3.event.pageX) + "px")
          .style("top", (_self.d3.event.pageY + 20) + "px");
      })
      .on("mouseout", function (d) {
        //鼠标移除 透明度设为0
        tooltip.style("opacity", 0.0);
      })

    //画图例
    let iconList = svg.append('g')
      .attr("transform", "translate(" + 0 + "," + (width + 10) + ")");


    data.forEach((value, index) => {
      let group = iconList.append('g')
        .attr("transform", "translate(" + 10 + "," + (15 * index) + ")");
      group.append('rect')
        .attr('width', 10)
        .attr('height', 5)
        .style('fill', value[2])

      group.append('text')
        .style('fill', 'black')
        .attr('x', 15)
        .attr('y', 7.5)
        .text(value[0])
      group.on("mouseover", function (d, i) {
        /*
        鼠标移入时，
        （1）通过 selection.html() 来更改提示框的文字
        （2）通过更改样式 left 和 top 来设定提示框的位置
        （3）设定提示框的透明度为1.0（完全不透明）
        */

        tooltip.html(value[0] + ":" + _self.getSize(value[1]).size + _self.getSize(value[1]).unit)
          .style("left", (_self.d3.event.pageX + 30) + "px")
          .style("top", (_self.d3.event.pageY - 30) + "px")
          .style("opacity", 1.0);
        //在提示框后添加阴影
        tooltip.style("box-shadow", "-10px 0px 0px" + value[2]);
      })
        .on("mousemove", function (d) {
          /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */
          tooltip.style("left", (_self.d3.event.pageX + 30) + "px")
            .style("top", (_self.d3.event.pageY - 30) + "px");
        })
        .on("mouseout", function (d) {
          //鼠标移除 透明度设为0
          tooltip.style("opacity", 0.0);
        })
    })
    let iconListWidth;
    if(iconList.node()){
      iconListWidth = iconList.node().getBBox().width;
    }

    iconList.attr("transform", "translate(" + (124 - iconListWidth / 2) + "," + (width + 10) + ")");


  }

  /**
   * 转换大小
   * @param {number} size  单位kb
   */
  public getSize(size: number): {
    unit: string,
    size: number
  } {
    let data;
    if (size / 1024 > 1024) { //GB
      data = {
        unit: 'G',
        size: (size / 1024 / 1024).toFixed(2)
      };
    } else {
      data = {
        unit: 'M',
        size: (size / 1024).toFixed(2)
      }
    }
    return data;
  }
}