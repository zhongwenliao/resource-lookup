//
//  DevModel.h
//  DoorMasterSDK DevModel Object
//  Created by Jason.Huang on 15/04/10.
//  Copyright (c) 2017. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "DMSDK_CallBack.h"
#import "DMFingerprintModel.h"
#import "DMConnectedDevice.h"

#define RESTARTBLENOTIFICATION @"RESTARTBLENOTIFICATION"

//连接上Eid设备
typedef void(^BlockOnEIDOnConnectDevice)(DMConnectedDevice *device);

//接收到EID设备的数据
typedef void(^BlockOnEIDOnReceiveData)(NSData *data);

//与EID设备断连
typedef void(^BlockOnEIDOnDisconnectDevice)();

//连接EID设备失败
typedef void(^BlockOnEIDOnConnectDeviceFail)();

@interface LibDevModel : NSObject

// SDK内部使用，不需要设置
// (EN: SDK internal use, do not need to set）
@property (nonatomic, copy) NSString *identifier;

// * 设备序列号 --必须
// * (EN: Device Serial Number - Required）
@property (nonatomic, copy) NSString *devSn;

// * 设备序MAC --必须
// * (EN: Device MAC - Required）
@property (nonatomic, copy) NSString *devMac;

// * 设备类型(1 门禁读头, 2 一体机, 3 梯控读头, 4 无线联网锁, 5 蓝牙小模块, 6 门禁控制器, 7 触摸开关门禁, 9 二维码设备 ) --必须
// * (EN: Device type (1 access reader, 2-in-1, 3 ladder control reading head, 4 wireless networking lock, 5 Bluetooth small module, 6 access controller, 7 touch switch access control, 9 qrcode device) -- Required）
@property (nonatomic) int devType;

// 管理者权限： 1 超级管理员，2 管理员， 4 普通用户
// (EN: Administrator privileges: 1 Super administrator, 2 administrators, 4 ordinary users)
@property (nonatomic) int privilege;

// 开门方式;
// (EN: Open door type)
@property (nonatomic) int openMode;

// 验证方式： 1 有效期， 2 次数， 3 有效期+次数
// (EN: Verification: 1 valid, 2 times, 3 valid + number of times)
@property (nonatomic) int verified;

// 开始日期，格式：年月日时分秒，如：20151201102030
// (EN: Start date, format: year, month, day, hour and minute, such as: 20151201102030)
@property (nonatomic, copy) NSString *startDate;

// 冻结日期，格式：年月日时分秒，如：20151201102030
// (EN: Freeze date, format: year, month, day, hour and minute, such as: 20151201102030)
@property (nonatomic, copy) NSString *endDate;

@property (nonatomic, assign) int supportNetwork;

@property (nonatomic, assign) BOOL isIbeacon; //如果是ibeacon设备，则不需要验证mac地址

@property (nonatomic, assign) int keyType; //密钥类型， 1：一体机 2：门禁读头 3：梯控读头

// 使用次数
// (EN: Use count)
@property (nonatomic) int useCount;

// * 用户电子钥匙 --必须
// * (EN: User Electronic Key - Required)
@property (nonatomic, copy) NSString *eKey;

// 用户卡号, 用于兼容 controlDevice、openDoor开门接口
// (EN: User card number, for compatible controlDevice, openDoor open the door interface)
@property (nonatomic, copy) NSString *cardno;

@property (nonatomic, copy) NSString *personalPwd;

//@property (nonatomic, copy) NSString *encryKey;


/**
 * zh-CN: 初始化蓝牙--预加载，首次调用需要时间（1秒内），在APP启动后调用最佳
 * En: Initialize Bluetooth - preload, first call takes time (within 1 second), invokes the best after APP starts
 */
+(int)initBluetooth;

/**
 * zh-CN: 初始化蓝牙--预加载，首次调用需要时间（1秒内），在APP启动后调用最佳 --> 手机蓝牙未打开时，不弹出提示框
 * En: Initialize Bluetooth - preload, first call takes time (within 1 second), invokes the best after APP starts  --> Phone Bluetooth is not open, do not pop-up prompt box
 */
+(int)initBluetoothNotShowPower;

/**
 * zh-CN: 初始化蓝牙回调函数
 * En: Initializes the Bluetooth callback function
 */
+(void) onInitBluetoothOver:(BlockInitBluetoothOver)blockInitBluetooth;

/**
 * zh-CN: 蓝牙状态改变立即返回
 * En: Bluetooth status changes are returned immediately
 *
 * BlockBluetoothStateOver: typedef void (^BlockBluetoothStateOver)(int state)
 * Return (int)state, state value defined：
 *            CBCentralManagerStateUnknown = 0, // = 0
 *            CBCentralManagerStateResetting,  // = 1
 *            CBCentralManagerStateUnsupported, // = 2
 *            CBCentralManagerStateUnauthorized, // = 3
 *            CBCentralManagerStatePoweredOff, // = 4
 *            CBCentralManagerStatePoweredOn, // = 5
 */
+(void)onBluetoothStateOver:(BlockBluetoothStateOver)blockBluetoothState;

/**
 * zh-CN: 启动蓝牙后台模式，锁屏时照常可以开门
 * EN: Start the Bluetooth background mode, lock the screen as usual can open the door
 */
+(int)startBackgroundMode;

/**
 * zh-CN: 启动蓝牙后台模式，锁屏时照常可以开门，参数为扫描间隔
 * EN: Start the Bluetooth background mode, lock the screen as usual can open the door
 */
+(int)startBackgroundModeWithInterval:(int)interval;

/**
 * zh-CN: 停止蓝牙后台模式
 * EN: Stop Bluetooth background mode
 */
+(int)stopBackgroundMode;

/**
 * zh-CN: 后台模式时，扫描结果回调函数. 用法：调用startBackgroundMode函数后，后台启用定时扫描，将扫描结果返回给onBGScanOver回调函数
 * EN: Background mode, the scan results callback function Usage: call startBackgroundMode function, the background enabled regular scan, the scan results will be returned to the onBGScanOver callback function
 *
 * BlockOnScanOver: typedef void (^BlockOnScanOver)(NSMutableDictionary *devDict);
 * Parameter devDict format：{devSn：Signal Strength}，E.g：{"123456": -70, "654321": -72}
 */
+(void)onBGScanOver:(BlockOnScanOver)blockBGScan;
+(void)onBGScanOverSort:(BlockOnScanOverSort)blockBGScan;

/**
 * zh-CN: SDK控制设备开门、设置参数等 接口
 * EN: SDK control equipment to open the door, set the interface parameters
 *
 * @param devModel： LibDevModel object
 * @param operation：Operation instruction
 */
+(int)controlDevice:(LibDevModel *)devModel andOperation:(int)operation;

/**
 * zh-CN: SDK获取设备设置参数
 * EN: SDK get the setting configuration of the device
 *
 * @param devModel： LibDevModel object
 * @param deviceConfigCallBack：typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict)
 */
+(int)getDeviceConfig:(LibDevModel *)devModel andGetDeviceConfigCallBack:(BlockOnControlOver)deviceConfigCallBack;

/**
 * zh-CN: SDK恢复出厂设置
 * EN: SDK reset the configuration of the device
 *
 * @param devModel： LibDevModel object
 * @param deviceConfigCallBack：typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict)
 */
+(int)resetDeviceConfig:(LibDevModel *)devModel andResetDeviceConfigCallBack:(BlockOnControlOver)deviceConfigCallBack;

/**
 * zh-CN: SDK清除所有数据
 * EN: SDK delete all datas of the device
 *
 * @param devModel： LibDevModel object
 * @param deviceConfigCallBack：typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict)
 */
+(int)deleteDeviceData:(LibDevModel *)devModel andDeleteDeviceDataCallBack:(BlockOnControlOver)deleteDeviceDataCallBack;

/**
 * zh-CN: SDK控制设备开门扩展接口
 * 注：用于用户电子钥匙等数据不存储进SDK中，如果存储数据，请使用controlDevice接口开门
 *
 * EN: SDK controls the device to open the door to expand the interface
 * Note: For the user electronic keys and other data is not stored in the SDK, if the stored data, use the controlDevice interface to open the door
 *
 * @param devModel： LibDevModel object
 * @param operation：Operation instruction
 */
+(int)openDoor:(LibDevModel *)devModel;


/**
 * controlDevice Callback function
 * BlockOnControlOver: typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict)
 */
+(void)onControlOver:(BlockOnControlOver)blockControl;

/**
 * SDK扫描附近设备,并且开最近的有权限的设备
 *
 * @param devList：用户设备权限列表
 * @param timeout：扫描超时时间，单位毫秒
 * @param blockControl：回调
 */
+(int)scanAndOpenDoor:(NSArray<LibDevModel*> *)devList timeout:(int)timeout callback:(BlockOnControlOver)blockControl;

/**
 * SDK扫描附近设备,并且开最近的有权限的设备
 *
 * @param devList：用户设备权限列表
 * @param timeout：扫描超时时间，单位毫秒
 * @param process: 中间过程
 * @param blockControl：回调
 */
+(int)scanAndOpenDoor:(NSArray<LibDevModel*> *)devList timeout:(int)timeout process:(BlockOnControlOver)process callback:(BlockOnControlOver)blockControl;

/**
 * zh-CN: DK扫描附近设备
 * @param scanTime：扫描时间, 单位：毫秒(100-600毫秒为扫描开门，1000-10000为扫描设备)
 *
 * EN: The SDK scans for nearby devices
 * @param scanTime：Scan time， Unit: milliseconds. (100-600 milliseconds for scanning to open the door, 1000-10000 for the scanning device)
 */
+(int)scanDevice:(int)scanTime;

/**
 * zh-CN: scanDevice 回调函数
 * EN: scanDevice Callback function
 *
 * BlockOnScanOver: typedef void (^BlockOnScanOver)(NSMutableDictionary *devDict);
 * Parameter devDict format：{devSn：Signal Strength}，E.g：{"123456": -70, "654321": -72}
 */
+(void)onScanOver:(BlockOnScanOver)blockScan;

/**
 * zh-CN: scanDevice 回调函数
 * EN: scanDevice Callback function
 *
 * BlockOnScanOverSort: typedef void (^BlockOnScanOverSort)(NSMutableArray *devRssiArray);
 * Parameter devDict format：[{devSn：Signal Strength}]，E.g：[{"123456": -70}, {"654321": -72}]
 */
+(void)onScanOverSort:(BlockOnScanOverSort)blockScan;

/**
 * zh-CN: 同步设备时间
 * @param devModel： 操作的设备对象
 * @param time：时间，格式：2015110910042301, 含义：2015年11月09日10点04分23秒-星期一
 * 使用接口后，调用 onControlOver接口回调获取操作结果
 *
 * EN: Synchronize device time
 * @param devModel: LibDevModel object
 * @param time: Format: 15110910042301, meaning: November 9,2015 10:04:23 PM - Monday
 * After using the interface, call the onControlOver interface callback to obtain the operation result
 */
+(int)syncDeviceTime:(LibDevModel *)devModel andTime:(NSString *) time;

/**
 * zh-CN: 配置WiFi
 * @param devModel： 操作的设备对象
 * @param ipAdress： ip地址
 * @param port：     端口
 * @param WiFiName： WiFi名称
 * @param WiFiPwd：  WiFi密码
 * @param callBack： 操作结果回调
 *
 * EN: Config WiFi for device
 * @param devModel: LibDevModel object
 * @param ipAdress： ip adress
 * @param port：     port
 * @param WiFiName： WiFi name
 * @param WiFiPwd：  WiFi password
 * @param callBack： the callback
 * @param callBack： typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict)
 */
+(int)configWiFi:(LibDevModel *)devModel ipAddress:(NSString *)ipAddress port:(int)port WiFiName:(NSString *)WiFiName WiFiPwd:(NSString *)WiFiPwd andCallBack:(BlockOnControlOver)callBack;

/**
 * zh-CN: 配置读卡扇区
 * @param devModel：        操作的设备对象
 * @param devId：           设备编号(0~255)
 * @param mifareSector：    扇区(0~15)
 * @param sectorKey：       扇区密钥(长度为12的十六进制字符串)
 * @param callBack：        操作结果回调
 *
 * EN: Set Read SectorKey of device
 * @param devModel:         LibDevModel object
 * @param devId：           Device ID (0~255)
 * @param mifareSector：    Device mifaresector (0~15)
 * @param sectorKey：       Device sectorkey (A hexadecimal string of length 12)
 * @param callBack：        typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict)
 */
+(int)setReadSectorKey:(LibDevModel *)devModel devId:(int)devId mifareSector:(int)mifareSector sectorKey:(NSString *)sectorKey andCallBack:(BlockOnControlOver)callBack;

/**
 * zh-CN: 设置设备控制参数
 * @param devModel： 操作的设备对象
 * @param wgfmt：韦根格式，26/34
 * @param openTime：开门时长，默认5秒
 * @param lockSwitch：锁开关信号设置， 0电锁控制，1手动开关（默认电锁控制）
 * 使用接口后，调用 onControlOver接口回调获取操作结果
 *
 * EN: Set the device control parameters
 * @param devModel: LibDevModel object
 * @param wgfmt: Wiegand format, 26 or 34
 * @param openTime: Opening time, default 5 seconds
 * @param lockSwitch: Lock switch signal setting, 0 electric lock control, 1 manual switch (default electric lock control)
 * After using the interface, call the onControlOver interface callback to obtain the operation result
 */
+(int)setDeviceParam:(LibDevModel *)devModel andWGFmt:(int)wgfmt andOpenTime:(int)openTime andLockSwitch:(int)lockSwitch; //SDK V2.0 interface

+(int)setDeviceConfig:(LibDevModel *)devModel andWGFmt:(int)wgfmt andOpenTime:(int)openTime andLockSwitch:(int)lockSwitch;  //SDK V2.0.1 interface

/**
 * zh-CN: 修改设备管理(开门)密码
 * @param devModel： 操作的设备对象
 * @param oldPwd：旧密码，6位数字，没有旧密码，传入@""字符串即可
 * @param newPwd：新密码，6位数字，例如：@"123456"
 * 使用接口后，调用 onControlOver接口回调获取操作结果
 *
 * EN: Modify the device management (open door) password
 * @param devModel: LibDevModel object
 * @param oldPwd: Old password, 6 digits, without the old password, pass in the @"" string
 * @param newPwd: New password, 6 digits, E.g: @"123456"
 * After using the interface, call the onControlOver interface callback to obtain the operation result
 */
+(int)modifyPwd:(LibDevModel *)devModel andOldPwd:(NSString *)oldPwd andNewPwd:(NSString *)newPwd;
+(int)modifyDevicePassword:(LibDevModel *)devModel andOldPwd:(NSString *)oldPwd andNewPwd:(NSString *)newPwd;


/**
 * 写入卡号信息到设备
 *
 * @param devModel： 操作的设备对象
 * @param cardArray：卡号列表，格式 [@"128372422", @"358745833"]
 * 使用接口后，调用 onControlOver接口回调获取操作结果
 */
+(int)writeCardToDevice:(LibDevModel *)devModel andCards:(NSArray *)cardArray;

/**
 * 写入卡号信息到设备
 *
 * @param devModel： 操作的设备对象
 * @param cardArray：卡号列表，格式 [@"128372422", @"358745833"]
 * @param append：是否追加卡号，YES 追加， NO 先清空设备卡号再写入
 * 使用接口后，调用 onControlOver接口回调获取操作结果
 */
+(int)writeCardToDevice:(LibDevModel *)devModel andCards:(NSArray *)cardArray andAppend:(BOOL)append;

/**
 * 删除设备卡号信息
 * 说明：清空设备所有卡号，调用 controlDevice 接口，operation参数传入0x0c
 * @param devModel： 操作的设备对象
 * @param cardArray：卡号列表，格式 [@"128372422", @"358745833"]
 * 使用接口后，调用 onControlOver接口回调获取操作结果
 */
+(int)deleteCardFromDevice:(LibDevModel *)devModel andCards:(NSArray *)cardArray;

/**
 * 获取设备卡号信息
 * 说明：获取设备的所有卡号信息
 * @param devModel： 操作的设备对象
 * @param progress： 读卡过程的回调，可用于显示进度条
 * @Param complete： 读卡完成或者其他异常情况时的回调
 */
+(int)getCardNumbersFromDevice:(LibDevModel *)devModel andProgress:(BlockOnReadCardProgressOver)progress andComplete:(BlockOnReadCardCompleteOver)complete;

/**
 * 获取设备卡号
 * 说明：获取设备刷卡添加模式下添加的卡号（最近的一张）
 * @param devModel： 操作的设备对象
 * @param callBack： 回调
 */
+(int)getSwipeAddCardno:(LibDevModel *)devModel andCallBack:(BlockOnControlOver)callBack;

/**
 * zh-CN: 获取电子钥匙Identity和来源
 * EN: Get eKey Indentity and resource
 *
 * @param eKey: The user eKey
 * return: NSDictionary object：{"resIdentity": @"***", "resource": @"**"}
 */
+(NSDictionary*)getEkeyIdentityAndResource:(NSString *)eKey;
/**
 * zh-CN: 同步指纹信息到设备
 * EN: Synchronize fingerprint information to the device
 *
 * @param fingerPrintModels: fingerprint information
 * return: int
 */
+(int)syncFingerPrintToDevice:(LibDevModel *)devModel andFingerprints:(NSMutableArray <DMFingerprintModel *>*)fingerprintModels andProgress:(BlockOnSyncFingerPrintProgressOver)progress andComplete:(BlockOnSyncFingerPrintCompleteOver)complete;

/**
 * zh-CN: 同步指纹信息到设备
 * EN: Synchronize fingerprint information to the device
 *
 * @param fingerPrintModels: fingerprint information
 * @param appened: whether to append
 * return: int
 */
+(int)syncFingerPrintToDevice:(LibDevModel *)devModel andFingerprints:(NSMutableArray <DMFingerprintModel *>*)fingerprintModels andProgress:(BlockOnSyncFingerPrintProgressOver)progress andComplete:(BlockOnSyncFingerPrintCompleteOver)complete append:(BOOL)append;

/**
 * zh-CN: 从设备里获取指纹信息
 * EN: Get fingerprint information from the device
 *
 * return: int
 */
+(int)getFingerPrintsFromDevice:(LibDevModel *)devModel andProgress:(BlockonReadFingerPrintProgressOver)progress andComplete:(BlockonReadFingerPrintComplete)complete;

/**
 * 获取设备开门记录（一次性获取全部）
 * 说明：获取设备的所有开门记录
 * @param devModel： 操作的设备对象
 * @param progress： 读记录过程的回调，可用于显示进度条
 * @Param complete： 读记录完成或者其他异常情况时的回调
 */
+(int)getOpenDoorRecordFromDevice:(LibDevModel *)devModel andProgress:(BlockonReadOpenDoorRecordProgressOver)progress andComplete:(BlockonReadOpenDoorRecordCompleteOver)complete;

/**
 * 获取设备未读取的开门记录
 * 说明：获取设备未读取的开门记录
 * @param devModel： 操作的设备对象
 * @param readCount: 调用一次接口读取的最大次数（读取一次最多15条记录），即若readCount为5，则此接口最多读取5次，即最多返回75条记录，若想直接读取完所有未读取过的记录，则readCount设置为0即可
 * @param progress： 读记录过程的回调，可用于显示进度条
 * @Param complete： 读记录完成或者其他异常情况时的回调
 */
+(int)getRecentOpenDoorRecordFromDevice:(LibDevModel *)devModel readCount:(int)readCount andProgress:(BlockonReadOpenDoorRecordProgressOver)progress andComplete:(BlockonReadOpenDoorRecordCompleteOver)complete;

/**
 * 删除所有开门记录
 * 说明：删除设备里的所有开门记录
 * @param devModel： 操作的设备对象
 * @Param callBack： 删除完成的回调
 */
+(int)cleanAllOpenDoorRecords:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 设置静态ip或DHCP
 * 说明：设置设备的静态ip（IPV4）或使用DHCP
 * @param devModel： 操作的设备对象
 * @param enable：   是否激活静态ip
 * @param staticIP： 静态ip地址
 * @param mask：     子网掩码地址
 * @param gate：     网关地址
 * @param dns：      dns服务器地址
 * @Param complete： 回调
 */
+(int)setDeviceStaticIP:(LibDevModel *)devModel andEnableStaticIP:(BOOL)enable andStaticIP:(NSString *)staticIP andMask:(NSString *)mask andGate:(NSString *)gate andDns:(NSString *)dns andCallback:(BlockOnControlOver)callBack;

/**
 * 设置服务器IP
 * 说明：给设备配置其连接的服务器IP
 * @param devModel：    操作的设备对象
 * @param serverIP：    服务器IP
 * @param serverPort：  服务器端口
 * @Param complete：    回调
 */
+(int)setServerIP:(LibDevModel *)devModel andServerIP:(NSString *)serverIP andServerPort:(int)serverPort andCallback:(BlockOnControlOver)callBack;

/**
 * 删除指纹
 * 说明：删除指定用户ID的指纹数据
 * @param devModel： 操作的设备对象
 * @param userIDs：  用户id数组
 * @Param complete： 删除完成的回调
 */
+(int)deleteFingerprints:(LibDevModel *)devModel andUserIDs:(NSArray <NSString *>*)userIDs andCallback:(BlockOnControlOver)callBack;

/**
 * 删除所有指纹
 * 说明：删除设备里的所有指纹数据
 * @param devModel： 操作的设备对象
 * @Param callBack： 删除完成的回调
 */
+(int)cleanFingerprints:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 重启设备（EXT200）
 * 说明：重启设备
 * @param devModel： 操作的设备对象
 * @Param callBack： 操作成功的回调
 */
+(int)rebootDevice:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 获取设备信号值（适用于2G和4G的单片机额）
 * 说明：获取信号值
 * @param devModel： 操作的设备对象
 * @Param callBack： 操作成功的回调
 */
+(int)getDeviceSignal:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 获取设备sim卡信息（适用于2G和4G的单片机额）
 * 说明：获取信号值
 * @param devModel： 操作的设备对象
 * @Param callBack： 操作成功的回调
 */
+(int)getSimstatus:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 刷卡添加模式（门锁模式）
 * 说明：获取信号值
 * @param devModel： 操作的设备对象
 * @Param callBack： 操作成功的回调
 */
+(int)swipeAddCardModelExtend:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 设置apn参数
 * 说明：设置apn参数
 * @param devModel： 操作的设备对象
 * @Param apnName：  apn名称
 * @Param userName： 用户名
 * @Param pwd：      密码
 * @Param callBack： 操作成功的回调
 */
+(int)setAPN:(LibDevModel *)devModel andApnName:(NSString *)apnName andUserName:(NSString *)userName andPwd:(NSString *)pwd andCallback:(BlockOnControlOver)callBack;

/**
 * 获取apn参数
 * 说明：获取apn参数
 * @param devModel： 操作的设备对象
 * @Param callBack： 操作成功的回调
 */
+(int)getAPN:(LibDevModel *)devModel callback:(BlockOnControlOver)callBack;

/**
 * 设置NB联网参数
 * 说明：设置NB联网参数
 * @param devModel：             操作的设备对象
 * @Param connectCount：         联网次数    1~5  不设置则为-1
 * @Param heartBeatInterval：    心跳间隔  1~240 不设置则为-1
 * @Param synFlag：              同步数据标志  0、1 不设置则为-1
 * @Param synInterval：          同步数据时间间隔 1~240 不设置则为-1
 * @Param callBack：             操作成功的回调
 */
+(int)setNBNetworkSetting:(LibDevModel *)devModel connectCount:(int)connectCount heartBeatInterval:(int)heartBeatInterval synFlag:(int)synFlag synInterval:(int)synInterval andCallback:(BlockOnControlOver)callBack;

/**
 * 设置NB联网密码
 * 说明：设置NB联网密码
 * @param devModel：     操作的设备对象
 * @Param oldPassowrd：  旧密码
 * @Param newPassword：  新密码
 * @Param callBack：     操作成功的回调
 */
+(int)setNBNetworkConnectionPwd:(LibDevModel *)devModel oldPassword:(NSString *)oldPassowrd newPassword:(NSString *)newPassword callback:(BlockOnControlOver)callBack;

/**
 * 连接EID设备
 * 说明：连接EID设备
 * @param devModel：         操作的设备对象
 * @Param connectedDevice：  连接上EID设备
 * @Param receivedData：     接收到来自EID设备的数据
 * @Param disconnected：     与EID设备断连
 * @Param connectFail：      连接EID设备失败
 */
+(int)connectEIDDevice:(LibDevModel *)devModel onConnectDevice:(BlockOnEIDOnConnectDevice)connectedDevice onReceiveData:(BlockOnEIDOnReceiveData)receivedData onDisconnectDevice:(BlockOnEIDOnDisconnectDevice)disconnected onConnectFail:(BlockOnEIDOnConnectDeviceFail)connectFail;

/**
 * 设备登记指纹
 * 说明：设备登记指纹，让设备进入指纹登记模式，并以传入的id作为指纹id进行本地录入
 * @param devModel：         操作的设备对象
 * @Param fingerprintID：    登记的指纹ID
 * @Param callBack：         操作成功的回调
 */
+(int)deviceRegistFingerprint:(LibDevModel *)devModel fingerprintID:(int)fingerprintID andCallback:(BlockOnControlOver)callBack;

/**
 * 获取设备里登记的指纹id列表
 * 说明：获取设备里登记的指纹id列表
 * @param devModel：         操作的设备对象
 * @Param callBack：         操作成功的回调
 */
+(int)getFingerprintIDsFromDevice:(LibDevModel *)devModel andCallback:(BlockOnControlOver)callBack;

/**
 * 获取SDK版本
 */
+(NSString *)getDoorMasterSDKVersion;

/**
 * 登录服务器（适用于3.0平台）
 * 说明：登录服务器
 * @param domain：    服务器地址
 * @param appId：     appId
 * @param appSecret： appSecret
 * @param account：   account
 * @Param callBack：  操作成功的回调
 */
+(void)login:(NSString *)domain appId:(NSString *)appId appSecret:(NSString *)appSecret account:(NSString *)account callback:(BlockOnControlOver)callback;

/**
 * 远程开门（适用于3.0平台）
 * 说明：远程开门
 * @param devSn：    设备序列号
 */
+(void)remoteOpenDoor:(NSString *)devSn callback:(BlockOnControlOver)callback;

/**
 * 设置Ibeacon模式
 * 说明：用于设置Ibeacon的广播模式，0：一直广播Ibeacon信号    1：默认广播ble蓝牙信号，当触摸设备后才开始广播Ibeacon信号
 * @param devModel：         操作的设备对象
 * @param mode:              模式
 * @Param callBack：         操作成功的回调
 */
+(int)setIbeaconMode:(LibDevModel *)devModel mode:(int)mode andCallback:(BlockOnControlOver)callBack;

+(void)releaseSDK;

@end

