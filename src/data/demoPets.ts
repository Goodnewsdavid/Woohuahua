/** Shared demo pet data for users with no pets. */

export type ApiPet = {
  id: string;
  microchipNumber: string;
  name: string;
  species: string;
  breed: string;
  color: string;
  dateOfBirth: string | null;
  sex: string;
  neutered: boolean;
  notes: string | null;
  imageUrl: string | null;
  status: string;
  registeredDate: string;
  createdAt: string;
  updatedAt: string;
};

export const DEMO_PETS: ApiPet[] = [
  {
    id: 'demo-bella',
    microchipNumber: '977200009123456',
    name: 'Bella',
    species: 'dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    dateOfBirth: '2020-03-15',
    sex: 'female',
    neutered: true,
    notes: 'Very friendly, loves swimming.',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    status: 'registered',
    registeredDate: '2020-04-20T00:00:00.000Z',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'demo-max',
    microchipNumber: '977200009654321',
    name: 'Max',
    species: 'cat',
    breed: 'British Shorthair',
    color: 'Grey',
    dateOfBirth: '2021-07-20',
    sex: 'male',
    neutered: true,
    notes: 'Indoor cat, shy with strangers.',
    imageUrl: null,
    status: 'registered',
    registeredDate: '2021-08-01T00:00:00.000Z',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'demo-luna',
    microchipNumber: '977200009111222',
    name: 'Luna',
    species: 'dog',
    breed: 'Labrador',
    color: 'Black',
    dateOfBirth: '2019-11-01',
    sex: 'female',
    neutered: true,
    notes: null,
    imageUrl: null,
    status: 'registered',
    registeredDate: '2019-12-01T00:00:00.000Z',
    createdAt: '',
    updatedAt: '',
  },
];

export function getDemoPetById(id: string): ApiPet | undefined {
  return DEMO_PETS.find((p) => p.id === id);
}
