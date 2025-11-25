import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

// Case Model - نموذج القضية
const Case = sequelize.define(
  "Case",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    caseNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "رقم القضية",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "عنوان القضية",
    },
    description: {
      type: DataTypes.TEXT,
      comment: "وصف القضية",
    },
    caseType: {
      type: DataTypes.ENUM(
        "civil",
        "criminal",
        "commercial",
        "administrative",
        "family",
        "labor",
        "other",
      ),
      allowNull: false,
      comment: "نوع القضية: مدني، جنائي، تجاري، إداري، أسري، عمالي، أخرى",
    },
    jurisdictionType: {
      type: DataTypes.ENUM(
        "ordinary",
        "administrative",
        "commercial",
      ),
      comment: "نوع القضاء: عادي، إداري، تجاري",
    },
    ordinaryJurisdictionType: {
      type: DataTypes.ENUM("judicial_council", "supreme_court"),
      allowNull: true,
      comment: "نوع القضاء العادي: مجلس قضائي أو محكمة عليا",
    },
    judicialCouncilId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف المجلس القضائي (للقضاء العادي)",
    },
    supremeCourtId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف المحكمة العليا",
    },
    supremeChamberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف غرفة المحكمة العليا",
    },
    administrativeAppealCourtId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف محكمة الاستئناف الإدارية (للقضاء الإداري)",
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف المحكمة",
    },
    courtName: {
      type: DataTypes.STRING,
      comment: "اسم المحكمة (للعرض)",
    },
    judge: {
      type: DataTypes.STRING,
      comment: "القاضي",
    },
    opposingParty: {
      type: DataTypes.STRING,
      comment: "الطرف المقابل",
    },
    opposingLawyer: {
      type: DataTypes.STRING,
      comment: "محامي الطرف المقابل",
    },
    clientRole: {
      type: DataTypes.ENUM(
        "plaintiff",
        "defendant",
        "intervening_party",
        "respondent_after_expertise",
        "appellant_after_expertise",
        "appellant",
        "respondent"
      ),
      allowNull: false,
      comment: "دور العميل: مدعي، مدعى عليه، مدخل في الخصام، مرجع بعد الخبرة، مرجع عليه بعد الخبرة، الطاعن، المطعون ضده",
    },
    status: {
      type: DataTypes.ENUM(
        "first_instance",
        "in_settlement",
        "closed",
        "in_appeal",
        "extraordinary_appeal",
      ),
      defaultValue: "first_instance",
      comment: "حالة القضية",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
      comment: "الأولوية",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      comment: "تاريخ بداية القضية",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      comment: "تاريخ انتهاء القضية",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      comment: "الأتعاب المتفق عليها",
    },
    notes: {
      type: DataTypes.TEXT,
      comment: "ملاحظات",
    },
  },
  {
    timestamps: true,
    tableName: "cases",
  },
);

export default Case;
