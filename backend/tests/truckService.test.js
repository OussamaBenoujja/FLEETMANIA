const truckService = require('../services/truckService');
const Truck = require('../models/TruckModel');

describe('Truck Service Unit Tests', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Should create a truck with auto-generated tires and components', async () => {
        const truckData = { plate: 'TEST-999', model: 'Volvo', configuration: '4x2' };

        const findOneSpy = jest.spyOn(Truck, 'findOne').mockResolvedValue(null);
        const createSpy = jest.spyOn(Truck, 'create').mockResolvedValue({ _id: '123', ...truckData, tires: [], components: [], fluids: [] });

        const result = await truckService.createTruck(truckData);

        expect(findOneSpy).toHaveBeenCalledWith({ plate: 'TEST-999' });
        expect(createSpy).toHaveBeenCalled();
        const createCallArg = createSpy.mock.calls[0][0];
        expect(createCallArg.tires).toHaveLength(6);
        expect(createCallArg.components).toHaveLength(6);
    });

    test('Should throw error if truck plate already exists', async () => {
        const truckData = { plate: 'DUPLICATE', model: 'Scania' };

        jest.spyOn(Truck, 'findOne').mockResolvedValue({ _id: '999', plate: 'DUPLICATE' });

        await expect(truckService.createTruck(truckData))
            .rejects
            .toThrow("Truck with this license plate already exists");
    });

    test('Should delete truck if status is available', async () => {
        jest.spyOn(Truck, 'findById').mockResolvedValue({ _id: '123', status: 'available' });
        jest.spyOn(Truck, 'findByIdAndDelete').mockResolvedValue(true);

        const result = await truckService.deleteTruck('123');
        expect(result).toEqual({ message: "Truck deleted successfully" });
    });

    test('Should NOT delete truck if currently on a trip', async () => {
        jest.spyOn(Truck, 'findById').mockResolvedValue({ _id: '123', status: 'on_trip' });

        await expect(truckService.deleteTruck('123'))
            .rejects
            .toThrow("Cannot delete a truck while it is on a trip");
    });
});
