import { Logger } from '@nestjs/common';

export const wrapTimeMeasure = async (
  action: () => any,
  task: string,
  logger?: Logger,
) => {
  const [hrTimeStartSec, hrTimeStartNano] = process.hrtime();
  const startTime = hrTimeStartSec * 1000 + hrTimeStartNano / 1000000;

  await action();

  const [hrEndTimeSec, hrEndTimeNano] = process.hrtime();
  const endTime = hrEndTimeSec * 1000 + hrEndTimeNano / 1000000;

  if (logger) {
    logger.log(`Task: ${task} takes ${endTime - startTime} ms to finish`);
  } else {
    console.log(`Task: ${task} takes ${endTime - startTime} ms to finish`);
  }
};
