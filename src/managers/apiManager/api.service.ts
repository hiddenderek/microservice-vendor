import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ApplicationPost } from '../applicationManager/application.dto';

@Injectable()
export class ApiService {
    constructor(private readonly httpService: HttpService) {}

    async getExternalData(id?: string, serviceToken?: string): Promise<number> {
        try {
            const item = await this.httpService.axiosRef<{ testValue: number }>(`https://www.randomnumberapi.com/api/v1.0/random`);
            return item?.data[0];
        } catch (error) {
            // error.response.status
            const message = `Error getting external data for id ${id}`;
            Logger.error(message);
            throw new InternalServerErrorException('Error getting external data', {
                cause: error,
                description: message,
            });
        }
    }

    async post<T>(url: string, data: any): Promise<AxiosResponse<T>> {
        return await this.httpService.axiosRef(url, data);
    }

    // Add more methods as needed
}
