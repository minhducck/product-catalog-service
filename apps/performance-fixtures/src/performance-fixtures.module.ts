import { Module } from '@nestjs/common';
import { AppModule } from '../../backend/src/app.module';

@Module({
  imports: [AppModule],
  controllers: [],
  providers: [],
})
export class PerformanceFixturesModule {}
