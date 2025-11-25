import JudicialCouncil from '../models/JudicialCouncil.js';
import FirstDegreeCourt from '../models/FirstDegreeCourt.js';
import AdministrativeAppealCourt from '../models/AdministrativeAppealCourt.js';
import AdministrativeCourt from '../models/AdministrativeCourt.js';
import SpecializedCommercialCourt from '../models/SpecializedCommercialCourt.js';
import SupremeCourt from '../models/SupremeCourt.js';
import SupremeChamber from '../models/SupremeChamber.js';
import StateCouncil from '../models/StateCouncil.js';
import StateCouncilChamber from '../models/StateCouncilChamber.js';
import {
  serializeJudicialCouncil,
  serializeFirstDegreeCourt,
  serializeAdministrativeAppealCourt,
  serializeAdministrativeCourt,
  serializeSpecializedCommercialCourt,
  serializeList,
  serializeAllCourts
} from '../serializers/jurisdictionalSerializers.js';

/**
 * Service for managing jurisdictional data (courts and councils)
 */
class JurisdictionalService {
  /**
   * Get all judicial councils
   * @returns {Promise<Object>} Success response with councils data
   */
  async getAllJudicialCouncils() {
    try {
      const councils = await JudicialCouncil.findAll({
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(councils, serializeJudicialCouncil),
        count: councils.length,
        message: 'Judicial councils fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching judicial councils:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch judicial councils'
      };
    }
  }

  /**
   * Get a judicial council by ID with its courts
   * @param {number} id - Council ID
   * @returns {Promise<Object>} Success response with council data
   */
  async getJudicialCouncilById(id) {
    try {
      if (!id) {
        throw new Error('Council ID is required');
      }

      const council = await JudicialCouncil.findByPk(id, {
        include: [{
          model: FirstDegreeCourt,
          as: 'courts',
          order: [['name', 'ASC']]
        }]
      });

      if (!council) {
        throw new Error('Judicial council not found');
      }

      return {
        success: true,
        data: serializeJudicialCouncil(council),
        message: 'Judicial council fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching judicial council:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch judicial council'
      };
    }
  }

  /**
   * Get all first degree courts
   * @param {Object} filters - Optional filters (councilId, isBranch)
   * @returns {Promise<Object>} Success response with courts data
   */
  async getAllFirstDegreeCourts(filters = {}) {
    try {
      const where = {};

      if (filters.councilId) {
        where.councilId = filters.councilId;
      }

      if (filters.isBranch !== undefined) {
        where.isBranch = filters.isBranch;
      }

      const courts = await FirstDegreeCourt.findAll({
        where,
        include: [{
          model: JudicialCouncil,
          as: 'council'
        }],
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(courts, serializeFirstDegreeCourt),
        count: courts.length,
        message: 'First degree courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching first degree courts:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch first degree courts'
      };
    }
  }

  /**
   * Get courts by judicial council ID
   * @param {number} councilId - Council ID
   * @returns {Promise<Object>} Success response with courts data
   */
  async getCourtsByCouncilId(councilId) {
    try {
      if (!councilId) {
        throw new Error('Council ID is required');
      }

      const courts = await FirstDegreeCourt.findAll({
        where: { councilId },
        order: [['isBranch', 'ASC'], ['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(courts, serializeFirstDegreeCourt),
        count: courts.length,
        message: 'Courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching courts by council:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch courts by council'
      };
    }
  }

  /**
   * Get all administrative appeal courts
   * @returns {Promise<Object>} Success response with courts data
   */
  async getAllAdministrativeAppealCourts() {
    try {
      const courts = await AdministrativeAppealCourt.findAll({
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(courts, serializeAdministrativeAppealCourt),
        count: courts.length,
        message: 'Administrative appeal courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching administrative appeal courts:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch administrative appeal courts'
      };
    }
  }

  /**
   * Get all administrative courts
   * @param {Object} filters - Optional filters (appealCourtId)
   * @returns {Promise<Object>} Success response with courts data
   */
  async getAllAdministrativeCourts(filters = {}) {
    try {
      const where = {};

      if (filters.appealCourtId) {
        where.appealCourtId = filters.appealCourtId;
      }

      const courts = await AdministrativeCourt.findAll({
        where,
        include: [{
          model: AdministrativeAppealCourt,
          as: 'appealCourt'
        }],
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(courts, serializeAdministrativeCourt),
        count: courts.length,
        message: 'Administrative courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching administrative courts:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch administrative courts'
      };
    }
  }

  /**
   * Get administrative courts by appeal court ID
   * @param {number} appealCourtId - Appeal court ID
   * @returns {Promise<Object>} Success response with courts data
   */
  async getAdminCourtsByAppealCourtId(appealCourtId) {
    try {
      if (!appealCourtId) {
        throw new Error('Appeal court ID is required');
      }

      const courts = await AdministrativeCourt.findAll({
        where: { appealCourtId },
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(courts, serializeAdministrativeCourt),
        count: courts.length,
        message: 'Administrative courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching administrative courts by appeal court:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch administrative courts by appeal court'
      };
    }
  }

  /**
   * Get all specialized commercial courts
   * @returns {Promise<Object>} Success response with courts data
   */
  async getAllCommercialCourts() {
    try {
      const courts = await SpecializedCommercialCourt.findAll({
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: serializeList(courts, serializeSpecializedCommercialCourt),
        count: courts.length,
        message: 'Commercial courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching commercial courts:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch commercial courts'
      };
    }
  }

  /**
   * Get a commercial court by ID
   * @param {number} id - Court ID
   * @returns {Promise<Object>} Success response with court data
   */
  async getCommercialCourtById(id) {
    try {
      if (!id) {
        throw new Error('Commercial court ID is required');
      }

      const court = await SpecializedCommercialCourt.findByPk(id);

      if (!court) {
        throw new Error('Commercial court not found');
      }

      return {
        success: true,
        data: serializeSpecializedCommercialCourt(court),
        message: 'Commercial court fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching commercial court:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch commercial court'
      };
    }
  }

  /**
   * Get all courts (for dropdowns)
   * Returns a unified list of all court types
   * @returns {Promise<Object>} Success response with all courts data
   */
  async getAllCourts() {
    try {
      const [firstDegree, administrative, commercial] = await Promise.all([
        FirstDegreeCourt.findAll({
          include: [{ model: JudicialCouncil, as: 'council' }],
          order: [['name', 'ASC']]
        }),
        AdministrativeCourt.findAll({
          order: [['name', 'ASC']]
        }),
        SpecializedCommercialCourt.findAll({
          order: [['name', 'ASC']]
        })
      ]);

      const courtsData = {
        firstDegreeCourts: firstDegree,
        administrativeCourts: administrative,
        commercialCourts: commercial
      };

      return {
        success: true,
        data: serializeAllCourts(courtsData),
        message: 'All courts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching all courts:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch all courts'
      };
    }
  }

  /**
   * Get the Supreme Court
   * @returns {Promise<Object>} Success response with Supreme Court data
   */
  async getSupremeCourt() {
    try {
      const supremeCourt = await SupremeCourt.findOne({
        include: [{
          model: SupremeChamber,
          as: 'chambers',
          order: [['name', 'ASC']]
        }]
      });

      if (!supremeCourt) {
        throw new Error('Supreme Court not found');
      }

      return {
        success: true,
        data: supremeCourt.toJSON(),
        message: 'Supreme Court fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching Supreme Court:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch Supreme Court'
      };
    }
  }

  /**
   * Get all Supreme Court chambers
   * @returns {Promise<Object>} Success response with chambers data
   */
  async getSupremeChambers() {
    try {
      const chambers = await SupremeChamber.findAll({
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: chambers.map(c => c.toJSON()),
        count: chambers.length,
        message: 'Supreme Court chambers fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching Supreme Court chambers:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch Supreme Court chambers'
      };
    }
  }

  /**
   * Get a Supreme Court chamber by ID
   * @param {number} id - Chamber ID
   * @returns {Promise<Object>} Success response with chamber data
   */
  async getSupremeChamberById(id) {
    try {
      if (!id) {
        throw new Error('Chamber ID is required');
      }

      const chamber = await SupremeChamber.findByPk(id);

      if (!chamber) {
        throw new Error('Chamber not found');
      }

      return {
        success: true,
        data: chamber.toJSON(),
        message: 'Chamber fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching chamber:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch chamber'
      };
    }
  }

  /**
   * Get the State Council
   * @returns {Promise<Object>} Success response with State Council data
   */
  async getStateCouncil() {
    try {
      const stateCouncil = await StateCouncil.findOne({
        include: [{
          model: StateCouncilChamber,
          as: 'chambers',
          order: [['name', 'ASC']]
        }]
      });

      if (!stateCouncil) {
        throw new Error('State Council not found');
      }

      return {
        success: true,
        data: stateCouncil.toJSON(),
        message: 'State Council fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching State Council:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch State Council'
      };
    }
  }

  /**
   * Get all State Council chambers
   * @returns {Promise<Object>} Success response with chambers data
   */
  async getStateCouncilChambers() {
    try {
      const chambers = await StateCouncilChamber.findAll({
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: chambers.map(c => c.toJSON()),
        count: chambers.length,
        message: 'State Council chambers fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching State Council chambers:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch State Council chambers'
      };
    }
  }

  /**
   * Get a State Council chamber by ID
   * @param {number} id - Chamber ID
   * @returns {Promise<Object>} Success response with chamber data
   */
  async getStateCouncilChamberById(id) {
    try {
      if (!id) {
        throw new Error('Chamber ID is required');
      }

      const chamber = await StateCouncilChamber.findByPk(id);

      if (!chamber) {
        throw new Error('Chamber not found');
      }

      return {
        success: true,
        data: chamber.toJSON(),
        message: 'Chamber fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching chamber:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch chamber'
      };
    }
  }
}

export default new JurisdictionalService();
