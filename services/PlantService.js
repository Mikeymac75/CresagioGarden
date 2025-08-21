import fruits from '../data/plants/fruits.json';
import grains from '../data/plants/grains.json';
import herbs from '../data/plants/herbs.json';
import leafy_greens from '../data/plants/leafy_greens.json';
import legumes from '../data/plants/legumes.json';
import root_vegetables from '../data/plants/root_vegetables.json';
import vegetables from '../data/plants/vegetables.json';

const PLANTS = [
  ...fruits,
  ...grains,
  ...herbs,
  ...leafy_greens,
  ...legumes,
  ...root_vegetables,
  ...vegetables,
];

export default PLANTS;
