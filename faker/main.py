from faker import Faker
import requests
from faker.providers import person
import random

f = Faker()
f.add_provider(person)

intra = f.first_name_male()

avatar = random.choice(["https://i.imgur.com/YrZrRz0.jpg", "https://i.imgur.com/fMpvKk4.jpg"])

user = {
    "id": intra,
    "nickname": f.first_name_male(),
    "intra_login": intra,
    "avatar": avatar,
}

url = "http://localhost:3000/user"

x = requests.post(url, json=user)

print(x.status_code)
