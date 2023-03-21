const express = require('express');

const Route = express.Router();

const authRoutes = require('./routes/auth');
const kartuKeluargaRoutes = require('./routes/kartuKeluarga');
const dokterRoutes = require('./routes/dokter');
const tahapPelayananRoutes = require('./routes/tahapPelayanan');
const rakRoutes = require('./routes/rak');
const informasiRoutes = require('./routes/informasi');
const poliRoutes = require('./routes/poli');
const usersRoutes = require('./routes/users');
const rekamMedisRoutes = require('./routes/rekamMedis');
const detailRekamMedisRoutes = require('./routes/detailRekamMedis');
const praktekRoutes = require('./routes/praktek');
const detailPraktekRoutes = require('./routes/detailPraktek');
const pasienRoutes = require('./routes/pasien');
const notifikasiRoutes = require('./routes/notifikasi');
const detailAntrianRoutes = require('./routes/detailAntrian');
const antrianRoutes = require('./routes/antrian');
const dataRoutes = require('./routes/data');

Route.use('/auth', authRoutes);
Route.use('/kartu-keluarga', kartuKeluargaRoutes);
Route.use('/dokter', dokterRoutes);
Route.use('/tahap-pelayanan', tahapPelayananRoutes);
Route.use('/rak', rakRoutes);
// Route.use('/rak', Route.get('/', (req, res) => res.status(200).json({ data: 'mantap' })));
Route.use('/informasi', informasiRoutes);
Route.use('/poli', poliRoutes);
Route.use('/users', usersRoutes);
Route.use('/rekam-medis', rekamMedisRoutes);
Route.use('/detail-rekam-medis', detailRekamMedisRoutes);
Route.use('/praktek', praktekRoutes);
Route.use('/detail-praktek', detailPraktekRoutes);
Route.use('/pasien', pasienRoutes);
Route.use('/notifikasi', notifikasiRoutes);
Route.use('/detail-antrian', detailAntrianRoutes);
Route.use('/antrian', antrianRoutes);
Route.use('/data', dataRoutes);

module.exports = Route;
