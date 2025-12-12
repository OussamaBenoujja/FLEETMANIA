# FleetMania - Fleet Management System

**FleetMania** is a comprehensive web-based platform designed for road
transport companies to manage their fleet of trucks, trailers, and
drivers efficiently. It replaces manual Excel-based workflows with a
centralized, real-time digital solution.

------------------------------------------------------------------------

## Key Features

### Admin Dashboard (Dispatcher)

-   **Resource Management:** Create and track Trucks, Trailers, and
    Drivers.
-   **Mission Control:** Dispatch trips by assigning a Driver, Truck,
    and Trailer to a specific route.
-   **Real-time Metrics:** View fleet availability, active missions, and
    fleet health at a glance.
-   **Smart Alerts:** Automatic warnings for vehicle maintenance
    (mileage-based) and tire wear.
-   **Overload Protection:** System prevents dispatching if cargo weight
    exceeds vehicle/trailer limits.

### Driver Portal

-   **Mission View:** See current active assignment with route and cargo
    details.
-   **PDF Generation:** Instantly download official "Mission Orders" as
    PDF files.
-   **Reporting:** Log arrival mileage, fuel consumption, and vehicle
    issues upon mission completion.

------------------------------------------------------------------------

## Technical Stack

### Backend (API)

-   **Runtime:** Node.js (Express.js)
-   **Database:** MongoDB (with Mongoose ODM)
-   **Authentication:** JWT (JSON Web Tokens) with Role-Based Access
    Control (Admin/Driver).
-   **Testing:** Jest (Unit tests for Service Layer).
-   **File Handling:** Multer (for truck photos).

### Frontend (UI)

-   **Framework:** React.js (Vite)
-   **Styling:** Tailwind CSS
-   **State Management:** React Context API
-   **PDF Generation:** jsPDF & AutoTable
-   **Interactive Graphics:** HTML5 Canvas (for interactive truck
    diagrams).

### DevOps & Deployment

-   **Containerization:** Docker & Docker Compose
-   **Server:** Nginx (serving Frontend container)

------------------------------------------------------------------------

## Installation & Setup

### Option 1: Docker (Recommended)

**Prerequisites:** Docker Desktop installed.

``` bash
git clone <repository-url>
cd fleetmania
docker compose up --build
```

Seed the database:

``` bash
cd backend
node seed.js
```

Access: - Frontend: http://localhost:5173 - Backend API:
http://localhost:3045

------------------------------------------------------------------------

### Option 2: Manual Installation (Dev Mode)

**Prerequisites:** Node.js (v18+) and MongoDB.

#### Backend

``` bash
cd backend
npm install
npm run dev
```

#### Frontend

``` bash
cd frontend/fleetmania-front
npm install
npm run dev
```

------------------------------------------------------------------------

## Running Tests

``` bash
npm test
```

-   Scope: tripService and truckService
-   Framework: Jest

------------------------------------------------------------------------

## Login Credentials (Seed Data)

  Role          Email               Password
  ------------- ------------------- -------------
  Super Admin   admin@fleet.com     password123
  Driver        driver1@fleet.com   password123

------------------------------------------------------------------------

## Project Structure

    fleetmania/
    ├── backend/
    ├── frontend/
    └── docker-compose.yml

------------------------------------------------------------------------

## Author

**Created By:** Oussama Benoujja\
**Project:** FleetMania\
**Date:** December 2025\
**Context:** Full Stack Web Development Assessment
