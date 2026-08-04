# MathBoxx Primary — Master Architecture & System Design Specification

> **System Name:** MathBoxx Primary  
> **Target Audience:** Primary School Mathematics Teachers (ป.1 - ป.6)  
> **Document Version:** 1.1.0  
> **Status:** Draft — Under Review  
> **Multi-App Strategy:** Multi-App Ready  

---

## 1. System Overview

MathBoxx Primary เป็นเว็บแอปพลิเคชันสำหรับครูผู้สอนวิชาคณิตศาสตร์ระดับประถมศึกษา (ป.1 - ป.6) ออกแบบขึ้นเพื่อลดเวลาและความซ้ำซ้อนในการจัดเตรียมใบงาน แบบฝึกหัด และข้อสอบ ผ่านเครื่องมือสร้างใบงานอัจฉริยะ คลังข้อสอบตรงตามหลักสูตรแกนกลาง และการส่งออกเอกสารที่พร้อมพิมพ์ได้ทันที

---

## 2. Goals & Core Functionality

### 2.1 Core Functionality & Scope (WHAT the system does)
- **Curriculum Navigation:** ค้นหาและดูเนื้อหาตามหลักสูตรวิชาคณิตศาสตร์ (ป.1 - ป.6)
- **Interactive Worksheet Generation:** เลือกสเปก สลับเรียง ปรับเปลี่ยน และสร้างใบงานคณิตศาสตร์ที่สมบูรณ์
- **Teacher Branding:** แสดงชื่อครู ชื่อโรงเรียน โลโก้โรงเรียน และลายน้ำส่วนตัวบนใบงาน
- **Question Reusability & Diversity:** คลังข้อสอบรองรับการใช้โจทย์ 1 ข้อในหลายใบงาน และรองรับโจทย์หลายรูปแบบ (ปรนัย, เติมคำ, จับคู่, แสดงวิธีทำ)
- **Dual Printing Output:** สั่งพิมพ์โดยตรงผ่านเบราว์เซอร์ และดาวน์โหลดไฟล์ PDF คุณภาพสูง
- **Subscription Management:** ควบคุมโควตาและฟีเจอร์การใช้งานตามแพ็กเกจสมาชิก (Free, Premium, Premium Pro)
- **Manual Payment Verification:** ชำระเงินผ่านการโอนธนาคาร อัปโหลดสลิป และอนุมัติสิทธิ์โดย Admin

### 2.2 Core Features Breakdown (HOW each feature works)
- **Worksheet Builder Wizard:** ครูทำงานผ่าน 3 ขั้นตอน: (1) เลือกบทเรียน ความยาก จำนวนข้อ -> (2) ตั้งค่าการแสดงผลส่วนหัวและลายน้ำ -> (3) ตรวจสอบ สลับข้อ หรือสุ่มเปลี่ยนโจทย์
- **A4 Layout & Watermark Engine:** ใช้ CSS `@media print` สำหรับพิมพ์ทันที และใช้ Dedicated PDF Engine ในการสร้างไฟล์ PDF ขนาด A4 (Portrait/Landscape) ที่จัดระยะขอบ การตัดหน้า (Page Break) หมายเลขหน้า ลายน้ำบางเบาทุกหน้า สระภาษาไทย และสัญลักษณ์คณิตศาสตร์คมชัด
- **Configurable Subscription Limits:** ระบบตรวจสอบขีดจำกัดจากตาราง `subscription_plans` ในฐานข้อมูล โดยคำนวณการใช้งานที่ถูกหักโควตาในรอบ billing period ปัจจุบันแยกตาม `user_id`, `app_id`, และ `action_type` จาก `usage_records` หากเกินโควตาจะแสดง Modal แจ้งเตือนอัปเกรด
- **Slip Upload & Approval Queue:** ครูส่งสลิปผ่านแบบฟอร์ม -> ระบบสร้างคำขอใน `payment_requests` (status: `pending`) -> Admin ตรวจสอบสลิป -> กด `approved` (อัปเดต Plan และสร้าง `payment_transactions` โดยจำกัด 1 payment_request ต่อ 1 transaction) หรือกด `rejected` (ระบุเหตุผล)
- **Multi-App Data Segregation:** ใช้คอลัมน์ `app_id` เชื่อมโยงข้อมูลรายวิชา คลังข้อสอบ ใบงาน และบันทึกการใช้งานเข้ากับตาราง `apps` รองรับการต่อขยายแอปพลิเคชันอื่นในอนาคต

---

## 3. Technology Architecture

```
+-----------------------------------------------------------------------------------+
|                                  FRONTEND LAYER                                   |
|   React + TypeScript + Vite + Tailwind CSS + Lucide Icons + Vitest                |
|   (Version must be selected based on stable and compatible versions available     |
|    at actual installation time.)                                                  |
+-----------------------------------------------------------------------------------+
                                         │
                                Supabase Client API
                                         ▼
+-----------------------------------------------------------------------------------+
|                                  BACKEND LAYER                                    |
|   Supabase Platform (PostgreSQL Engine + Auth Service + Storage Buckets)          |
|   - Row Level Security (RLS) Policies on all tables                               |
|   - Custom Database Security Functions (`is_admin()`)                             |
|   - Storage Buckets: `school-logos`, `payment-slips`                             |
+-----------------------------------------------------------------------------------+
                                         │
                                 Deployment Pipeline
                                         ▼
+-----------------------------------------------------------------------------------+
|                                HOSTING & CDN LAYER                                |
|   Vercel Edge Platform (Automated GitHub CI/CD Deployment + Global Edge Network)  |
+-----------------------------------------------------------------------------------+
```

| Component | Technology | Rationale & Specifications |
| :--- | :--- | :--- |
| **Frontend Core** | React + TypeScript + Vite | Version must be selected based on stable and compatible versions available at actual installation time. |
| **Styling Framework** | Tailwind CSS | สร้าง Design Tokens สีพาสเทล สดใส สะอาดตา สไตล์ Bright Friendly Modern Educational |
| **Icons & Assets** | Lucide React | ชุด Vector Icon ครบถ้วน น้ำหนักเบา และปรับแต่งขนาด/สีได้ง่าย |
| **Backend & Database** | PostgreSQL via Supabase | Relational integrity สูง, JSONB สำหรับ choices และ metadata, UUID Primary Keys |
| **Authentication** | Supabase Auth | รองรับ Email/Password, JWT Session Management, RLS integration |
| **Cloud Storage** | Supabase Storage | จัดเก็บรูปภาพสลิปโอนเงิน และโลโก้โรงเรียน พร้อม Access Control |
| **Hosting & CI/CD** | Vercel | Integration กับ GitHub/Vite, Edge CDN ให้ความเร็วในการโหลดสูง |

---

## 4. Application Structure

### 4.1 Public Pages
- `/` — **Landing Page**: แนะนำคุณสมบัติ ตัวอย่างใบงาน รีวิว และ Call to Action
- `/pricing` — **Pricing Page**: ตารางเปรียบเทียบ Subscription Plans (Free, Premium, Premium Pro)
- `/login` — **Login Page**: เข้าสู่ระบบสำหรับครูและ Admin
- `/register` — **Register Page**: สมัครสมาชิกใหม่
- `/forgot-password` — **Forgot Password Page**: ขอลิงก์ตั้งรหัสผ่านใหม่

### 4.2 Teacher Pages
- `/app/dashboard` — **Teacher Dashboard**: สรุปจำนวนใบงานที่สร้าง Quota การใช้งานคงเหลือ และข่าวสาร
- `/app/profile` — **Teacher Profile**: จัดการข้อมูลส่วนตัว ชื่อครู ชื่อโรงเรียน อัปโหลดโลโก้โรงเรียน ตั้งค่าลายน้ำ
- `/app/builder` — **Worksheet Builder**: เครื่องมือเลือกหลักสูตร/ระดับชั้น/จำนวนข้อ/ความยาก พรีวิว และปรับแต่งใบงาน
- `/app/worksheets` — **My Worksheets**: รายการใบงานที่เคยสร้าง ดู แก้ไข สั่งพิมพ์ หรือดาวน์โหลด PDF
- `/app/question-bank` — **Question Bank Browser**: คลังข้อสอบสำหรับครู (อ่านได้อย่างเดียว)
- `/app/subscription` — **Subscription Status**: ตรวจสอบแพ็กเกจปัจจุบัน ประวัติการซื้อ และปุ่มอัปเกรด
- `/app/payment` — **Payment Page**: แจ้งชำระเงิน พร้อมแบบฟอร์มอัปโหลด Slip
- `/app/settings` — **Account Settings**: ตั้งค่ารหัสผ่านและการแจ้งเตือน

### 4.3 Admin Pages
- `/admin` — **Admin Dashboard**: ภาพรวมระบบ จำนวนผู้ใช้ ยอดการชำระเงิน สถิติการสร้างใบงาน
- `/admin/users` — **User Management**: ค้นหา ดูรายละเอียด ปรับเปลี่ยน Plan หรือ Role ของผู้ใช้งาน
- `/admin/payments` — **Payment Approvals**: รายการแจ้งชำระเงิน ตรวจสอบ Slip อนุมัติ (Approve) หรือ ปฏิเสธ (Reject)
- `/admin/subscriptions` — **Subscription Management**: จัดการ Subscription Plans และ Quota limits
- `/admin/question-bank` — **Question Bank Management**: เพิ่ม แก้ไข ลบ จัดกลุ่ม และ Publish ข้อสอบ
- `/admin/curriculum` — **Curriculum Management**: จัดการ Subject, Grade, Unit, และ Lesson
- `/admin/usage-stats` — **Usage & Statistics**: รายงานเชิงลึกการใช้งานแยกตามรายวัน/รายเดือน/ประเภทกิจกรรม
- `/admin/settings` — **System Settings**: ตั้งค่าระบบทั่วไป ค่าบัญชีธนาคารสำหรับรับโอนเงิน

---

## 5. User Roles

1. **`teacher` (ผู้ใช้ทั่วไป / ครูผู้สอน)**
   - ค้นหาและดูโจทย์ในคลังข้อสอบ (`published`) ภายใต้แอปที่ได้รับสิทธิ์
   - สร้าง แก้ไข ลบ จัดเรียง พรีวิว และพิมพ์ใบงานของตนเอง
   - อัปโหลดโลโก้โรงเรียนและลายน้ำส่วนตัว (ตามสิทธิ์ Plan)
   - แจ้งชำระเงิน อัปโหลดสลิป และตรวจสอบสถานะแพ็กเกจ
2. **`admin` (ผู้ดูแลระบบ)**
   - จัดการหลักสูตร (Subjects, Grades, Units, Lessons) แบบ Full CRUD
   - จัดการคลังข้อสอบ (สร้าง แก้ไข ลบ Draft/Publish)
   - ตรวจสอบสลิปการโอนเงินและกดอนุมัติ (Approve) หรือปฏิเสธ (Reject)
   - บริหารจัดการผู้ใช้ ปรับเปลี่ยนแพ็กเกจ/โควตาแบบ Manual และดูสถิติระบบ

---

## 6. Curriculum Architecture

โครงสร้างหลักสูตรถูกออกแบบตามลำดับชั้น (Hierarchy) ที่ชัดเจน:

```
[Subject (วิชา)] ──► [Grade (ระดับชั้น ป.1 - ป.6)] ──► [Unit (หน่วยการเรียนรู้)] ──► [Lesson (บทเรียนย่อย)]
```

- **Subjects:** กลุ่มสาระวิชา เชื่อมโยงกับ `app_id` ( Composite Unique `(app_id, code)` )
- **Grades:** ระดับชั้นเรียน (ป.1 ถึง ป.6) กำหนดตัวเลขอ้างอิง `level_number` (1 - 6)
- **Units:** หน่วยการเรียนรู้ตามหลักสูตรแกนกลาง
- **Lessons:** บทเรียนย่อยภายใต้หน่วยการเรียนรู้ เป็นจุดอ้างอิงหลักในการเลือกโจทย์ข้อสอบ

---

## 7. Question Bank Architecture

### 7.1 Relationship & Reusability Chain

```
[Lesson (บทเรียนย่อย)] ──► [question_bank (คลังข้อสอบ)] ──► [worksheet_questions] ◄── [worksheets (ใบงาน)]
```

- **Reusability Model:** ข้อสอบ 1 ข้อใน `question_bank` สามารถถูกนำไปใช้ในหลายใบงานผ่านตารางกลาง `worksheet_questions` โดยกำหนดลำดับข้อ (`order_number`) และจัดเก็บ **Question Snapshot** ใน `custom_settings` (JSONB) เพื่อรักษาเนื้อหาโจทย์ ณ เวลาสร้างใบงานไว้ แม้โจทย์ต้นทางใน `question_bank` จะถูกแก้ไขในภายหลัง
- **Extensible Question Types:** `multiple_choice`, `fill_in_blank`, `matching`, `subjective`

### 7.2 Core Attributes & Versioning
ข้อสอบประกอบด้วย: `question_text`, `question_type`, `difficulty`, `choices`, `correct_answer`, `explanation`, `answer_key`, `curriculum_reference`, `status`, `version` (ใช้ติดตาม Revision ของโจทย์ ห้ามทำให้ใบงานเดิมเปลี่ยนโดยไม่ตั้งใจ), `metadata`

---

## 8. Worksheet Architecture

### 8.1 3-Step Worksheet Builder Flow
1. **Step 1: Selection** — เลือก Grade -> Unit -> Lesson -> ระดับความยาก -> จำนวนข้อ
2. **Step 2: Customization** — เลือกแสดง/ซ่อน โลโก้โรงเรียน, ชื่อครู, ชื่อโรงเรียน, ข้อความลายน้ำ, และคำชี้แจง
3. **Step 3: Question Review & Reorder** — สลับตำแหน่งข้อสอบ ปรับคะแนน หรือกดสุ่มเปลี่ยนข้อสอบเป็นข้ออื่นในบทเรียนเดียวกัน

### 8.2 Worksheet Question Snapshot Strategy
เพื่อสร้างหลักประกันว่าเมื่อครูสร้างใบงานเสร็จสมบูรณ์แล้ว หาก Admin แก้ไขเนื้อหาโจทย์ใน `question_bank` ภายหลัง ใบงานเดิมจะยังคงแสดงผลโจทย์ตาม Snapshot เดิมเสมอ:
- ตาราง `worksheet_questions` จะเก็บบันทึก Question Snapshot ลงในคอลัมน์ `custom_settings` (JSONB) ณ เวลาสร้างใบงาน ประกอบด้วย:
  - `question_text`
  - `question_type`
  - `choices`
  - `correct_answer` / `answer_key`
  - `explanation`
  - `version`

---

## 9. Print & PDF Architecture

#### Browser Print
- ใช้ CSS `@media print`
- สั่งพิมพ์ตรงผ่านเครื่องพิมพ์ด้วย `window.print()`
- ซ่อนองค์ประกอบ UI ที่ไม่เกี่ยวข้องด้วยคลาส `.no-print`

#### PDF Download
- ใช้ dedicated PDF generation strategy
- ต้องรองรับ: A4 default, Portrait default, Landscape, Thai text, Mathematical notation, Page breaks, Header/Footer, Page numbers, Watermark on every applicable page, Logo, Teacher name, School name

---

## 10. Subscription & Usage Architecture

### 10.1 Configurable DB Subscription Plans
กำหนดขีดจำกัด (Limits) ในตาราง `subscription_plans` เพื่อให้ Admin ปรับเปลี่ยนได้ผ่านฐานข้อมูลโดยไม่ต้องแก้ไขโค้ด:

| Plan Code | Max Worksheets / Month | Max Questions / Worksheet | Custom Logo | Custom Watermark | PDF Export |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **free** | 5 | 10 | NO | NO (Standard Only) | YES |
| **premium** | 50 | 30 | YES | YES | YES |
| **premium_pro** | 100 | 50 | YES | YES | YES |

### 10.2 Audit Logging vs Quota Enforcement Rules
แยกหน้าที่ระหว่าง **Audit Logging** (การบันทึกประวัติกิจกรรม) และ **Quota Enforcement** (การนับตัดโควตาการใช้งาน) ออกจากกันอย่างชัดเจน:

| Action | usage_records (Audit Log) | หัก Quota | เหตุผลและข้อกำหนด |
| :--- | :--- | :--- | :--- |
| **Worksheet Generation** | YES | **YES — 1** | นับตัดโควตาใบงานรายเดือน (`worksheet_limit`) |
| **PDF Download** | YES | **YES — 1** | นับตัดโควตาดาวน์โหลด PDF (`pdf_limit` หากเปิดใช้) |
| **Browser Print** | YES | **NO — 0** | ห้ามนับหักโควตาการใช้งาน (บันทึก Audit Log เพื่อสถิติเท่านั้น) |
| **Preview** | ไม่จำเป็นต้องบันทึก | **NO — 0** | การพรีวิวหน้าจอไม่นับ Quota และไม่ต้องบันทึก Log |

- **Quota Scoping:** การคำนวณนับ Quotas ถูกตรวจสอบและประมวลผลแยกตาม:
  - `user_id` (ผู้ใช้งาน)
  - `app_id` (แอปพลิเคชัน)
  - `action_type` (ประเภทกิจกรรม)
  - `billing period` (รอบเดือนชำระเงินปัจจุบัน)

---

## 11. Payment Architecture

### 11.1 Workflow & Status Flow

```
[Teacher] เลือก Plan + อัปโหลด Slip โอนเงิน ──► Create record in payment_requests (status: 'pending')
                                                                 │
                                                                 ▼
[Admin Dashboard] ตรวจสอบสลิปและยอดเงิน ─────────────────► Decision
                                                                 │
                                 ┌───────────────────────────────┴───────────────────────────────┐
                                 ▼                                                               ▼
                          [APPROVE Action]                                                [REJECT Action]
               - status = 'approved'                                           - status = 'rejected'
               - อัปเดต subscriptions (คำนวณ end_date)                          - ระบุเหตุผลใน rejection_reason
               - สร้าง payment_transactions (UNIQUE payment_request_id)        - แจ้งครูส่งสลิปใหม่
```

- **Strict Payment Rule & 1:1 Enforcement:** การอัปโหลด Slip หรือส่งคำขอชำระเงิน **ไม่ถือว่าชำระเงินสำเร็จ** จนกว่า Admin จะตรวจสอบและกดอนุมัติ (Approve) ผ่าน Admin Dashboard เท่านั้น โดยตาราง `payment_transactions` จะถูกกำหนด UNIQUE constraint บน `payment_request_id` เพื่อบังคับให้ 1 `payment_request` เกิดได้สูงสุดไม่เกิน 1 `payment_transaction` เท่านั้น
- สถานะคำขอชำระเงิน: `pending`, `approved`, `rejected`, `cancelled`

---

## 12. Admin Architecture

Admin มีศูนย์ควบคุมการทำงานผ่าน `/admin` ประกอบด้วย: User Management, Payment Verification Queue, Curriculum & Question Bank CRUD, Subscription Plan Configurator, และ System Settings & Usage Analytics

---

## 13. DATABASE_SCHEMA_SPECIFICATION

### 13.1 Multi-App Analysis & App-ID Placement Strategy
วิเคราะห์ความจำเป็นในการใส่ `app_id` เป็นรายตาราง เพื่อป้องกันการใส่ `app_id` พร่ำเพรื่อโดยไม่จำเป็น:

| Table Category | Table Name | Multi-App Strategy | Has `app_id`? | Reason & Justification |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `apps` | Shared / Global | N/A (Self) | ตารางนิยามแอปพลิเคชันหลักของทั้งระบบ |
| | `system_settings` | Shared / Global | NO | คอนฟิกกลางของแพลตฟอร์ม (เช่น บัญชีธนาคารสำหรับโอนเงิน) |
| **User** | `profiles` | Shared / Global | NO | บัญชีผู้ใช้ 1 บัญชีสามารถล็อกอินใช้ได้ทุกแอปในเครือ |
| **Curriculum** | `subjects` | App-Specific | YES | รายวิชาผูกกับแอปโดยตรง ( Composite Unique `(app_id, code)` ) |
| | `grades` | Inherited via Subject | NO | สังกัด `subject_id` ซึ่งรู้ `app_id` อยู่แล้ว |
| | `units` | Inherited via Grade | NO | สังกัด `grade_id` ซึ่งรู้ `app_id` อยู่แล้ว |
| | `lessons` | Inherited via Unit | NO | สังกัด `unit_id` ซึ่งรู้ `app_id` อยู่แล้ว |
| **Question** | `question_bank` | App-Specific | YES | ข้อสอบผูกกับแอปเพื่อประสิทธิภาพ Indexing และ RLS กรองตามแอปที่ได้รับสิทธิ์ |
| **Worksheet** | `worksheets` | App-Specific | YES | ใบงานผูกกับแอปเพื่อกรองรายการใบงานแยกตามแอปของครู |
| | `worksheet_questions` | Inherited via Worksheet | NO | สังกัด `worksheet_id` และ `question_id` |
| **Subscription**| `subscription_plans` | Shared / Global | NO | แพ็กเกจราคาสมาชิกกลางของแพลตฟอร์ม (Free, Premium, Premium Pro) |
| | `subscriptions` | Shared / Global | NO | สถานะแพ็กเกจสมาชิกกลางของผู้ใช้ในระดับบัญชี |
| | `user_app_access` | App-Specific Junction | YES | สิทธิ์การเข้าใช้งานรายแอปของผู้ใช้แต่ละคน |
| **Usage** | `usage_records` | App-Specific | YES | บันทึกประวัติเพื่อคำนวณและควบคุม Quotas แยกตามรายแอปพลิเคชัน |
| **Payment** | `payment_requests` | Shared / Global | NO | คำขอชำระเงินผูกกับบัญชีผู้ใช้และ Plan |
| | `payment_transactions` | Shared / Global | NO | ประวัติธุรกรรมการเงินผูกกับบัญชีผู้ใช้และ Plan |

---

### 13.2 Detailed Table Specifications (16 Core Tables)

#### 1. Table: `apps` (System Domain)
- **Purpose:** นิยามรายชื่อแอปพลิเคชันในระบบ (MathBoxx Primary, EnglishBoxx, ScienceBoxx)
- **Indexes:** `idx_apps_code` (`code`)
- **Relationships:** 1 : N กับ `subjects`, `question_bank`, `worksheets`, `user_app_access`, `usage_records`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสอ้างอิงแอปพลิเคชัน |
| `code` | VARCHAR(50) | NO | - | NO | - | YES | รหัสโค้ดแอป เช่น `'mathboxx_primary'` |
| `name` | VARCHAR(100) | NO | - | NO | - | NO | ชื่อแอป เช่น `'MathBoxx Primary'` |
| `description` | TEXT | YES | NULL | NO | - | NO | คำอธิบายแอปพลิเคชัน |
| `is_active` | BOOLEAN | NO | `true` | NO | - | NO | สถานะการเปิดใช้งานแอป |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 2. Table: `system_settings` (System Domain)
- **Purpose:** จัดเก็บค่าตั้งกลางของระบบ เช่น บัญชีธนาคารสำหรับโอนเงิน
- **Indexes:** `idx_system_settings_key` (`setting_key`)
- **Relationships:** N : 1 กับ `profiles` (updated_by)

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสตั้งค่า |
| `setting_key` | VARCHAR(100) | NO | - | NO | - | YES | คีย์ตั้งค่า เช่น `'bank_account_info'` |
| `setting_value` | JSONB | NO | - | NO | - | NO | ค่าคอนฟิกในรูปแบบ JSON |
| `description` | TEXT | YES | NULL | NO | - | NO | คำอธิบายการตั้งค่า |
| `updated_by` | UUID | YES | NULL | NO | `profiles(id)` | NO | Admin ผู้แก้ไขล่าสุด |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 3. Table: `profiles` (User Domain)
- **Purpose:** ข้อมูลโปรไฟล์ผู้ใช้ ครูผู้สอน โลโก้โรงเรียน และลายน้ำส่วนตัว
- **Indexes:** `idx_profiles_role` (`role`)
- **Relationships:** 1 : 1 กับ `auth.users` | 1 : N กับ `worksheets`, `subscriptions`, `payment_requests`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | - | YES | `auth.users(id)` | YES | ID ตรงกับ Supabase Auth User |
| `email` | VARCHAR(255) | NO | - | NO | - | NO | อีเมลผู้ใช้งาน |
| `role` | VARCHAR(20) | NO | `'teacher'` | NO | - | NO | บทบาท (`'teacher'`, `'admin'`) |
| `teacher_name` | VARCHAR(150) | YES | NULL | NO | - | NO | ชื่อ-นามสกุลครูผู้สอน |
| `school_name` | VARCHAR(200) | YES | NULL | NO | - | NO | ชื่อโรงเรียน |
| `school_logo_url` | TEXT | YES | NULL | NO | - | NO | URL โลโก้โรงเรียนใน Storage |
| `custom_watermark` | VARCHAR(100) | YES | NULL | NO | - | NO | ข้อความลายน้ำส่วนตัว |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่ลงทะเบียน |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 4. Table: `subjects` (Curriculum Domain)
- **Purpose:** กำหนดรายวิชาเรียนในแต่ละแอปพลิเคชัน
- **Indexes:** `idx_subjects_app_code` (`app_id`, `code`)
- **Relationships:** N : 1 กับ `apps` | 1 : N กับ `grades`, `question_bank`, `worksheets`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสวิชา |
| `app_id` | UUID | NO | - | NO | `apps(id)` | YES (Composite) | แอปพลิเคชันที่สังกัด |
| `code` | VARCHAR(50) | NO | - | NO | - | YES (Composite) | รหัสวิชา เช่น `'MATH_PRIMARY'` (Composite Unique: `(app_id, code)`) |
| `name_th` | VARCHAR(100) | NO | - | NO | - | NO | ชื่อวิชาภาษาไทย |
| `name_en` | VARCHAR(100) | YES | NULL | NO | - | NO | ชื่อวิชาภาษาอังกฤษ |
| `order_index` | INT | NO | `0` | NO | - | NO | ลำดับการเรียง |
| `is_active` | BOOLEAN | NO | `true` | NO | - | NO | สถานะการใช้งาน |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

*Composite Unique Constraint: `UNIQUE(app_id, code)`*

#### 5. Table: `grades` (Curriculum Domain)
- **Purpose:** กำหนดระดับชั้นเรียน (ป.1 - ป.6)
- **Indexes:** `idx_grades_subject_level` (`subject_id`, `level_number`)
- **Relationships:** N : 1 กับ `subjects` | 1 : N กับ `units`, `question_bank`, `worksheets`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสระดับชั้น |
| `subject_id` | UUID | NO | - | NO | `subjects(id)` | NO | วิชาที่สังกัด |
| `code` | VARCHAR(20) | NO | - | NO | - | NO | รหัสชั้น เช่น `'P1'`, `'P2'` ... `'P6'` |
| `name_th` | VARCHAR(100) | NO | - | NO | - | NO | ชื่อชั้น เช่น `'ประถมศึกษาปีที่ 1'` |
| `name_en` | VARCHAR(100) | YES | NULL | NO | - | NO | ชื่อชั้นภาษาอังกฤษ |
| `level_number` | INT | NO | - | NO | - | NO | ตัวเลขอ้างอิงชั้น (1 ถึง 6) |
| `order_index` | INT | NO | `0` | NO | - | NO | ลำดับการเรียง |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

#### 6. Table: `units` (Curriculum Domain)
- **Purpose:** หน่วยการเรียนรู้ตามหลักสูตร
- **Indexes:** `idx_units_grade_number` (`grade_id`, `unit_number`)
- **Relationships:** N : 1 กับ `grades` | 1 : N กับ `lessons`, `question_bank`, `worksheets`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสหน่วยการเรียนรู้ |
| `grade_id` | UUID | NO | - | NO | `grades(id)` | NO | ระดับชั้นที่สังกัด |
| `unit_number` | INT | NO | - | NO | - | NO | หมายเลขหน่วย เช่น 1, 2, 3 |
| `title_th` | VARCHAR(200) | NO | - | NO | - | NO | ชื่อหน่วยการเรียนรู้ภาษาไทย |
| `title_en` | VARCHAR(200) | YES | NULL | NO | - | NO | ชื่อหน่วยภาษาอังกฤษ |
| `description` | TEXT | YES | NULL | NO | - | NO | คำอธิบายหน่วยการเรียนรู้ |
| `order_index` | INT | NO | `0` | NO | - | NO | ลำดับการเรียง |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

#### 7. Table: `lessons` (Curriculum Domain)
- **Purpose:** บทเรียนย่อยภายใต้หน่วยการเรียนรู้
- **Indexes:** `idx_lessons_unit_number` (`unit_id`, `lesson_number`)
- **Relationships:** N : 1 กับ `units` | 1 : N กับ `question_bank`, `worksheets`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสบทเรียน |
| `unit_id` | UUID | NO | - | NO | `units(id)` | NO | หน่วยการเรียนรู้ที่สังกัด |
| `lesson_number` | INT | NO | - | NO | - | NO | หมายเลขบทเรียน เช่น 1, 2, 3 |
| `title_th` | VARCHAR(200) | NO | - | NO | - | NO | ชื่อบทเรียนภาษาไทย |
| `title_en` | VARCHAR(200) | YES | NULL | NO | - | NO | ชื่อบทเรียนภาษาอังกฤษ |
| `description` | TEXT | YES | NULL | NO | - | NO | คำอธิบายบทเรียน |
| `order_index` | INT | NO | `0` | NO | - | NO | ลำดับการเรียง |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

#### 8. Table: `question_bank` (Question Domain)
- **Purpose:** จัดเก็บโจทย์คณิตศาสตร์ นำไปใช้ซ้ำในหลายใบงานได้ (Subject -> Grade -> Unit -> Lesson -> Question)
- **Indexes:** 
  - `idx_question_bank_lookup`: (`app_id`, `subject_id`, `grade_id`, `unit_id`, `lesson_id`, `status`)
  - `idx_question_bank_difficulty`: (`difficulty`)
  - `idx_question_bank_type`: (`question_type`)
- **Relationships:** N : 1 กับ `apps`, `subjects`, `grades`, `units`, `lessons` | 1 : N กับ `worksheet_questions`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสข้อสอบ |
| `app_id` | UUID | NO | - | NO | `apps(id)` | NO | แอปที่สังกัด |
| `subject_id` | UUID | NO | - | NO | `subjects(id)` | NO | วิชาที่สังกัด |
| `grade_id` | UUID | NO | - | NO | `grades(id)` | NO | ระดับชั้นที่สังกัด |
| `unit_id` | UUID | NO | - | NO | `units(id)` | NO | หน่วยการเรียนรู้ที่สังกัด |
| `lesson_id` | UUID | NO | - | NO | `lessons(id)` | NO | บทเรียนที่สังกัด |
| `question_code` | VARCHAR(50) | NO | - | NO | - | YES | โค้ดข้อสอบ เช่น `'MATH-P1-U1-L1-001'` |
| `question_text` | TEXT | NO | - | NO | - | NO | ตัวโจทย์คณิตศาสตร์ |
| `question_type` | VARCHAR(30) | NO | - | NO | - | NO | ประเภทโจทย์ (`'multiple_choice'`, `'fill_in_blank'`, `'matching'`, `'subjective'`) |
| `difficulty` | INT | NO | - | NO | - | NO | ระดับความยาก (1 ถึง 5) |
| `choices` | JSONB | NO | `'[]'::jsonb` | NO | - | NO | ตัวเลือกคำตอบในกรณีปรนัย |
| `correct_answer` | TEXT | NO | - | NO | - | NO | คำตอบที่ถูกต้อง |
| `explanation` | TEXT | YES | NULL | NO | - | NO | คำอธิบายเฉลยอย่างละเอียด |
| `answer_key` | TEXT | YES | NULL | NO | - | NO | เฉลยย่อสำหรับครู |
| `curriculum_reference`| VARCHAR(100) | YES | NULL | NO | - | NO | รหัสอ้างอิงตัวชี้วัดหลักสูตรแกนกลาง |
| `version` | INT | NO | `1` | NO | - | NO | เวอร์ชันสำหรับติดตาม Revision ของโจทย์ (ห้ามทำให้ใบงานเดิมเปลี่ยนโดยไม่ตั้งใจ) |
| `metadata` | JSONB | NO | `'{}'::jsonb` | NO | - | NO | รูปภาพโจทย์ ความสูงบรรทัดเขียนตอบ |
| `status` | VARCHAR(20) | NO | `'published'` | NO | - | NO | สถานะ (`'draft'`, `'published'`, `'archived'`) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่เพิ่มข้อสอบ |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 9. Table: `worksheets` (Worksheet Domain)
- **Purpose:** จัดเก็บข้อมูลใบงานที่ครูสร้างขึ้น (`worksheets` -> `worksheet_questions` -> `question_bank`)
- **Indexes:** `idx_worksheets_owner`: (`owner_id`, `created_at` DESC)
- **Relationships:** N : 1 กับ `profiles` (owner_id), `apps`, `subjects`, `grades`, `units`, `lessons` | 1 : N กับ `worksheet_questions`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสใบงาน |
| `owner_id` | UUID | NO | - | NO | `profiles(id)` | NO | ครูผู้สร้างใบงาน |
| `app_id` | UUID | NO | - | NO | `apps(id)` | NO | แอปพลิเคชัน |
| `subject_id` | UUID | NO | - | NO | `subjects(id)` | NO | วิชา |
| `grade_id` | UUID | NO | - | NO | `grades(id)` | NO | ระดับชั้น |
| `unit_id` | UUID | YES | NULL | NO | `units(id)` | NO | หน่วยการเรียนรู้ (ถ้ามี) |
| `lesson_id` | UUID | YES | NULL | NO | `lessons(id)` | NO | บทเรียน (ถ้ามี) |
| `title` | VARCHAR(200) | NO | - | NO | - | NO | ชื่อหัวข้อใบงาน |
| `worksheet_format` | VARCHAR(20) | NO | `'A4'` | NO | - | NO | ขนาดกระดาษ (default `'A4'`) |
| `orientation` | VARCHAR(20) | NO | `'PORTRAIT'` | NO | - | NO | วางแนว (`'PORTRAIT'`, `'LANDSCAPE'`) |
| `difficulty` | INT | YES | NULL | NO | - | NO | ความยากเฉลี่ยของใบงาน |
| `question_count` | INT | NO | `10` | NO | - | NO | จำนวนข้อโจทย์ในใบงาน |
| `settings` | JSONB | NO | `'{}'::jsonb` | NO | - | NO | การแสดงผลโลโก้ ชื่อ ลายน้ำ คำชี้แจง |
| `status` | VARCHAR(20) | NO | `'active'` | NO | - | NO | สถานะใบงาน (`'active'`, `'archived'`) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้างใบงาน |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 10. Table: `worksheet_questions` (Worksheet Domain)
- **Purpose:** ตารางเชื่อมโยงกำหนดลำดับข้อสอบและการปรับแต่งเฉพาะข้อในใบงาน พร้อมเก็บบันทึก Question Snapshot (`question_text`, `question_type`, `choices`, `correct_answer`/`answer_key`, `explanation`, `version`)
- **Indexes:** `idx_worksheet_questions_lookup`: (`worksheet_id`, `order_number`)
- **Relationships:** N : 1 กับ `worksheets` (CASCADE delete) | N : 1 กับ `question_bank` (RESTRICT delete)

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสตารางเชื่อมโยง |
| `worksheet_id` | UUID | NO | - | NO | `worksheets(id)` | YES (Composite) | ใบงานที่สังกัด |
| `question_id` | UUID | NO | - | NO | `question_bank(id)` | NO | ข้อสอบที่ถูกเลือก |
| `order_number` | INT | NO | - | NO | - | YES (Composite) | ลำดับข้อในใบงาน (1, 2, 3...) |
| `custom_settings` | JSONB | NO | `'{}'::jsonb` | NO | - | NO | ค่าตั้งเฉพาะข้อ และ **Question Snapshot** (สำรอง `question_text`, `question_type`, `choices`, `correct_answer`/`answer_key`, `explanation`, `version` ณ เวลาสร้างใบงาน เพื่อให้ใบงานเดิมยังแสดงโจทย์ตาม Snapshot เดิมเสมอแม้ Admin แก้ไข `question_bank` ภายหลัง) |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

*Unique Constraint แบบ Composite: `UNIQUE(worksheet_id, order_number)`*

#### 11. Table: `subscription_plans` (Subscription Domain)
- **Purpose:** กำหนดการตั้งค่าสิทธิ์และโควตาของแพ็กเกจ (Free, Premium, Premium Pro)
- **Indexes:** `idx_subscription_plans_code` (`code`)
- **Relationships:** 1 : N กับ `subscriptions`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสแพ็กเกจ |
| `code` | VARCHAR(50) | NO | - | NO | - | YES | โค้ดแพ็กเกจ (`'free'`, `'premium'`, `'premium_pro'`) |
| `name_th` | VARCHAR(100) | NO | - | NO | - | NO | ชื่อแพ็กเกจภาษาไทย |
| `name_en` | VARCHAR(100) | YES | NULL | NO | - | NO | ชื่อแพ็กเกจภาษาอังกฤษ |
| `price_monthly` | NUMERIC(10,2) | NO | `0.00` | NO | - | NO | ราคารายเดือน |
| `price_yearly` | NUMERIC(10,2) | NO | `0.00` | NO | - | NO | ราคารายปี |
| `worksheet_limit` | INT | NO | - | NO | - | NO | โควตาใบงาน/เดือน (-1 = ไม่จำกัด) |
| `question_limit` | INT | NO | - | NO | - | NO | จำนวนข้อสูงสุดต่อใบงาน |
| `pdf_limit` | INT | NO | `-1` | NO | - | NO | โควตาดาวน์โหลด PDF (-1 = ไม่จำกัด) |
| `allow_custom_logo` | BOOLEAN | NO | `false` | NO | - | NO | สิทธิ์อัปโหลดโลโก้โรงเรียน |
| `allow_custom_watermark` | BOOLEAN | NO | `false` | NO | - | NO | สิทธิ์ตั้งค่าลายน้ำส่วนตัว |
| `features` | JSONB | NO | `'[]'::jsonb` | NO | - | NO | รายการฟีเจอร์เสริมในแพ็กเกจ |
| `is_active` | BOOLEAN | NO | `true` | NO | - | NO | สถานะการเปิดขายแพ็กเกจ |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

#### 12. Table: `subscriptions` (Subscription Domain)
- **Purpose:** บันทึกสถานะการสมัครสมาชิกและวันหมดอายุของผู้ใช้
- **Indexes:** `idx_subscriptions_user_status`: (`user_id`, `status`)
- **Relationships:** N : 1 กับ `profiles` (user_id), `subscription_plans` (plan_id) | 1 : N กับ `user_app_access`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสการสมัคร |
| `user_id` | UUID | NO | - | NO | `profiles(id)` | NO | ผู้ใช้งาน |
| `plan_id` | UUID | NO | - | NO | `subscription_plans(id)` | NO | แพ็กเกจที่สมัคร |
| `status` | VARCHAR(20) | NO | `'active'` | NO | - | NO | สถานะ (`'active'`, `'expired'`, `'cancelled'`, `'pending'`) |
| `billing_cycle` | VARCHAR(10) | NO | `'monthly'` | NO | - | NO | รอบการชำระ (`'monthly'`, `'yearly'`) |
| `start_date` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันที่เริ่มแพ็กเกจ |
| `end_date` | TIMESTAMPTZ | YES | NULL | NO | - | NO | วันหมดอายุ (NULL = ไม่มีวันหมดอายุ) |
| `auto_renew` | BOOLEAN | NO | `false` | NO | - | NO | ต่อให้อัตโนมัติหรือไม่ |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 13. Table: `user_app_access` (Subscription Domain)
- **Purpose:** สิทธิ์การเข้าถึงแอปพลิเคชันรายแอปของผู้ใช้แต่ละคน
- **Indexes:** `idx_user_app_access_lookup`: (`user_id`, `app_id`)
- **Relationships:** N : 1 กับ `profiles`, `apps`, `subscriptions`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสสิทธิ์ |
| `user_id` | UUID | NO | - | NO | `profiles(id)` | YES (Composite) | ผู้ใช้งาน |
| `app_id` | UUID | NO | - | NO | `apps(id)` | YES (Composite) | แอปพลิเคชัน |
| `subscription_id` | UUID | YES | NULL | NO | `subscriptions(id)` | NO | อ้างอิง Subscription |
| `is_enabled` | BOOLEAN | NO | `true` | NO | - | NO | สถานะการเปิดใช้สิทธิ์ |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่สร้าง |

*Unique Constraint แบบ Composite: `UNIQUE(user_id, app_id)`*

#### 14. Table: `usage_records` (Usage Domain)
- **Purpose:** ตรวจสอบสถิติและการนับ Quota การสร้างใบงาน ดาวน์โหลด PDF และกิจกรรมต่างๆ แยกตาม `user_id`, `app_id`, `action_type`, และ `billing period`
- **Indexes:** `idx_usage_records_user_monthly`: (`user_id`, `action_type`, `created_at`)
- **Relationships:** N : 1 กับ `profiles`, `apps`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสบันทึก |
| `user_id` | UUID | NO | - | NO | `profiles(id)` | NO | ผู้ใช้งาน |
| `app_id` | UUID | NO | - | NO | `apps(id)` | NO | แอปพลิเคชัน |
| `action_type` | VARCHAR(50) | NO | - | NO | - | NO | กิจกรรม (`'worksheet_created'` = 1 usage/หัก Quota, `'pdf_downloaded'` = 1 usage/หัก Quota, `'browser_print'` = 0 usage/ไม่หัก Quota) |
| `reference_id` | UUID | YES | NULL | NO | - | NO | ID อ้างอิง เช่น worksheet_id |
| `metadata` | JSONB | NO | `'{}'::jsonb` | NO | - | NO | ข้อมูลเสริม |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่ทำกิจกรรม |

#### 15. Table: `payment_requests` (Payment Domain)
- **Purpose:** บันทึกคำขอชำระเงินและสลิปโอนเงิน เพื่อให้ Admin ตรวจสอบอนุมัติ/ปฏิเสธ
- **Indexes:** `idx_payment_requests_status`: (`status`, `created_at` DESC)
- **Relationships:** N : 1 กับ `profiles` (user_id), `subscription_plans`, `profiles` (reviewed_by) | 1 : 1 กับ `payment_transactions`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสคำขอชำระเงิน |
| `user_id` | UUID | NO | - | NO | `profiles(id)` | NO | ผู้ใช้งานที่แจ้งชำระ |
| `plan_id` | UUID | NO | - | NO | `subscription_plans(id)` | NO | แพ็กเกจที่ต้องการซื้อ |
| `amount` | NUMERIC(10,2) | NO | - | NO | - | NO | จำนวนเงินที่โอน |
| `billing_cycle` | VARCHAR(10) | NO | `'monthly'` | NO | - | NO | รอบการชำระ (`'monthly'`, `'yearly'`) |
| `slip_url` | TEXT | NO | - | NO | - | NO | URL รูปภาพสลิปใน Storage |
| `payment_method` | VARCHAR(50) | NO | `'bank_transfer'` | NO | - | NO | ช่องทางชำระเงิน |
| `status` | VARCHAR(20) | NO | `'pending'` | NO | - | NO | สถานะ (`'pending'`, `'approved'`, `'rejected'`, `'cancelled'`) |
| `user_note` | TEXT | YES | NULL | NO | - | NO | หมายเหตุจากผู้ใช้งาน |
| `rejection_reason` | TEXT | YES | NULL | NO | - | NO | เหตุผลการปฏิเสธจาก Admin |
| `reviewed_by` | UUID | YES | NULL | NO | `profiles(id)` | NO | Admin ผู้ตรวจสอบคำขอ |
| `reviewed_at` | TIMESTAMPTZ | YES | NULL | NO | - | NO | วันเวลาที่อนุมัติ/ปฏิเสธ |
| `submitted_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่ส่งคำขอ |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาบันทึกแถว |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่อัปเดต |

#### 16. Table: `payment_transactions` (Payment Domain)
- **Purpose:** บันทึกหลักฐานธุรกรรมการชำระเงินที่ Admin อนุมัติเรียบร้อยแล้ว (Enforce maximum 1 payment_transaction per 1 payment_request)
- **Indexes:** `idx_payment_tx_ref` (`transaction_ref`)
- **Relationships:** 1 : 1 กับ `payment_requests` | N : 1 กับ `profiles`, `subscriptions`

| Column Name | Data Type | Nullable | Default Value | PK | FK Reference | Unique | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | NO | `gen_random_uuid()` | YES | - | NO | รหัสธุรกรรม |
| `payment_request_id` | UUID | NO | - | NO | `payment_requests(id)` | YES | คำขอชำระเงินต้นทาง (**UNIQUE Constraint** บังคับ 1 payment_request -> maximum 1 payment_transaction) |
| `user_id` | UUID | NO | - | NO | `profiles(id)` | NO | ผู้ใช้งาน |
| `subscription_id` | UUID | NO | - | NO | `subscriptions(id)` | NO | Subscription ที่ถูกสร้าง/ต่ออายุ |
| `amount` | NUMERIC(10,2) | NO | - | NO | - | NO | จำนวนเงินสุทธิ |
| `transaction_ref` | VARCHAR(100) | NO | - | NO | - | YES | โค้ดอ้างอิงธุรกรรม เช่น `'TXN-20260801-001'` |
| `payment_date` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาที่ชำระเงินสมบูรณ์ |
| `created_at` | TIMESTAMPTZ | NO | `now()` | NO | - | NO | วันเวลาบันทึกรายการ |

---

### 13.3 Recommended Tables
ตารางทั้ง 16 ตารางข้างต้นถูกแนะนำให้ใช้เป็นโครงสร้างหลักของ MathBoxx Primary เนื่องจาก:
1. ครอบคลุมการทำงานทุกโดเมน (System, User, Curriculum, Question, Worksheet, Subscription, Usage, Payment)
2. รองรับการขยายแอปพลิเคชันอื่นในอนาคตผ่าน `apps` และ `app_id`
3. มีตาราง Audit Log (`usage_records`) สำหรับนับ Quota ได้อย่างยืดหยุ่น

### 13.4 Tables Requiring Review
- `user_app_access`: ในระยะเริ่มต้นหากผู้ใช้ทุกสิทธิ์เข้าถึงได้เฉพาะ MathBoxx ตารางนี้อาจใช้วิธีดึงสิทธิ์จาก `subscriptions` โดยตรงได้ อย่างไรก็ดี การคงตารางนี้ไว้จะช่วยให้รองรับ Multi-App ในอนาคตได้อย่างสมบูรณ์

### 13.5 Tables Not Recommended
- **`organizations` / `schools` / `tenants`**: **ไม่แนะนำให้สร้างในระยะนี้** เนื่องจากจะเพิ่มความซับซ้อนของ Multi-Tenant Architecture โดยไม่จำเป็น ควรใช้คอลัมน์ `school_name` ใน `profiles` ตาม requirement ปัจจุบัน

### 13.6 Key Relationships Summary
- `profiles` 1 : N `worksheets`
- `subjects` 1 : N `grades` 1 : N `units` 1 : N `lessons` 1 : N `question_bank`
- `worksheets` N : M `question_bank` (เชื่อมโยงผ่าน Junction Table `worksheet_questions`)
- `subscription_plans` 1 : N `subscriptions`
- `payment_requests` 1 : 1 `payment_transactions` (เมื่อผ่านการตรวจอนุมัติจาก Admin โดย Enforce ด้วย UNIQUE constraint)

### 13.7 RLS Matrix

| Table Name | Public Read | Authenticated Read | Owner Read | Owner Write | Admin Read | Admin Write | Justification / Security Logic |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `apps` | YES | YES | N/A | NO | YES | YES | รายชื่อแอปพลิเคชันเป็นข้อมูลสาธารณะ Admin จัดการได้เท่านั้น |
| `system_settings` | NO | YES | N/A | NO | YES | YES | ค่าตั้งระบบเปิดให้ผู้ใช้ลงทะเบียนอ่านได้ Admin แก้ไขเท่านั้น |
| `profiles` | NO | NO | YES | YES | YES | YES | ผู้ใช้ดู/แก้ไขโปรไฟล์ตนเอง (ยกเว้น role) Admin จัดการได้ทั้งหมด |
| `subjects` | YES | YES | N/A | NO | YES | YES | ข้อมูลหลักสูตรอ่านได้ทั่วไป Admin CRUD ได้ |
| `grades` | YES | YES | N/A | NO | YES | YES | ข้อมูลหลักสูตรอ่านได้ทั่วไป Admin CRUD ได้ |
| `units` | YES | YES | N/A | NO | YES | YES | ข้อมูลหลักสูตรอ่านได้ทั่วไป Admin CRUD ได้ |
| `lessons` | YES | YES | N/A | NO | YES | YES | ข้อมูลหลักสูตรอ่านได้ทั่วไป Admin CRUD ได้ |
| `question_bank` | NO | status='published' AND app_id IN (User App Access) | N/A | NO | YES | YES | ครูอ่านโจทย์ที่ publish แล้วภายใต้ app_id ที่ตนมีสิทธิ์เท่านั้น Admin CRUD ข้อสอบทั้งหมด |
| `worksheets` | NO | NO | YES | YES | YES | NO | ครูสร้าง/แก้ไข/ลบใบงานตนเองเท่านั้น Admin ดูสถิติได้ |
| `worksheet_questions`| NO | NO | YES (ผ่าน `worksheets.owner_id`) | YES (ผ่าน `worksheets.owner_id`) | YES | NO | สืบทอดสิทธิ์จากใบงานต้นทาง (`worksheets.owner_id`) |
| `subscription_plans` | YES | YES | N/A | NO | YES | YES | ตารางราคาแพ็กเกจอ่านได้ทั่วไป Admin แก้ไข limits ได้ |
| `subscriptions` | NO | NO | YES | NO | YES | YES | ผู้ใช้ดูสถานะแพ็กเกจตนเอง Admin อัปเดตแพ็กเกจผ่านการอนุมัติ |
| `user_app_access` | NO | NO | YES | NO | YES | YES | ผู้ใช้ดูสิทธิ์แอปตนเอง Admin จัดการการเข้าถึง |
| `usage_records` | NO | NO | YES | Insert Only | YES | NO | Audit Log อ่านได้เฉพาะของตนเอง ห้ามแก้ไขลบข้อมูล |
| `payment_requests` | NO | NO | YES | Insert Only | YES | YES | ครูสร้างคำขอชำระเงินตนเอง Admin อนุมัติ/ปฏิเสธเท่านั้น |
| `payment_transactions`| NO | NO | YES | NO | YES | NO | ประวัติธุรกรรมอ่านได้อย่างเดียว ห้ามแก้ไข (Immutable Log) |

### 13.8 Open Design Questions
1. **การจัดเก็บรูปภาพในสลักโจทย์:** โจทย์คณิตศาสตร์ที่มีรูปภาพประกอบ ควรเก็บบน Supabase Storage Bucket ชื่อ `question-images` แล้วใส่ URL อ้างอิงใน `metadata->>'image_url'` หรือไม่? *(ข้อเสนอแนะ: ควรใช้ Supabase Storage และอ้างอิงผ่าน URL)*

---

## 14. Security & RLS Specification

### 14.1 Core Security Rules
1. **No Service Role Key in Frontend:** ใช้เฉพาะ `VITE_SUPABASE_ANON_KEY` ใน Frontend ห้ามใส่ `SERVICE_ROLE_KEY` เด็ดขาด
2. **Strict RLS Enforced:** ทุกตารางต้องเปิดใช้งาน `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`
3. **No Hard-coded Secrets:** จัดเก็บค่า Key และ URL ทั้งหมดใน Environment Variables
4. **No RLS Bypass:** ห้ามปิด RLS หรือสร้างช่องทาง Bypass เด็ดขาด

### 14.2 Database Security Function
```
Function: public.is_admin()
Type: SECURITY DEFINER
Logic:
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
```

---

## 15. API / Service Architecture

ออกแบบแยกส่วนตามหลัก Clean Service Layer Pattern:

```
[React UI Page / Component]
          │
          ▼ (Custom Hooks Layer)
  useAuth(), useWorksheetBuilder(), useCurriculum(), usePayment()
          │
          ▼ (Services Layer)
  authService, worksheetService, curriculumService, questionService, paymentService, adminService
          │
          ▼ (Database Infrastructure Layer)
  supabaseClient (`src/lib/supabase.ts`)
          │
          ▼
[Supabase Backend API & PostgreSQL]
```

---

## 16. Folder Structure

```
MathBoxx Primary/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── assets/               # Local Images, Icons, Fonts
│   ├── components/           # Reusable UI Components
│   │   ├── ui/               # Base Tokens UI (Button, Card, Input, Badge, Modal)
│   │   ├── layout/           # App Layouts (Navbar, Sidebar, Footer, PageHeader)
│   │   ├── worksheet/        # Worksheet Components (Header, QuestionCard, PrintContainer, Watermark)
│   │   └── common/           # LoadingSpinner, StatusBadge, EmptyState
│   ├── design-tokens/        # Centralized Pastel Color Tokens & Utilities
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── features/             # Feature-specific modules
│   │   ├── auth/             # LoginForm, RegisterForm, AuthProvider
│   │   ├── builder/          # StepSelector, QuestionSelector, WorksheetPreview
│   │   ├── curriculum/       # CurriculumTree, LessonPicker
│   │   ├── payment/          # SlipUploader, PaymentHistoryTable
│   │   └── admin/            # ApprovalTable, UserTable, StatsChart
│   ├── hooks/                # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useWorksheets.ts
│   │   ├── useCurriculum.ts
│   │   └── usePayment.ts
│   ├── layouts/              # Route Layout Wrapper (PublicLayout, TeacherLayout, AdminLayout)
│   ├── lib/                  # Core Utilities & External Clients
│   │   ├── supabase.ts       # Supabase Client Initialization
│   │   └── printUtils.ts     # Print/PDF helpers
│   ├── pages/                # Route Pages
│   │   ├── public/           # Landing, Pricing, Login, Register
│   │   ├── teacher/          # Dashboard, Builder, Worksheets, Profile, Payment
│   │   └── admin/            # AdminDashboard, UserMgmt, PaymentMgmt, QuestionMgmt
│   ├── services/             # API Services
│   │   ├── auth.service.ts
│   │   ├── worksheet.service.ts
│   │   ├── curriculum.service.ts
│   │   ├── question.service.ts
│   │   ├── payment.service.ts
│   │   └── admin.service.ts
│   ├── types/                # TypeScript Interfaces & Database Types
│   │   ├── database.types.ts
│   │   ├── worksheet.types.ts
│   │   └── subscription.types.ts
│   ├── utils/                # Pure Helper Functions (formatters, validators)
│   ├── App.tsx               # Main App Router Setup
│   ├── index.css             # Tailwind Directives & CSS Design Tokens
│   └── main.tsx              # React Entry Point
├── .env.example              # Template for Environment Variables
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── MATHBOXX_ARCHITECTURE.md  # Master Architecture Specification
```

---

## 17. Testing Strategy

1. **Unit Testing (Vitest):** ทดสอบ Helper Functions, Date Formatters, และ Quota Calculation Logic
2. **Component & Token Testing:** ทดสอบ Rendering ของ Design Tokens, Button States, Modal Toggles
3. **Print & PDF Verification:** ทดสอบการพิมพ์ผ่าน Browser Print และการดาวน์โหลด PDF บน Chrome, Edge, Safari ในกระดาษ A4 แนวตั้ง/แนวนอน ตรวจสอบสระภาษาไทยและลายน้ำทุกหน้า
4. **RLS & Security Verification:** ทดสอบ Query ข้าม User หรือพยายามอัปเดตข้อมูล Admin เพื่อยืนยันความปลอดภัยในระดับ Supabase RLS

---

## 18. Deployment Strategy

1. **Supabase Setup:** สร้าง Project ใหม่ในภูมิภาค Singapore, รัน SQL Migration Schema ทั้ง 16 ตาราง, เปิดใช้งาน RLS, สร้าง Storage Buckets (`school-logos`, `payment-slips`)
2. **Vercel Hosting:** เชื่อมต่อ GitHub Repository กับ Vercel, ตั้งค่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`, เปิดใช้งาน SSL และ Custom Domain

---

## 19. Development Phases

| Phase | Description & Deliverables | Verification / Acceptance Criteria |
| :--- | :--- | :--- |
| **Phase 1: Foundation & Design System** | ตั้งค่า Vite, TypeScript, Tailwind CSS, Pastel Design Tokens (`colors.ts`), Base UI Components (`Button`, `Card`, `Input`, `Badge`, `Modal`) | Run `npm run build` ผ่าน 100%, แสดงผล UI Design System แสง สี พาสเทล ได้ถูกต้อง |
| **Phase 2: Supabase & Auth & Profiles** | ติดตั้ง Supabase Client, Auth Context, Sign Up/Login/Reset Password, `profiles` Table Trigger | สมาชิกสมัคร สมัครเรียน/เข้าสู่ระบบได้ อัปเดตชื่อครู โลโก้โรงเรียนได้ |
| **Phase 3: Curriculum System** | สร้างโครงสร้าง `subjects`, `grades`, `units`, `lessons`, API Services ดึงหลักสูตร ป.1 - ป.6 | สามารถเลือกวิชา/ชั้นปี/หน่วย/บทเรียน ได้ถูกต้องตาม Hierarchy |
| **Phase 4: Question Bank System** | สร้างตาราง `question_bank` ดึงและคัดกรองข้อสอบตามประเภท ความยาก และบทเรียน | ค้นหาข้อสอบตามเงื่อนไข กรองข้อสอบ และสุ่มข้อสอบได้ |
| **Phase 5: Worksheet Builder** | พัฒนาระบบ Builder 3 ขั้นตอน สลับข้อ ปรับแต่งหัวใบงาน และคำชี้แจง | ครูเลือกโจทย์ ปรับแต่งใบงาน บันทึกลงตาราง `worksheets` ได้ |
| **Phase 6: Print / PDF Engine** | พัฒนา A4 Layout (Portrait/Landscape), CSS `@media print`, Custom Watermark Layer, PDF Export Engine | กดพิมพ์และดาวน์โหลด PDF ได้ตรงตามกระดาษ A4 สระภาษาไทยไม่ลอย ลายน้ำคมชัด |
| **Phase 7: Subscriptions & Usage Tracking** | สร้างตาราง `subscription_plans`, `subscriptions`, `usage_records`, เช็คโควตาผู้ใช้ | บันทึกการสร้างใบงาน แจ้งเตือนเมื่อโควตาหมด ควบคุมฟีเจอร์ตาม Plan |
| **Phase 8: Payment & Manual Approval** | พัฒนาแบบฟอร์มชำระเงิน อัปโหลด Slip ไปยัง Supabase Storage, ระบบอนุมัติสลิปโดย Admin | ครูส่งสลิปได้ Admin ตรวจสอบและกดอนุมัติเพื่อเปลี่ยน Plan สมาชิกอัตโนมัติ |
| **Phase 9: Admin Dashboard** | หน้าบริหารจัดการ ผู้ใช้งาน, คำขอชำระเงิน, คลังข้อสอบ และหลักสูตร | Admin เข้าใช้งาน จัดการข้อมูล อนุมัติสลิป และดูรายงานสถิติได้ |
| **Phase 10: Security Audit & Production Deployment** | ตรวจสอบ RLS Policies ทั้งหมด, ตั้งค่า Environment Variables, Deploy ขึ้น Vercel | Production Build สำเร็จ, ไม่มี Leak Key, SSL & Domain พร้อมใช้งาน |

---
