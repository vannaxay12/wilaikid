-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 17, 2026 at 06:01 PM
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
-- Database: `reactnew`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `first_name`, `last_name`, `phone`, `email`, `username`, `password_hash`, `address`, `points`, `is_active`, `created_at`) VALUES
(1, 'fggs', 'dsds', '0204568525', 'cv@gmail.com', 'sdd', '$2a$10$dnQwTOB0fi4rMdmwkRJneeMAZFZBJvIULjfP9nmHTMmsRcUkn2KR.', NULL, 478, 1, '2026-07-06 21:37:42'),
(2, 'gdfgd', 'fgdfgd', '0204555555', 'vfgf@gmail.com', 'ffffff', '$2a$10$Q5yCThlamNmcQcG4PcQd5uw6an82BTRm/jHLjkdruv8gkkllfm5c.', NULL, 56, 1, '2026-07-12 23:12:32');

-- --------------------------------------------------------

--
-- Table structure for table `customer_orders`
--

CREATE TABLE `customer_orders` (
  `order_id` int(11) NOT NULL,
  `order_number` varchar(30) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','transfer') NOT NULL DEFAULT 'cash',
  `payment_status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `transfer_ref` varchar(100) DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_orders`
--

INSERT INTO `customer_orders` (`order_id`, `order_number`, `customer_id`, `total_amount`, `payment_method`, `payment_status`, `transfer_ref`, `status`, `notes`, `created_at`) VALUES
(1, 'ORD-20260706-8109', 1, 28000.00, 'cash', 'pending', NULL, 'completed', '', '2026-07-06 21:38:28'),
(2, 'ORD-20260706-2684', 1, 450000.00, 'cash', 'pending', NULL, 'completed', '', '2026-07-06 21:48:02'),
(3, 'ORD-20260717-9192', 2, 28000.00, 'cash', 'pending', NULL, 'completed', '', '2026-07-17 21:42:59'),
(4, 'ORD-20260717-7287', 2, 28000.00, 'cash', 'pending', NULL, 'completed', '', '2026-07-17 21:43:07');

-- --------------------------------------------------------

--
-- Table structure for table `customer_order_items`
--

CREATE TABLE `customer_order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`qty` * `unit_price`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_order_items`
--

INSERT INTO `customer_order_items` (`item_id`, `order_id`, `product_id`, `qty`, `unit_price`) VALUES
(1, 1, 10, 1, 28000.00),
(2, 2, 11, 10, 45000.00),
(3, 3, 10, 1, 28000.00),
(4, 4, 10, 1, 28000.00);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','cashier','stock') NOT NULL DEFAULT 'cashier',
  `hire_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `approval_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  `requested_role` enum('cashier','stock') NOT NULL DEFAULT 'cashier',
  `reject_reason` varchar(255) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `first_name`, `last_name`, `phone`, `profile_image`, `username`, `password_hash`, `role`, `hire_date`, `is_active`, `approval_status`, `requested_role`, `reject_reason`, `approved_by`, `approved_at`, `created_at`) VALUES
(1, 'Admin', 'ຮ້ານ', '020-000-0001', NULL, 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2026-01-01', 1, 'approved', 'cashier', NULL, NULL, NULL, '2026-07-05 21:35:40'),
(2, 'ແຄດ', 'ເຊຍ', '020-000-0002', NULL, 'cashier1', '$2a$10$7EhvEqSrepudMwQ8TnVvfunpPQ8Mul//xKpWMQeh/q0e.x9IpqfU2', 'cashier', '2026-01-01', 1, 'approved', 'cashier', NULL, NULL, NULL, '2026-07-05 21:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_receipts`
--

CREATE TABLE `inventory_receipts` (
  `receipt_id` int(11) NOT NULL,
  `receipt_number` varchar(30) NOT NULL,
  `po_id` int(11) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `received_at` datetime NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_receipts`
--

INSERT INTO `inventory_receipts` (`receipt_id`, `receipt_number`, `po_id`, `employee_id`, `received_at`, `notes`) VALUES
(1, 'RCV-20260703-0001', NULL, 1, '2026-07-05 22:28:11', 'ນຳເຂົ້າສິນຄ້າເລີ່ມຕົ້ນ');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_receipt_items`
--

CREATE TABLE `inventory_receipt_items` (
  `ri_item_id` int(11) NOT NULL,
  `receipt_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty_received` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`qty_received` * `unit_cost`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_receipt_items`
--

INSERT INTO `inventory_receipt_items` (`ri_item_id`, `receipt_id`, `product_id`, `qty_received`, `unit_cost`) VALUES
(1, 1, 10, 29, 25000.00),
(2, 1, 1, 25, 18000.00),
(3, 1, 2, 25, 18000.00),
(4, 1, 6, 20, 18000.00),
(5, 1, 7, 30, 13000.00),
(6, 1, 5, 25, 20000.00),
(7, 1, 11, 20, 40000.00),
(8, 1, 12, 40, 3500.00),
(9, 1, 4, 6, 35000.00),
(10, 1, 3, 28, 33000.00),
(11, 1, 8, 12, 26000.00),
(12, 1, 9, 25, 13000.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `category_id` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_qty` int(11) NOT NULL DEFAULT 0,
  `min_stock_level` int(11) NOT NULL DEFAULT 5,
  `expiry_date` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `barcode`, `product_name`, `category_id`, `unit_id`, `supplier_id`, `cost_price`, `selling_price`, `stock_qty`, `min_stock_level`, `expiry_date`, `image`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '8850001', 'ນ້ຳຕານຂາວ', 1, 1, NULL, 18000.00, 20000.00, 50, 10, NULL, '/uploads/products/prod_1784298809910.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:33:29'),
(2, '8850002', 'ນ້ຳຕານແດງ', 1, 3, NULL, 18000.00, 20000.00, 50, 5, NULL, '/uploads/products/prod_1784298848783.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:34:09'),
(3, '8850003', 'ແປງນົວກາບ່ວງ', 1, 1, NULL, 33000.00, 35000.00, 56, 10, NULL, '/uploads/products/prod_1784299117670.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:38:37'),
(4, '8850004', 'ແປງນົວກາຖ້ວຍ', 1, 6, NULL, 35000.00, 45000.00, 12, 10, NULL, '/uploads/products/prod_1784299128461.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:38:48'),
(5, '8850005', 'ນ້ຳປາແກ້ວ', 1, 1, NULL, 20000.00, 22000.00, 50, 8, NULL, '/uploads/products/prod_1784298924001.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:35:24'),
(6, '8850006', 'ນ້ຳປາຍາງ', 1, 1, NULL, 18000.00, 20000.00, 40, 15, NULL, '/uploads/products/prod_1784298875709.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:34:35'),
(7, '8850007', 'ນ້ຳປານ້ອຍ', 1, 3, 2, 13000.00, 15000.00, 60, 12, NULL, '/uploads/products/prod_1784298904422.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:35:04'),
(8, '8850008', 'ແມັກກີ', 1, 5, NULL, 26000.00, 28000.00, 24, 5, NULL, '/pictures/แม็กกี้ใหย่.jpg', 1, '2026-07-05 21:35:41', '2026-07-05 22:28:12'),
(9, '8850009', 'ແມັກກີນ້ອຍ', 1, 3, NULL, 13000.00, 15000.00, 50, 6, NULL, '/uploads/products/prod_1784299061597.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:37:41'),
(10, '8850010', 'ຊອດແມ່ພອຍ', 1, 5, NULL, 25000.00, 28000.00, 55, 5, NULL, '/uploads/products/prod_1783871855908.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:43:56'),
(11, '8850011', 'ນ້ຳມັນກຸກ', 1, 1, NULL, 40000.00, 45000.00, 30, 4, NULL, '/uploads/products/prod_1784298941166.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:35:41'),
(12, '8850012', 'ໄວໄວ', 1, 1, NULL, 3500.00, 5000.00, 80, 15, NULL, '/uploads/products/prod_1784299037593.jpg', 1, '2026-07-05 21:35:41', '2026-07-17 21:37:17');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`category_id`, `category_name`, `description`, `created_at`) VALUES
(1, 'ເຄື່ອງປຸງ', NULL, '2026-07-05 21:35:39');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `po_id` int(11) NOT NULL,
  `po_number` varchar(30) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `expected_date` date DEFAULT NULL,
  `status` enum('pending','confirmed','received','cancelled') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `po_item_id` int(11) NOT NULL,
  `po_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty_ordered` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`qty_ordered` * `unit_cost`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `sale_id` int(11) NOT NULL,
  `receipt_number` varchar(30) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `sale_datetime` datetime NOT NULL DEFAULT current_timestamp(),
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','transfer','other') NOT NULL DEFAULT 'cash',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`sale_id`, `receipt_number`, `employee_id`, `sale_datetime`, `subtotal`, `discount`, `total_amount`, `amount_paid`, `change_amount`, `payment_method`, `created_at`) VALUES
(1, 'RCP-TEST-0001', 1, '2026-07-06 10:00:00', 45000.00, 0.00, 45000.00, 50000.00, 5000.00, 'cash', '2026-07-06 21:56:04'),
(2, 'RCP-TEST-0002', 1, '2026-07-06 11:00:00', 28000.00, 0.00, 28000.00, 30000.00, 2000.00, 'cash', '2026-07-06 21:56:04'),
(3, 'RCP-TEST-0003', 1, '2026-07-06 14:00:00', 35000.00, 0.00, 35000.00, 35000.00, 0.00, 'transfer', '2026-07-06 21:56:04'),
(4, 'RCP-TODAY-0001', 1, '2026-07-17 22:33:32', 65000.00, 0.00, 65000.00, 100000.00, 35000.00, 'cash', '2026-07-17 22:33:32'),
(7, 'RCP-20260717-223516', 1, '2026-07-17 22:35:16', 62000.00, 0.00, 62000.00, 100000.00, 38000.00, 'cash', '2026-07-17 22:35:16'),
(8, 'RCP-20260717-223522', 1, '2026-07-17 22:35:22', 62000.00, 0.00, 62000.00, 100000.00, 38000.00, 'cash', '2026-07-17 22:35:22');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `sale_item_id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`qty` * `unit_price`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`sale_item_id`, `sale_id`, `product_id`, `qty`, `unit_price`) VALUES
(1, 1, 1, 2, 20000.00),
(2, 1, 2, 1, 5000.00),
(3, 2, 3, 1, 28000.00),
(4, 3, 5, 1, 22000.00),
(5, 3, 6, 1, 13000.00),
(6, 4, 1, 2, 20000.00),
(7, 4, 5, 1, 22000.00),
(8, 7, 1, 2, 20000.00),
(9, 7, 5, 1, 22000.00),
(10, 8, 1, 2, 20000.00),
(11, 8, 5, 1, 22000.00);

-- --------------------------------------------------------

--
-- Table structure for table `shop_settings`
--

CREATE TABLE `shop_settings` (
  `key` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shop_settings`
--

INSERT INTO `shop_settings` (`key`, `value`, `updated_at`) VALUES
('bank_bcel', '010-XXXX-XXXX-XXX', '2026-07-05 21:35:41'),
('bank_ldb', '020-XXXX-XXXX-XXX', '2026-07-05 21:35:41'),
('qr_bcel', NULL, '2026-07-05 21:35:41'),
('qr_ldb', NULL, '2026-07-05 21:35:41'),
('shop_name', 'ຮ້ານຂອງໝູ່', '2026-07-05 21:35:41');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `supplier_name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `supplier_name`, `contact_person`, `phone`, `email`, `address`, `is_active`, `created_at`) VALUES
(1, 'ຜູ້ສະໜອງທົ່ວໄປ', NULL, NULL, NULL, NULL, 1, '2026-07-05 21:35:40'),
(2, 'ຜູ້ສະໜອງ 2', NULL, NULL, NULL, NULL, 1, '2026-07-05 21:35:40');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `unit_id` int(11) NOT NULL,
  `unit_name` varchar(50) NOT NULL,
  `unit_abbr` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`unit_id`, `unit_name`, `unit_abbr`) VALUES
(1, 'ຖົງ', 'ຖົງ'),
(2, 'ກ່ອງ', 'ກ່ອງ'),
(3, 'ຕຸກ', 'ຕຸກ'),
(4, 'ອັນ', 'ອັນ'),
(5, 'ກິໂລ', 'ກກ'),
(6, 'ແກດ', 'ແກດ'),
(7, 'ລັງ', 'ລັງ'),
(8, 'ຂວດ', 'ຂວດ'),
(9, 'ປ່ອງ', 'ປ່ອງ'),
(10, 'ແຕະ', 'ແຕະ');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `customer_orders`
--
ALTER TABLE `customer_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `fk_co_cust` (`customer_id`);

--
-- Indexes for table `customer_order_items`
--
ALTER TABLE `customer_order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_coi_order` (`order_id`),
  ADD KEY `fk_coi_prod` (`product_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `inventory_receipts`
--
ALTER TABLE `inventory_receipts`
  ADD PRIMARY KEY (`receipt_id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `fk_ir_emp` (`employee_id`);

--
-- Indexes for table `inventory_receipt_items`
--
ALTER TABLE `inventory_receipt_items`
  ADD PRIMARY KEY (`ri_item_id`),
  ADD KEY `fk_rii_rec` (`receipt_id`),
  ADD KEY `fk_rii_prod` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `fk_prod_cat` (`category_id`),
  ADD KEY `fk_prod_unit` (`unit_id`),
  ADD KEY `fk_prod_sup` (`supplier_id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`po_id`),
  ADD UNIQUE KEY `po_number` (`po_number`),
  ADD KEY `fk_po_emp` (`employee_id`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`po_item_id`),
  ADD KEY `fk_poi_po` (`po_id`),
  ADD KEY `fk_poi_prod` (`product_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sale_id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `fk_sale_emp` (`employee_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`sale_item_id`),
  ADD KEY `fk_si_sale` (`sale_id`),
  ADD KEY `fk_si_prod` (`product_id`);

--
-- Indexes for table `shop_settings`
--
ALTER TABLE `shop_settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`unit_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customer_orders`
--
ALTER TABLE `customer_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer_order_items`
--
ALTER TABLE `customer_order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `inventory_receipts`
--
ALTER TABLE `inventory_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_receipt_items`
--
ALTER TABLE `inventory_receipt_items`
  MODIFY `ri_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `po_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `po_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sale_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `sale_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `unit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customer_orders`
--
ALTER TABLE `customer_orders`
  ADD CONSTRAINT `fk_co_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

--
-- Constraints for table `customer_order_items`
--
ALTER TABLE `customer_order_items`
  ADD CONSTRAINT `fk_coi_order` FOREIGN KEY (`order_id`) REFERENCES `customer_orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_coi_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `inventory_receipts`
--
ALTER TABLE `inventory_receipts`
  ADD CONSTRAINT `fk_ir_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `inventory_receipt_items`
--
ALTER TABLE `inventory_receipt_items`
  ADD CONSTRAINT `fk_rii_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_rii_rec` FOREIGN KEY (`receipt_id`) REFERENCES `inventory_receipts` (`receipt_id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_prod_cat` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`category_id`),
  ADD CONSTRAINT `fk_prod_sup` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  ADD CONSTRAINT `fk_prod_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`unit_id`);

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `fk_po_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `fk_poi_po` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_poi_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sale_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `fk_si_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`sale_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;