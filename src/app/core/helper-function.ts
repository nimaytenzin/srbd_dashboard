export function PARSEDATE(date: string) {
    const dateObject = new Date(date);

    // Format the Date object to a human-readable string
    return dateObject.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

export function PARSEBUILDINGFLOORS(
    regularFloorCount: number,
    basementCount: number,
    stiltCount: number,
    atticCount: number,
    jamthogCount: number
): string {
    const basementLabel = basementCount
        ? basementCount === 1
            ? 'B+'
            : `${basementCount}B+`
        : '';
    const stiltLabel = stiltCount
        ? stiltCount === 1
            ? 'S+'
            : `${stiltCount}S+`
        : '';
    const regularFloorLabel =
        regularFloorCount > 0
            ? regularFloorCount - 1 === 0
                ? `G`
                : `G+${regularFloorCount - 1}`
            : 'G';

    const atticLabel = atticCount
        ? atticCount === 1
            ? 'A'
            : `${atticCount}A`
        : '';
    const jamthogLabel = jamthogCount
        ? jamthogCount === 1
            ? 'J'
            : `${jamthogCount}J`
        : '';

    return `${basementLabel}${stiltLabel}${regularFloorLabel}${
        atticLabel ? `+${atticLabel}` : ''
    }${jamthogLabel ? `+${jamthogLabel}` : ''}`;
}
