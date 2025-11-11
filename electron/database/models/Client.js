import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

// Client Model - نموذج العميل
const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("individual", "company"),
      allowNull: false,
      defaultValue: "individual",
      comment: "نوع العميل: فرد أو شركة",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "الاسم الأول",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "اسم العائلة",
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "اسم الشركة",
    },
    nationalId: {
      type: DataTypes.STRING,
      unique: true,
      comment: "رقم البطاقة الوطنية",
    },
    taxId: {
      type: DataTypes.STRING,
      comment: "الرقم الجبائي",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "رقم الهاتف",
    },
    email: {
      type: DataTypes.STRING,
      comment: "البريد الإلكتروني",
    },
    address: {
      type: DataTypes.TEXT,
      comment: "العنوان",
    },
    city: {
      type: DataTypes.STRING,
      comment: "المدينة",
    },
    wilaya: {
      type: DataTypes.STRING,
      comment: "الولاية",
    },
    notes: {
      type: DataTypes.TEXT,
      comment: "ملاحظات",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
      comment: "الحالة",
    },
  },
  {
    timestamps: true,
    tableName: "clients",
  },
);

export default Client;
