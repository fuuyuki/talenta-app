import { Controller, Post, Body } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('api/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async submit(@Body() body: any) {
    return this.requestsService.submitRequest(body);
  }
}
