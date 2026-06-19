import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    console.log("AUTH HEADER:", request.headers.authorization);
    console.log("TOKEN:", token);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing or invalid');
    }

    // try {
    //   const payload = await this.jwtService.verifyAsync(token, {
    //     secret: process.env.JWT_SECRET || 'fallback_secret',
    //   });
    //   (request as any).user = payload;
    // } catch {
    //   throw new UnauthorizedException('Authentication token expired or invalid');
    // }
    try {
  const payload = await this.jwtService.verifyAsync(token)
   

  console.log("PAYLOAD =>", payload);

  (request as any).user = payload;

} catch (error) {
  console.log("JWT ERROR =>", error);
  throw new UnauthorizedException('Authentication token expired or invalid');
}

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
