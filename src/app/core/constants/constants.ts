// export const API_URL = 'http://localhost:4322';
export const API_URL = 'https://zhichar.ddnsfree.com/app';

export const AUTHTOKENKEY = 'zhicharV2Auth';

export enum BuildingDataStatus {
    COMPLETED = 'COMPLETED',
    INCOMPLETE = 'INCOMPLETE',
    SYNCED = 'SYNCED',
}

export enum BuildingTypology {
    REINFORCED_CONCRETE = 'Reinforced Concrete',
    CONFINED_MASONRY = 'Confined Masonry',
    STONE_MASONRY_CEMENT_MUD = 'Stone masonry with cement and mud mortar',
    STONE_MASONRY_CEMENT = 'Stone masonry with cement mortar',
    RAMMED_EARTH = 'Rammed earth',
    BRICK_MASONRY = 'Brick masonry',
    ADOBE_BLOCKS = 'Adobe blocks',
    TIMBER = 'Timber',
    IKRA = 'Ikra',
    STEEL = 'Steel',
    OTHERS = 'Others',
}

export enum BuildingPrimaryUse {
    RESIDENTIAL = 'Residential',
    ResidentialSingleUse = 'Residential Single Use',
    ResidentialCombinedUse = 'Residential Combined Use',
    COMMERCIAL = 'Commercial',
    HOSPITAL = 'Hospital',
    INDUSTRIAL = 'Industrial',
    EDUCATIONAL = 'Educational',
    INSTITUTIONAL = 'Institutional',
    OFFICE = 'Office',
    RELIGIOUS_INSTITUTION = 'Religious Institution',
    STORAGE = 'Storage',
    ASSEMBLY = 'Assembly',
}
