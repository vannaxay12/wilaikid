-- ============================================================
--  วิไลคิต — XAMPP / phpMyAdmin
--  Database: reactnew  (เปิดใน phpMyAdmin → เลือก reactnew → SQL)
--  MySQL port: 3306
-- ============================================================

-- ถ้ายังไม่มี database ให้ uncomment บรรทัดด้านล่าง:
-- CREATE DATABASE IF NOT EXISTS reactnew CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE reactnew;

-- ──────────────────────────────────────────────────────────
--  DROP (เพื่อ re-import ได้ซ้ำ)
-- ──────────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS inventory_receipt_items;
DROP TABLE IF EXISTS inventory_receipts;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS product_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- ──────────────────────────────────────────────────────────
--  MASTER DATA
-- ──────────────────────────────────────────────────────────

CREATE TABLE product_categories (
  category_id   INT          NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  description   TEXT,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE units (
  unit_id   INT         NOT NULL AUTO_INCREMENT,
  unit_name VARCHAR(50) NOT NULL,
  unit_abbr VARCHAR(20) NOT NULL,
  PRIMARY KEY (unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
  supplier_id    INT          NOT NULL AUTO_INCREMENT,
  supplier_name  VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  phone          VARCHAR(20),
  email          VARCHAR(100),
  address        TEXT,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE employees (
  employee_id   INT          NOT NULL AUTO_INCREMENT,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','cashier','stock') NOT NULL DEFAULT 'cashier',
  hire_date     DATE         NOT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  product_id      INT            NOT NULL AUTO_INCREMENT,
  barcode         VARCHAR(50)    UNIQUE,
  product_name    VARCHAR(200)   NOT NULL,
  category_id     INT            NOT NULL,
  unit_id         INT            NOT NULL,
  supplier_id     INT,
  cost_price      DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  selling_price   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  stock_qty       INT            NOT NULL DEFAULT 0,
  min_stock_level INT            NOT NULL DEFAULT 5,
  expiry_date     DATE,
  is_active       TINYINT(1)     NOT NULL DEFAULT 1,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  KEY idx_barcode   (barcode),
  KEY idx_category  (category_id),
  CONSTRAINT fk_prod_cat  FOREIGN KEY (category_id) REFERENCES product_categories(category_id),
  CONSTRAINT fk_prod_unit FOREIGN KEY (unit_id)     REFERENCES units(unit_id),
  CONSTRAINT fk_prod_sup  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────────────────
--  PURCHASING
-- ──────────────────────────────────────────────────────────

CREATE TABLE purchase_orders (
  po_id          INT            NOT NULL AUTO_INCREMENT,
  po_number      VARCHAR(30)    NOT NULL UNIQUE,
  supplier_id    INT            NOT NULL,
  employee_id    INT            NOT NULL,
  order_date     DATE           NOT NULL,
  expected_date  DATE,
  status         ENUM('pending','confirmed','received','cancelled') NOT NULL DEFAULT 'pending',
  total_amount   DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  notes          TEXT,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (po_id),
  CONSTRAINT fk_po_sup  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  CONSTRAINT fk_po_emp  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE purchase_order_items (
  po_item_id  INT           NOT NULL AUTO_INCREMENT,
  po_id       INT           NOT NULL,
  product_id  INT           NOT NULL,
  qty_ordered INT           NOT NULL,
  unit_cost   DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(12,2) GENERATED ALWAYS AS (qty_ordered * unit_cost) STORED,
  PRIMARY KEY (po_item_id),
  CONSTRAINT fk_poi_po   FOREIGN KEY (po_id)      REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_prod FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────────────────
--  INVENTORY RECEIPT
-- ──────────────────────────────────────────────────────────

CREATE TABLE inventory_receipts (
  receipt_id     INT         NOT NULL AUTO_INCREMENT,
  receipt_number VARCHAR(30) NOT NULL UNIQUE,
  po_id          INT,
  employee_id    INT         NOT NULL,
  received_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes          TEXT,
  PRIMARY KEY (receipt_id),
  CONSTRAINT fk_ir_po  FOREIGN KEY (po_id)       REFERENCES purchase_orders(po_id),
  CONSTRAINT fk_ir_emp FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_receipt_items (
  ri_item_id   INT           NOT NULL AUTO_INCREMENT,
  receipt_id   INT           NOT NULL,
  product_id   INT           NOT NULL,
  qty_received INT           NOT NULL,
  unit_cost    DECIMAL(10,2) NOT NULL,
  subtotal     DECIMAL(12,2) GENERATED ALWAYS AS (qty_received * unit_cost) STORED,
  PRIMARY KEY (ri_item_id),
  CONSTRAINT fk_rii_rec  FOREIGN KEY (receipt_id) REFERENCES inventory_receipts(receipt_id) ON DELETE CASCADE,
  CONSTRAINT fk_rii_prod FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────────────────
--  SALES / POS
-- ──────────────────────────────────────────────────────────

CREATE TABLE sales (
  sale_id        INT            NOT NULL AUTO_INCREMENT,
  receipt_number VARCHAR(30)    NOT NULL UNIQUE,
  employee_id    INT            NOT NULL,
  sale_datetime  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal       DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  discount       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  total_amount   DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  amount_paid    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  change_amount  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  payment_method ENUM('cash','transfer','other') NOT NULL DEFAULT 'cash',
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sale_id),
  KEY idx_sale_date (sale_datetime),
  CONSTRAINT fk_sale_emp FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sale_items (
  sale_item_id INT           NOT NULL AUTO_INCREMENT,
  sale_id      INT           NOT NULL,
  product_id   INT           NOT NULL,
  qty          INT           NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  subtotal     DECIMAL(12,2) GENERATED ALWAYS AS (qty * unit_price) STORED,
  PRIMARY KEY (sale_item_id),
  CONSTRAINT fk_si_sale FOREIGN KEY (sale_id)    REFERENCES sales(sale_id) ON DELETE CASCADE,
  CONSTRAINT fk_si_prod FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ──────────────────────────────────────────────────────────
--  TRIGGER — อัปเดต total_amount ใน purchase_orders
-- ──────────────────────────────────────────────────────────

DELIMITER $$
CREATE TRIGGER trg_po_total_insert
AFTER INSERT ON purchase_order_items FOR EACH ROW
BEGIN
  UPDATE purchase_orders SET total_amount=(
    SELECT COALESCE(SUM(subtotal),0) FROM purchase_order_items WHERE po_id=NEW.po_id
  ) WHERE po_id=NEW.po_id;
END$$

CREATE TRIGGER trg_po_total_update
AFTER UPDATE ON purchase_order_items FOR EACH ROW
BEGIN
  UPDATE purchase_orders SET total_amount=(
    SELECT COALESCE(SUM(subtotal),0) FROM purchase_order_items WHERE po_id=NEW.po_id
  ) WHERE po_id=NEW.po_id;
END$$
DELIMITER ;

-- ──────────────────────────────────────────────────────────
--  SEED DATA
-- ──────────────────────────────────────────────────────────

INSERT INTO product_categories (category_name, description) VALUES
('เครื่องดื่ม',       'น้ำอัดลม น้ำผลไม้ ชา กาแฟ'),
('ขนมขบเคี้ยว',       'มันฝรั่ง ข้าวโพด บิสกิต'),
('ของใช้ครัวเรือน',   'สบู่ ยาสีฟัน แชมพู'),
('อาหารสำเร็จรูป',    'บะหมี่กึ่งสำเร็จรูป'),
('นมและผลิตภัณฑ์นม',  'นมสด โยเกิร์ต');

INSERT INTO units (unit_name, unit_abbr) VALUES
('ชิ้น','ชิ้น'),('กล่อง','กล่อง'),('ขวด','ขวด'),('แพ็ค','แพ็ค'),('โหล','โหล');

INSERT INTO suppliers (supplier_name, contact_person, phone) VALUES
('บริษัท เจริญโภคภัณฑ์ จำกัด','สมชาย ใจดี','02-111-1111'),
('บริษัท ยูนิลีเวอร์ ไทย จำกัด','สมศรี รักดี','02-222-2222');

-- ──────────────────────────────────────────────────────────
--  DEFAULT USERS
--  admin   / admin1234
--  cashier / cash1234
-- ──────────────────────────────────────────────────────────
INSERT INTO employees (first_name,last_name,phone,username,password_hash,role,hire_date) VALUES
('วิไล','คิต','081-000-0001','admin',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password: password (bcrypt)
 'admin','2023-01-01'),
('สมศรี','ใจดี','081-000-0002','cashier',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password: password
 'cashier','2024-03-01');

-- NOTE: รหัสผ่านทั้งคู่คือ "password"
-- เปลี่ยนรหัสผ่านได้ที่หน้า Employees ในระบบ

INSERT INTO products (barcode,product_name,category_id,unit_id,supplier_id,cost_price,selling_price,stock_qty,min_stock_level) VALUES
('8850006310308','น้ำดื่มสิงห์ 600ml',1,3,1, 5.00,  8.00, 100, 20),
('8850999280606','เป๊ปซี่ กระป๋อง 325ml',1,1,1,10.00, 15.00,  60, 10),
('8850718110804','มาม่า ต้มยำกุ้ง',4,1,2, 4.50,  6.00, 200, 30),
('8850274000032','เลย์ คลาสสิก 75g',2,1,2,18.00, 25.00,  50, 10),
('8850006001186','นมไทย-เดนมาร์ค 200ml',5,1,1, 9.00, 13.00,  80, 15);
