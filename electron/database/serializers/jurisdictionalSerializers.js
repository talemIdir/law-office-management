/**
 * Serializers for Jurisdictional Models
 * These functions transform Sequelize model instances into plain JSON objects
 * with consistent formatting and only the necessary fields
 */

/**
 * Serialize a Judicial Council
 * @param {Object} council - JudicialCouncil model instance
 * @returns {Object} Serialized council data
 */
export const serializeJudicialCouncil = (council) => {
  if (!council) return null;

  const data = council.toJSON ? council.toJSON() : council;

  return {
    id: data.id,
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    address: data.address || null,
    receptionDays: data.receptionDays || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Include associated courts if present
    courts: data.courts ? data.courts.map(serializeFirstDegreeCourt) : undefined
  };
};

/**
 * Serialize a First Degree Court
 * @param {Object} court - FirstDegreeCourt model instance
 * @returns {Object} Serialized court data
 */
export const serializeFirstDegreeCourt = (court) => {
  if (!court) return null;

  const data = court.toJSON ? court.toJSON() : court;

  return {
    id: data.id,
    name: data.name,
    councilId: data.councilId,
    isBranch: data.isBranch || false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Include associated council if present
    council: data.council ? {
      id: data.council.id,
      name: data.council.name,
      phone: data.council.phone || null,
      email: data.council.email || null,
      website: data.council.website || null,
      address: data.council.address || null
    } : undefined,
    // Legacy format for backward compatibility
    JudicialCouncil: data.JudicialCouncil ? {
      id: data.JudicialCouncil.id,
      name: data.JudicialCouncil.name,
      phone: data.JudicialCouncil.phone || null,
      email: data.JudicialCouncil.email || null,
      website: data.JudicialCouncil.website || null,
      address: data.JudicialCouncil.address || null
    } : undefined
  };
};

/**
 * Serialize an Administrative Appeal Court
 * @param {Object} court - AdministrativeAppealCourt model instance
 * @returns {Object} Serialized court data
 */
export const serializeAdministrativeAppealCourt = (court) => {
  if (!court) return null;

  const data = court.toJSON ? court.toJSON() : court;

  return {
    id: data.id,
    name: data.name,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Include associated courts if present
    administrativeCourts: data.administrativeCourts
      ? data.administrativeCourts.map(serializeAdministrativeCourt)
      : undefined
  };
};

/**
 * Serialize an Administrative Court
 * @param {Object} court - AdministrativeCourt model instance
 * @returns {Object} Serialized court data
 */
export const serializeAdministrativeCourt = (court) => {
  if (!court) return null;

  const data = court.toJSON ? court.toJSON() : court;

  return {
    id: data.id,
    name: data.name,
    appealCourtId: data.appealCourtId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Include associated appeal court if present
    appealCourt: data.appealCourt ? {
      id: data.appealCourt.id,
      name: data.appealCourt.name
    } : undefined,
    // Legacy format for backward compatibility
    AdministrativeAppealCourt: data.AdministrativeAppealCourt ? {
      id: data.AdministrativeAppealCourt.id,
      name: data.AdministrativeAppealCourt.name
    } : undefined
  };
};

/**
 * Serialize a Specialized Commercial Court
 * @param {Object} court - SpecializedCommercialCourt model instance
 * @returns {Object} Serialized court data
 */
export const serializeSpecializedCommercialCourt = (court) => {
  if (!court) return null;

  const data = court.toJSON ? court.toJSON() : court;

  return {
    id: data.id,
    name: data.name,
    jurisdictionDetails: data.jurisdictionDetails || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

/**
 * Serialize a list of items using the appropriate serializer
 * @param {Array} items - Array of model instances
 * @param {Function} serializer - Serializer function to use
 * @returns {Array} Array of serialized items
 */
export const serializeList = (items, serializer) => {
  if (!Array.isArray(items)) return [];
  return items.map(serializer).filter(item => item !== null);
};

/**
 * Serialize all courts for unified response
 * @param {Object} courtsData - Object containing all court types
 * @returns {Object} Serialized courts data
 */
export const serializeAllCourts = (courtsData) => {
  return {
    firstDegreeCourts: serializeList(
      courtsData.firstDegreeCourts || [],
      serializeFirstDegreeCourt
    ),
    administrativeCourts: serializeList(
      courtsData.administrativeCourts || [],
      serializeAdministrativeCourt
    ),
    commercialCourts: serializeList(
      courtsData.commercialCourts || [],
      serializeSpecializedCommercialCourt
    ),
    // Add summary counts
    counts: {
      firstDegree: courtsData.firstDegreeCourts?.length || 0,
      administrative: courtsData.administrativeCourts?.length || 0,
      commercial: courtsData.commercialCourts?.length || 0,
      total: (courtsData.firstDegreeCourts?.length || 0) +
             (courtsData.administrativeCourts?.length || 0) +
             (courtsData.commercialCourts?.length || 0)
    }
  };
};
