//
//  DMConnectedDevice.h
//  DoorMaster
//
//  Created by 宏根 张 on 2020/12/1.
//  Copyright © 2020 zhiguo. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol DMDataSendingAndReceivingDelegate <NSObject>

-(void)sendData:(NSData *)data;
-(void)disconnect:(BOOL)result;

@end

@interface DMConnectedDevice : NSObject
//数据收发代理
@property(nonatomic,weak)id<DMDataSendingAndReceivingDelegate>delegate;
//发送数据给设备
-(void)sendData:(NSData *)data;
//断连设备，断连之前发送操作结果，以便设备做出对应的响应
-(void)disconnect:(BOOL)result;

@end

NS_ASSUME_NONNULL_END
