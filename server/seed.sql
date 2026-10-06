-- ========================================================
-- JurisCore: Initial Database Seeds
-- Database: LegalCaseDB
-- ========================================================

USE LegalCaseDB;

-- 1. Seed Clients (20 Records)
INSERT INTO Client (id, name, phone, email, address, dob, notes, status) VALUES
('CLI-1001', 'Alexander Vance', '+1 (555) 234-5678', 'a.vance@vancetech.io', '742 Evergreen Terrace, New York, NY 10001', '1982-04-14', 'Corporate founder, ongoing trademark dispute', 'Active'),
('CLI-1002', 'Beatrice Montgomery', '+1 (555) 345-6789', 'bmontgomery@heraldgroup.com', '108 Ocean Drive, Boston, MA 02110', '1976-11-23', 'Commercial real estate lease dispute', 'Active'),
('CLI-1003', 'Carlos Mendoza', '+1 (555) 456-7890', 'carlos.mendoza@solarenergy.net', '512 Pinecrest Blvd, Chicago, IL 60601', '1989-08-02', 'Cross-border breach of supplier contract', 'Active'),
('CLI-1004', 'Diana Sterling', '+1 (555) 567-8901', 'diana.sterling@sterlingcap.com', '12 Wall Street, Penthouse 4, New York, NY 10005', '1971-03-30', 'Hedge fund SEC compliance dispute', 'Active'),
('CLI-1005', 'Evan Thorne', '+1 (555) 678-9012', 'ethorne@thornebiotech.org', '88 Biotech Way, San Francisco, CA 94107', '1985-12-15', 'Patent infringement in gene-editing diagnostics', 'Active'),
('CLI-1006', 'Fiona Gallagher-Reid', '+1 (555) 789-0123', 'fiona.reid@galreid.co', '414 Maple Avenue, Seattle, WA 98101', '1990-06-19', 'Shareholder appraisal arbitration', 'Active'),
('CLI-1007', 'Gabriel Dupont', '+1 (555) 890-1234', 'g.dupont@aerodynamics.fr', '2300 Aerospace Pkwy, Austin, TX 78701', '1968-09-09', 'Aviation hardware warranty defense', 'Active'),
('CLI-1008', 'Helena Rostova', '+1 (555) 901-2345', 'h.rostova@maritimetrade.org', '33 Harbour Point, Miami, FL 33130', '1983-01-25', 'Admiralty law cargo spillage claims', 'Active'),
('CLI-1009', 'Ian MacIntyre', '+1 (555) 012-3456', 'ian.mac@scotishlogistics.com', '900 Industrial Loop, Denver, CO 80202', '1974-07-04', 'Interstate freight carrier regulatory defense', 'Active'),
('CLI-1010', 'Jacqueline Wu', '+1 (555) 123-4560', 'j.wu@quantumai.dev', '650 Silicon Expressway, San Jose, CA 95112', '1992-10-11', 'Trade secrets and non-compete enforcement', 'Active'),
('CLI-1011', 'Karan Johar Sharma', '+1 (555) 234-5671', 'karan.sharma@indianglobal.in', '120 Lexington Ave, Jersey City, NJ 07302', '1987-05-22', 'Software export transfer pricing assessment', 'Active'),
('CLI-1012', 'Laura Kensington', '+1 (555) 345-6782', 'lkensington@kensingtonestate.co.uk', '55 Park Lane, Greenwich, CT 06830', '1965-02-18', 'Family trust reformation and probate', 'Active'),
('CLI-1013', 'Marcus Aurelius Bell', '+1 (555) 456-7893', 'marcus.bell@titansteel.com', '1400 Forge St, Pittsburgh, PA 15222', '1979-09-14', 'Environmental EPA compliance settlement', 'Active'),
('CLI-1014', 'Nadia Al-Mansoor', '+1 (555) 567-8904', 'nadia@gulfventures.ae', '700 Constitution Ave, Washington, DC 20002', '1984-12-01', 'Foreign direct investment sanctions review', 'Active'),
('CLI-1015', 'Oliver Sinclair', '+1 (555) 678-9015', 'osinclair@heritagepublishers.com', '880 Broadway, New York, NY 10003', '1978-06-08', 'Copyright infringement on digital publishing rights', 'Active'),
('CLI-1016', 'Priscilla O\'Connell', '+1 (555) 789-0126', 'priscilla@cloverpharma.ie', '400 Discovery Drive, Philadelphia, PA 19104', '1981-08-29', 'Clinical trial data disclosure inquiry', 'Active'),
('CLI-1017', 'Quentin Morales', '+1 (555) 890-1237', 'qmorales@andesmineral.cl', '2100 Summit Ridge, Salt Lake City, UT 84111', '1973-10-05', 'Subsurface mineral rights title clearing', 'Active'),
('CLI-1018', 'Rachel Goldman', '+1 (555) 901-2348', 'rachel.goldman@fintechguard.io', '350 Hudson Street, New York, NY 10014', '1991-03-17', 'Consumer credit privacy class action defense', 'Active'),
('CLI-1019', 'Samuel Tanaka', '+1 (555) 012-3459', 's.tanaka@pacificinfra.jp', '1800 Harbor Ave SW, Seattle, WA 98116', '1969-11-12', 'Port dredging joint venture partnership dissolution', 'Active'),
('CLI-1020', 'Theresa Lindqvist', '+1 (555) 123-4569', 't.lindqvist@nordicenergy.se', '950 Windmill Point, Portland, OR 97201', '1986-07-27', 'Offshore wind farm federal lease permitting', 'Active');

-- 2. Seed Lawyers (20 Records)
INSERT INTO Lawyer (id, name, phone, email, specialization, barNumber, experience, casesCount, status) VALUES
('LAW-2001', 'Eleanor Vance, Esq.', '+1 (555) 910-4401', 'eleanor.vance@juriscore.law', 'Corporate Law', 'NY-492019', '16 years', 6, 'Active'),
('LAW-2002', 'Marcus Thorne, Esq.', '+1 (555) 910-4402', 'marcus.thorne@juriscore.law', 'Criminal Law', 'MA-331092', '14 years', 5, 'Active'),
('LAW-2003', 'Siddharth Mehta, Esq.', '+1 (555) 910-4403', 'siddharth.mehta@juriscore.law', 'Cyber Law', 'CA-882190', '11 years', 4, 'Active'),
('LAW-2004', 'Claire DeWitt, Esq.', '+1 (555) 910-4404', 'claire.dewitt@juriscore.law', 'Civil Law', 'IL-672901', '12 years', 5, 'Active'),
('LAW-2005', 'Jonathan Sterling, Esq.', '+1 (555) 910-4405', 'jonathan.sterling@juriscore.law', 'Property Law', 'NY-501934', '18 years', 4, 'Active'),
('LAW-2006', 'Amara Okonjo, Esq.', '+1 (555) 910-4406', 'amara.okonjo@juriscore.law', 'Tax Law', 'DC-109283', '9 years', 3, 'Active'),
('LAW-2007', 'Vivian H. Hayes, Esq.', '+1 (555) 910-4407', 'vivian.hayes@juriscore.law', 'Family Law', 'CT-782012', '15 years', 4, 'Active'),
('LAW-2008', 'Julian Rivera, Esq.', '+1 (555) 910-4408', 'julian.rivera@juriscore.law', 'Corporate Law', 'TX-440918', '13 years', 5, 'Active'),
('LAW-2009', 'Genevieve Moreau, Esq.', '+1 (555) 910-4409', 'genevieve.moreau@juriscore.law', 'Cyber Law', 'WA-661209', '10 years', 4, 'Active'),
('LAW-2010', 'Devon Fitzpatrick, Esq.', '+1 (555) 910-4410', 'devon.fitz@juriscore.law', 'Criminal Law', 'PA-309184', '8 years', 3, 'Active'),
('LAW-2011', 'Aisha Al-Hashimi, Esq.', '+1 (555) 910-4411', 'aisha.hashimi@juriscore.law', 'Property Law', 'FL-902384', '14 years', 4, 'Active'),
('LAW-2012', 'Lucas Brennan, Esq.', '+1 (555) 910-4412', 'lucas.brennan@juriscore.law', 'Tax Law', 'CO-551982', '12 years', 3, 'Active'),
('LAW-2013', 'Miriam Chen, Esq.', '+1 (555) 910-4413', 'miriam.chen@juriscore.law', 'Civil Law', 'CA-994018', '17 years', 4, 'Active'),
('LAW-2014', 'Harrison Brooks, Esq.', '+1 (555) 910-4414', 'harrison.brooks@juriscore.law', 'Corporate Law', 'NY-281903', '7 years', 3, 'Active'),
('LAW-2015', 'Nadine Dubois, Esq.', '+1 (555) 910-4415', 'nadine.dubois@juriscore.law', 'Family Law', 'MA-774012', '11 years', 4, 'Active'),
('LAW-2016', 'Rajesh Kothari, Esq.', '+1 (555) 910-4416', 'rajesh.kothari@juriscore.law', 'Criminal Law', 'IL-449102', '15 years', 3, 'Active'),
('LAW-2017', 'Seraphina Locke, Esq.', '+1 (555) 910-4417', 'seraphina.locke@juriscore.law', 'Property Law', 'UT-189204', '13 years', 3, 'Active'),
('LAW-2018', 'Vikram Malhotra, Esq.', '+1 (555) 910-4418', 'vikram.malhotra@juriscore.law', 'Cyber Law', 'OR-662901', '10 years', 4, 'Active'),
('LAW-2019', 'Penelope Wright, Esq.', '+1 (555) 910-4419', 'penelope.wright@juriscore.law', 'Civil Law', 'VA-883019', '16 years', 3, 'Active'),
('LAW-2020', 'Tobias Lindt, Esq.', '+1 (555) 910-4420', 'tobias.lindt@juriscore.law', 'Tax Law', 'NJ-339018', '9 years', 2, 'Active');

-- 3. Seed Judges
INSERT INTO Judge (id, name, court, phone, email, chamber, activeCases) VALUES
('JDG-3001', 'Hon. Margaret C. Holloway', 'Commercial Court, Southern District', '+1 (555) 441-8801', 'm.holloway@courts.gov', 'Chamber 14-B', 8),
('JDG-3002', 'Hon. Arthur Pendelton', 'Supreme Court (Appellate Division)', '+1 (555) 441-8802', 'a.pendelton@courts.gov', 'Chamber 22-A', 6),
('JDG-3003', 'Hon. Evelyn Mercer', 'High Court of Chancery', '+1 (555) 441-8803', 'e.mercer@courts.gov', 'Chamber 08-C', 7),
('JDG-3004', 'Hon. Samuel O\'Reilly', 'District Court, 2nd Circuit', '+1 (555) 441-8804', 's.oreilly@courts.gov', 'Chamber 04-F', 5),
('JDG-3005', 'Hon. Patricia K. Lawson', 'Family Court of Metropolitan County', '+1 (555) 441-8805', 'p.lawson@courts.gov', 'Chamber 06-D', 4),
('JDG-3006', 'Hon. Victor H. Sterling', 'Federal Cyber & Intellectual Property Tribunal', '+1 (555) 441-8806', 'v.sterling@courts.gov', 'Chamber 11-A', 4);

-- 4. Seed Legal Cases
INSERT INTO LegalCase (id, title, clientId, caseType, lawyerId, judgeId, status, filingDate, court, priority, description, retainerAmount, paidAmount) VALUES
('CAS-5001', 'Vance Technologies v. Helix Innovations Corp.', 'CLI-1001', 'Corporate Law', 'LAW-2001', 'JDG-3001', 'ONGOING', '2026-02-12', 'Commercial Court, Southern District', 'High', 'Dispute concerning unauthorized reverse engineering and commercial deployment of proprietary neural network algorithms under an expired master services agreement.', 25000, 25000),
('CAS-5002', 'Commonwealth v. Montgomery Logistics', 'CLI-1002', 'Civil Law', 'LAW-2004', 'JDG-3004', 'PENDING', '2026-03-01', 'District Court, 2nd Circuit', 'Medium', 'Action to enforce commercial tenancy terms and remediate alleged dock warehouse violations across waterfront parcel 19-E.', 18000, 12000),
('CAS-5003', 'Mendoza Solar v. Atlas Inverters International', 'CLI-1003', 'Corporate Law', 'LAW-2008', 'JDG-3001', 'ONGOING', '2026-01-18', 'Commercial Court, Southern District', 'High', 'Breach of warranty claims concerning defective three-phase grid inverters causing $4.2M in grid interconnection delays.', 32000, 32000),
('CAS-5004', 'SEC Inquiry regarding Sterling Alpha Global Master Fund', 'CLI-1004', 'Tax Law', 'LAW-2006', 'JDG-3002', 'PENDING', '2026-03-14', 'Supreme Court (Appellate Division)', 'High', 'Regulatory defense and voluntary disclosure concerning automated algorithmic block trading execution timing and wash-trade filters.', 45000, 45000),
('CAS-5005', 'Thorne Biosciences v. CRISPR Core Technologies', 'CLI-1005', 'Cyber Law', 'LAW-2003', 'JDG-3006', 'ONGOING', '2025-11-09', 'Federal Cyber & Intellectual Property Tribunal', 'Urgent', 'Patent priority contest regarding RNA sequence barcoding methods and computational molecular folding models.', 50000, 50000),
('CAS-5006', 'In re Gallagher-Reid Trust Reformation', 'CLI-1006', 'Family Law', 'LAW-2007', 'JDG-3005', 'COMPLETED', '2025-08-14', 'Family Court of Metropolitan County', 'Low', 'Successful judicial modification of generation-skipping dynasty trust terms with court approval for independent trustee appointment.', 16000, 16000),
('CAS-5007', 'Dupont Aerodynamics v. TransGlobal Express Fleet', 'CLI-1007', 'Property Law', 'LAW-2005', 'JDG-3003', 'ONGOING', '2026-02-04', 'High Court of Chancery', 'Medium', 'Aviation hangar real property easement enforcement and noise mitigation covenant review.', 22000, 15000),
('CAS-5008', 'Maritime Authority v. Rostova Shipping Line', 'CLI-1008', 'Civil Law', 'LAW-2013', 'JDG-3004', 'PENDING', '2026-03-20', 'District Court, 2nd Circuit', 'High', 'Admiralty limitation of liability proceeding following container cargo shifting incident during Atlantic passage.', 28000, 14000);

-- 5. Seed Hearings
INSERT INTO Hearing (id, caseId, judgeId, date, time, location, status, notes) VALUES
('HRG-7001', 'CAS-5001', 'JDG-3001', '2026-10-07', '10:00 AM', 'Courtroom 402, Federal Plaza', 'Upcoming', 'Oral arguments on Motion for Preliminary Injunction regarding source code escrow inspection.'),
('HRG-7002', 'CAS-5005', 'JDG-3006', '2026-10-07', '02:30 PM', 'Chamber 11-A, Tech Tribunal', 'Upcoming', 'Markman hearing on patent claim construction of sequence barcoding methodology.'),
('HRG-7003', 'CAS-5003', 'JDG-3001', '2026-10-09', '11:15 AM', 'Courtroom 402, Federal Plaza', 'Upcoming', 'Status conference on cross-border deposition scheduling of factory engineering leads.'),
('HRG-7004', 'CAS-5010', 'JDG-3006', '2026-10-12', '09:30 AM', 'Chamber 11-A, Tech Tribunal', 'Upcoming', 'Evidentiary hearing regarding digital forensics expert report on downloaded git commits.');

-- 6. Seed Payments
INSERT INTO Payment (id, clientId, caseId, amount, date, method, remarks) VALUES
('PAY-9001', 'CLI-1001', 'CAS-5001', 15000.00, '2026-10-02', 'Bank Transfer', 'Retainer tranche #2 - Federal Court Litigation filing fees & expert fees'),
('PAY-9002', 'CLI-1005', 'CAS-5005', 25000.00, '2026-10-01', 'Bank Transfer', 'Markman hearing preparation and patent counsel retainer'),
('PAY-9003', 'CLI-1003', 'CAS-5003', 12000.00, '2026-09-28', 'UPI', 'Overseas process service fee & expert witness deposit'),
('PAY-9004', 'CLI-1004', 'CAS-5004', 30000.00, '2026-09-24', 'Bank Transfer', 'SEC voluntary document production compliance retainer');

-- 7. Seed Works_On
INSERT INTO Works_On (lawyerId, caseId, role, hoursBilled) VALUES
('LAW-2001', 'CAS-5001', 'Lead Counsel', 142.00),
('LAW-2004', 'CAS-5002', 'Trial Counsel', 94.00),
('LAW-2008', 'CAS-5003', 'Commercial Contracts Lead', 156.00),
('LAW-2006', 'CAS-5004', 'Regulatory Tax Counsel', 180.00),
('LAW-2003', 'CAS-5005', 'Lead IP Litigator', 210.00),
('LAW-2007', 'CAS-5006', 'Trust Administrator', 85.00),
('LAW-2005', 'CAS-5007', 'Real Property Strategist', 112.00),
('LAW-2013', 'CAS-5008', 'Admiralty Counsel', 98.00);
