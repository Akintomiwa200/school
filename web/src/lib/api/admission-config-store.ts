import {
  createDefaultAdmissionConfig,
  type AdmissionConfig,
  type AdmissionDocumentRequirement,
  type AdmissionScreeningRule,
  type SchoolType,
} from "@/components/admissions/admissions-workflow-data";

let config: AdmissionConfig = createDefaultAdmissionConfig("university");

export function getAdmissionConfig() {
  return config;
}

export function updateAdmissionConfig(patch: Partial<AdmissionConfig>) {
  config = {
    ...config,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return config;
}

export function setSchoolType(schoolType: SchoolType) {
  const defaults = createDefaultAdmissionConfig(schoolType);
  config = {
    ...defaults,
    ...config,
    schoolType,
    applicationFee: config.applicationFee || defaults.applicationFee,
    programOptions: config.programOptions.length ? config.programOptions : defaults.programOptions,
    requiredDocuments: patchDocuments(config.requiredDocuments, defaults.requiredDocuments),
    screeningRules: patchRules(config.screeningRules, defaults.screeningRules),
    examSubjects: config.examSubjects.length ? config.examSubjects : defaults.examSubjects,
    programLabel: defaults.programLabel,
    updatedAt: new Date().toISOString(),
  };
  return config;
}

function patchDocuments(
  current: AdmissionDocumentRequirement[],
  defaults: AdmissionDocumentRequirement[],
) {
  return current.length ? current : defaults;
}

function patchRules(current: AdmissionScreeningRule[], defaults: AdmissionScreeningRule[]) {
  return current.length ? current : defaults;
}

export function resetAdmissionConfig(schoolType?: SchoolType) {
  config = createDefaultAdmissionConfig(schoolType ?? config.schoolType);
  return config;
}
