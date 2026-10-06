-- ========================================================
-- JurisCore: Legal Case & Client Management System
-- Database: LegalCaseDB
-- Engine: MySQL 8.0+ / InnoDB
-- ========================================================

CREATE DATABASE IF NOT EXISTS LegalCaseDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE LegalCaseDB;

-- 1. Client Table
CREATE TABLE IF NOT EXISTS Client (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    dob DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Lawyer Table
CREATE TABLE IF NOT EXISTS Lawyer (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    specialization ENUM(
        'Criminal Law',
        'Civil Law',
        'Corporate Law',
        'Family Law',
        'Property Law',
        'Cyber Law',
        'Tax Law'
    ) NOT NULL,
    barNumber VARCHAR(50),
    experience VARCHAR(50),
    casesCount INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Judge Table
CREATE TABLE IF NOT EXISTS Judge (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    court VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    chamber VARCHAR(50),
    activeCases INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. LegalCase Table
CREATE TABLE IF NOT EXISTS LegalCase (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    clientId VARCHAR(20) NOT NULL,
    caseType VARCHAR(60) NOT NULL,
    lawyerId VARCHAR(20),
    judgeId VARCHAR(20),
    status ENUM('PENDING', 'ONGOING', 'COMPLETED') DEFAULT 'PENDING',
    filingDate DATE NOT NULL,
    court VARCHAR(150) NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    description TEXT,
    retainerAmount DECIMAL(12, 2) DEFAULT 0.00,
    paidAmount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_case_client FOREIGN KEY (clientId) REFERENCES Client(id) ON DELETE CASCADE,
    CONSTRAINT fk_case_lawyer FOREIGN KEY (lawyerId) REFERENCES Lawyer(id) ON DELETE SET NULL,
    CONSTRAINT fk_case_judge FOREIGN KEY (judgeId) REFERENCES Judge(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Hearing Table
CREATE TABLE IF NOT EXISTS Hearing (
    id VARCHAR(20) PRIMARY KEY,
    caseId VARCHAR(20) NOT NULL,
    judgeId VARCHAR(20),
    date DATE NOT NULL,
    time VARCHAR(30) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(30) DEFAULT 'Upcoming',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hearing_case FOREIGN KEY (caseId) REFERENCES LegalCase(id) ON DELETE CASCADE,
    CONSTRAINT fk_hearing_judge FOREIGN KEY (judgeId) REFERENCES Judge(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Payment Table
CREATE TABLE IF NOT EXISTS Payment (
    id VARCHAR(20) PRIMARY KEY,
    clientId VARCHAR(20),
    caseId VARCHAR(20) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    method ENUM('UPI', 'Cash', 'Bank Transfer') NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_client FOREIGN KEY (clientId) REFERENCES Client(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_case FOREIGN KEY (caseId) REFERENCES LegalCase(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Works_On Relationship Table
CREATE TABLE IF NOT EXISTS Works_On (
    lawyerId VARCHAR(20) NOT NULL,
    caseId VARCHAR(20) NOT NULL,
    role VARCHAR(80) DEFAULT 'Lead Counsel',
    hoursBilled DECIMAL(8, 2) DEFAULT 0.00,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lawyerId, caseId),
    CONSTRAINT fk_works_lawyer FOREIGN KEY (lawyerId) REFERENCES Lawyer(id) ON DELETE CASCADE,
    CONSTRAINT fk_works_case FOREIGN KEY (caseId) REFERENCES LegalCase(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for high-speed lookup
CREATE INDEX idx_client_email ON Client(email);
CREATE INDEX idx_case_status ON LegalCase(status);
CREATE INDEX idx_case_client ON LegalCase(clientId);
CREATE INDEX idx_hearing_date ON Hearing(date);
CREATE INDEX idx_payment_case ON Payment(caseId);
