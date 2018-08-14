# Workflow 工作流程

##主要功能

- 显示当前用户关联workflow列表
- 绘图展示某个workflow
- 增删改操作

##后端关联API

- [申请人列表](http://devapi-debug.blockbi.com/?url=/api/workflow/applicantList)
- [批准人列表](http://devapi-debug.blockbi.com/?url=/api/workflow/approverList)
- [保存工作流](http://devapi-debug.blockbi.com/?url=/api/workflow/upload)
- [工作流列表](http://devapi-debug.blockbi.com/?url=/api/workflow/list)
- [工作流详情](http://devapi-debug.blockbi.com/?url=/api/workflow/details)
- [删除工作流](http://devapi-debug.blockbi.com/?url=/api/workflow/delete)

##绘制原理

1. 绝对定位每个workflow元素的坐标(x, y)

2. 基于坐标定位连接线, 并且由于直接连接各个元素会造成线段的重叠

   将所有连接线分为 
 - 用于直接显示的[线1], 线1不会有重叠
 - 动画触发的[线2], [线2]直接关联相关元素
 - 线2显示的时候隐藏[线1], 反之一样

3. 连接线分为同意线和拒绝线

4. 起始步骤不存在拒绝, 结束步骤不存在同意, 拒绝只能回退到至少之前一步

5. 一票通过和一票拒绝 

6. 使用Expand小标签链接另一个workflow

##workflow原理

1. 一票通过和一票拒绝
  - 只有多职务和多职位支持一票通过 （一个Executor选项中只能多选职务或者职位, 或者 单选部门, 或者 单选外部公司职务）
  - 一票拒绝支持多种组合

