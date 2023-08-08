import { faker } from '@faker-js/faker';

export interface User {
  id?: number;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  intraLogin: string;
  status: string;
}

export const createRandomUser = (): User => {
  return {
    avatar: faker.internet.avatar(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    fullName: faker.person.fullName(),
    intraLogin: faker.internet.userName(),
    status: faker.helpers.arrayElement(['on', 'off', 'afk']),
  };
};
