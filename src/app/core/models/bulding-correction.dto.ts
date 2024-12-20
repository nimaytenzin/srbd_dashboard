export enum BUILDINGCORRECTIONSTATUSENUM {
    'PENDING' = 'PENDING',
    'RESOLVED' = 'RESOLVED',
    'REJECTED' = 'REJECTED',
}

export interface ResolverDTO {
    fullName: string;
    cid: string;
}
export interface BuildingCorrectionRequestDTO {
    id: number;
    status: BUILDINGCORRECTIONSTATUSENUM;
    plotId: string;
    ownerCid: string;

    requestorName: string;
    requestorCid: string;
    requestorPhoneNumber: number;

    fileUri: string;

    resolverId?: number;
    remarks?: string;

    resolver?: ResolverDTO;
}

export interface UpdateBuildingCorrectionRequestDTO {
    id: number;
    resolverId: number;
    remarks: string;
    status: BUILDINGCORRECTIONSTATUSENUM;
}
