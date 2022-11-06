const express = require("express");
const moment = require("moment/moment");
const database = require("../config/database");

function SocketRouter(io) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const result = await database
        .select(
          'monitor_dc.id_monitor_dc',
          'monitor_dc.waktu',
          'tb_device.nama_device',
          'tb_device.id_device',
          'tb_jenis_device.nama_jenis',
          'tb_jenis_device.id_jenis_device',
          'monitor_dc.waktu',
          'monitor_dc.tegangan',
          'monitor_dc.kwh',
          'monitor_dc.watt',
          'monitor_dc.arus',
          'tb_indikator.nama_indikator',
          'tb_indikator.id_indikator',
          'tb_indikator.satuan',
          'tb_indikator.icon',
          'tb_indikator.satuan',
          'tb_indikator.minimum',
          'tb_indikator.maksimum',
        )
        .from('monitor_dc')
        .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
        .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
        .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_device')
        .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
        .join(
          database.raw(
            '(select max(id_monitor_dc) as id_monitor_dc from monitor_dc group by id_device) as max_monitor_dc'
          ),
          'monitor_dc.id_monitor_dc',
          'max_monitor_dc.id_monitor_dc'
        )
        .orderBy('monitor_dc.id_monitor_dc', 'desc')
        .groupBy('tb_jenis_device.id_jenis_device', 'tb_indikator.id_indikator', 'tb_device.id_device')
        .modify(function (queryBuilder) {
          if (req.query.indikator) {
            if (req.query.indikator != 'all') {
              queryBuilder.where('tb_indikator.nama_indikator', req.query.indikator);
            }
          }

          if (req.query.jenis_device) {
            if (req.query.jenis_device != 'all') {
              queryBuilder.where('tb_jenis_device.id_jenis_device', req.query.jenis_device);
            }
          }

          if (req.query.sektor) {
            if (req.query.sektor != 'all') {
              queryBuilder.where('tb_sektor.id_sektor', req.query.sektor);
            }
          }
        })


      for (let i = 0; i < result.length; i++) {
        const waktu = moment.utc(result[i].waktu, 'YYYY-MM-DDTHH:mm:ss.SSS').format('YYYY-MM-DD HH:mm:ss')
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const checkBatas = await database
          .select(
            'tb_threshold.id_threshold',
            'tb_threshold.id_indikator',
            'tb_threshold.minimum',
            'tb_threshold.maksimum',
          )
          .from('tb_threshold')
          .join('tb_indikator', 'tb_threshold.id_indikator', 'tb_indikator.id_indikator')
          .join('tb_device', 'tb_indikator.id_device', 'tb_device.id_device')
          .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
          .where('tb_threshold.id_indikator', result[i].id_indikator)
          .andWhere('tb_jenis_device.id_jenis_device', result[i].id_jenis_device)
          .andWhere('tb_device.id_device', result[i].id_device)
          .first()

        if (checkBatas) {
          if (moment(waktu).format('YYYY-MM-DD') == moment(now).format('YYYY-MM-DD') && moment(waktu).format('HH') == moment(now).format('HH')) {
            if (result[i].satuan == 'A') {
              if (result[i].arus < checkBatas.minimum || result[i].arus > checkBatas.maksimum) {
                if (result[i].arus <= result[i].minimum || result[i].arus >= result[i].maksimum) {
                  result[i].status = 'danger'
                } else {
                  result[i].status = 'warning'
                }
              } else {
                result[i].status = 'success'
              }
            } else if (result[i].satuan == 'W') {
              if (result[i].watt < checkBatas.minimum || result[i].watt > checkBatas.maksimum) {
                if (result[i].watt <= result[i].minimum || result[i].watt >= result[i].maksimum) {
                  result[i].status = 'danger'
                } else {
                  result[i].status = 'warning'
                }
              } else {
                result[i].status = 'success'
              }
            } else if (result[i].satuan == 'Wh') {
              if (result[i].kwh < checkBatas.minimum || result[i].kwh > checkBatas.maksimum) {
                if (result[i].kwh <= result[i].minimum || result[i].kwh >= result[i].maksimum) {
                  result[i].status = 'danger'
                } else {
                  result[i].status = 'warning'
                }
              } else {
                result[i].status = 'success'
              }
            } else if (result[i].satuan == 'V') {
              if (result[i].tegangan < checkBatas.minimum || result[i].tegangan > checkBatas.maksimum) {
                if (result[i].tegangan <= result[i].minimum || result[i].tegangan >= result[i].maksimum) {
                  result[i].status = 'danger'
                } else {
                  result[i].status = 'warning'
                }
              } else {
                result[i].status = 'success'
              }
            }
          } else {
            result[i].status = 'secondary'
          }
        }
      }


      if (result) {
        io.emit('monitor_dc', result)

        return res.status(200).json({
          status: 1,
          message: "Berhasil",
          result: result
        });
      } else {
        return res.status(400).json({
          status: 0,
          message: "Data tidak ditemukan"
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message
      })
    }
  });

  router.post('/', async (req, res) => {
    try {
      // contains ','
      if (req.body.sensor.includes(', ')) {
        const sensor = req.body.sensor.split(", ");

        const checkDevice = await database("tb_device")
          .join("tb_jenis_device", "tb_device.id_jenis_device", "tb_jenis_device.id_jenis_device")
          .join("tb_sektor", "tb_device.id_sektor", "tb_sektor.id_sektor")
          .where("tb_device.nama_device", sensor[0])
          .where("tb_jenis_device.nama_jenis", sensor[1])
          .where("tb_sektor.nama_sektor", req.body.lokasi)
          .select("tb_device.id_device")
          .first();

        if (!checkDevice) {
          return res.status(400).json({
            status: 0,
            message: "Device tidak ditemukan"
          });
        }

        const data = {
          id_device: checkDevice.id_device,
          tegangan: parseFloat(req.body.tegangan),
          arus: parseFloat(req.body.arus),
          watt: parseFloat(req.body.watt),
          kwh: parseFloat(req.body.kwh),
          waktu: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          created_at: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          updated_at: moment().format("YYYY-MM-DDTHH:mm:ss.SSS")
        }

        const insert = await database("monitor_dc").insert(data);
        if (insert) {


          const result = await database
            .select(
              'monitor_dc.id_monitor_dc',
              'monitor_dc.waktu',
              'tb_device.nama_device',
              'tb_device.id_device',
              'tb_jenis_device.nama_jenis',
              'tb_jenis_device.id_jenis_device',
              'monitor_dc.waktu',
              'monitor_dc.tegangan',
              'monitor_dc.kwh',
              'monitor_dc.watt',
              'monitor_dc.arus',
              'tb_indikator.nama_indikator',
              'tb_indikator.id_indikator',
              'tb_indikator.satuan',
              'tb_indikator.icon',
              'tb_indikator.satuan',
              'tb_indikator.minimum',
              'tb_indikator.maksimum',
            )
            .from('monitor_dc')
            .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
            .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
            .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_device')
            .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
            .join(
              database.raw(
                '(select max(id_monitor_dc) as id_monitor_dc from monitor_dc group by id_device) as max_monitor_dc'
              ),
              'monitor_dc.id_monitor_dc',
              'max_monitor_dc.id_monitor_dc'
            )
            .orderBy('monitor_dc.id_monitor_dc', 'desc')
            .groupBy('tb_jenis_device.id_jenis_device', 'tb_indikator.id_indikator', 'tb_device.id_device')
            .modify(function (queryBuilder) {
              if (req.query.indikator) {
                if (req.query.indikator != 'all') {
                  queryBuilder.where('tb_indikator.nama_indikator', req.query.indikator);
                }
              }

              if (req.query.jenis_device) {
                if (req.query.jenis_device != 'all') {
                  queryBuilder.where('tb_jenis_device.id_jenis_device', req.query.jenis_device);
                }
              }

              if (req.query.sektor) {
                if (req.query.sektor != 'all') {
                  queryBuilder.where('tb_sektor.id_sektor', req.query.sektor);
                }
              }
            })


          for (let i = 0; i < result.length; i++) {
            const waktu = moment.utc(result[i].waktu, 'YYYY-MM-DDTHH:mm:ss.SSS').format('YYYY-MM-DD HH:mm:ss')
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            const checkBatas = await database
              .select(
                'tb_threshold.id_threshold',
                'tb_threshold.id_indikator',
                'tb_threshold.minimum',
                'tb_threshold.maksimum',
              )
              .from('tb_threshold')
              .join('tb_indikator', 'tb_threshold.id_indikator', 'tb_indikator.id_indikator')
              .join('tb_device', 'tb_indikator.id_device', 'tb_device.id_device')
              .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
              .where('tb_threshold.id_indikator', result[i].id_indikator)
              .andWhere('tb_jenis_device.id_jenis_device', result[i].id_jenis_device)
              .andWhere('tb_device.id_device', result[i].id_device)
              .first()

            if (checkBatas) {
              if (moment(waktu).format('YYYY-MM-DD') == moment(now).format('YYYY-MM-DD') && moment(waktu).format('HH') == moment(now).format('HH')) {
                if (result[i].satuan == 'A') {
                  if (result[i].arus < checkBatas.minimum || result[i].arus > checkBatas.maksimum) {
                    if (result[i].arus <= result[i].minimum || result[i].arus >= result[i].maksimum) {
                      result[i].status = 'danger'
                    } else {
                      result[i].status = 'warning'
                    }
                  } else {
                    result[i].status = 'success'
                  }
                } else if (result[i].satuan == 'W') {
                  if (result[i].watt < checkBatas.minimum || result[i].watt > checkBatas.maksimum) {
                    if (result[i].watt <= result[i].minimum || result[i].watt >= result[i].maksimum) {
                      result[i].status = 'danger'
                    } else {
                      result[i].status = 'warning'
                    }
                  } else {
                    result[i].status = 'success'
                  }
                } else if (result[i].satuan == 'Wh') {
                  if (result[i].kwh < checkBatas.minimum || result[i].kwh > checkBatas.maksimum) {
                    if (result[i].kwh <= result[i].minimum || result[i].kwh >= result[i].maksimum) {
                      result[i].status = 'danger'
                    } else {
                      result[i].status = 'warning'
                    }
                  } else {
                    result[i].status = 'success'
                  }
                } else if (result[i].satuan == 'V') {
                  if (result[i].tegangan < checkBatas.minimum || result[i].tegangan > checkBatas.maksimum) {
                    if (result[i].tegangan <= result[i].minimum || result[i].tegangan >= result[i].maksimum) {
                      result[i].status = 'danger'
                    } else {
                      result[i].status = 'warning'
                    }
                  } else {
                    result[i].status = 'success'
                  }
                }
              } else {
                result[i].status = 'secondary'
              }
            }
          }


          if (result) {
            io.emit('monitor_dc', result)

            return res.status(200).json({
              status: 1,
              message: "Berhasil",
              result: result
            });
          } else {
            return res.status(400).json({
              status: 0,
              message: "Data tidak ditemukan"
            });
          }


          // return res.status(201).json({
          //   status: 1,
          //   message: "Berhasil"
          // })
        } else {
          return res.status(422).json({
            status: 0,
            message: "Gagal"
          })
        }
      } else {
        return res.status(422).json({
          status: 0,
          message: "Nama dan jenis device tidak dapat ditemukan"
        })
      }
    } catch (error) {
      return res.status(500).json({
        status: 0,
        message: error.message
      })
    }
  });

  router.get('/statistic', async (req, res) =>{
    try{
        const result = await database
            .select(
                database.raw('CONCAT (tb_device.nama_device, " - ", tb_jenis_device.nama_jenis) as name'),
                'tb_device.id_device'
            )
            .from('monitor_dc')
            .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
            .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
            .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_indikator')
            .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
            .orderBy('monitor_dc.id_monitor_dc', 'desc')
            .groupBy('tb_indikator.id_indikator')
            .limit(100)
            .modify(function (queryBuilder) {
          if (req.query.indikator) {
            if (req.query.indikator != 'all') {
              queryBuilder.where('tb_indikator.nama_indikator', req.query.indikator);
            }
          }

          if (req.query.jenis_device) {
            if (req.query.jenis_device != 'all') {
              queryBuilder.where('tb_jenis_device.id_jenis_device', req.query.jenis_device);
            }
          }

          if (req.query.sektor) {
            if (req.query.sektor != 'all') {
              queryBuilder.where('tb_sektor.id_sektor', req.query.sektor);
            }
          }
        })

        for ( let i = 0; i < result.length; i++) {
            const data = await database
                .select(
                    'monitor_dc.arus',
                    'monitor_dc.tegangan',
                    'monitor_dc.watt',
                    'monitor_dc.kwh',
                    'monitor_dc.waktu',
                )
                .from('monitor_dc')
                .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
                .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
                .where('tb_device.id_device', result[i].id_device)
                .groupByRaw('DATE_FORMAT(waktu, "%Y-%m-%d %H")')
                .orderBy('monitor_dc.id_monitor_dc', 'desc')
                .limit(100)

              if (data) {
                  result[i].data = data
                }
            }
            
            if(result) {
                io.emit('monitor_dc', result)

                return res.status(200).json({
                    status: 1,
                    message: "Berhasil",
                    result: result
                });
            } else {
                return res.status(400).json({
                    status:0,
                    message: "Data tidak ditemukan"
                })
            }
        } catch (error) {
            return res.status(500).json({
              status: 0,
              message: error.message
            })
          }
        });
    
  router.get('/filter', async (req, res) =>{
    try{
        const result = await database
            .select(
                      database.raw('CONCAT (tb_device.nama_device, " - ", tb_jenis_device.nama_jenis) as name'),
                      'tb_device.id_device'
                  )
                  .from('monitor_dc')
                  .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
                  .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
                  .join('tb_indikator', 'tb_device.id_device', 'tb_indikator.id_indikator')
                  .join('tb_sektor', 'tb_device.id_sektor', 'tb_sektor.id_sektor')
                  .orderBy('monitor_dc.id_monitor_dc', 'desc')
                  .groupBy('tb_indikator.id_indikator')
                  .limit(100)
                  .modify(function (queryBuilder) {
                if (req.query.indikator) {
                  if (req.query.indikator != 'all') {
                    queryBuilder.where('tb_indikator.nama_indikator', req.query.indikator);
                  }
                }
      
                if (req.query.jenis_device) {
                  if (req.query.jenis_device != 'all') {
                    queryBuilder.where('tb_jenis_device.id_jenis_device', req.query.jenis_device);
                  }
                }
      
                if (req.query.sektor) {
                  if (req.query.sektor != 'all') {
                    queryBuilder.where('tb_sektor.id_sektor', req.query.sektor);
                  }
                }
              })
      
        for ( let i = 0; i < result.length; i++) {
         const data = await database
                      .select(
                        'arus as text',
                        'waktu as time'
                      )
                      .select(
                        'tegangan as text',
                        'waktu as time'
                      )
                      .select(
                        'watt as text',
                        'waktu as time'
                      )
                      .select(
                        'kwh as text',
                        'waktu as time'
                      )
                .from('monitor_dc')
                .join('tb_device', 'monitor_dc.id_device', 'tb_device.id_device')
                .join('tb_jenis_device', 'tb_device.id_jenis_device', 'tb_jenis_device.id_jenis_device')
                .where('tb_device.id_device', result[i].id_device)
                .groupByRaw('DATE_FORMAT(waktu, "%Y-%m-%d %H")')
                .orderBy('monitor_dc.id_monitor_dc', 'desc')
                .limit(100)

              if (data) {
                  result[i].data = data
                }
            }
            
            if(result) {
                io.emit('monitor_dc', result)

                return res.status(200).json({
                    status: 1,
                    message: "Berhasil",
                    result: result
                });
            } else {
                return res.status(400).json({
                    status:0,
                    message: "Data tidak ditemukan"
                })
            }
        } catch (error) {
            return res.status(500).json({
              status: 0,
              message: error.message
            })
          }
        });
  
  return router;
}

module.exports = SocketRouter;