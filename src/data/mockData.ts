// Mock data for Woo-Huahua Microchip Database
// All data is static and for UI demonstration purposes only

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  role: 'owner' | 'vet' | 'police' | 'council' | 'admin' | 'agent';
  createdAt: string;
}

export interface Pet {
  id: string;
  microchipNumber: string;
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'ferret' | 'other';
  breed: string;
  color: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  neutered: boolean;
  ownerId: string;
  registeredDate: string;
  status: 'registered' | 'lost' | 'found' | 'transferred' | 'deceased';
  imageUrl?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  petId: string;
  type: 'registration' | 'update' | 'transfer' | 'lost_report' | 'found' | 'lookup';
  description: string;
  timestamp: string;
  userId: string;
}

export interface SearchResult {
  microchipNumber: string;
  petName: string;
  species: string;
  breed: string;
  status: 'registered' | 'lost' | 'found';
  registeredDatabase: string;
  ownerContactAvailable: boolean;
}

// Mock current user
export const currentUser: User = {
  id: 'usr_001',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.co.uk',
  phone: '+44 7700 900123',
  address: '45 Primrose Lane, Kensington',
  postcode: 'W8 5QR',
  role: 'owner',
  createdAt: '2023-06-15',
};

// Mock pets
export const mockPets: Pet[] = [
  {
    id: 'pet_001',
    microchipNumber: '977200009123456',
    name: 'Bella',
    species: 'dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    dateOfBirth: '2020-03-15',
    sex: 'female',
    neutered: true,
    ownerId: 'usr_001',
    registeredDate: '2020-04-20',
    status: 'registered',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    notes: 'Very friendly, loves swimming',
  },
  {
    id: 'pet_002',
    microchipNumber: '977200009654321',
    name: 'Max',
    species: 'dog',
    breed: 'German Shepherd',
    color: 'Black and Tan',
    dateOfBirth: '2019-08-22',
    sex: 'male',
    neutered: true,
    ownerId: 'usr_001',
    registeredDate: '2019-10-01',
    status: 'registered',
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop',
  },
  {
    id: 'pet_003',
    microchipNumber: '977200009789012',
    name: 'Whiskers',
    species: 'cat',
    breed: 'British Shorthair',
    color: 'Grey',
    dateOfBirth: '2021-01-10',
    sex: 'male',
    neutered: true,
    ownerId: 'usr_001',
    registeredDate: '2021-02-15',
    status: 'registered',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
  },
];

// Mock activities
export const mockActivities: Activity[] = [
  {
    id: 'act_001',
    petId: 'pet_001',
    type: 'registration',
    description: 'Bella registered to Woo-Huahua Database',
    timestamp: '2020-04-20T10:30:00Z',
    userId: 'usr_001',
  },
  {
    id: 'act_002',
    petId: 'pet_001',
    type: 'update',
    description: 'Contact details updated',
    timestamp: '2023-11-15T14:22:00Z',
    userId: 'usr_001',
  },
  {
    id: 'act_003',
    petId: 'pet_002',
    type: 'registration',
    description: 'Max registered to Woo-Huahua Database',
    timestamp: '2019-10-01T09:15:00Z',
    userId: 'usr_001',
  },
  {
    id: 'act_004',
    petId: 'pet_003',
    type: 'registration',
    description: 'Whiskers registered to Woo-Huahua Database',
    timestamp: '2021-02-15T11:45:00Z',
    userId: 'usr_001',
  },
  {
    id: 'act_005',
    petId: 'pet_002',
    type: 'lookup',
    description: 'Microchip scanned at PetCare Veterinary Clinic',
    timestamp: '2024-01-08T16:00:00Z',
    userId: 'usr_vet_001',
  },
];

// Mock search results
export const mockSearchResults: SearchResult[] = [
  {
    microchipNumber: '977200009123456',
    petName: 'Bella',
    species: 'Dog',
    breed: 'Golden Retriever',
    status: 'registered',
    registeredDatabase: 'Woo-Huahua Database',
    ownerContactAvailable: true,
  },
];

// FAQ data
export const faqData = [
  {
    question: 'What is a microchip and why is it important?',
    answer: 'A microchip is a small electronic chip, about the size of a grain of rice, that is implanted under your pet\'s skin. It contains a unique identification number that can be read by a scanner. In the UK, all dogs must be microchipped by law. It\'s the most reliable way to identify your pet and reunite you if they become lost.',
  },
  {
    question: 'Is microchipping mandatory in the UK?',
    answer: 'Yes, since 6 April 2016, all dogs in England must be microchipped and registered on an approved database by the time they are 8 weeks old. From 10 June 2024, cats must also be microchipped by the time they reach 20 weeks of age.',
  },
  {
    question: 'How do I register my pet\'s microchip?',
    answer: 'You can register your pet by creating an account on our platform, then using the "Register Pet" feature. You\'ll need your pet\'s microchip number, your contact details, and basic information about your pet.',
  },
  {
    question: 'What should I do if my pet goes missing?',
    answer: 'If your pet goes missing, immediately log into your account and report them as lost using the "Report Lost Pet" feature. This alerts databases and local authorities. Also contact local vets, shelters, and use social media to spread the word.',
  },
  {
    question: 'How do I transfer ownership of a pet?',
    answer: 'To transfer ownership, the current registered keeper must initiate the transfer through their account. The new owner will receive an email to confirm and complete the transfer by providing their details.',
  },
  {
    question: 'What databases does Woo-Huahua work with?',
    answer: 'Woo-Huahua Database is DEFRA and AMBDO compliant, and integrates with all major UK microchip databases to ensure comprehensive searching and registration capabilities.',
  },
];

// Species options
export const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'ferret', label: 'Ferret' },
  { value: 'other', label: 'Other' },
];

// Common dog breeds
export const dogBreeds = [
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'French Bulldog',
  'Bulldog',
  'Poodle',
  'Beagle',
  'Rottweiler',
  'Yorkshire Terrier',
  'Boxer',
  'Dachshund',
  'Siberian Husky',
  'Border Collie',
  'Cocker Spaniel',
  'Shih Tzu',
  'Mixed Breed',
  'Other',
];

// Common cat breeds
export const catBreeds = [
  'British Shorthair',
  'Persian',
  'Maine Coon',
  'Ragdoll',
  'Bengal',
  'Siamese',
  'Abyssinian',
  'Scottish Fold',
  'Sphynx',
  'Russian Blue',
  'Domestic Shorthair',
  'Domestic Longhair',
  'Mixed Breed',
  'Other',
];

// Common rabbit breeds
export const rabbitBreeds = [
  'Netherland Dwarf',
  'Mini Lop',
  'Dutch',
  'Lionhead',
  'French Lop',
  'Rex',
  'English Spot',
  'Flemish Giant',
  'Angora',
  'Mini Rex',
  'Himalayan',
  'Mixed Breed',
  'Other',
];

// Common ferret breeds / types
export const ferretBreeds = [
  'Sable',
  'Albino',
  'Dark-eyed White',
  'Silver',
  'Chocolate',
  'Cinnamon',
  'Mixed',
  'Other',
];

// When species is "other" and no matching list below
export const otherBreeds = [
  'Mixed Breed',
  'Other',
];

// Breeds for common "other" species (Option B: match breed list to custom species)
export const hamsterBreeds = [
  'Syrian',
  'Dwarf (Campbell)',
  'Dwarf (Winter White)',
  'Roborovski',
  'Chinese',
  'Mixed Breed',
  'Other',
];

export const birdBreeds = [
  'Budgerigar',
  'Cockatiel',
  'Cockatoo',
  'African Grey',
  'Macaw',
  'Conure',
  'Parakeet',
  'Canary',
  'Finch',
  'Lovebird',
  'Mixed Breed',
  'Other',
];

export const guineaPigBreeds = [
  'American',
  'Abyssinian',
  'Peruvian',
  'Silkie',
  'Teddy',
  'Texel',
  'Coronet',
  'Mixed Breed',
  'Other',
];

export const reptileBreeds = [
  'Bearded Dragon',
  'Leopard Gecko',
  'Crested Gecko',
  'Tortoise',
  'Terrapin',
  'Snake',
  'Mixed Breed',
  'Other',
];

export const horsePonyBreeds = [
  'Thoroughbred',
  'Arabian',
  'Quarter Horse',
  'Shetland Pony',
  'Welsh Pony',
  'Cob',
  'Mixed Breed',
  'Other',
];

/** Map normalized "other" species name (lowercase) to breed list. Used when species is "Other". */
export const otherSpeciesBreedsMap: Record<string, string[]> = {
  hamster: hamsterBreeds,
  hamsters: hamsterBreeds,
  bird: birdBreeds,
  birds: birdBreeds,
  parrot: birdBreeds,
  parrots: birdBreeds,
  'guinea pig': guineaPigBreeds,
  guineapig: guineaPigBreeds,
  reptile: reptileBreeds,
  reptiles: reptileBreeds,
  tortoise: reptileBreeds,
  turtle: reptileBreeds,
  lizard: reptileBreeds,
  snake: reptileBreeds,
  horse: horsePonyBreeds,
  horses: horsePonyBreeds,
  pony: horsePonyBreeds,
  ponies: horsePonyBreeds,
};

/** Get breed list for "Other" species based on the custom species name they typed. */
export function getBreedsForOtherSpecies(speciesOther: string): string[] {
  const key = speciesOther.trim().toLowerCase();
  if (!key) return otherBreeds;
  return otherSpeciesBreedsMap[key] ?? otherBreeds;
}

/** True when we have a specific breed list for this "other" species (e.g. hamster, bird). False = unlisted species, use free-text breed. */
export function hasKnownBreedsForOtherSpecies(speciesOther: string): boolean {
  const key = speciesOther.trim().toLowerCase();
  if (!key) return false;
  return key in otherSpeciesBreedsMap;
}
