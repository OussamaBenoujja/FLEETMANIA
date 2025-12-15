const tripService = require('../services/tripService');
const Trip = require('../models/TripModel');
const Truck = require('../models/TruckModel');
const User = require('../models/UserModel');
const Trailer = require('../models/TrailerModel');

describe('Trip Service Unit Tests', () => {

    let mockDriver;
    let mockTruck;
    let tripInput;

    beforeEach(() => {
        jest.restoreAllMocks();

        mockDriver = { _id: 'user1', role: 'driver', name: 'John' };

        mockTruck = {
            _id: 'truck1',
            status: 'available',
            plate: 'VOLVO-01',
            maintenanceRules: { maxLoadCapacity: 40000 },
            currentMileage: 50000,
            save: jest.fn()
        };

        tripInput = {
            driverId: 'user1',
            truckId: 'truck1',
            startLocation: 'Paris',
            endLocation: 'Lyon',
            cargoType: 'Electronics',
            cargoWeight: 10000,
            description: 'Urgent'
        };
    });

    test('Should create a trip successfully', async () => {
        jest.spyOn(User, 'findById').mockResolvedValue(mockDriver);
        jest.spyOn(Truck, 'findById').mockResolvedValue(mockTruck);
        jest.spyOn(Trailer, 'findById').mockResolvedValue(null);

        const createdTrip = { ...tripInput, _id: 'trip1', status: 'to_do' };
        jest.spyOn(Trip, 'create').mockResolvedValue(createdTrip);

        const result = await tripService.createTrip(tripInput);

        expect(result.status).toBe('to_do');
        expect(mockTruck.status).toBe('on_trip');
        expect(mockTruck.save).toHaveBeenCalled();
    });

    test('Should block trip if Cargo is too heavy (Overload)', async () => {
        jest.spyOn(User, 'findById').mockResolvedValue(mockDriver);
        jest.spyOn(Truck, 'findById').mockResolvedValue(mockTruck);

        const heavyLoad = { ...tripInput, cargoWeight: 50000 };

        await expect(tripService.createTrip(heavyLoad))
            .rejects
            .toThrow("OVERLOAD: Truck limit");
    });

    test('Should block trip if Truck is not available', async () => {
        const busyTruck = { ...mockTruck, status: 'maintenance' };

        jest.spyOn(User, 'findById').mockResolvedValue(mockDriver);
        jest.spyOn(Truck, 'findById').mockResolvedValue(busyTruck);

        await expect(tripService.createTrip(tripInput))
            .rejects
            .toThrow(/is currently maintenance/);
    });

    test('Should block trip if User is not a driver', async () => {
        const adminUser = { _id: 'user2', role: 'admin' };
        jest.spyOn(User, 'findById').mockResolvedValue(adminUser);

        await expect(tripService.createTrip(tripInput))
            .rejects
            .toThrow("Invalid Driver selected");
    });
});
