// Sri Lanka Provinces and 25 Districts (alphabetical provinces)
export const SRI_LANKA_PROVINCES = [
    {
        province: 'Central',
        districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
    },
    {
        province: 'Eastern',
        districts: ['Ampara', 'Batticaloa', 'Trincomalee'],
    },
    {
        province: 'North Central',
        districts: ['Anuradhapura', 'Polonnaruwa'],
    },
    {
        province: 'Northern',
        districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    },
    {
        province: 'North Western',
        districts: ['Kurunegala', 'Puttalam'],
    },
    {
        province: 'Sabaragamuwa',
        districts: ['Kegalle', 'Ratnapura'],
    },
    {
        province: 'Southern',
        districts: ['Galle', 'Hambantota', 'Matara'],
    },
    {
        province: 'Uva',
        districts: ['Badulla', 'Monaragala'],
    },
    {
        province: 'Western',
        districts: ['Colombo', 'Gampaha', 'Kalutara'],
    },
];

export const ALL_SRI_LANKA_DISTRICTS = SRI_LANKA_PROVINCES.flatMap((p) => p.districts).sort();

// Popular & international shipping destination countries
export const COUNTRIES = [
    'Australia',
    'Austria',
    'Bahrain',
    'Bangladesh',
    'Belgium',
    'Canada',
    'China',
    'Cyprus',
    'Denmark',
    'Egypt',
    'Finland',
    'France',
    'Germany',
    'Hong Kong',
    'India',
    'Indonesia',
    'Ireland',
    'Italy',
    'Japan',
    'Kuwait',
    'Malaysia',
    'Maldives',
    'Mauritius',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Oman',
    'Pakistan',
    'Philippines',
    'Poland',
    'Qatar',
    'Saudi Arabia',
    'Singapore',
    'South Africa',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Thailand',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Vietnam',
];
