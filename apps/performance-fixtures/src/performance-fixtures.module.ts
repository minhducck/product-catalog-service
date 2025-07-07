import { Module } from '@nestjs/common';
import { AppModule } from '@app/backend/app.module';

@Module({
  imports: [AppModule],
  controllers: [],
  providers: [],
})
export class PerformanceFixturesModule {}
