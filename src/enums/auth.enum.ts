export enum EOtpType {
  SIGN_UP = 'sign_up',
  FORGOT_PASSWORD = 'forgot_password',
  NEW_REGISTRATION = 'new_registration',
  LOGIN_NEW_DEVICE = 'login_new_device',
  CHANGE_PASSWORD = 'change_password',
  CONFIRM_TRANSACTION = 'confirm_transaction',
  SET_BIOMETRIC = 'set_biometric',
  OTHERS = 'others',
}


export enum UsrLoginType {
  EMAIL = 'email',
  PHONE = 'phone_number',
  OAUTH = 'oauth',
}