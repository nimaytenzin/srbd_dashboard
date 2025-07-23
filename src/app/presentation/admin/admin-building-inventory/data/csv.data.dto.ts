/**
 * DTO for Building Survey CSV Data
 * Represents comprehensive building survey information collected via EpiCollect
 */
export interface BuildingSurveyCSVData {
    // Basic Information
    slNo: number;
    uuid: string;
    createdBy: string;
    ownerName?: string;
    houseNumber?: string;
    thramNumber?: string;
    contact?: string;

    // Location Information
    lat: number;
    long: number;
    gewog?: string;
    chiwog?: string;
    village?: string;

    // Construction Information
    yearCompleted?: string;
    constructionYear?: string;
    constructionStatus?: string;
    use?: string;
    remarks?: string;
    typology?: string;
    remarksTypology?: string;

    // Physical Dimensions
    numberOfFloors?: number;
    storeyHeight?: number;
    length?: number;
    breadth?: number;
    areaM2?: number;

    // Photo Information
    photo1?: string;
    photo2?: string;
    photo3?: string;
    photo4?: string;
    photo5?: string;
    photo6?: string;

    // Infrastructure Assessment
    total?: string;
    exteriorFinishes?: string;
    electricalSystem?: string;
    waterSystem?: string;
    toiletSystem?: string;
    mobileNetwork?: string;
    floorType?: string;
    othersRemarks?: string;
}
