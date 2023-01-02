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

Route.use('/auth', authRoutes);
Route.use('/kartu-keluarga', kartuKeluargaRoutes);
Route.use('/dokter', dokterRoutes);
Route.use('/tahap-pelayanan', tahapPelayananRoutes);
Route.use('/rak', rakRoutes);
Route.use('/informasi', informasiRoutes);
Route.use('/poli', poliRoutes);
Route.use('/users', usersRoutes);
Route.use('/rekam-medis', rekamMedisRoutes);

module.exports = Route;
