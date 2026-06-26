import { Controller, Post, Body,UseGuards, ParseIntPipe, HttpCode, HttpStatus, Query, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @Post('checkout')
  async checkout(@Body ('sessionId',ParseIntPipe)sessionId:number){
    const data = await this.paymentService.checkout(sessionId);
    return{
      success:true,
      message:"paymob keys is ready",
      data
    }
  }


  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() payload: any, @Query('hmac') hmac: string) {
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    console.log("from webhook")
    const isVerified = this.paymentService.verifyPaymobHmac(payload, hmac);
    if (!isVerified) {
      return{
        success:false,
        messasge:"invalid hmac"
      }
    }
    const success =await this.paymentService.handleWebhook(payload);    
    return { success };
  }
  
}
