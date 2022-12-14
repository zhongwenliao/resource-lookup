//
//  DMUpgradManager.h
//  SUOTA
//
//  Created by 宏根 张 on 2021/3/30.
//  Copyright © 2021 Martijn Houtman. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef void(^DMUpgradeOnProcess)(int state, NSString *msg);    //中间过程回调
typedef void(^DMUpgradeOnProgress)(int progress);               //进度回调
typedef void(^DMUpgradeOnError)(int errorCode, NSString *msg);  //错误回调


@interface DMUpgradManager : NSObject

+(DMUpgradManager *)shareInstance;

-(void)startUpgrade:(NSString *)devSn filePath:(NSString *)path onProcess:(DMUpgradeOnProcess)process onProgress:(DMUpgradeOnProgress)progress onError:(DMUpgradeOnError)error;

@end

NS_ASSUME_NONNULL_END
