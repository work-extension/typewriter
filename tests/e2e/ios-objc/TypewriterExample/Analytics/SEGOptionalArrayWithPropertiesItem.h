/**
 * This client was automatically generated by Segment Typewriter. ** Do Not Edit **
 */

#import <Foundation/Foundation.h>
#import <Analytics/SEGSerializableValue.h>
#import "SEGTypewriterSerializable.h"
#import "SEGTypewriterUtils.h"

@interface SEGOptionalArrayWithPropertiesItem : NSObject<SEGTypewriterSerializable>

/// Optional any property
@property (strong, nonatomic, nullable) id optionalAny;
/// Optional array property
@property (strong, nonatomic, nullable) NSArray<id> *optionalArray;
/// Optional boolean property
@property (strong, nonatomic, nullable) NSNumber *optionalBoolean;
/// Optional integer property
@property (strong, nonatomic, nullable) NSNumber *optionalInt;
/// Optional number property
@property (strong, nonatomic, nullable) NSNumber *optionalNumber;
/// Optional object property
@property (strong, nonatomic, nullable) SERIALIZABLE_DICT optionalObject;
/// Optional string property
@property (strong, nonatomic, nullable) NSString *optionalString;
/// Optional string property with a regex conditional
@property (strong, nonatomic, nullable) NSString *optionalStringWithRegex;

+(nonnull instancetype) initWithOptionalAny:(nullable id)optionalAny
optionalArray:(nullable NSArray<id> *)optionalArray
optionalBoolean:(nullable NSNumber *)optionalBoolean
optionalInt:(nullable NSNumber *)optionalInt
optionalNumber:(nullable NSNumber *)optionalNumber
optionalObject:(nullable SERIALIZABLE_DICT)optionalObject
optionalString:(nullable NSString *)optionalString
optionalStringWithRegex:(nullable NSString *)optionalStringWithRegex;

-(nonnull SERIALIZABLE_DICT) toDictionary;

@end
