//
//  SDKCallBack.h
//  DoorMasterSDK
//
//  Created by Jason.Huang on 1/30/16.
//  Copyright © 2017. All rights reserved.
//

#import <Foundation/Foundation.h>

// Scan device callback object, devDict {device serial number: signal value}. E.g: { "123456": -70, "654321": -72}
typedef void (^BlockOnScanOver)(NSMutableDictionary *devDict);

// Scan device callback object, devDict [{device serial number: signal value}]. E.g: [{ "123456": -70}, {"654321": -72}]
typedef void (^BlockOnScanOverSort)(NSMutableArray *devRssiArray);

// Operate the device callback object
typedef void (^BlockOnControlOver)(int ret, NSMutableDictionary *msgDict);

// Bluetooth status change returns
typedef void (^BlockBluetoothStateOver)(int state);

// Initializes the Bluetooth callback object
typedef void (^BlockInitBluetoothOver)(int ret);

//Read card callback in progress
typedef void (^BlockOnReadCardProgressOver)(int cur, int all);

//Read card callback when complete
typedef void (^BlockOnReadCardCompleteOver)(int result, int all, NSArray<NSString *>* cardnumbers);

//Sync fingerprint data callback in progress
typedef void (^BlockOnSyncFingerPrintProgressOver)(int cur, int all);

//Sync fingerprint data callback when complete
typedef void (^BlockOnSyncFingerPrintCompleteOver)(int result, int all);

//Read fingerprint data callback in progress
typedef void (^BlockonReadFingerPrintProgressOver)(int curFP, int allFP, int curPackage, int allPackage);

//Read fingerprint data callback in complete
typedef void (^BlockonReadFingerPrintComplete)(int result, int all, NSArray *fingerprints);

//Read opendoor record callback in progress
typedef void(^BlockonReadOpenDoorRecordProgressOver)(int cur, int all);

//Read opendoor record callback in complete
typedef void(^BlockonReadOpenDoorRecordCompleteOver)(int result, int all, NSArray *records);

typedef void(^DMSucessBlock)(NSDictionary *result);

typedef void(^DMFailureBlock)(NSError *error);


