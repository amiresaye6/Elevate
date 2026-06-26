import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prismaService : PrismaService,
    private readonly httpService : HttpService
  ){}

  async checkout(sessionId:number){
    let session;
    try{
      session = await this.prismaService.reviewSession.findUnique({
        where:{id:sessionId},
        include:{
          mentor:{include:{user:true}},
          student:{include:{user:true}}
        }
      });
      if(!session){
        throw new NotFoundException(`failed to find session with id= ${sessionId}`);
      }
    }catch(error:any){
      if(error.code =='P2025'){
        throw new NotFoundException(`failed to find session with id= ${sessionId}`);
      }
      throw new BadRequestException(`an error occured while fetching session data`);
    }

    const paymentLog =await this.prismaService.paymentLog.create({
      data:{
        sessionId:sessionId,
        userId:session.student.user.id,
        type:"DEPOSIT",
        status:"PENDING",
        amount:session.mentor.hourlyRate,
        currency:"EGP"
      }
    })

    const payload ={
      "amount": Number(session?.mentor.hourlyRate)*100,
      "currency": "EGP",
      "payment_methods": [
        5750710
      ],
      "items": [
        {
          "name": "session",
          "amount": Number(session?.mentor.hourlyRate)*100,
          "description": session?.description,
          "quantity": 1
        }
      ],
      "billing_data": {
        "apartment": "N/A",
        "first_name": session.student.name.split(' ')[0],
        "last_name": session.student.name.split(' ')[session.student.name.split(' ').length-1],
        "street": "N/A",
        "building": "N/A",
        "phone_number": session.student.user.phoneNumber,
        "city": "N/A",
        "country": "Egypt",
        "email": session.student.user.email,
        "floor": "N/A",
        "state": "cairo"
      },
      "special_reference": "PAYMENTLogID-"+paymentLog.id,
      "expiration": 3600,
      "notification_url": process.env.PAYMOB_WEBHOOK_URL,
      "redirection_url": process.env.FRONTEND_URL+"/student/sessions"
    };
    const headers = {
      Authorization :"Token "+process.env.SECRET_KEY_PAYMOB,
      "Content-Type": "application/json"
    };
    const url= "https://accept.paymob.com/v1/intention/";
    //console.log("=== PAYLOAD SENT TO PAYMOB ===", JSON.stringify(payload, null, 2));
    try{
      const response = await this.httpService.axiosRef.post(url, payload,  {headers} );
      await this.prismaService.paymentLog.update({
        where: { id: paymentLog.id },
        data: { paymobOrderId: String(response.data.id) },
      });
      return {
        clientSecret: response.data.client_secret,
        paymentToken: response.data.payment_keys[0]?.key
      };
    }catch(error:any){
      console.error("Paymob Intention Error:", error.response?.data || error.message);
      throw new BadRequestException(`Paymob integration failed: ${error.message}`);
    }
  }

  async handleWebhook(payload: any) {
    console.log(payload);
    const transaction = payload.obj;
    const specialReference = transaction.order.merchant_order_id;
    if (!specialReference) {
      return;
    }
    if (transaction.pending === true || String(transaction.pending) === 'true') {
      return 'PENDING_IGNORED'; 
    }
    const logId = parseInt(specialReference.split('-')[1], 10);
    const isSuccess = transaction.success === true || transaction.success==="true";
    const updatedLog = await this.prismaService.paymentLog.update({
      where: { id: logId },
      data: {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        paymobTxnId: String(transaction.id),
      },
    });

    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    console.log(isSuccess);
    if (isSuccess) {
      await this.prismaService.reviewSession.update({
        where: { id: updatedLog.sessionId },
        data: { 
          status: 'SCHEDULED'
        },
      });
    } else {
      await this.prismaService.reviewSession.delete({
        where: { id: updatedLog.sessionId }
      });
    }

    return isSuccess
  }

  verifyPaymobHmac(payload: any, receivedHmac: string): boolean {
    if (!receivedHmac || !payload.obj) return false;
    
    const obj = payload.obj;
    
    const dataString = 
      obj.amount_cents +
      obj.created_at +
      obj.currency +
      obj.error_occured +
      obj.has_parent_transaction +
      obj.id +
      obj.integration_id +
      obj.is_3d_secure +
      obj.is_auth +
      obj.is_capture +
      obj.is_refunded +
      obj.is_standalone_payment +
      obj.is_voided +
      obj.order.id +
      obj.owner +
      obj.pending +
      obj.source_data.pan +
      obj.source_data.sub_type +
      obj.source_data.type +
      obj.success;

    const hmacSecret:any = process.env.PAYMOB_HMAC_SECRET;
    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(dataString)
      .digest('hex');

    return calculatedHmac === receivedHmac;
  }
}
