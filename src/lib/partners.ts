import { DeliveryPartner } from "@/types/partner"

export function getPartners() {
    // Simulate fetching partners from a database
    return new Promise<DeliveryPartner[]>((resolve) => {
        const partners: DeliveryPartner[] = [];
        for (let i = 1; i <= 10; i++) {
            partners.push({
                _id: `${i}`,
                name: `Partner ${i}`,
                email: `test${i}@test.com`,
                areas: ["Goregaon", "Malad"],
                currentLoad: 2,
                phone: "9930374661",
                status: "active",
                metrics: {
                    cancelledOrders: 0,
                    completedOrders: 10,
                    rating: 5
                },
                shift: {
                    start: "07:00",
                    end: "19:00"
                }
            });
        }
        resolve(partners)
    }
    )
};

export function createPartner(partner: DeliveryPartner) {
    // Simulate creating a partner in a database
    return new Promise<DeliveryPartner>((resolve) => {
        const newPartner = {
            ...partner,
            _id: `${Date.now()}`,
        };
        resolve(newPartner);
    });
}

export function updatePartner(id: string, partner: DeliveryPartner) {
    // Simulate updating a partner in a database
    return new Promise<DeliveryPartner>((resolve) => {
        const updatedPartner = {
            ...partner,
            _id: id,
        };
        resolve(updatedPartner);
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function deletePartner(_id: string) {
    // Simulate deleting a partner from a database
    return new Promise<boolean>((resolve) => {
        // random true or false
        const isDeleted = Math.random() > 0.5;
        resolve(isDeleted);
    });
}