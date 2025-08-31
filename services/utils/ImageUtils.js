const plantImages = {
  1: require('../../assets/images/plants/1.jpg'),
  2: require('../../assets/images/plants/2.jpg'),
  3: require('../../assets/images/plants/3.jpg'),
  4: require('../../assets/images/plants/4.jpg'),
  5: require('../../assets/images/plants/5.jpg'),
  6: require('../../assets/images/plants/6.jpg'),
  7: require('../../assets/images/plants/7.jpg'),
  8: require('../../assets/images/plants/8.jpg'),
  9: require('../../assets/images/plants/9.jpg'),
  10: require('../../assets/images/plants/10.jpg'),
  11: require('../../assets/images/plants/11.jpg'),
  12: require('../../assets/images/plants/12.jpg'),
  13: require('../../assets/images/plants/13.jpg'),
  14: require('../../assets/images/plants/14.jpg'),
  15: require('../../assets/images/plants/15.jpg'),
  16: require('../../assets/images/plants/16.jpg'),
  17: require('../../assets/images/plants/17.jpg'),
  18: require('../../assets/images/plants/18.jpg'),
  19: require('../../assets/images/plants/19.jpg'),
  20: require('../../assets/images/plants/20.jpg'),
  21: require('../../assets/images/plants/21.jpg'),
  22: require('../../assets/images/plants/22.jpg'),
  23: require('../../assets/images/plants/23.jpg'),
  24: require('../../assets/images/plants/24.jpg'),
  25: require('../../assets/images/plants/25.jpg'),
  26: require('../../assets/images/plants/26.jpg'),
  27: require('../../assets/images/plants/27.jpg'),
  28: require('../../assets/images/plants/28.jpg'),
  29: require('../../assets/images/plants/29.jpg'),
  30: require('../../assets/images/plants/30.jpg'),
  31: require('../../assets/images/plants/31.jpg'),
  32: require('../../assets/images/plants/32.jpg'),
  33: require('../../assets/images/plants/33.jpg'),
  34: require('../../assets/images/plants/34.jpg'),
  35: require('../../assets/images/plants/35.jpg'),
  36: require('../../assets/images/plants/36.jpg'),
  37: require('../../assets/images/plants/37.jpg'),
  38: require('../../assets/images/plants/38.jpg'),
  39: require('../../assets/images/plants/39.jpg'),
  40: require('../../assets/images/plants/40.jpg'),
  41: require('../../assets/images/plants/41.jpg'),
  42: require('../../assets/images/plants/42.jpg'),
  // 43: require('../../assets/images/plants/43.jpg'), // Renable when image is added
  44: require('../../assets/images/plants/44.jpg'),
  45: require('../../assets/images/plants/45.jpg'),
  46: require('../../assets/images/plants/46.jpg'),
  47: require('../../assets/images/plants/47.jpg'),
  48: require('../../assets/images/plants/48.jpg'),
  49: require('../../assets/images/plants/49.jpg'),
  50: require('../../assets/images/plants/50.jpg'),
  51: require('../../assets/images/plants/51.jpg'),
  52: require('../../assets/images/plants/52.jpg'),
  53: require('../../assets/images/plants/53.jpg'),
  54: require('../../assets/images/plants/54.jpg'),
  55: require('../../assets/images/plants/55.jpg'),
  63: require('../../assets/images/plants/63.jpg'),
  64: require('../../assets/images/plants/64.jpg'),
  65: require('../../assets/images/plants/65.jpg'),
  66: require('../../assets/images/plants/66.jpg'),
};

export const getPlantImage = (plantId) => {
  return plantImages[plantId];
};

const pestImages = {};

export const getPestImage = (pestId) => {
  // Assuming the pestId is a string like 'pest-1' and the image is 'pest-1.jpg'
  // This is a dynamic approach since we don't have the files yet.
  // A static map would be better if the file names are known.
  const imageMap = {
    'pest-1': require('../../assets/images/pests/pest-1.jpg'),
    'pest-2': require('../../assets/images/pests/pest-2.jpg'),
    'pest-3': require('../../assets/images/pests/pest-3.jpg'),
    'pest-4': require('../../assets/images/pests/pest-4.jpg'),
    'pest-5': require('../../assets/images/pests/pest-5.jpg'),
    'disease-1': require('../../assets/images/pests/disease-1.jpg'),
    'disease-2': require('../../assets/images/pests/disease-2.jpg'),
    'disease-3': require('../../assets/images/pests/disease-3.jpg'),
    'disease-4': require('../../assets/images/pests/disease-4.jpg'),
  };
  return imageMap[pestId];
};
