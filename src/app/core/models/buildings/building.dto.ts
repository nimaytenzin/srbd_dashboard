export interface BuildingDTO {
    id: string;
    clientBuildingId: string | null;
    geomSource: string;
    address: string | null;
    qrUuid: string | null;
    existencyStatus: string;
    associativePosition: string | null;
    name: string | null;
    typology: string | null;
    type: string | null;
    primaryUse: string | null;
    secondaryUse: string | null;
    regularFloorCount: number;
    basementCount: number;
    stiltCount: number;
    atticCount: number;
    jamthogCount: number;
    length: number | null;
    breadth: number | null;
    footprintArea: number | null;
    contact: string | null;
    isProtected: boolean;
    isDataCleaned: boolean;
    status: string;
    subAdministrativeZoneId: number;
    createdAt: string;
    updatedAt: string;

    buildingImages: any[];
}

export interface CreateBuildingDto {}

export interface UpdateBuildingDto {}

export interface CreateBuildingsCleanedDto {
    buildingId: number;
    geom?: string | any;
    geomSource?: string;
    address?: string;
    qrUuid?: string;
    existencyStatus?: string;
    associativePosition?: string;
    name?: string;
    typology?: string;
    type?: string;
    primaryUse?: string;
    secondaryUse?: string;
    regularFloorCount?: number;
    basementCount?: number;
    stiltCount?: number;
    atticCount?: number;
    jamthogCount?: number;
    length?: number;
    breadth?: number;
    footprintArea?: number;
    contact?: number;
    isProtected?: boolean;
    status?: string;
    isDataCleaned?: boolean;
    updatedBy: number;
    subAdministrativeZoneId?: number;
}
