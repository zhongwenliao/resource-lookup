//
//  DMVoipModel.h
//  DoorMasterVoipDemo
//
//  Created by Jason.Huang on 08/12/2016.
//  Copyright © 2017. All rights reserved.


#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "DMVideoDevice.h"
//#import "DMSDK_CallBack.h"
// Login callback object

#define kDMRegistrationUpdate @"DMRegistrationUpdate"
#define kDMCallIncomingReceived @"DMCallIncomingReceived"

@protocol AnswerViewDelegate <NSObject>

-(void)answerViewDelegateRefuse;
-(void)answerViewDelegateAnswer;
-(NSString *)getCallingNickName;

@end

typedef enum {
    DEFAULTCALLINGVIEWTYPE = 0,
    YIJIARENCALLINGVIEWTYPE,
    USECALLINGVIEWTYPE,
}DMCALLINGVIEWTYPE; //来电弹起界面类型以及通话界面

typedef enum _DMRegistrationState {
    DMRegistrationNone, /**< 初始状态 */
    DMRegistrationProgress, /**< 注册中 */
    DMRegistrationOk,    /**< 注册成功 */
    DMRegistrationCleared, /**< 取消注册成功 */
    DMRegistrationFailed,    /**< 注册失败 */
    DMRegistrationCancel    /**< 账号被挤出 */
} DMRegistrationState;

typedef enum _DMRINGTYPE{
    DMRINGSYSTEM = 1,
    DMRINGAVAUDIO,
}DMRINGTYPE;


typedef void (^DMBlockLoginOver)(int ret, NSString *msg);
// Calling callback object
typedef void (^DMBlockCallOver)(int ret, NSString *msg);

typedef void (^DMBlockCallStateUpdate)(NSString *msg); //This block will call when call state update

typedef void(^DMSucessBlock)(NSDictionary *result);

typedef void(^DMFailureBlock)(NSError *error);

typedef void(^DMGetNickNameBlock)(NSString *nickname);

typedef void(^DMGetCaptureImageBlock) (NSData *capture); //This block will get the capture image from device.

typedef void(^DMCustomNotificationWhenCallIncoming)(NSDictionary *data); //This block will be called when one call incoming and the aplication is in background.

@interface DMCommModel : NSObject

+ (instancetype)manager;
/**
 * Login voip server first
 */
+ (int)initDMVPhoneSDK;

/**
 * Login voip server first
 */
+ (int)initDMVPhoneSDKWithCompanyName:(NSString *)companyName;

/**
 * Login voip server first
 */
+ (int)initDMVPhoneSDKWithApplicationServer:(NSString *)aServerDomain andVideoServer:(NSString *)vServerDomain;

/**
 * Exit voip server
 */
+(int)exitDMVPhoneSDK;

/**
 * Change the registration behavior, YES means to suspend the registration to the server, NO means to register with the server. This is used for account being squeezed out, and it is different from the exitDMVPhoneSDK method.
 */
+(int)pauseRegister:(BOOL)isPause;

/**
 * Get sdk version
 */
+(NSString *)getDMVPhoneSDKVersion;

/**
 * Set voip answerView
 */
+(void)setAnswerView:(UIView *)answerView;

/**
 * Set request open view
 */
+(void)setRequestOpenView:(UIView *)requestOpenView;

/**
 * Login voip server first
 */
+ (int)loginServer:(NSString *)account passwd:(NSString *)passwd accountType:(NSNumber *)accountType loginCallback:(DMBlockLoginOver)callback;
//+ (int)loginServer:(NSString *)account passwd:(NSString *)passwd accountType:(NSNumber *)accountType;

/**
 * Login voip server first
 */
+ (int)loginServer:(NSString *)account appId:(NSString *)appId appSecret:(NSString *)appSecret accountType:(NSNumber *)accountType loginCallback:(DMBlockLoginOver)callback;

/**
 * 设置呼叫账号列表--即白名单，如果不设置，默认不拦截来电账号。格式：{"账号": "别名"}，例如： {"1001": "门禁1", "1002": "门禁2"}
 * Setting call account dictionary. If you do not set, the default does not block incoming calls account. Formater: {"Account": "ShowName"},  E.g: {"1001": "Door1", "1002": "Door2"}
 *
 */
+(int)setCallAccountDict:(NSMutableDictionary*)accountDict intercept:(BOOL)intercept;

/**
 * Login result callback interface
 */
//+(void) onLoginOver:(BlockOnLoginOver)blockOnLoginOver;

/**
 * Calling other voip account
 */
+ (int) callAccount:(NSString *)account callAccountType:(NSNumber *)callAccountType callback:(DMBlockCallOver)callback;

/**
 * Calling other voip account, and you can set displayname
 */
+ (int) callAccount:(NSString *)account callAccountType:(NSNumber *)callAccountType displayName:(NSString *)displayName callback:(DMBlockCallOver)callback;

/**
 * Calling other voip account, and jump into call ViewController automatically,when calling is successful. The type of calling viewController is setup by the method "registerReceiverCallWithAnswerViewType"
 */
+ (int)callByAutomaticalWithController:(UIViewController *)controller  andCallAccount:(NSString *)account callAccountType:(NSNumber *)callAccountType callback:(DMBlockCallOver)callback;
/**
 * Calling other voip account, and jump into call ViewController automatically,when calling is successful. The type of calling viewController is setup by the method "registerReceiverCallWithAnswerViewType"
 * And can set displayname
 */
+ (int)callByAutomaticalWithController:(UIViewController *)controller  andCallAccount:(NSString *)account callAccountType:(NSNumber *)callAccountType displayName:(NSString *)displayName callback:(DMBlockCallOver)callback;

//+ (int) callAccount:(NSString *)account callAccountType:(NSNumber *)callAccountType;

/**
 * Refuse button click
 */
+ (void) refuseCall;

/**
 * Refuse button click
 */
+ (void) refuseCallByCallKit;

/**
 * Answer button click
 */
+ (void) answerCall;

/**
 * Answer button click
 */
+ (void) answerCallByCallKit;

/**
 * Open door click
 */
+ (BOOL) openDoor;

/**
 * Register receiver call request viewcontroller
 */
+ (void) registerReceiverCall;

/**
 * Register receiver call request viewcontroller and answerView type
 */
+ (void) registerReceiverCallWithCallingViewType:(DMCALLINGVIEWTYPE)callingViewType;

/**
 * AppDeletegate.m background use
 * This method is invalid
 */
+ (void) applicationBackground;


+ (void) applicationWillTerminate;


/**
 * Setting calling viewController
 */
+(void)setCallViewController:(UIViewController *)callViewController;

/**
 * Get current calling nickname
 */
+(NSString *)getCurrentCallingNickname;

/**
 * Get current calling nickname with block
 */
+(void)getCurrentCallingNicknameWithBlock:(DMGetNickNameBlock)nicknameBlock;

/**
 * Get current calling capture with block
 */
+(void)getCaptureImageWithBlock:(DMGetCaptureImageBlock)captureBlock;

/**
 * Get current nickname with block
 */
+(void)getCurrentRequestOpendoorNicknameWithBlock:(DMGetNickNameBlock)nicknameBlock;

/**
 * Get capture with block
 */
+(void)getCaptureRequestOpendoorImageWithBlock:(DMGetCaptureImageBlock)captureBlock;

/**
 * Set video view
 */
+(void)setVideoView:(UIView *)videoView;


/**
 * Set call state update callback
 */
+(void)setCallStreamsRunning:(DMBlockCallStateUpdate)callStreamsRunning callError:(DMBlockCallStateUpdate)callError callEnd:(DMBlockCallStateUpdate)callEnd callReleased:(DMBlockCallStateUpdate)callReleased;

/**
 * Terminate the call
 */
+ (void)refuseCalling;

/**
 * Set the video show
 */
+ (void)showVideoCalling:(BOOL)isShow;

/**
 * Open door
 */
+ (BOOL)openDoorCalling;

/**
 * Set the sound loudness
 */
+ (void)setSpeaker:(BOOL)isSpeaker;

/**
 * Take video snapshot, format of image: JPEG (抓拍对方的图片，格式为JPEG)
 * Param: savePath (保存的路径)
 * Return: 0 if successfull, -1 otherwise (typically if jpeg format is not supported or savePath is nil).
 */
+ (int)takeVideoSnapshot:(NSString *)savePath;

/**
 * Take preview snapshot, format of image: JPEG(抓拍自己的图片，格式为JPEG)
 * Param: savePath (保存的路径)
 * Return: 0 if successfull, -1 otherwise (typically if jpeg format is not supported or savePath is nil).
 */
+ (int)takePreviewSnapshot:(NSString *)savePath;

/**
 * Refuse all incoming calls  进入免打扰模式
 * isRefuse: whether to refuse
 * Return: 0 if successfull
 */
+ (int)refuseAllIncomingCalls:(BOOL)isRefuse;

/**
 * Set(or overwrite) balckList to refuse the call incoming  设置(或者覆盖)黑名单
 * blackList: the list that you want to refuse. eg:[devSn, devSn, ...]. We do not refuse any call, If the list is nil.
 * Return: 0 if successfull
 */
+ (int)setBlackList:(NSArray *)blackList;

/**
 * Modify balckList to refuse the call incoming  修改黑名单
 * devSn: The device you want to add or delete from blackList.
 * isAdd: YES: add,   NO: delete
 */
+ (int)modifyBlackList:(NSString *)devSn isAdd:(BOOL)isAdd;

/**
 * Get balckList  获取黑名单
 */
+ (NSArray *)getBlackList;

/**
 * showLog  显示日志
 */
+ (void)showLog:(BOOL)flag;

/**
 * enable voice broadcast  开启语音播报功能
 */
+ (void)enableVoiceBroadcast:(BOOL)enable;

/**
 * enable the function of showing tips when wwan is used   若当前网络环境为wwan，通话时警告用户
 */
+ (void)enableWWANTipsFunction:(BOOL)enable;

/**
 * When the call is incoming, the block is called, and the incoming call object information is passed over to customize the local push title and content   当来电时，会调用这个block，并且把来电对象的信息传过来，用于自定义本地推送的标题和内容。
 */
+ (void)setCustomNotificationWhenCallincoming:(DMCustomNotificationWhenCallIncoming)callback;

/**
 * Turn on/off the microphone   打开/关闭麦克风
 */
+ (int) muteMicro:(BOOL) isMicMuted;

/**
 * Get the state of microphone   获取麦克风的状态
 */
+ (BOOL) isMicroMuted;

/**
 * Set the rotation of video 设置摄像头的旋转方向（UIInterfaceOrientationPortrait的rotation为0，UIInterfaceOrientationLandscapeRight的rotation为270）下次通话生效
 */
+(int)setVideoRotation:(int)rotation;

/**
 * Enable the function of auto adapt the rotation of device 开启自动适配当前设备摄像头的旋转方向
 */
+(void)enableAutoAdaptDeviceRotation:(BOOL)enable;

/**
 * Send message to account   发送消息到指定账号
 */
+(BOOL) sendMessage:(NSString *)message toAccount:(NSString *)toAccount;

/**
 * Set auto accept call   设置自动接听
 */
+(void) setAutoAcceptCall:(BOOL)autoAccept;

/**
 * Login voip server first
 */
+ (int)loginServer:(NSString *)account passwd:(NSString *)passwd deviceSn:(NSString *)devSn loginCallback:(DMBlockLoginOver)callback;

/**
 * enable the call preview   开启弹出开门请求功能，默认是打开的
 */
+(void)enableCallPreview:(BOOL)enable;

/**
 * set app type   设置app类型，以便后台根据类型选择相应的推送证书
 */
+(void)setAppType:(int)appType;

/**
 * set ring type   设置铃声类型
 */
+(void)setRingType:(int)ringType;

+(void)setRingSoundID:(int)soundID;

/**
 * get current connected device info   获取当前设备的信息
 */
+(DMVideoDevice *)getCurConnDevice;

/**
 * get current connected device info   获取当前设备的信息
 */
+(void)forceStopOtherCallsWhenRefuseCall:(BOOL)refuseAll;

/**
 * enableCallKit   是否使用Callkit
 */
+(void)enableCallKit:(BOOL)enable;

/**
 * enablePushKit   是否使用Pushkit
 */
+(void)enablePushKit:(BOOL)enable;

/**
 * setAPNSToken   设置APNS推送Token
 */
+(void)setAPNSToken:(NSString *)token;

/**
 * receiveAPNSNotification   收到APNS消息
 */
+(void)receiveAPNSNotification:(NSDictionary *)notification;

/**
 * showConnectionStatusInVideoView   在VideoView上显示对讲连接状态，默认是开启的
 */
+(void)showConnectionStatusInVideoView:(BOOL)show;
@end
