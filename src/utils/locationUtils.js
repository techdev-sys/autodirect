export const CITY_COORDS = {
    'harare': [-17.8216, 31.0492],
    'bulawayo': [-20.1367, 28.5818],
    'gweru': [-19.4587, 29.8105],
    'mutare': [-18.9728, 32.6694],
    'masvingo': [-20.0723, 30.8277],
    'victoria falls': [-17.9243, 25.8559],
    'kwekwe': [-18.9201, 29.8236],
    'chinhoyi': [-17.3667, 30.2000],
    'hwange': [-18.3647, 26.4988],
    'kadoma': [-18.3333, 29.9167]
};

export const getCoordinates = (locationName) => {
    if (!locationName) return [-17.8216, 31.0492]; // Default to Harare center

    const key = locationName.toLowerCase().trim();
    const exactMatch = CITY_COORDS[key];

    if (exactMatch) return exactMatch;

    // If not found, hash string to create deterministic pseudo-random coords near Harare
    // This ensures the same unknown city always maps to the same "random" spot
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    const offsetLat = (hash % 100) / 1000;
    const offsetLng = ((hash >> 2) % 100) / 1000;

    return [-17.82 + offsetLat, 31.05 + offsetLng];
};

export const interpolatePosition = (start, end, progress) => {
    // progress is between 0.0 and 1.0
    const lat = start[0] + (end[0] - start[0]) * progress;
    const lng = start[1] + (end[1] - start[1]) * progress;
    return [lat, lng];
};
