import { Expose, Type } from 'class-transformer';
import { CatalogSetsProps } from '../types';
import { Hydratable } from './interfaces';

class RequisitesSimpleRuleValueValues implements Hydratable {
  logic: "and" | "or" = "and";

  @Expose({ name: "value" })
  raw_value: string[] = []; // Dehydrated IDs

  value: CatalogSetsProps[] = []; // Hydrated objects

  hydrate(sets: Map<String, CatalogSetsProps>) {
    this.value = this.raw_value.map(id => sets.get(id)).filter(Boolean) as CatalogSetsProps[]
  }
}

class RequisitesSimpleRuleValue implements Hydratable {
  id: string = "";
  condition: "courses" | "programs" | "courseSets" | "requirementSets" | "requisiteSets" | "none" = "none";

  @Type(() => RequisitesSimpleRuleValueValues)
  values: RequisitesSimpleRuleValueValues[] = [];

  getSetIds() {
    if (this.condition === "courseSets" || this.condition === "requirementSets" || this.condition === "requisiteSets") {
      return this.values.flatMap(value => value.raw_value)
    }
    return [];
  }

  hydrate(sets: Map<String, CatalogSetsProps>) {
    this.values.forEach(value => value.hydrate(sets))
  }
}

class RequisitesSimpleRule implements Hydratable {
  id: string = "";
  name: string = "";
  description: string = "";
  notes: string | null = null;
  condition: "anyOf" | "allOf" | "numberOf" | "completedAllOf" | "completedAtLeastXOf" | "completedAnyOf" | "enrolledIn" | "minimumCredits" | "minimumResidencyCredits" | "minimumGrade" | "averageGrade" | "freeformText" | "completeVariableCoursesAndVariableCredits" = "anyOf";

  @Expose({ name: "minCourses" })
  min_courses: number = 0;

  @Expose({ name: "maxCourses" })
  max_courses: number = 0;

  @Expose({ name: "minCredits" })
  min_credits: number = 0;

  @Expose({ name: "maxCredits" })
  max_credits: number = 0;

  credits: number = 0;
  number: number = 0;
  restriction: string = "";
  grade: string = "";

  @Expose({ name: "gradeType" })
  grade_type: string = "";

  @Type(() => RequisitesSimpleRule)
  @Expose({ name: "subRules" })
  sub_rules: RequisitesSimpleRule[] = []

  @Type(() => RequisitesSimpleRuleValue)
  value: string | RequisitesSimpleRuleValue = "";

  getSetIds() {
    if (this.value instanceof RequisitesSimpleRuleValue) {
      return this.value.getSetIds()
    }
    return [];
  }

  hydrate(sets: Map<String, CatalogSetsProps>) {
    if (this.value instanceof RequisitesSimpleRuleValue) {
      this.value.values.forEach(value => value.hydrate(sets))
    }

    if (this.sub_rules) {
      this.sub_rules.forEach(sub_rule => sub_rule.hydrate(sets))
    }
  }
}

class RequisiteSimpleChild implements Hydratable {
  id: string = "";
  type: string = "";
  name: string = "";
  notes: string | null = null;

  @Type(() => RequisitesSimpleRule)
  rules: RequisitesSimpleRule[] = [];

  getSetIds() {
    return this.rules.flatMap(rule => rule.getSetIds())
  }

  hydrate(sets: Map<String, CatalogSetsProps>) {
    this.rules.forEach(rule => rule.hydrate(sets))
  }
}

class RequisitesSimple extends Array<RequisiteSimpleChild> implements Hydratable {
  getSetIds() {
    return this.flatMap(requisite => requisite.getSetIds())
  }

  hydrate(sets: Map<String, CatalogSetsProps>) {
    this.forEach(requisite => requisite.hydrate(sets))
  }
}

class Requisites implements Hydratable {
  @Type(() => RequisitesSimple)
  @Expose({ name: "requisitesSimple" })
  requisites_simple: RequisitesSimple = new RequisitesSimple()

  getSetIds() {
    return this.requisites_simple.flatMap(requisite => requisite.getSetIds())
  }

  hydrate(sets: Map<String, CatalogSetsProps>) {
    this.requisites_simple.forEach(requisite => requisite.hydrate(sets))
  }
}

export { Requisites, RequisitesSimple }
