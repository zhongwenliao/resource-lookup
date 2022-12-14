//
//  CallViewController.h
//  SmartDoor
//
//  Created by Jason.Huang on 17/01/04.
//  Copyright © 2017. All rights reserved.
//

#import "DMCommonViewController.h"

@interface DMCallViewController : DMCommonViewController

@property (nonatomic,assign)int callType;

@property (nonatomic,strong)NSString *addStr;

@property (nonatomic,assign)BOOL isCallOut;

@end
