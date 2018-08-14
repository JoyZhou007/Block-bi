# Mission 展现基本准则
1. mission分为以下几种状态
~~~
// 被删除的
0 - DELETE

// 准备进行
1 - TODO

// 延期
2 - PENDING

// 重置时间 
3 - RESET 
- M1 s1 e1
- M2 s2 e2
- 如果M2连接到M1, M2的开始时间将不可选，结束时间将不得比e1早，如果e1
- RESET只可能在前置任务完成(done)之后才检查

// 正在进行
4 - DOING 

// 暂停
5 - PAUSE

// 取消
6 - CANCEL

// 已完成
7 - DONE

// 归档
8 - STORAGE
~~~

- 当mission变为已完成和归档的状态时候，所有的数据为只读。比如，文件只有下载操作，聊天功能失效


2. mission分为5种type(类型)
2.1 APPLICATION 应用 
- BIDDING/TARGET, MEMO不能启用
- 开始结束无法设置，开始时间为Now, 结束为Pending 
    
2.2 ASSIGNMENT 直属上下级任务
    BIDDING, EXPENSE, MEMO 不能启用
    
2.3 MEETING  会议
    OBSERVER/BIDDING/EXPENSE/TARGET 不能启用
 - 开始/结束时间必填
    
2.4 PROJECT  项目
- BIDDING/EXPENSE/TARGET/MEMO 不能启用
- 开始结束无法设置 全部为planning    
    
2.5 TASK 任务
    EXPENSE/MEMO 不能启用

3.0 mission分为8种function(功能)

3.1 participant 参与人

3.2 memo recorder 记录者

3.3 importance 重要性 

3.4 tracking  追踪

3.5 bidding 投标
- bidding的开始时间必然在mission的开始时间和结束时间内

3.6 expense 付款

3.7 target 目标

- 如果是

