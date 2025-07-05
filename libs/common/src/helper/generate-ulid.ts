import { TwitterSnowflake } from '@sapphire/snowflake';

export const generateULID = (): bigint => {
  return TwitterSnowflake.generate();
};
