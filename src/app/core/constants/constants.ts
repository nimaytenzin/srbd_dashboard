// export const API_URL = 'http://localhost:4322';
export const API_URL = 'https://zhichar.ddnsfree.com/app';

export const AUTHTOKENKEY = 'zhicharV2Auth';

export enum BuildingDataStatus {
    COMPLETED = 'COMPLETED',
    INCOMPLETE = 'INCOMPLETE',
    SYNCED = 'SYNCED',
}

export enum BuildingTypology {
    ADOBE_BLOCKS = 'Adobe blocks',
    BRICK_MASONRY = 'Brick masonry',
    REDBRICKS_WITH_REINFORCEMENT = 'Redbricks with Reinforcement',
    REDBRICKS_WITHOUT_REINFORCEMENT = 'Redbricks without Reinforcement',
    CONCRETE_BLOCK_WITH_REINFORCEMENT = 'Concrete Block with Reinforcement',
    CONCRETE_BLOCK_WITHOUT_REINFORCEMENT = 'Concrete Block without Reinforcement',
    CONFINED_MASONRY = 'Confined Masonry',
    CSEB = 'CSEB',
    CUT_STONE_CEMENT_MORTAR = 'Cut Stone with Cement Mortar',
    CUT_STONE_MUD_MORTAR = 'Cut Stone with Mud Mortar',
    DRESSED_STONE_CEMENT_MORTAR = 'Dressed Stone with Cement Mortar',
    DRESSED_STONE_MUD_MORTAR = 'Dressed Stone with Mud Mortar',
    IKRA = 'Ikra',
    INFORMAL = 'Informal',
    OTHERS = 'Others',
    RAMMED_EARTH = 'Rammed earth',
    REINFORCED_CONCRETE = 'Reinforced Concrete',
    RUBBLE_STONE_CEMENT_MORTAR = 'Rubble Stone with Cement Mortar',
    RUBBLE_STONE_MUD_MORTAR = 'Rubble Stone with Mud Mortar',
    STEEL = 'Steel',
    STONE_MASONRY_CEMENT = 'Stone masonry with cement mortar',
    STONE_MASONRY_CEMENT_MUD = 'Stone masonry with cement and mud mortar',
    STONE_MASONRY_MUD = 'Stone masonry with mud mortar',
    TIMBER = 'Timber',
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
