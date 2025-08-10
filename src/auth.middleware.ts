import { HttpException } from '@nestjs/common/exceptions/http.exception.js';
import { NestMiddleware, HttpStatus, Injectable } from '@nestjs/common';
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
// import { SECRET } from '../config';
// import { UserService } from './user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor() {} // private readonly userService: UserService

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeaders = req.headers.authorization;

        if (authHeaders && (authHeaders as string).split(' ')[1]) {
            const token = (authHeaders as string).split(' ')[1];
            const decoded = jwt.decode(token, { complete: true });

            const currentTime = Math.floor(new Date().getTime() / 1000);

            if (
                !decoded ||
                !decoded.payload ||
                !decoded.payload.vendor_id ||
                decoded.payload.groups.length !== 1 ||
                decoded.payload.exp < currentTime
            ) {
                res.status(401).send({
                    description: 'Unauthorized',
                    expired: decoded.payload.exp < currentTime,
                    token,
                });

                return;
            }

            const user = {
                vendorId: decoded.payload.vendor_id,
                role: decoded.payload.groups[0],
            };

            if (user.role === 'vendor' && !user.vendorId) {
                res.status(401).send({
                    description: 'Unauthorized. VendorId is missing',
                });

                return;
            }

            req.user = user;

            // 1. Validate token structure
            // 2. Verify token (using secret)
            // 3. Check user group from token and block route access

            //   const decoded: any = jwt.verify(token, SECRET);
            //   const user = await this.userService.findById(decoded.id);

            //   if (!user) {
            //     throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
            //   }

            //   req.user = user.user;

            req.vendorId = 'testId';
            next();
        } else {
            throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
        }
    }
}
