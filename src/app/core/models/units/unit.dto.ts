import { UnitOwnership } from '../ownership/owner.dto';

export interface UnitDto {
    id?: number;
    buildingId: number;
    unitNumberPrefix: string;
    unitNumber: string;
    qrUuid?: string;
    isLocked?: boolean;

    unitOwnerships?: UnitOwnership[];
}

export interface CreateUnitDto {
    buildingId: number;
    unitNumberPrefix: string;
    unitNumber: string;
    isLocked: boolean;
}
