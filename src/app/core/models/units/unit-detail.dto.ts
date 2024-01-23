import { UnitOccupancyStatus } from '../../constants';

export interface UnitDetailDto {
    id: number;
    unitId: number;
    occupancyStatus: UnitOccupancyStatus;
    use: string;
    numberOfBedrooms: number;
    isRented: boolean;
    rent: number;
    name: string;
    contact: number;
    dessupInCountry: number;
    dessupOutCountry: number;

    totalFemale: number;
    totalMale: number;
}

export interface CreateUnitDetailDto {
    unitId: number;
    occupancyStatus?: string;
    use?: string;
    numberOfBedrooms?: number;
    isRented?: boolean;
    name?: string;
    rent?: number;
    contact: number;
    dessupInCountry: number;
    dessupOutCountry: number;
    totalMale: number;
    totalFemale: number;
}

export interface UpdateUnitDetailDtos {
    occupancyStatus?: string;
    use?: string;
    numberOfBedrooms?: number;
    isRented?: boolean;
    rent?: number;
    name?: string;
    contact: number;
    dessupInCountry: number;
    dessupOutCountry: number;
    totalMale: number;
    totalFemale: number;
}
