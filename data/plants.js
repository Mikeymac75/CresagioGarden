// Common garden plants with growing information
export const PLANTS = [
  {
    id: 1,
    name: 'Tomato',
    category: 'Fruit',
    harvestType: 'continuous',
    daysToMaturity: 75,
    spacing: '18-24 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: 6,
    transplantWeeksAfterLastFrost: 2,
    directSowWeeksAfterLastFrost: null,
    wateringNeeds: 'Consistent, deep watering',
    wateringFrequencyDays: 3,
    frostTolerant: false,
    description: 'A popular warm-season crop that loves heat and needs support.',
    tips: 'Stake or cage for support. Water deeply and consistently to prevent blossom end rot. Mulch helps retain moisture.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 35, recurring: null },
      { name: 'Pinch off suckers', daysAfterPlanting: 56, recurring: 7 },
      { name: 'Fertilize with tomato food', daysAfterPlanting: 63, recurring: 14 },
      { name: 'Begin checking for ripe fruit', daysAfterPlanting: 100, recurring: 3 }
    ]
  },
  {
    id: 2,
    name: 'Lettuce (Loose Leaf)',
    category: 'Leafy Green',
    harvestType: 'continuous',
    daysToMaturity: 45,
    spacing: '6-8 inches',
    sunRequirement: 'Full sun to partial shade',
    startIndoorsWeeksBefore: 4,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksAfterLastFrost: -2,
    wateringNeeds: 'Consistent moisture, shallow roots',
    wateringFrequencyDays: 2,
    frostTolerant: true,
    description: 'A cool-season crop that grows quickly. Tends to bolt in hot weather.',
    tips: 'Plant every 2 weeks for a continuous harvest. Prefers cooler soil and appreciates afternoon shade in summer.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 21, recurring: null },
      { name: 'Thin direct-sown seedlings', daysAfterPlanting: 21, recurring: null },
      { name: 'Start harvesting outer leaves', daysAfterPlanting: 40, recurring: 5 }
    ]
  },
  {
    id: 3,
    name: 'Basil',
    category: 'Herb',
    harvestType: 'continuous',
    daysToMaturity: 60,
    spacing: '8-12 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: 6,
    transplantWeeksAfterLastFrost: 2,
    directSowWeeksAfterLastFrost: 2,
    wateringNeeds: 'Consistent moisture',
    wateringFrequencyDays: 3,
    frostTolerant: false,
    description: 'A warm-season herb that is sensitive to frost. Great companion for tomatoes.',
    tips: 'Pinch off flower heads as they appear to encourage leafy growth. Harvest often.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 35, recurring: null },
      { name: 'Pinch back tips to encourage branching', daysAfterPlanting: 50, recurring: 10 }
    ]
  },
  {
    id: 4,
    name: 'Carrots',
    category: 'Root Vegetable',
    harvestType: 'single',
    daysToMaturity: 70,
    spacing: '2-3 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -3,
    wateringNeeds: 'Consistent moisture to prevent splitting',
    wateringFrequencyDays: 2,
    frostTolerant: true,
    description: 'A cool-season root crop that needs loose, sandy soil to grow straight.',
    tips: 'Thin seedlings to prevent crowding and misshapen roots. Keep soil consistently moist and weed-free.',
    careTasks: [
      { name: 'Thin seedlings to 2-3 inches apart', daysAfterPlanting: 21, recurring: null },
      { name: 'Begin checking for harvest-size roots', daysAfterPlanting: 65, recurring: 7 }
    ]
  },
  {
    id: 5,
    name: 'Green Beans (Bush)',
    category: 'Legume',
    harvestType: 'continuous',
    daysToMaturity: 55,
    spacing: '4-6 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: 1,
    wateringNeeds: 'Moderate, consistent watering',
    wateringFrequencyDays: 3,
    frostTolerant: false,
    description: 'A warm-season crop that produces abundantly. Does not require a trellis.',
    tips: 'Plant after all danger of frost has passed. Avoid over-fertilizing with nitrogen. Sow every 2 weeks for continuous harvest.',
    careTasks: [
      { name: 'Begin harvesting beans', daysAfterPlanting: 50, recurring: 3 }
    ]
  },
  {
    id: 6,
    name: 'Bell Pepper',
    category: 'Fruit',
    harvestType: 'continuous',
    daysToMaturity: 80,
    spacing: '12-18 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: 8,
    transplantWeeksAfterLastFrost: 3,
    directSowWeeksAfterLastFrost: null,
    wateringNeeds: 'Consistent moisture',
    wateringFrequencyDays: 3,
    frostTolerant: false,
    description: 'A long-season, warm-weather crop that loves heat.',
    tips: 'Wait for consistently warm weather. Mulch to retain soil heat and moisture. Peppers can be harvested green or left to ripen to red, yellow, or orange.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 49, recurring: null },
      { name: 'Fertilize when first flowers appear', daysAfterPlanting: 75, recurring: 21 },
      { name: 'Begin checking for harvestable peppers', daysAfterPlanting: 110, recurring: 7 }
    ]
  },
  {
    id: 7,
    name: 'Spinach',
    category: 'Leafy Green',
    harvestType: 'continuous',
    daysToMaturity: 40,
    spacing: '4-6 inches',
    sunRequirement: 'Full sun to partial shade',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -4,
    wateringNeeds: 'Consistent moisture',
    wateringFrequencyDays: 2,
    frostTolerant: true,
    description: 'A very cold-hardy, cool-season crop. Plant in early spring and fall.',
    tips: 'Bolts quickly in heat. Provide afternoon shade to extend the harvest. Can be sown in late summer for a fall crop.',
    careTasks: [
      { name: 'Thin seedlings', daysAfterPlanting: 14, recurring: null },
      { name: 'Begin harvesting outer leaves', daysAfterPlanting: 35, recurring: 5 }
    ]
  },
  {
    id: 8,
    name: 'Zucchini',
    category: 'Fruit',
    harvestType: 'continuous',
    daysToMaturity: 50,
    spacing: '36 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: 2,
    wateringNeeds: 'Deep, consistent watering',
    wateringFrequencyDays: 3,
    frostTolerant: false,
    description: 'An incredibly productive warm-season crop. A few plants go a long way.',
    tips: 'Give it lots of space to sprawl. Harvest fruits when they are small and tender for the best flavor. Check under large leaves daily during peak season.',
    careTasks: [
      { name: 'Check for squash vine borer eggs at base of stem', daysAfterPlanting: 14, recurring: 7 },
      { name: 'Fertilize when blooms appear', daysAfterPlanting: 30, recurring: null },
      { name: 'Begin harvesting fruit', daysAfterPlanting: 45, recurring: 2 }
    ]
  },
  {
    id: 9,
    name: 'Radishes',
    category: 'Root Vegetable',
    harvestType: 'single',
    daysToMaturity: 25,
    spacing: '1-2 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -4,
    wateringNeeds: 'Very consistent moisture',
    wateringFrequencyDays: 1,
    frostTolerant: true,
    description: 'A very fast-growing, cool-season crop perfect for filling in garden gaps.',
    tips: 'Ready to harvest in as little as 3-4 weeks. Inconsistent watering can cause them to split or become woody. Plant in succession for a steady supply.',
    careTasks: [
      { name: 'Thin seedlings to 1-2 inches apart', daysAfterPlanting: 10, recurring: null },
      { name: 'Begin harvesting roots', daysAfterPlanting: 22, recurring: 3 }
    ]
  },
  {
    id: 10,
    name: 'Cilantro',
    category: 'Herb',
    harvestType: 'continuous',
    daysToMaturity: 45,
    spacing: '4-6 inches',
    sunRequirement: 'Full sun to partial shade',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -2,
    wateringNeeds: 'Regular moisture',
    wateringFrequencyDays: 3,
    frostTolerant: true,
    description: 'A cool-season herb that bolts (goes to flower) very quickly in heat.',
    tips: 'Sow seeds every 2-3 weeks for a continuous supply. Harvest leaves often to delay bolting. The flowers are edible and attract beneficial insects.',
    careTasks: [
      { name: 'Begin harvesting leaves', daysAfterPlanting: 30, recurring: 7 }
    ]
  },
  {
    id: 11,
    name: 'Cucumber',
    category: 'Fruit',
    harvestType: 'continuous',
    daysToMaturity: 60,
    spacing: '12-18 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: 4,
    transplantWeeksAfterLastFrost: 2,
    directSowWeeksAfterLastFrost: 2,
    wateringNeeds: 'Very consistent, deep watering',
    wateringFrequencyDays: 2,
    frostTolerant: false,
    description: 'Vining plant that needs warm weather and consistent moisture.',
    tips: 'Grow on a trellis to save space and keep fruit clean. Water deeply to prevent bitterness. Mulching is highly recommended.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 21, recurring: null },
      { name: 'Fertilize with balanced fertilizer', daysAfterPlanting: 45, recurring: 14 },
      { name: 'Begin checking for harvestable cucumbers', daysAfterPlanting: 55, recurring: 2 }
    ]
  },
  {
    id: 12,
    name: 'Kale',
    category: 'Leafy Green',
    harvestType: 'continuous',
    daysToMaturity: 60,
    spacing: '12-18 inches',
    sunRequirement: 'Full sun to partial shade',
    startIndoorsWeeksBefore: 6,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksAfterLastFrost: -4,
    wateringNeeds: 'Consistent moisture',
    wateringFrequencyDays: 3,
    frostTolerant: true,
    description: 'Hardy cool-season green that gets sweeter after a light frost.',
    tips: 'Harvest outer leaves to allow the center to keep producing. Very cold tolerant and can often be harvested into winter.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 35, recurring: null },
      { name: 'Check for cabbage worms', daysAfterPlanting: 40, recurring: 7 },
      { name: 'Begin harvesting outer leaves', daysAfterPlanting: 55, recurring: 7 }
    ]
  },
  {
    id: 13,
    name: 'Strawberry (June-Bearing)',
    category: 'Fruit',
    harvestType: 'continuous',
    daysToMaturity: 365,
    spacing: '18 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksAfterLastFrost: null,
    wateringNeeds: 'Consistent moisture, especially during fruit development',
    wateringFrequencyDays: 2,
    frostTolerant: true,
    description: 'Perennial fruit that establishes in year one and produces heavily for a few weeks in year two.',
    tips: 'Pinch off all flowers in the first year to encourage a strong root system for future harvests. Mulch with straw to keep berries clean.',
    careTasks: [
      { name: 'Pinch off flowers (first year only)', daysAfterPlanting: 45, recurring: 7 },
      { name: 'Renovate bed after harvest (Year 2+)', daysAfterPlanting: 400, recurring: null }
    ]
  },
  {
    id: 14,
    name: 'Potato',
    category: 'Root Vegetable',
    harvestType: 'single',
    daysToMaturity: 90,
    spacing: '12 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -4,
    wateringNeeds: 'Consistent moisture, especially when tubers form',
    wateringFrequencyDays: 4,
    frostTolerant: false,
    description: 'Planted as "seed potatoes". The underground tubers are the harvested crop.',
    tips: '"Hill" the plants by mounding soil up the stems as they grow to protect tubers from sunlight, which can turn them green and toxic.',
    careTasks: [
      { name: 'Hill up soil around stems (first time)', daysAfterPlanting: 21, recurring: null },
      { name: 'Hill up soil around stems (second time)', daysAfterPlanting: 35, recurring: null },
      { name: 'Watch for Colorado potato beetles', daysAfterPlanting: 30, recurring: 5 },
      { name: 'Stop watering 2 weeks before harvest', daysAfterPlanting: 75, recurring: null },
      { name: 'Harvest new potatoes', daysAfterPlanting: 70, recurring: null },
      { name: 'Harvest main crop after foliage dies back', daysAfterPlanting: 90, recurring: null }
    ]
  },
  {
    id: 15,
    name: 'Peas',
    category: 'Legume',
    harvestType: 'continuous',
    daysToMaturity: 60,
    spacing: '2-4 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -6,
    wateringNeeds: 'Consistent moisture, especially during flowering and pod set',
    wateringFrequencyDays: 3,
    frostTolerant: true,
    description: 'One of the first crops to be planted in spring. Does not like heat.',
    tips: 'Provide a trellis for vining varieties. Harvest pods when they are plump and sweet for best flavor. Pods left too long become starchy.',
    careTasks: [
      { name: 'Install trellis at time of planting', daysAfterPlanting: 0, recurring: null },
      { name: 'Begin harvesting pods', daysAfterPlanting: 55, recurring: 3 }
    ]
  },
  {
    id: 16,
    name: 'Pumpkin',
    category: 'Fruit',
    harvestType: 'single',
    daysToMaturity: 100,
    spacing: '48-60 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: 2,
    wateringNeeds: 'Deep, infrequent watering',
    wateringFrequencyDays: 5,
    frostTolerant: false,
    description: 'A vining, warm-season crop that requires a lot of space and a long growing season.',
    tips: 'Water at the base of the plant to prevent powdery mildew. Place a board or straw under developing fruits to keep them off wet soil.',
    careTasks: [
      { name: 'Thin seedlings to the strongest one per mound', daysAfterPlanting: 14, recurring: null },
      { name: 'Check for squash vine borer eggs', daysAfterPlanting: 21, recurring: 7 },
      { name: 'Fertilize when vines begin to run', daysAfterPlanting: 35, recurring: null },
      { name: 'Harvest before first hard frost, when rind is hard', daysAfterPlanting: 95, recurring: null }
    ]
  },
  {
    id: 17,
    name: 'Garlic',
    category: 'Root Vegetable',
    harvestType: 'single',
    daysToMaturity: 240,
    spacing: '4-6 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: null,
    transplantWeeksAfterLastFrost: null,
    directSowWeeksAfterLastFrost: -24, // Represents planting in the fall, 24 weeks before spring's last frost
    wateringNeeds: 'Moderate, stop when leaves yellow',
    wateringFrequencyDays: 7,
    frostTolerant: true,
    description: 'Planted in the fall for a mid-summer harvest the following year.',
    tips: 'Plant individual cloves, pointed end up. Mulch heavily after planting to protect through winter. Harvest when the lower leaves start to turn brown.',
    careTasks: [
      { name: 'Mulch bed heavily for winter protection', daysAfterPlanting: 7, recurring: null },
      { name: 'Cut off flower scapes (on hardneck varieties)', daysAfterPlanting: 210, recurring: null },
      { name: 'Stop watering', daysAfterPlanting: 225, recurring: null },
      { name: 'Harvest bulbs when lower leaves are yellow', daysAfterPlanting: 240, recurring: null }
    ]
  },
  {
    id: 18,
    name: 'Broccoli',
    category: 'Vegetable',
    harvestType: 'continuous',
    daysToMaturity: 70,
    spacing: '18 inches',
    sunRequirement: 'Full sun',
    startIndoorsWeeksBefore: 6,
    transplantWeeksAfterLastFrost: -2,
    directSowWeeksAfterLastFrost: -4,
    wateringNeeds: 'Consistent moisture',
    wateringFrequencyDays: 4,
    frostTolerant: true,
    description: 'A cool-season crop that produces a large central head, followed by smaller side shoots.',
    tips: 'Transplant into the garden before the weather gets too hot. Heat can cause it to bolt. Harvest the main head before the flowers open.',
    careTasks: [
      { name: 'Begin hardening off seedlings', daysAfterPlanting: 35, recurring: null },
      { name: 'Fertilize 3 weeks after transplanting', daysAfterPlanting: 56, recurring: null },
      { name: 'Check for cabbage worms', daysAfterPlanting: 50, recurring: 5 },
      { name: 'Harvest main head when buds are tight', daysAfterPlanting: 80, recurring: null },
      { name: 'Continue harvesting side shoots', daysAfterPlanting: 90, recurring: 7 }
    ]
  }
];

// Hardiness zone data for calculating planting dates
export const HARDINESS_ZONES = {
  3: { lastFrostDate: '2025-05-15', firstFrostDate: '2025-09-15' },
  4: { lastFrostDate: '2025-05-01', firstFrostDate: '2025-10-01' },
  5: { lastFrostDate: '2025-04-15', firstFrostDate: '2025-10-15' },
  6: { lastFrostDate: '2025-04-01', firstFrostDate: '2025-10-30' },
  7: { lastFrostDate: '2025-03-15', firstFrostDate: '2025-11-15' },
  8: { lastFrostDate: '2025-03-01', firstFrostDate: '2025-12-01' },
  9: { lastFrostDate: '2025-02-15', firstFrostDate: '2025-12-15' },
  10: { lastFrostDate: '2025-01-30', firstFrostDate: '2026-01-15' }
};