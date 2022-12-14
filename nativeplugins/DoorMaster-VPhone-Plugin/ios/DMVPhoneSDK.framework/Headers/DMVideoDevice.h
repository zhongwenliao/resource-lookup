//
//  DMVideoDevice.h
//  3
//
//  Created by 宏根 张 on 2018/9/6.
//  Copyright © 2018 Intelligoo. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface DMVideoDevice : NSObject

/*
 * 设备序列号
 */
@property (nonatomic, strong) NSString *devSn;

/*
 * 设备名称
 */
@property (nonatomic, strong) NSString *devName;

/*
 * 设备呼叫的房间id
 */
@property (nonatomic, strong) NSString *roomID;

/*
 * 设备抓拍的图片链接
 */
@property (nonatomic, strong) NSString *captureImage;

@end
