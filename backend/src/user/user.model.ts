import { faker } from "@faker-js/faker";

export interface User {
    id?: number;
    avatar: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
}

export const createRandomUser = (): User => {
    return {
        avatar: faker.internet.avatar(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        status: faker.helpers.arrayElement(["on", "off", "afk"])
    }
}
