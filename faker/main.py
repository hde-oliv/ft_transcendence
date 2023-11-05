from faker import Faker
import requests
from faker.providers import person

f = Faker()
f.add_provider(person)

intra = f.first_name_male()


user = {
    "id": intra,
    "nickname": f.first_name_male(),
    "intra_login": intra,
    "avatar": "https://s4.anilist.co/file/anilistcdn/character/large/b210152-ZrFbuMmlgs21.jpg",
}

url = "http://localhost:3000/user"

x = requests.post(url, json=user)

print(x.status_code)
