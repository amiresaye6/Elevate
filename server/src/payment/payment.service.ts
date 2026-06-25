import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import {  } from 'rxjs';

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
        "apartment": "",
        "first_name": session.student.name.split(' ')[0],
        "last_name": session.student.name.split(' ')[session.student.name.split(' ').length-1],
        "street": "",
        "building": "",
        "phone_number": "",
        "city": "",
        "country": "",
        "email": session.student.user.email,
        "floor": "",
        "state": ""
      },
      "special_reference": "PAYMENTLOGID-"+paymentLog.id,
      "expiration": 3600,
      "notification_url": process.env.PAYMOB_WEBHOOK_URL,
      "redirection_url": process.env.FRONTEND_URL+"/payment-status"
    };
    const headers = {
      Authorization :"Token "+process.env.SECRET_KEY_PAYMOB,
      "Content-Type": "application/json"
    };
    const url= "https://accept.paymob.com/v1/intention/";

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
      throw new BadRequestException("an error occured while sending request to paymob")
    }
  }

  async handleWebhook(payload:any){

  }
}
