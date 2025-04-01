export enum ErrorMessage {
    UNKNOWN_ERROR = 'unknown_error',
    WRONG_PASSWORD = 'wrong_password',
  
    USER_NOT_EXIST = 'user_not_existed',
    CLIENT_PASSWORD_CHANGE_NOT_VALID = 'CLIENT_PASSWORD_CHANGE_NOT_VALID',
    CLIENT_LOCKED_OR_DELETED = 'CLIENT_LOCKED_OR_DELETED',
    CLIENT_CANCELED_OR_DELETED = 'CLIENT_CANCELED_OR_DELETED',
  
    USR_IS_EXISTED = 'email_or_user_is_signed_up_to_another_account',
    USER_IS_TEMP_LOCK = 'user_is_temp_lock',
  
    OTP_EXPIRED = 'otp_expired',
    WRONG_OTP_TO_MUCH = 'wrong_otp_to_much',
    INVALID_OTP_CODE = 'invalid_otp_code',
  
    SESSION_EXPIRED = 'session_expired',
    INVALID_ATOKEN = 'access_token_is_invalid',
  }
  