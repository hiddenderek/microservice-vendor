import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import type { 
    CreateSubscriptionRequestDTO, 
    UpdateSubscriptionStatusRequestDTO, 
    SubscriptionResponseDTO, 
    ActiveSubscriptionResponseDTO 
} from './subscription.dto';

@Controller('subscription')
@ApiTags('subscription')
@ApiBearerAuth()
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new subscription' })
    @ApiResponse({ status: 201, description: 'Subscription created successfully' })
    async createSubscription(@Body() body: CreateSubscriptionRequestDTO) {
        return await this.subscriptionService.createSubscription(body);
    }

    @Get(':subscriptionId')
    @ApiOperation({ summary: 'Get subscription by ID' })
    @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
    async getSubscription(@Param('subscriptionId') subscriptionId: string) {
        return await this.subscriptionService.getSubscription(subscriptionId);
    }

    @Get('customer/:customerId')
    @ApiOperation({ summary: 'Get subscriptions by customer ID' })
    @ApiResponse({ status: 200, description: 'Customer subscriptions retrieved successfully' })
    async getSubscriptionsByCustomer(@Param('customerId') customerId: string) {
        return await this.subscriptionService.getSubscriptionsByCustomer(customerId);
    }

    @Get('vendor/:vendorId')
    @ApiOperation({ summary: 'Get subscriptions by vendor ID' })
    @ApiResponse({ status: 200, description: 'Vendor subscriptions retrieved successfully' })
    async getSubscriptionsByVendor(@Param('vendorId') vendorId: string) {
        return await this.subscriptionService.getSubscriptionsByVendor(vendorId);
    }

    @Get('active/:vendorId')
    @ApiOperation({ summary: 'Get active subscriptions by vendor ID with effect details' })
    @ApiResponse({ status: 200, description: 'Active subscriptions retrieved successfully' })
    async getActiveSubscriptions(@Param('vendorId') vendorId: string) {
        return await this.subscriptionService.getActiveSubscriptions(vendorId);
    }

    @Put(':subscriptionId/status')
    @ApiOperation({ summary: 'Update subscription status' })
    @ApiResponse({ status: 200, description: 'Subscription status updated successfully' })
    async updateSubscriptionStatus(
        @Param('subscriptionId') subscriptionId: string,
        @Body() body: UpdateSubscriptionStatusRequestDTO
    ) {
        return await this.subscriptionService.updateSubscriptionStatus(subscriptionId, body);
    }

    @Post(':subscriptionId/renew')
    @ApiOperation({ summary: 'Renew subscription and update next billing date' })
    @ApiResponse({ status: 200, description: 'Subscription renewed successfully' })
    async renewSubscription(@Param('subscriptionId') subscriptionId: string) {
        return await this.subscriptionService.renewSubscription(subscriptionId);
    }

    @Get('billing/due')
    @ApiOperation({ summary: 'Get subscriptions due for billing' })
    @ApiResponse({ status: 200, description: 'Due subscriptions retrieved successfully' })
    @ApiQuery({ name: 'dueDate', description: 'Date to check for due subscriptions (ISO string)', required: false })
    async getSubscriptionsDueForBilling(@Query('dueDate') dueDate?: string) {
        const date = dueDate ? new Date(dueDate) : new Date();
        return await this.subscriptionService.getSubscriptionsDueForBilling(date);
    }
}
