# Structure 组织架构

1. 名词解释

    1.1 主干 Main
    
    1.2 部门 Department
    
    1.3 职位 Position Name (-> level)
    
    1.4 职位等级 Position Level
    
    1.5 职务名 Position Title (-> position name)
    
    1.6 待分配人员 Pending Person
    
    1.7 助手 Assistant
    
    1.8 下属 Subordinate
    
    1.9 域, 指一个部门Department内或者主干Main内
    
    2.0 直属上级, Function manager, 又称Line manager 用来处理业务逻辑
    
    2.1 行政上级, Admin manager, 此版本无功能，原定可以为跨分公司/子公司的人员
    
    2.2 分公司 
    
    2.3 子公司 通过申请成为旗下子公司，共享contact list的Internal列表。
    
2. Position Structure逻辑

- 当psid有关联的正在进行的任务(application除外)和拥有文件时, 不可删除。
- psid只可在同域（见1.9）内平移，即更改同level的上级, psid*有下级和助理*时候不可以平移
- psid有助理的不能删除
- psid被删除时候, 其子级的parent_id将变为psid的父级id(祖父id)
- 待完善: 如果有相关application 比如跨部门的连接人时任务如何处理?
 
3. Department 逻辑

- 当部门中只要有psid就不能删除
- department leader可以任意更换为main域, 且level小于部门内最高level的人

4. Pending Person
- 当用户没有和任何职位关联时，为pending状态
- pending状态分为常量0和常量2, 0代表刚入职, 2代表换职位
- 在pending状态时候，只能发送站内信, 正常公司用户则通过psid走聊天通道
