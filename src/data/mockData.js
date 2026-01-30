
export const generateMockJobs = () => [
    {
        id: 'mock-job-1',
        vehicleModel: '2020 Toyota Hilux',
        serviceType: 'Suspension & Brakes',
        location: 'Downtown District',
        status: 'open',
        ownerId: 'demo-owner',
        mechanicId: null,
        totalBudget: 450,
        netPayout: 438.75,
        createdAt: Date.now()
    },
    {
        id: 'mock-job-2',
        vehicleModel: '2018 Honda Fit',
        serviceType: 'General Service',
        location: 'Westside',
        status: 'assigned',
        ownerId: 'demo-owner',
        mechanicId: 'demo-mechanic',
        mechanicName: 'DirectPro-DEMO',
        totalBudget: 120,
        netPayout: 117,
        createdAt: Date.now() - 100000
    },
    {
        id: 'mock-job-3',
        vehicleModel: '2015 Ford Ranger',
        serviceType: 'Engine Overhaul',
        location: 'Industrial Area',
        status: 'repairing',
        ownerId: 'other-owner',
        mechanicId: 'demo-mechanic',
        mechanicName: 'DirectPro-DEMO',
        totalBudget: 1200,
        netPayout: 1170,
        createdAt: Date.now() - 500000
    }
];
