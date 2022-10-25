/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Drop All Tables

  return knex.schema.dropTableIfExists('tb_jabatan').then(() => {
    return knex.schema.createTable('tb_jabatan', (table) => {
      table.increments('id_jabatan').primary();
      table.string('nama_jabatan');
      table.enum('status', ['a', 't']);
      table.timestamps();
      table.engine('InnoDB');
    });
  }).then(() => {
    return knex.schema.dropTableIfExists('tb_sektor').then(() => {
      return knex.schema.createTable('tb_sektor', (table) => {
        table.increments('id_sektor').primary();
        table.string('nama_sektor');
        table.text('deskripsi');
        table.text('alamat');
        table.enum('status', ['a', 't']);
        table.timestamps();
        table.engine('InnoDB');
      });
    });
  }).then(() => {
    return knex.schema.dropTableIfExists('tb_jenis_device').then(() => {
      return knex.schema.createTable('tb_jenis_device', (table) => {
        table.increments('id_jenis_device').primary();
        table.string('nama_jenis');
        table.text('keterangan');
        table.enum('status', ['a', 't']);
        table.timestamps();
        table.engine('InnoDB');
      });
    });
  }).then(() => {
    return knex.schema.dropTableIfExists('tb_petugas').then(() => {
      return knex.schema.createTable('tb_petugas', (table) => {
        table.increments('id_petugas').primary();
        table.integer('id_jabatan').unsigned().references('id_jabatan').inTable('tb_jabatan');
        table.string('id_card');
        table.enum('role', ['Sysadmin', 'Admin', 'Petugas']);
        table.string('nama_lengkap');
        table.string('no_tlp');
        table.string('email');
        table.string('username');
        table.string('password');
        table.string('foto').nullable();
        table.text('token').nullable();
        table.enum('status', ['a', 't']);
        table.timestamps();
        table.engine('InnoDB');
      });
    });
  }).then(() => {
    return knex.schema.dropTableIfExists('tb_device').then(() => {
      return knex.schema.createTable('tb_device', (table) => {
        table.increments('id_device').primary();
        table.integer('id_jenis_device').unsigned().references('id_jenis_device').inTable('tb_jenis_device');
        table.integer('id_sektor').unsigned().references('id_sektor').inTable('tb_sektor');
        table.string('nama_device');
        table.text('deskripsi');
        table.enum('status', ['a', 't']);
        table.timestamps();
        table.engine('InnoDB');
      });
    });
  }).then(() => {
    return knex.schema.dropTableIfExists('tb_indikator').then(() => {
      return knex.schema.createTable('tb_indikator', (table) => {
        table.increments('id_indikator').primary();
        table.integer('id_device').unsigned().references('id_device').inTable('tb_device');
        table.string('nama_indikator');
        table.string('satuan');
        table.integer('minimum');
        table.integer('maksimum');
        table.text('deskripsi');
        table.enum('status', ['a', 't']);
        table.timestamps();
        table.engine('InnoDB');
      });
    });
  }).then(() => {
    return knex.schema.dropTableIfExists('tb_alert').then(() => {
      return knex.schema.createTable('tb_alert', (table) => {
        table.increments('id_alert').primary();
        table.integer('id_petugas').unsigned().references('id_petugas').inTable('tb_petugas');
        table.integer('id_device').unsigned().references('id_device').inTable('tb_device');
        table.string('nama_alert');
        table.string('kondisi');
        table.integer('interval');
        table.timestamp('tanggal');
        table.enum('status', ['a', 't']);
        table.timestamps();
        table.engine('InnoDB');
      });
    });
  }).then(() => {
    // Monitor DC
    return knex.schema.dropTableIfExists('monitor_dc').then(() => {
      return knex.schema.createTable('monitor_dc', (table) => {
        table.increments('id_monitor_dc').primary();
        table.integer('id_device').unsigned().references('id_device').inTable('tb_device');
        table.float('tegangan').nullable();
        table.float('arus').nullable();
        table.float('watt').nullable();
        table.float('kwh').nullable();
        table.timestamp('waktu');
        table.enum('status', ['p', 'm', 's', 'w']);
        table.timestamps();
        table.engine('InnoDB');
      });
    }
    );
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

};
