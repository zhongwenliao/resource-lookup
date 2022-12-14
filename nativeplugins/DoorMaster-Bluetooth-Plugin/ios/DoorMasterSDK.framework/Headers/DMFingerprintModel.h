//
//  DMFingerPrintModel.h
//  DoorMaster
//
//  Created by 宏根 张 on 22/12/2017.
//  Copyright © 2017 zhiguo. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface DMFingerprintModel : NSObject

@property (nonatomic, strong) NSString *identity; //用户身份
@property (nonatomic, strong) NSMutableArray <NSData *>* fingerPrintDatas; //指纹数据(支持多个)
@property (nonatomic, strong) NSDate *startDate; //开始时间
@property (nonatomic ,strong) NSDate *endDate; //结束时间

@end
