-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 20, 2026 at 06:22 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `monitoring_udara`
--

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `Id_lokasi` int(11) NOT NULL,
  `Nama_lokasi` varchar(100) NOT NULL,
  `Latitude` decimal(10,8) NOT NULL,
  `Longitude` decimal(11,8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`Id_lokasi`, `Nama_lokasi`, `Latitude`, `Longitude`) VALUES
(1, 'Universitas Pignatelli Triputra - Kantin', -7.55313300, 110.77751900),
(2, 'Universitas Pignatelli Triputra - Ruang Kelas', -7.55265000, 110.77746700);

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `Id_report` int(11) NOT NULL,
  `Id_user` int(11) NOT NULL,
  `Id_lokasi` int(11) NOT NULL,
  `Range_data` varchar(100) DEFAULT NULL,
  `Nilai_AQI_RataRata` decimal(10,2) DEFAULT NULL,
  `Waktu_Dibuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `Dokumen_Catatan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report`
--

INSERT INTO `report` (`Id_report`, `Id_user`, `Id_lokasi`, `Range_data`, `Nilai_AQI_RataRata`, `Waktu_Dibuat`, `Dokumen_Catatan`) VALUES
(8, 3, 1, '2026-05-16', 370.11, '2026-05-16 12:15:02', 'Laporan Sensor (Data Mentah)\nTanggal: 2026-05-16\nTotal Data: 22\n\nLokasi ID | Suhu | Kelembapan | AQI | Waktu\n---------------------------------------------------\n2 | 29.50°C | 72.00% | 85.00 | 13/5/2026, 11.53.02\n2 | 30.20°C | 70.50% | 92.00 | 13/5/2026, 11.53.02\n1 | 28.80°C | 75.00% | 78.00 | 13/5/2026, 11.53.02\n1 | 29.10°C | 74.20% | 82.00 | 13/5/2026, 11.53.02\n2 | 27.50°C | 78.00% | 65.00 | 13/5/2026, 11.53.02\n1 | 23.90°C | 41.00% | 843.00 | 16/5/2026, 14.21.05\n1 | 23.90°C | 41.00% | 843.00 | 16/5/2026, 14.21.09\n1 | 23.90°C | 41.00% | 843.00 | 16/5/2026, 14.21.14\n1 | 23.90°C | 41.00% | 2726.00 | 16/5/2026, 14.21.25\n1 | 23.90°C | 41.00% | 442.00 | 16/5/2026, 14.31.05\n1 | 23.90°C | 41.00% | 112.00 | 16/5/2026, 14.31.41\n1 | 23.90°C | 41.00% | 102.00 | 16/5/2026, 14.31.53\n1 | 23.90°C | 41.00% | 177.00 | 16/5/2026, 14.34.18\n1 | 23.90°C | 41.00% | 177.00 | 16/5/2026, 14.35.07\n1 | 23.90°C | 41.00% | 41.00 | 16/5/2026, 14.35.20\n1 | 23.90°C | 41.00% | 44.00 | 16/5/2026, 14.35.32\n1 | 23.90°C | 41.00% | 55.00 | 16/5/2026, 14.35.36\n1 | 23.90°C | 41.00% | 94.00 | 16/5/2026, 14.35.45\n1 | 23.90°C | 41.00% | 70.00 | 16/5/2026, 14.35.50\n1 | 3.60°C | 54.50% | 70.00 | 16/5/2026, 14.35.58\n1 | 3.60°C | 54.50% | 177.00 | 16/5/2026, 15.09.25\n1 | 3.60°C | 54.50% | 56.00 | 16/5/2026, 15.09.39\n'),
(9, 3, 2, '2026-05-16', 80.67, '2026-05-16 12:15:02', 'Laporan Sensor (Data Mentah)\nTanggal: 2026-05-16\nTotal Data: 22\n\nLokasi ID | Suhu | Kelembapan | AQI | Waktu\n---------------------------------------------------\n2 | 29.50°C | 72.00% | 85.00 | 13/5/2026, 11.53.02\n2 | 30.20°C | 70.50% | 92.00 | 13/5/2026, 11.53.02\n1 | 28.80°C | 75.00% | 78.00 | 13/5/2026, 11.53.02\n1 | 29.10°C | 74.20% | 82.00 | 13/5/2026, 11.53.02\n2 | 27.50°C | 78.00% | 65.00 | 13/5/2026, 11.53.02\n1 | 23.90°C | 41.00% | 843.00 | 16/5/2026, 14.21.05\n1 | 23.90°C | 41.00% | 843.00 | 16/5/2026, 14.21.09\n1 | 23.90°C | 41.00% | 843.00 | 16/5/2026, 14.21.14\n1 | 23.90°C | 41.00% | 2726.00 | 16/5/2026, 14.21.25\n1 | 23.90°C | 41.00% | 442.00 | 16/5/2026, 14.31.05\n1 | 23.90°C | 41.00% | 112.00 | 16/5/2026, 14.31.41\n1 | 23.90°C | 41.00% | 102.00 | 16/5/2026, 14.31.53\n1 | 23.90°C | 41.00% | 177.00 | 16/5/2026, 14.34.18\n1 | 23.90°C | 41.00% | 177.00 | 16/5/2026, 14.35.07\n1 | 23.90°C | 41.00% | 41.00 | 16/5/2026, 14.35.20\n1 | 23.90°C | 41.00% | 44.00 | 16/5/2026, 14.35.32\n1 | 23.90°C | 41.00% | 55.00 | 16/5/2026, 14.35.36\n1 | 23.90°C | 41.00% | 94.00 | 16/5/2026, 14.35.45\n1 | 23.90°C | 41.00% | 70.00 | 16/5/2026, 14.35.50\n1 | 3.60°C | 54.50% | 70.00 | 16/5/2026, 14.35.58\n1 | 3.60°C | 54.50% | 177.00 | 16/5/2026, 15.09.25\n1 | 3.60°C | 54.50% | 56.00 | 16/5/2026, 15.09.39\n'),
(10, 2, 1, '2026-05-20', 73.21, '2026-05-20 03:37:35', 'Laporan Sensor (Data Mentah)\nTanggal: 2026-05-20\nTotal Data: 29\n\nLokasi ID | Suhu | Kelembapan | AQI | Waktu\n---------------------------------------------------\n1 | 3.60°C | 54.50% | 177.00 | 16/5/2026, 19.15.43\n1 | 3.60°C | 54.50% | 46.00 | 16/5/2026, 19.15.56\n1 | 3.60°C | 54.50% | 54.00 | 16/5/2026, 19.16.02\n1 | 3.60°C | 54.50% | 57.00 | 16/5/2026, 19.16.08\n1 | 3.60°C | 54.50% | 177.00 | 17/5/2026, 16.20.20\n1 | 3.60°C | 54.50% | 42.00 | 17/5/2026, 16.20.28\n1 | 3.60°C | 54.50% | 49.00 | 17/5/2026, 16.20.32\n1 | 3.60°C | 54.50% | 55.00 | 17/5/2026, 16.20.36\n1 | 3.60°C | 54.50% | 46.00 | 17/5/2026, 16.20.40\n1 | 3.60°C | 54.50% | 54.00 | 17/5/2026, 16.20.44\n1 | 23.90°C | 41.00% | 177.00 | 19/5/2026, 20.50.12\n1 | 23.90°C | 41.00% | 57.00 | 19/5/2026, 20.50.20\n1 | 23.90°C | 41.00% | 65.00 | 19/5/2026, 20.50.28\n1 | 23.90°C | 41.00% | 55.00 | 19/5/2026, 20.50.41\n1 | 23.90°C | 41.00% | 61.00 | 19/5/2026, 20.50.49\n1 | 23.90°C | 41.00% | 177.00 | 19/5/2026, 21.00.12\n1 | 23.90°C | 41.00% | 46.00 | 19/5/2026, 21.00.20\n1 | 23.90°C | 41.00% | 51.00 | 19/5/2026, 21.00.29\n1 | 23.90°C | 41.00% | 177.00 | 20/5/2026, 10.20.06\n1 | 23.90°C | 41.00% | 44.00 | 20/5/2026, 10.20.12\n1 | 23.90°C | 41.00% | 46.00 | 20/5/2026, 10.20.16\n1 | 23.90°C | 41.00% | 55.00 | 20/5/2026, 10.20.20\n1 | 23.90°C | 41.00% | 51.00 | 20/5/2026, 10.20.23\n1 | 23.90°C | 41.00% | 48.00 | 20/5/2026, 10.20.27\n1 | 23.90°C | 41.00% | 49.00 | 20/5/2026, 10.20.31\n1 | 23.90°C | 41.00% | 57.00 | 20/5/2026, 10.20.40\n1 | 23.90°C | 41.00% | 49.00 | 20/5/2026, 10.20.43\n1 | 23.90°C | 41.00% | 55.00 | 20/5/2026, 10.21.00\n1 | 23.90°C | 41.00% | 46.00 | 20/5/2026, 10.21.03\n');

-- --------------------------------------------------------

--
-- Table structure for table `sensor`
--

CREATE TABLE `sensor` (
  `Id_sensor` int(11) NOT NULL,
  `Nama_sensor` varchar(100) NOT NULL,
  `Tipe` varchar(50) NOT NULL,
  `Status` enum('Aktif','Maintenance','Rusak') DEFAULT 'Aktif',
  `Id_lokasi` int(11) NOT NULL,
  `Installed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sensor`
--

INSERT INTO `sensor` (`Id_sensor`, `Nama_sensor`, `Tipe`, `Status`, `Id_lokasi`, `Installed_at`) VALUES
(2, 'Sensor Suhu & Kelembapan - Kantin', 'DHT22', 'Maintenance', 1, '2026-05-13 04:52:35'),
(3, 'Sensor Kualitas Udara - Kelas', 'MQ135', 'Aktif', 2, '2026-05-13 04:52:35'),
(11, 'Sensor Kantin', 'DHT22+MQ135', 'Aktif', 1, '2026-05-16 07:21:05');

-- --------------------------------------------------------

--
-- Table structure for table `sensor_data`
--

CREATE TABLE `sensor_data` (
  `Id_data` int(11) NOT NULL,
  `Id_sensor` int(11) NOT NULL,
  `Id_lokasi` int(11) NOT NULL,
  `Suhu` decimal(5,2) DEFAULT NULL,
  `Kelembapan` decimal(5,2) DEFAULT NULL,
  `Nilai_AQI` decimal(10,2) DEFAULT NULL,
  `Waktu` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sensor_data`
--

INSERT INTO `sensor_data` (`Id_data`, `Id_sensor`, `Id_lokasi`, `Suhu`, `Kelembapan`, `Nilai_AQI`, `Waktu`) VALUES
(1, 11, 1, 23.90, 41.00, 177.00, '2026-05-20 04:21:03'),
(2, 11, 1, 23.90, 41.00, 54.00, '2026-05-20 04:21:13'),
(3, 11, 1, 23.90, 41.00, 49.00, '2026-05-20 04:21:17'),
(4, 11, 1, 23.90, 41.00, 46.00, '2026-05-20 04:21:21'),
(5, 11, 1, 23.90, 41.00, 57.00, '2026-05-20 04:21:27'),
(6, 11, 1, 23.90, 41.00, 55.00, '2026-05-20 04:21:31'),
(7, 11, 1, 23.90, 41.00, 65.00, '2026-05-20 04:21:35'),
(8, 11, 1, 23.90, 41.00, 55.00, '2026-05-20 04:21:39'),
(9, 11, 1, 23.90, 41.00, 62.00, '2026-05-20 04:21:42'),
(10, 11, 1, 23.90, 41.00, 54.00, '2026-05-20 04:21:46'),
(11, 11, 1, 23.90, 41.00, 53.00, '2026-05-20 04:21:55'),
(12, 11, 1, 23.90, 41.00, 75.00, '2026-05-20 04:22:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id_user` int(11) NOT NULL,
  `Nama` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` enum('Admin','Analis','Publik') DEFAULT 'Publik',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `Created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id_user`, `Nama`, `Email`, `Password`, `Role`, `reset_token`, `reset_token_expiry`, `Created_at`) VALUES
(1, 'bima', 'Saktybima@test.com', '$2b$10$M964pxbMnR05IFfCLBJbSOsUdWG5DZnkNE0oSSuotMJp4WLy3/DVO', 'Publik', NULL, NULL, '2026-05-13 05:17:57'),
(2, 'Admin - Bima', 'MemanggilAdmin@test.com', '$2b$10$zs5iVa3DhmU9XZgiuOWMt.fry1wFzUoHgO5hNqxkkoJT4xSyv2.dK', 'Admin', NULL, NULL, '2026-05-16 07:40:57'),
(3, 'Analis - Bima', 'AnalisDatang@test.com', '$2b$10$VSXjhmW3oyXSoD4x83SsaODvH0emUd.zEurh9lKQp7qor4N7JG3W6', 'Analis', NULL, NULL, '2026-05-16 07:44:42');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`Id_lokasi`),
  ADD KEY `idx_nama_lokasi` (`Nama_lokasi`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`Id_report`),
  ADD KEY `idx_user` (`Id_user`),
  ADD KEY `idx_lokasi` (`Id_lokasi`);

--
-- Indexes for table `sensor`
--
ALTER TABLE `sensor`
  ADD PRIMARY KEY (`Id_sensor`),
  ADD KEY `idx_lokasi` (`Id_lokasi`),
  ADD KEY `idx_status` (`Status`);

--
-- Indexes for table `sensor_data`
--
ALTER TABLE `sensor_data`
  ADD PRIMARY KEY (`Id_data`),
  ADD KEY `idx_sensor` (`Id_sensor`),
  ADD KEY `idx_lokasi` (`Id_lokasi`),
  ADD KEY `idx_waktu` (`Waktu`),
  ADD KEY `idx_sensor_waktu` (`Id_sensor`,`Waktu`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id_user`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_email` (`Email`),
  ADD KEY `idx_role` (`Role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `Id_lokasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `Id_report` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sensor`
--
ALTER TABLE `sensor`
  MODIFY `Id_sensor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sensor_data`
--
ALTER TABLE `sensor_data`
  MODIFY `Id_data` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`Id_user`) REFERENCES `users` (`Id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `report_ibfk_2` FOREIGN KEY (`Id_lokasi`) REFERENCES `location` (`Id_lokasi`) ON DELETE CASCADE;

--
-- Constraints for table `sensor`
--
ALTER TABLE `sensor`
  ADD CONSTRAINT `sensor_ibfk_1` FOREIGN KEY (`Id_lokasi`) REFERENCES `location` (`Id_lokasi`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sensor_data`
--
ALTER TABLE `sensor_data`
  ADD CONSTRAINT `sensor_data_ibfk_1` FOREIGN KEY (`Id_sensor`) REFERENCES `sensor` (`Id_sensor`) ON DELETE CASCADE,
  ADD CONSTRAINT `sensor_data_ibfk_2` FOREIGN KEY (`Id_lokasi`) REFERENCES `location` (`Id_lokasi`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
