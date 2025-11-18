import JudicialCouncil from '../models/JudicialCouncil.js';
import FirstDegreeCourt from '../models/FirstDegreeCourt.js';
import AdministrativeAppealCourt from '../models/AdministrativeAppealCourt.js';
import AdministrativeCourt from '../models/AdministrativeCourt.js';
import SpecializedCommercialCourt from '../models/SpecializedCommercialCourt.js';

/**
 * Service for managing jurisdictional data (courts and councils)
 */
class JurisdictionalService {
  /**
   * Get all judicial councils
   */
  async getAllJudicialCouncils() {
    try {
      return await JudicialCouncil.findAll({
        order: [['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching judicial councils:', error);
      throw error;
    }
  }

  /**
   * Get a judicial council by ID with its courts
   */
  async getJudicialCouncilById(id) {
    try {
      return await JudicialCouncil.findByPk(id, {
        include: [{
          model: FirstDegreeCourt,
          as: 'courts',
          order: [['name', 'ASC']]
        }]
      });
    } catch (error) {
      console.error('Error fetching judicial council:', error);
      throw error;
    }
  }

  /**
   * Get all first degree courts
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

      return await FirstDegreeCourt.findAll({
        where,
        include: [{
          model: JudicialCouncil,
          as: 'council'
        }],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching first degree courts:', error);
      throw error;
    }
  }

  /**
   * Get courts by judicial council ID
   */
  async getCourtsByCouncilId(councilId) {
    try {
      return await FirstDegreeCourt.findAll({
        where: { councilId },
        order: [['isBranch', 'ASC'], ['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching courts by council:', error);
      throw error;
    }
  }

  /**
   * Get all administrative appeal courts
   */
  async getAllAdministrativeAppealCourts() {
    try {
      return await AdministrativeAppealCourt.findAll({
        order: [['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching administrative appeal courts:', error);
      throw error;
    }
  }

  /**
   * Get all administrative courts
   */
  async getAllAdministrativeCourts(filters = {}) {
    try {
      const where = {};

      if (filters.appealCourtId) {
        where.appealCourtId = filters.appealCourtId;
      }

      return await AdministrativeCourt.findAll({
        where,
        include: [{
          model: AdministrativeAppealCourt,
          as: 'appealCourt'
        }],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching administrative courts:', error);
      throw error;
    }
  }

  /**
   * Get administrative courts by appeal court ID
   */
  async getAdminCourtsByAppealCourtId(appealCourtId) {
    try {
      return await AdministrativeCourt.findAll({
        where: { appealCourtId },
        order: [['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching administrative courts by appeal court:', error);
      throw error;
    }
  }

  /**
   * Get all specialized commercial courts
   */
  async getAllCommercialCourts() {
    try {
      return await SpecializedCommercialCourt.findAll({
        order: [['name', 'ASC']]
      });
    } catch (error) {
      console.error('Error fetching commercial courts:', error);
      throw error;
    }
  }

  /**
   * Get a commercial court by ID
   */
  async getCommercialCourtById(id) {
    try {
      return await SpecializedCommercialCourt.findByPk(id);
    } catch (error) {
      console.error('Error fetching commercial court:', error);
      throw error;
    }
  }

  /**
   * Get all courts (for dropdowns)
   * Returns a unified list of all court types
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

      return {
        firstDegreeCourts: firstDegree,
        administrativeCourts: administrative,
        commercialCourts: commercial
      };
    } catch (error) {
      console.error('Error fetching all courts:', error);
      throw error;
    }
  }
}

export default new JurisdictionalService();
