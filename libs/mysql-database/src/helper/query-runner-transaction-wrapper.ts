import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { DataSource } from 'typeorm';

export async function queryRunnerTransactionWrapper<TResult>(
  dataSource: DataSource,
  execution: (queryRunner: QueryRunner) => Promise<TResult>,
) {
  const _queryRunner = dataSource.createQueryRunner();
  try {
    await _queryRunner.connect();
    await _queryRunner.startTransaction();
    const result = await execution(_queryRunner);
    await _queryRunner.commitTransaction();
    return result;
  } catch (e) {
    await _queryRunner.rollbackTransaction();
    throw e;
  } finally {
    if (!_queryRunner.isReleased) await _queryRunner.release();
  }
}
