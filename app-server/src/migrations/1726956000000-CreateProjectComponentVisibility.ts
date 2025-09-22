import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProjectComponentVisibility1726956000000 implements MigrationInterface {
  name = 'CreateProjectComponentVisibility1726956000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project_component_visibility',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'component_key',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'visible_roles',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'is_visible_to_all',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['project_id'],
            referencedTableName: 'projects',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [
          {
            name: 'UQ_project_component',
            columnNames: ['project_id', 'component_key'],
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'project_component_visibility',
      new TableIndex({
        name: 'IDX_project_component_visibility_project_id',
        columnNames: ['project_id'],
      }),
    );

    await queryRunner.createIndex(
      'project_component_visibility',
      new TableIndex({
        name: 'IDX_project_component_visibility_component_key',
        columnNames: ['component_key'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('project_component_visibility');
  }
}
