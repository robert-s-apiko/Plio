import User from './User';
import Organization from './Organization';
import File from './File';
import Action from './Action';
import Risk from './Risk';
import Analysis from './Analysis';
import ImprovementPlan from './ImprovementPlan';
import Lesson from './Lesson';

export default {
  ...User,
  ...Organization,
  ...File,
  ...Action,
  ...Risk,
  ...Analysis,
  ...ImprovementPlan,
  ...Lesson,
};
