export interface UserProfile {
  uid: string;
  email: string;
  role: 'barber' | 'admin';
  avatarUrl?: string;
  createdAt: any;
}

export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Location {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface BarberProfile {
  id?: string;
  uid: string;
  shopName: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  services: BarberService[];
  openingHours: OpeningHours;
  location: Location;
  whatsapp?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
  templateId: 'classic' | 'modern' | 'luxury';
  isSubscribed: boolean;
  createdAt: any;
}

export interface Booking {
  id?: string;
  barberId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: any;
}
