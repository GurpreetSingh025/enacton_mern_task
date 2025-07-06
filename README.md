# Product Management System (Next.js + MySQL)

This is a full-featured product management system built with **Next.js**, **TypeScript**, **React**, and **MySQL** using `kysely` as a SQL query builder. It supports CRUD operations, dynamic filtering, sorting, and pagination.

---

## 🚀 Features

- ✅ Add, Edit, and Delete Products  
- ✅ Assign Categories and Brands to Products  
- ✅ Dynamic Filtering by:
  - Brand
  - Category
  - Gender
  - Occasion
  - Price Range
  - Discount %
- ✅ Sort by:
  - Price (asc/desc)
  - Rating (asc/desc)
  - Created Date (asc/desc)
- ✅ Client-side & Server-side Validation  
- ✅ Pagination Support  
- ✅ Formik & Yup-based form with multi-select inputs  
- ✅ Uses `kysely` for SQL queries  
- ✅ Custom image file handling  
- ✅ Modular file structure and reusable components

---

## 🛠️ Tech Stack

- **Frontend**: React 18+, Next.js 14 App Router, TypeScript  
- **Database**: MySQL  
- **ORM**: Kysely  
- **State Management**: Local State / Controlled Components  
- **Validation**: Formik + Yup  
- **Styling**: Tailwind CSS  
- **UI**: `react-select`, `react-multi-select-component`, and native inputs  
- **Notifications**: react-toastify  

---
## 📦 Folder Structure
project-root/
├── actions/ # Server-side logic (CRUD)
├── components/ # Reusable React components (UI, Filters, Tables)
├── db/ # Kysely DB config
├── schemas/ # Yup validation schemas
├── types/ # TypeScript types
├── app/products/ # Main Product UI pages (listing, add, edit)
└── constant.ts # Shared constants

1. **Clone the repository**
   ```bash
   git clone https://github.com/GurpreetSingh025/enacton_mern_task.git
   cd project-root
2. **Install dependencies**
   ```bash
     npm install --force
3. **Configure environment**
    Create a .env.local file and configure your database:
4. **Run the development server**
     ```bash
      npm run dev

