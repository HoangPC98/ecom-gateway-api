import { ErrorMessage } from "../enums/error.enum";
import * as otpGenerator from 'otp-generator';
import { TOtpDto } from "../interfaces/types/auth.type";
import { EOtpType } from "../enums/auth.enum";
import { v1 as uuidv1 } from 'uuid';
import { OTP_SIGNUP_TTL } from "../constants/common.constant";
import CacheService from "./infrastructure/cache.service";

export class OtpService {
    // Thời gian OTP hết hiệu lực
    private readonly otpExpireTime = process.env.OTP_EXPIRE_TIME;
    private readonly otpByPassAll: string = process.env.OTP_BY_PASS_ALL || 'false';
    private readonly otpCodeBypassDf: string = process.env.OTP_CODE_BYPASS_DF || '111111';
    private readonly otpWrongCountLitmit: number = Number.parseInt(process.env.OTP_WRONG_COUNT_LIMIT || '3');
    protected cacheService: CacheService;
    // Thời gian OTP được lưu trữ lại để kiểm tra
    protected otpKey = 'otp';

    constructor() {
      this.cacheService = new CacheService();
    }
  
    public async validate(phoneOrEmail: string, otp: string, trackingId: string): Promise<boolean> {
      const otpByPassKey = process.env.OTP_BY_PASS_KEY;
  
      if (this.otpCodeBypassDf != null && otp == this.otpCodeBypassDf) return true;
      if (this.otpByPassAll.toString().toLowerCase() === 'true') return true;
      if (otpByPassKey?.includes(phoneOrEmail)) return true;
      const ckey = `${this.otpKey}_${phoneOrEmail}`;
      const cacheOtp = (await this.cacheService.get(`${this.otpKey}_${phoneOrEmail}`)) as unknown as TOtpDto;
  
      if (!cacheOtp) {
        throw new Error(ErrorMessage.OTP_EXPIRED);
      }
      else {
        
      }
  
      if (cacheOtp.wrong_count && cacheOtp.wrong_count >= this.otpWrongCountLitmit)
        throw new Error(ErrorMessage.WRONG_OTP_TO_MUCH);
  
      if (otp == cacheOtp.value && trackingId == cacheOtp.id) {
        await this.cacheService.del(ckey);
        return true;
      } else {
        cacheOtp.wrong_count = cacheOtp.wrong_count ? (cacheOtp.wrong_count += 1) : 1;
        await this.cacheService.set(ckey, cacheOtp, 300);
        throw new Error(ErrorMessage.INVALID_OTP_CODE);
      }
    }
  
    // key = phoneNumber or email
    public async generateOtpCode(phoneOrEmail: string, type?: EOtpType): Promise<TOtpDto> {
      const ckey = `${this.otpKey}_${phoneOrEmail}`;
      const otpCode = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
  
      const otpValue: TOtpDto = {
        id: uuidv1(),
        value: otpCode,
        key: phoneOrEmail,
        type: type,
        expried_in: OTP_SIGNUP_TTL,
      };
      await this.cacheService.set(ckey, otpValue);
      const otp = await this.cacheService.get(ckey) as unknown as TOtpDto;
      return otpValue;
    }
  }