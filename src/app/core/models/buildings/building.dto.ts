export interface BuildingDTO {
    id: number;
    address: any;
    lat: number;
    lng: number;
    qrUuid: string;
    isProtected:boolean;
}

export interface CreateBuildingDto {}

export interface UpdateBuildingDto {}
