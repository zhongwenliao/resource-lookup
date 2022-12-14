//
//  CommonViewController.h
//  Storm
//
//  Created by 朱攀峰 on 15/11/27.
//  Copyright (c) 2015年 MCDS. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "DMCommonNavBar.h"

@interface DMCommonViewController : UIViewController<UITableViewDataSource,UITableViewDelegate>

@property (nonatomic,strong)DMCommonNavBar *commonNavBar;

@property (nonatomic,strong)UITableView *tableView;

@property (nonatomic,strong)UITableView *groupTableView;


@property (nonatomic,assign)BOOL isHiddenBackBtn;

//- (void)initCharRoom;

- (void)performBlock:(void(^)())block afterDelay:(NSTimeInterval)delay;//延迟调用

- (void)presentSheet:(NSString *)title;

- (void)displayOverFlowActivityView;

- (void)removeOverFlowActivityView;

- (void)initBackBtn;

- (void)pushViewController:(UIViewController *)viewController animated:(BOOL)animated;

@end
