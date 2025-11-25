import { Op } from "sequelize";
import Document from "../models/Document.js";
import Client from "../models/Client.js";
import Case from "../models/Case.js";
import fs from "fs/promises";
import path from "path";

/**
 * Document Service
 * Handles all business logic for document operations
 */

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
];
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp'];
const DANGEROUS_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'jar', 'app', 'deb', 'rpm'];

class DocumentService {
  /**
   * Validate file for security and size
   * @param {Object} fileData - File data containing fileName, fileSize, mimeType
   * @returns {Object} Validation result
   */
  validateFile(fileData) {
    const { fileName, fileSize, mimeType } = fileData;

    // Check if file exists
    if (!fileName) {
      return { valid: false, error: "اسم الملف مطلوب" };
    }

    // Extract file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) {
      return { valid: false, error: "امتداد الملف غير صالح" };
    }

    // Check for dangerous file types
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `نوع الملف .${ext} غير مسموح به لأسباب أمنية` };
    }

    // Check if extension is allowed
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `امتداد الملف .${ext} غير مسموح به. الأنواع المسموحة: ${ALLOWED_EXTENSIONS.join(', ')}` };
    }

    // Check MIME type if provided
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return { valid: false, error: "نوع الملف غير مدعوم" };
    }

    // Check file size
    if (fileSize) {
      if (fileSize > MAX_FILE_SIZE) {
        const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        return {
          valid: false,
          error: `حجم الملف (${fileSizeMB} ميجابايت) يتجاوز الحد الأقصى المسموح به (${maxSizeMB} ميجابايت)`
        };
      }
    }

    return { valid: true };
  }
  /**
   * Create a new document
   * @param {Object} documentData - Document data
   * @returns {Promise<Object>} Created document
   */
  async createDocument(documentData) {
    try {
      // Validate required fields
      if (!documentData.title) {
        throw new Error("Document title is required");
      }
      if (!documentData.documentType) {
        throw new Error("Document type is required");
      }

      // Validate file if fileName is provided
      if (documentData.fileName) {
        const validation = this.validateFile({
          fileName: documentData.fileName,
          fileSize: documentData.fileSize,
          mimeType: documentData.mimeType
        });

        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Verify client exists if clientId is provided
      if (documentData.clientId) {
        const client = await Client.findByPk(documentData.clientId);
        if (!client) {
          throw new Error("Client not found");
        }
      }

      // Verify case exists if caseId is provided
      if (documentData.caseId) {
        const caseData = await Case.findByPk(documentData.caseId);
        if (!caseData) {
          throw new Error("Case not found");
        }
      }

      // Set file name to title if not provided
      if (!documentData.fileName && documentData.title) {
        documentData.fileName = documentData.title;
      }

      // Detect MIME type from file extension if not provided
      if (!documentData.mimeType && documentData.fileName) {
        const ext = documentData.fileName.split('.').pop()?.toLowerCase();
        const mimeTypes = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'bmp': 'image/bmp',
        };
        documentData.mimeType = mimeTypes[ext] || 'application/octet-stream';
      }

      const document = await Document.create(documentData);

      return {
        success: true,
        data: document.toJSON(),
        message: "Document created successfully",
      };
    } catch (error) {
      console.error("Error creating document:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to create document",
      };
    }
  }

  /**
   * Get all documents with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} List of documents
   */
  async getAllDocuments(filters = {}) {
    try {
      let where = {};

      // If filters has a 'where' property, use it directly (Sequelize-style)
      if (filters.where) {
        where = { ...filters.where };
      } else {
        // Otherwise, build where clause from individual filter properties (legacy support)
        // Apply filters
        if (filters.documentType) {
          where.documentType = filters.documentType;
        }

        if (filters.clientId) {
          where.clientId = filters.clientId;
        }

        if (filters.caseId) {
          where.caseId = filters.caseId;
        }

        if (filters.startDate) {
          where.uploadDate = {
            [Op.gte]: filters.startDate,
          };
        }

        if (filters.endDate) {
          if (where.uploadDate) {
            where.uploadDate[Op.lte] = filters.endDate;
          } else {
            where.uploadDate = {
              [Op.lte]: filters.endDate,
            };
          }
        }

        if (filters.search) {
          where[Op.or] = [
            { title: { [Op.like]: `%${filters.search}%` } },
            { description: { [Op.like]: `%${filters.search}%` } },
            { fileName: { [Op.like]: `%${filters.search}%` } },
            { notes: { [Op.like]: `%${filters.search}%` } },
          ];
        }
      }

      // Use custom order if provided, otherwise default
      const order = filters.order || [["uploadDate", "DESC"]];

      const documents = await Document.findAll({
        where,
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order,
      });

      return {
        success: true,
        data: documents.map((document) => document.toJSON()),
        count: documents.length,
      };
    } catch (error) {
      console.error("Error fetching documents:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch documents",
      };
    }
  }

  /**
   * Get a document by ID
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocumentById(id) {
    try {
      if (!id) {
        throw new Error("Document ID is required");
      }

      const document = await Document.findByPk(id, {
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return {
        success: true,
        data: document.toJSON(),
      };
    } catch (error) {
      console.error("Error fetching document:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch document",
      };
    }
  }

  /**
   * Update a document
   * @param {number} id - Document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated document
   */
  async updateDocument(id, updateData) {
    try {
      if (!id) {
        throw new Error("Document ID is required");
      }

      const document = await Document.findByPk(id);
      if (!document) {
        throw new Error("Document not found");
      }

      await document.update(updateData);

      return {
        success: true,
        data: document.toJSON(),
        message: "Document updated successfully",
      };
    } catch (error) {
      console.error("Error updating document:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to update document",
      };
    }
  }

  /**
   * Delete a document
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteDocument(id) {
    try {
      if (!id) {
        throw new Error("Document ID is required");
      }

      const document = await Document.findByPk(id);
      if (!document) {
        throw new Error("Document not found");
      }

      // Delete physical file if it exists
      if (document.filePath) {
        try {
          await fs.unlink(document.filePath);
          console.log(`Physical file deleted: ${document.filePath}`);
        } catch (fileError) {
          // Log warning but don't fail the operation if file doesn't exist
          console.warn(`Warning: Could not delete physical file: ${fileError.message}`);
          // File might already be deleted or moved - continue with DB deletion
        }
      }

      // Delete database record
      await document.destroy();

      return {
        success: true,
        message: "Document deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting document:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to delete document",
      };
    }
  }

  /**
   * Get documents by client
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>} Client documents
   */
  async getDocumentsByClient(clientId) {
    try {
      if (!clientId) {
        throw new Error("Client ID is required");
      }

      const documents = await Document.findAll({
        where: { clientId },
        include: [{ model: Case, as: "case" }],
        order: [["uploadDate", "DESC"]],
      });

      return {
        success: true,
        data: documents.map((document) => document.toJSON()),
        count: documents.length,
      };
    } catch (error) {
      console.error("Error fetching documents by client:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch documents by client",
      };
    }
  }

  /**
   * Get documents by case
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case documents
   */
  async getDocumentsByCase(caseId) {
    try {
      if (!caseId) {
        throw new Error("Case ID is required");
      }

      const documents = await Document.findAll({
        where: { caseId },
        include: [{ model: Client, as: "client" }],
        order: [["uploadDate", "DESC"]],
      });

      return {
        success: true,
        data: documents.map((document) => document.toJSON()),
        count: documents.length,
      };
    } catch (error) {
      console.error("Error fetching documents by case:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch documents by case",
      };
    }
  }

  /**
   * Get documents by type
   * @param {string} documentType - Document type
   * @returns {Promise<Object>} Documents by type
   */
  async getDocumentsByType(documentType) {
    try {
      if (!documentType) {
        throw new Error("Document type is required");
      }

      const documents = await Document.findAll({
        where: { documentType },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["uploadDate", "DESC"]],
      });

      return {
        success: true,
        data: documents.map((document) => document.toJSON()),
        count: documents.length,
      };
    } catch (error) {
      console.error("Error fetching documents by type:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch documents by type",
      };
    }
  }

  /**
   * Get recent documents
   * @param {number} limit - Number of documents to retrieve
   * @returns {Promise<Object>} Recent documents
   */
  async getRecentDocuments(limit = 10) {
    try {
      const documents = await Document.findAll({
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["uploadDate", "DESC"]],
        limit,
      });

      return {
        success: true,
        data: documents.map((document) => document.toJSON()),
        count: documents.length,
      };
    } catch (error) {
      console.error("Error fetching recent documents:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch recent documents",
      };
    }
  }

  /**
   * Search documents
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  async searchDocuments(searchTerm) {
    try {
      if (!searchTerm) {
        return this.getAllDocuments();
      }

      const documents = await Document.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { fileName: { [Op.like]: `%${searchTerm}%` } },
            { notes: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        include: [
          { model: Client, as: "client" },
          { model: Case, as: "case" },
        ],
        order: [["uploadDate", "DESC"]],
      });

      return {
        success: true,
        data: documents.map((document) => document.toJSON()),
        count: documents.length,
      };
    } catch (error) {
      console.error("Error searching documents:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to search documents",
      };
    }
  }

  /**
   * Get document statistics
   * @returns {Promise<Object>} Document statistics
   */
  async getDocumentStats() {
    try {
      const documents = await Document.findAll();

      const stats = {
        totalDocuments: documents.length,
        totalSize: documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
        byType: {
          contract: documents.filter((d) => d.documentType === "contract")
            .length,
          court_filing: documents.filter(
            (d) => d.documentType === "court_filing"
          ).length,
          evidence: documents.filter((d) => d.documentType === "evidence")
            .length,
          correspondence: documents.filter(
            (d) => d.documentType === "correspondence"
          ).length,
          id_document: documents.filter((d) => d.documentType === "id_document")
            .length,
          power_of_attorney: documents.filter(
            (d) => d.documentType === "power_of_attorney"
          ).length,
          other: documents.filter((d) => d.documentType === "other").length,
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching document stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to fetch document statistics",
      };
    }
  }
}

export default new DocumentService();
