import { faker } from '@faker-js/faker';

export interface User {
  id: number,
  nickname: string,
  avatar: string,
  two_fa_token: string,
  intra_login: string
  online: boolean
}


export const createRandomUser = (): User => {
  return {
    id: faker.number.int(),
    nickname: faker.person.firstName(),
    avatar: faker.internet.avatar(),
    two_fa_token: faker.person.zodiacSign(),
    intra_login: faker.internet.userName(),
    online: false
  };
};
