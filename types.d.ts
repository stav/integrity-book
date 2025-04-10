type Lead = {
  leadsId: number;
  prefix: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  suffix: string | null;
  leadStatusId: number;
  statusName: string;
  notes: string;
  medicareBeneficiaryID: string;
  partA: string | null;
  partB: string | null;
  height: number | null;
  weight: number | null;
  gender: string | null;
  maritalStatus: string;
  hasMedicAid: number;
  isTobaccoUser: boolean | null;
  birthdate: string;
  primaryCommunication: string;
  reminders: any[]; // Replace `any` with a specific type if known
  activities: any[]; // Replace `any` with a specific type if known
  addresses: {
    leadAddressId: number;
    address1: string | null;
    address2: string | null;
    city: string;
    stateCode: string;
    postalCode: string;
    county: string;
    countyFips: string;
    latitude: number | null;
    longitude: number | null;
    createDate: string;
    modifyDate: string;
  }[];
  emails: {
    emailID: number;
    leadEmail: string;
    createDate: string;
    modifyDate: string;
    inactive: boolean;
    hasKnownBounces: boolean | null;
    isValid: boolean;
  }[];
  phones: any[]; // Replace `any` with a specific type if known
  leadSource: string;
  contactRecordType: string;
  inactive: number;
  leadTags: {
    leadTagId: number;
    metadata: any | null; // Replace `any` with a specific type if known
    interactionUrl: string | null;
    interactionUrlLabel: string | null;
    tag: {
      tagCategory: {
        tagCategoryId: number;
        parentCategoryId: number | null;
        tagCategoryName: string;
        parentCategoryName: string | null;
        tagCategoryColor: string;
        isActive: boolean;
      };
      tagId: number;
      tagLabel: string;
      tagCategoryId: number;
      tagIconUrl: string | null;
      metadata: any | null; // Replace `any` with a specific type if known
      isActive: boolean;
      createDate: string;
      modifyDate: string | null;
    };
  }[];
  createDate: string;
  lifePolicyCount: number;
  healthPolicyCount: number;
  subsidyLevel: string;
  [key: string]: string | number | null; // Index signature
};

export type ApiResponse = {
  pageResult: {
    total: number;
    pageSize: number;
    totalPages: number;
  };
  result: Lead[];
};

export type Token = string | undefined;
