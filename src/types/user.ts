
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  buildingNo?: number;
  flatNo?: string;
  contactNo?: string;
  createdAt?: any;
  updatedAt?: any;
  isActive: boolean;
}

export interface Building {
  id: string;
  buildingNo: number;
  flats: string[];
  createdAt?: any;
}

export interface FlatAssignment {
  id: string;
  buildingNo: number;
  flatNo: string;
  assignedEmail: string;
  assignedAt?: any;
  assignedBy: string;
}

export interface BuildingMaster {
  id: string;
  buildingNo: number;
  name?: string;
  totalFlats: number;
  createdAt?: any;
  updatedAt?: any;
  isActive: boolean;
}

export interface FlatMaster {
  id: string;
  buildingNo: number;
  flatNo: string;
  flatType?: string;
  createdAt?: any;
  updatedAt?: any;
  isActive: boolean;
}
