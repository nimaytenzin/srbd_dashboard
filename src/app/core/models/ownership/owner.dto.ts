import { BuildingOwnershipTypes } from '../../constants';
import { UnitDto } from '../units/unit.dto';

export interface BuildingOwnershipDto {
    id: number;
    ownerId: number;
    buildingId: number;
    type: BuildingOwnershipTypes;
    ownershipPercentage: number;

    owner?: OwnerDto;
    unitOwnerships?: UnitOwnership[];
}

export interface OwnerDto {
    cid: string;
    name: string;
    contact: number;
}

export interface UnitOwnership {
    unitId: number;
    buildingOwnershipId: number;
    ownershipPercentage: number;
    unit?: UnitDto;
}

export interface CreateBuildingOwnershipDto {
    cid: string;
    name: string;
    contact: number;
    type: string;
    ownershipPercentage: number;
    buildingId: number;
}

export interface UpdateBuildingOwnershipDto {
    cid: string;
    name: string;
    contact: number;
    type: string;
    ownershipPercentage: number;
    buildingId: number;
}

export interface UnitOwnershipDto {
    id: number;
    buildingOwnershipId: number;
    ownershipPercentage: number;
    unitId: number;
    buildingOwnership?: BuildingOwnershipDto;
}
