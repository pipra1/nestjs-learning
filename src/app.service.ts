import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  findOne(id: number) {
    return {
      id,
      title: `Task ${id}`,
      status: 'open',
    }
  }
}
