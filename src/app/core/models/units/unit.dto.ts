export interface UnitDto {
    id?: number;
    buildingId: number;
    unitNumberPrefix: string;
    unitNumber: string;
    qrUuid?: string;
    isLocked?: boolean;
}

export interface CreateUnitDto {
    buildingId: number;
    unitNumberPrefix: string;
    unitNumber: string;
    isLocked: boolean;
}
