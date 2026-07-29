import {
  createDefaultAdmissionConfig,
  type AdmissionConfig,
  type AdmissionDocumentRequirement,
  type AdmissionScreeningRule,
  type SchoolType,
} from "@/components/admissions/admissions-workflow-data";
import { broadcastAdmissionConfigChange } from "./admission-config-events";

let config: AdmissionConfig = createDefaultAdmissionConfig("university");

function touchConfig(next: AdmissionConfig, reason: string) {
  config = next;
  broadcastAdmissionConfigChange(reason);
  return config;
}

export function getAdmissionConfig() {
  return config;
}

export function updateAdmissionConfig(patch: Partial<AdmissionConfig>) {
  return touchConfig(
    {
      ...config,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
    "config_updated",
  );
}

export function setSchoolType(schoolType: SchoolType) {
  const defaults = createDefaultAdmissionConfig(schoolType);
  return touchConfig(
    {
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
    },
    "school_type_changed",
  );
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
  return touchConfig(createDefaultAdmissionConfig(schoolType ?? config.schoolType), "config_reset");
}
